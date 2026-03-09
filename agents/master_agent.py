"""
Master Agent - Orchestrates the full multi-agent pipeline.
Calls each specialized agent in sequence, validates outputs against source text,
and returns the final structured JSON.
"""

import re
from typing import Callable, Optional

from agents.document_agent import DocumentIngestionAgent
from agents.issue_agent import IssueIdentificationAgent
from agents.petitioner_agent import PetitionerArgumentAgent
from agents.respondent_agent import RespondentArgumentAgent
from agents.law_section_agent import LawSectionAgent
from agents.precedent_agent import PrecedentAnalysisAgent
from agents.reasoning_agent import CourtReasoningAgent
from agents.judgment_agent import FinalJudgmentAgent
from agents.metadata_agent import MetadataAgent


class MasterAgent:
    """
    Orchestrates all specialized agents and produces the final structured JSON.

    Pipeline:
        DocumentIngestionAgent
        -> IssueIdentificationAgent
        -> PetitionerArgumentAgent
        -> RespondentArgumentAgent
        -> LawSectionAgent
        -> PrecedentAnalysisAgent
        -> CourtReasoningAgent
        -> FinalJudgmentAgent
        -> MetadataAgent
        -> Source validation and evidence mapping
        -> [Merge] Final structured output
    """

    def __init__(self, job_id: str, progress_callback: Optional[Callable] = None):
        self.job_id = job_id
        self.progress_callback = progress_callback

        # Initialize all agents
        self.document_agent = DocumentIngestionAgent()
        self.issue_agent = IssueIdentificationAgent()
        self.petitioner_agent = PetitionerArgumentAgent()
        self.respondent_agent = RespondentArgumentAgent()
        self.law_section_agent = LawSectionAgent()
        self.precedent_agent = PrecedentAnalysisAgent()
        self.reasoning_agent = CourtReasoningAgent()
        self.judgment_agent = FinalJudgmentAgent()
        self.metadata_agent = MetadataAgent()

    def _notify(self, name: str):
        if self.progress_callback:
            self.progress_callback(name)

    async def run(self, content: bytes, filename: str) -> dict:
        """Execute the full pipeline and return structured JSON."""

        # Step 1: Extract text
        self._notify("Document Ingestion Agent")
        text = await self.document_agent.run(content, filename)

        # Step 2: Structured extraction
        self._notify("Issue Identification Agent")
        issue = await self.issue_agent.run(text)

        self._notify("Petitioner Argument Agent")
        petitioner_args = await self.petitioner_agent.run(text)

        self._notify("Respondent Argument Agent")
        respondent_args = await self.respondent_agent.run(text)

        self._notify("Law Section Agent")
        law_sections = await self.law_section_agent.run(text)

        self._notify("Precedent Analysis Agent")
        precedents = await self.precedent_agent.run(text)

        self._notify("Court Reasoning Agent")
        court_reasoning = await self.reasoning_agent.run(text)

        self._notify("Final Judgment Agent")
        final_judgment = await self.judgment_agent.run(text)

        self._notify("Metadata Agent")
        metadata = await self.metadata_agent.run(text, filename)

        # Step 3: Source validation / evidence mapping
        self._notify("Source Validation Agent")
        source_validation = self._build_source_validation(
            text=text,
            issue=issue,
            petitioner_args=petitioner_args,
            respondent_args=respondent_args,
            law_sections=law_sections,
            precedents=precedents,
            court_reasoning=court_reasoning,
            final_judgment=final_judgment,
        )

        # Step 4: Merge all outputs
        self._notify("Master Agent (Merging)")
        structured_output = {
            # Metadata
            "case_title": metadata.get("case_title", ""),
            "court": metadata.get("court", ""),
            "year": metadata.get("year", ""),
            "judge": metadata.get("judge", ""),
            "case_category": metadata.get("case_category", ""),
            "case_number": metadata.get("case_number", ""),

            # Core analysis
            "issue": issue,
            "petitioner_arguments": petitioner_args,
            "respondent_arguments": respondent_args,
            "law_sections": law_sections,
            "precedents": precedents,
            "court_reasoning": court_reasoning,
            "final_judgment": final_judgment,

            # Validation against source text
            "source_validation": source_validation,

            # Summary (generated from combined outputs)
            "summary": self._generate_summary(metadata, issue, final_judgment),

            # Source info
            "source_filename": filename,
            "text_length": len(text),
            "processing_agents": 10,
        }

        return structured_output

    def _generate_summary(self, metadata: dict, issue: str, judgment: str) -> str:
        title = metadata.get("case_title", "This case")
        court = metadata.get("court", "the court")
        year = metadata.get("year", "")
        return (
            f"{title} ({year}) was decided by {court}. "
            f"The primary issue was: {issue[:200]}... "
            f"The court held: {judgment[:200]}..."
        )

    def _build_source_validation(
        self,
        text: str,
        issue: str,
        petitioner_args: list,
        respondent_args: list,
        law_sections: list,
        precedents: list,
        court_reasoning: str,
        final_judgment: str,
    ) -> dict:
        """
        Build deterministic evidence mapping from extracted outputs to source text.
        This does not call any LLM and provides transparent traceability.
        """
        paragraphs = [p.strip() for p in re.split(r"\n\s*\n+", text) if p.strip()]
        if not paragraphs:
            paragraphs = [text[:2000]] if text else []

        def normalize(s: str) -> str:
            return re.sub(r"\s+", " ", (s or "").lower()).strip()

        def tokenize(s: str) -> list:
            return re.findall(r"[a-z0-9]{3,}", normalize(s))

        def overlap_score(paragraph: str, query: str) -> float:
            p = normalize(paragraph)
            q = normalize(query)
            if not p or not q:
                return 0.0
            if q in p:
                return 1.0
            q_tokens = tokenize(q)
            if not q_tokens:
                return 0.0
            matches = sum(1 for t in set(q_tokens) if t in p)
            return matches / max(len(set(q_tokens)), 1)

        def find_snippets(query: str, top_k: int = 2) -> list:
            scored = []
            for para in paragraphs:
                score = overlap_score(para, query)
                if score >= 0.2:
                    snippet = para[:320] + ("..." if len(para) > 320 else "")
                    scored.append((score, snippet))
            scored.sort(key=lambda x: x[0], reverse=True)

            out = []
            seen = set()
            for score, snippet in scored:
                if snippet in seen:
                    continue
                seen.add(snippet)
                out.append({"score": round(score, 3), "text": snippet})
                if len(out) >= top_k:
                    break
            return out

        petitioner_map = []
        for arg in (petitioner_args or [])[:7]:
            if isinstance(arg, str) and arg.strip():
                petitioner_map.append({"claim": arg, "evidence": find_snippets(arg, top_k=2)})

        respondent_map = []
        for arg in (respondent_args or [])[:7]:
            if isinstance(arg, str) and arg.strip():
                respondent_map.append({"claim": arg, "evidence": find_snippets(arg, top_k=2)})

        law_map = []
        for sec in (law_sections or [])[:20]:
            if isinstance(sec, str) and sec.strip():
                law_map.append({"section": sec, "evidence": find_snippets(sec, top_k=2)})

        precedent_map = []
        for item in (precedents or [])[:15]:
            if not isinstance(item, dict):
                continue
            case_name = str(item.get("case_name", "")).strip()
            citation = str(item.get("citation", "")).strip()
            query = " ".join(part for part in [case_name, citation] if part).strip()
            if not query:
                continue
            precedent_map.append(
                {
                    "case_name": case_name,
                    "citation": citation,
                    "evidence": find_snippets(query, top_k=2),
                }
            )

        issue_evidence = find_snippets(issue, top_k=2) if issue else []
        reasoning_evidence = find_snippets((court_reasoning or "")[:500], top_k=2) if court_reasoning else []
        judgment_evidence = find_snippets(final_judgment, top_k=2) if final_judgment else []

        field_hits = {
            "issue": 1 if issue_evidence else 0,
            "petitioner_arguments": sum(1 for x in petitioner_map if x["evidence"]),
            "respondent_arguments": sum(1 for x in respondent_map if x["evidence"]),
            "law_sections": sum(1 for x in law_map if x["evidence"]),
            "precedents": sum(1 for x in precedent_map if x["evidence"]),
            "court_reasoning": 1 if reasoning_evidence else 0,
            "final_judgment": 1 if judgment_evidence else 0,
        }
        field_totals = {
            "issue": 1 if issue else 0,
            "petitioner_arguments": len(petitioner_map),
            "respondent_arguments": len(respondent_map),
            "law_sections": len(law_map),
            "precedents": len(precedent_map),
            "court_reasoning": 1 if court_reasoning else 0,
            "final_judgment": 1 if final_judgment else 0,
        }

        total_items = sum(field_totals.values()) or 1
        total_hits = sum(field_hits.values())
        overall_coverage = round((total_hits / total_items) * 100, 1)

        return {
            "method": "keyword_overlap_paragraph_match_v1",
            "overall_coverage_percent": overall_coverage,
            "field_coverage": {
                key: {
                    "matched": field_hits[key],
                    "total": field_totals[key],
                    "percent": round((field_hits[key] / field_totals[key]) * 100, 1) if field_totals[key] else 0.0,
                }
                for key in field_totals
            },
            "evidence": {
                "issue": issue_evidence,
                "petitioner_arguments": petitioner_map,
                "respondent_arguments": respondent_map,
                "law_sections": law_map,
                "precedents": precedent_map,
                "court_reasoning": reasoning_evidence,
                "final_judgment": judgment_evidence,
            },
        }

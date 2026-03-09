"""
Specialized Agents for NyayaAI
Each agent has a focused prompt and parses the LLM response.
"""

import json
import re
import asyncio
from agents.base_agent import BaseAgent


# ══════════════════════════════════════════════════════════
# 1. Document Ingestion Agent
# ══════════════════════════════════════════════════════════

class DocumentIngestionAgent(BaseAgent):
    """Extracts and cleans text from PDF or TXT uploads."""

    async def run(self, content: bytes, filename: str) -> str:
        if filename.endswith(".txt"):
            return content.decode("utf-8", errors="ignore")

        # PDF parsing
        try:
            import fitz  # PyMuPDF
            import io
            doc = fitz.open(stream=content, filetype="pdf")
            text = "\n".join(page.get_text() for page in doc)
            return text.strip()
        except ImportError:
            pass

        try:
            from pypdf import PdfReader
            import io
            reader = PdfReader(io.BytesIO(content))
            text = "\n".join(p.extract_text() or "" for p in reader.pages)
            return text.strip()
        except Exception as e:
            raise RuntimeError(f"PDF parsing failed: {e}")


# ══════════════════════════════════════════════════════════
# 2. Issue Identification Agent
# ══════════════════════════════════════════════════════════

ISSUE_SYSTEM_PROMPT = """
You are a senior Indian legal analyst specializing in identifying the core legal issue in court judgments.

Given an excerpt of an Indian court judgment, identify:
- The PRIMARY legal question or issue the court is deciding.
- State it as one or two clear, concise sentences.
- Be specific: include relevant law, parties, and the core dispute.

Respond ONLY with the issue statement. No preamble.
"""

class IssueIdentificationAgent(BaseAgent):
    async def run(self, text: str) -> str:
        return await self.call_llm(
            ISSUE_SYSTEM_PROMPT,
            f"JUDGMENT EXCERPT:\n{text[:6000]}"
        )


# ══════════════════════════════════════════════════════════
# 3. Petitioner Argument Agent
# ══════════════════════════════════════════════════════════

PETITIONER_SYSTEM_PROMPT = """
You are an expert Indian legal analyst. Your task is to extract the arguments made by the PETITIONER (appellant/plaintiff) in the following court judgment.

Rules:
- Return a JSON array of strings, each being a distinct argument.
- Each argument should be a concise sentence (1-2 lines).
- Include statutory citations if mentioned.
- Limit to the top 5-7 most important arguments.

Response format: ["argument 1", "argument 2", ...]
"""

class PetitionerArgumentAgent(BaseAgent):
    async def run(self, text: str) -> list:
        result = await self.call_llm(
            PETITIONER_SYSTEM_PROMPT,
            f"JUDGMENT:\n{text[:7000]}"
        )
        return self._parse_json_list(result)

    def _parse_json_list(self, text: str) -> list:
        try:
            match = re.search(r'\[.*?\]', text, re.DOTALL)
            if match:
                return json.loads(match.group())
        except Exception:
            pass
        return [line.strip("- •").strip() for line in text.splitlines() if line.strip()][:7]


# ══════════════════════════════════════════════════════════
# 4. Respondent Argument Agent
# ══════════════════════════════════════════════════════════

RESPONDENT_SYSTEM_PROMPT = """
You are an expert Indian legal analyst. Your task is to extract the arguments made by the RESPONDENT (defendant/state/opposite party) in the following court judgment.

Rules:
- Return a JSON array of strings.
- Each argument should be a concise sentence (1-2 lines).
- Limit to top 5-7 arguments.

Response format: ["argument 1", "argument 2", ...]
"""

class RespondentArgumentAgent(BaseAgent):
    async def run(self, text: str) -> list:
        result = await self.call_llm(
            RESPONDENT_SYSTEM_PROMPT,
            f"JUDGMENT:\n{text[:7000]}"
        )
        return PetitionerArgumentAgent()._parse_json_list(result)


# ══════════════════════════════════════════════════════════
# 5. Law Section Agent
# ══════════════════════════════════════════════════════════

LAW_SECTION_SYSTEM_PROMPT = """
You are a legal statute expert. Extract ALL sections of law cited in the following Indian court judgment.

Rules:
- Include IPC sections, CrPC sections, Constitution articles, specific Acts, etc.
- Return as a JSON array: ["IPC 302", "CrPC 161", "Article 21 Constitution", ...]
- Be comprehensive. Include every cited section.
- Normalize format: "Act Name Section/Article Number"

Response format: ["IPC 420", "CrPC 313", ...]
"""

class LawSectionAgent(BaseAgent):
    async def run(self, text: str) -> list:
        result = await self.call_llm(
            LAW_SECTION_SYSTEM_PROMPT,
            f"JUDGMENT:\n{text[:8000]}"
        )
        return PetitionerArgumentAgent()._parse_json_list(result)


# ══════════════════════════════════════════════════════════
# 6. Precedent Analysis Agent
# ══════════════════════════════════════════════════════════

PRECEDENT_SYSTEM_PROMPT = """
You are a legal research specialist. Extract all case precedents (past judgments) cited in the following Indian court judgment.

Rules:
- Return as a JSON array of objects with fields: "case_name", "citation", "relevance"
- Example: [{"case_name": "Maneka Gandhi v. Union of India", "citation": "AIR 1978 SC 597", "relevance": "Right to personal liberty"}]
- Include Supreme Court, High Court, and Privy Council cases.
- If citation format unknown, include what is available.

Response format (JSON array):
[{"case_name": "...", "citation": "...", "relevance": "..."}]
"""

class PrecedentAnalysisAgent(BaseAgent):
    async def run(self, text: str) -> list:
        result = await self.call_llm(
            PRECEDENT_SYSTEM_PROMPT,
            f"JUDGMENT:\n{text[:8000]}"
        )
        try:
            match = re.search(r'\[.*?\]', result, re.DOTALL)
            if match:
                return json.loads(match.group())
        except Exception:
            pass
        return []


# ══════════════════════════════════════════════════════════
# 7. Court Reasoning Agent
# ══════════════════════════════════════════════════════════

REASONING_SYSTEM_PROMPT = """
You are a judicial analyst. Summarize the REASONING used by the court/judge in reaching its conclusion in the following Indian judgment.

Rules:
- Write in 3-5 clear paragraphs.
- Cover: legal principles applied, how evidence was weighed, why precedents were followed/distinguished.
- Be analytical, not just descriptive.
- Use plain English accessible to non-lawyers.
"""

class CourtReasoningAgent(BaseAgent):
    async def run(self, text: str) -> str:
        return await self.call_llm(
            REASONING_SYSTEM_PROMPT,
            f"JUDGMENT:\n{text[:8000]}",
            max_tokens=1000
        )


# ══════════════════════════════════════════════════════════
# 8. Final Judgment Agent
# ══════════════════════════════════════════════════════════

JUDGMENT_SYSTEM_PROMPT = """
You are a legal analyst. Extract the FINAL VERDICT/JUDGMENT from the following Indian court judgment.

Include:
- What the court decided (convicted/acquitted/dismissed/allowed/etc.)
- Any specific orders, directions, or relief granted
- Sentence if criminal case, or damages if civil case
- Any conditions or caveats

Write in 2-4 sentences. Be precise.
"""

class FinalJudgmentAgent(BaseAgent):
    async def run(self, text: str) -> str:
        # Focus on the end of the document which typically has the judgment
        relevant_text = text[-4000:] if len(text) > 4000 else text
        return await self.call_llm(
            JUDGMENT_SYSTEM_PROMPT,
            f"JUDGMENT (FINAL PORTION):\n{relevant_text}"
        )


# ══════════════════════════════════════════════════════════
# 9. Metadata Agent
# ══════════════════════════════════════════════════════════

METADATA_SYSTEM_PROMPT = """
You are a legal metadata specialist. Extract the following metadata from the Indian court judgment header/text.

Return a JSON object with EXACTLY these fields:
{
  "case_title": "Party A vs Party B",
  "court": "Supreme Court of India / Delhi High Court / etc.",
  "year": "2023",
  "judge": "Justice Name",
  "case_category": "Criminal / Civil / Constitutional / Tax / Family / etc.",
  "case_number": "Criminal Appeal No. 123/2023"
}

If any field is not found, use empty string "".
"""

class MetadataAgent(BaseAgent):
    async def run(self, text: str, filename: str) -> dict:
        # Focus on the header (first 2000 chars typically has metadata)
        header_text = text[:2000]
        result = await self.call_llm(
            METADATA_SYSTEM_PROMPT,
            f"JUDGMENT HEADER:\n{header_text}\nFILENAME: {filename}"
        )
        try:
            match = re.search(r'\{.*?\}', result, re.DOTALL)
            if match:
                return json.loads(match.group())
        except Exception:
            pass
        return {
            "case_title": filename.replace(".pdf", "").replace("_", " ").title(),
            "court": "",
            "year": "",
            "judge": "",
            "case_category": "",
            "case_number": "",
        }

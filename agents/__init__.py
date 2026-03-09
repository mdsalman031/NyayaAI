# Re-export all agents from the consolidated module
from agents.document_agent import (
    DocumentIngestionAgent,
    IssueIdentificationAgent,
    PetitionerArgumentAgent,
    RespondentArgumentAgent,
    LawSectionAgent,
    PrecedentAnalysisAgent,
    CourtReasoningAgent,
    FinalJudgmentAgent,
    MetadataAgent,
)

# Individual agent module aliases
issue_agent     = IssueIdentificationAgent
petitioner_agent = PetitionerArgumentAgent
respondent_agent = RespondentArgumentAgent
law_section_agent = LawSectionAgent
precedent_agent  = PrecedentAnalysisAgent
reasoning_agent  = CourtReasoningAgent
judgment_agent   = FinalJudgmentAgent
metadata_agent   = MetadataAgent

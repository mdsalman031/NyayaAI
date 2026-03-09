"""
Base Agent — All specialized agents inherit from this.
Uses OpenAI-compatible API (works with OpenAI, Together, Groq, etc.)
"""

import os
import json
import asyncio
from dotenv import load_dotenv
try:
    from openai import AsyncOpenAI
except ImportError:
    AsyncOpenAI = None

load_dotenv()


def _build_client():
    if AsyncOpenAI is None:
        return None

    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key:
        return None

    base_url = os.getenv("OPENAI_BASE_URL", "").strip()
    if not base_url and api_key.startswith("gsk_"):
        base_url = "https://api.groq.com/openai/v1"

    kwargs = {"api_key": api_key}
    if base_url:
        kwargs["base_url"] = base_url
    return AsyncOpenAI(**kwargs)


client = _build_client()
MODEL = os.getenv(
    "LLM_MODEL",
    "llama-3.1-8b-instant" if os.getenv("OPENAI_API_KEY", "").strip().startswith("gsk_") else "gpt-4o-mini",
)


class BaseAgent:
    """Base class with shared LLM calling logic."""

    async def call_llm(self, system_prompt: str, user_content: str, max_tokens: int = 1500) -> str:
        """Call the LLM and return the response text."""
        if client is None:
            return self._fallback()

        try:
            response = await client.chat.completions.create(
                model=MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user",   "content": user_content[:12000]},  # context limit guard
                ],
                max_tokens=max_tokens,
                temperature=0.1,
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"[LLM Error] {e}")
            return self._fallback()

    def _fallback(self) -> str:
        return "Could not extract information at this time."

    async def run(self, *args, **kwargs):
        raise NotImplementedError

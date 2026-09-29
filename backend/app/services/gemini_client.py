import os
from google import genai
from google.genai import types
from typing import Optional

class GeminiUnavailableError(Exception):
    pass

class GeminiClient:
    def __init__(self, api_key: str, model_name: str = "gemini-3.8-flash"):
        self.api_key = api_key
        self.model_name = model_name
        self.client = genai.Client(api_key=self.api_key)

    async def generate(self, prompt: str, system_prompt: str, max_tokens: int = 1024) -> str:
        try:
            # We construct a prompt combining system_prompt and the actual user prompt
            full_prompt = f"{system_prompt}\n\n{prompt}"
            response = await self.client.aio.models.generate_content(
                model=self.model_name,
                contents=full_prompt,
                config=types.GenerateContentConfig(
                    max_output_tokens=max_tokens,
                    temperature=0.1,
                )
            )
            return response.text if response.text else str(response)
        except Exception as e:
            raise GeminiUnavailableError(f"Failed to communicate with Gemini: {str(e)}")

    def check_availability(self) -> bool:
        return bool(self.api_key)

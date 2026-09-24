import httpx
import json
import re

class OllamaUnavailableError(Exception):
    pass

class OllamaClient:
    def __init__(self, base_url: str, model: str):
        self.base_url = base_url
        self.model = model

    def _strip_think_tags(self, text: str) -> str:
        """Strip <think>...</think> reasoning tags produced by qwen3 and similar models."""
        # Remove <think>...</think> blocks (including multiline)
        text = re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL)
        return text.strip()

    async def generate(self, prompt: str, system_prompt: str, max_tokens: int = 1024) -> str:
        url = f"{self.base_url}/api/generate"
        payload = {
            "model": self.model,
            "prompt": prompt,
            "system": system_prompt,
            "stream": False,
            "think": False,   # Disable chain-of-thought for faster responses
            "options": {
                "num_predict": max_tokens,
                "temperature": 0.1,  # Low temperature for factual accuracy
            }
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=payload, timeout=120.0)
                response.raise_for_status()
                raw = response.json().get("response", "")
                return self._strip_think_tags(raw)
        except Exception as e:
            raise OllamaUnavailableError(f"Failed to communicate with Ollama: {str(e)}")

    async def check_availability(self) -> bool:
        url = f"{self.base_url}/api/tags"
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, timeout=5.0)
                if response.status_code == 200:
                    data = response.json()
                    models = [m["name"] for m in data.get("models", [])]
                    return self.model in models or f"{self.model}:latest" in models
                return False
        except Exception:
            return False

# System Prompt constants
SYSTEM_PROMPT = """You are IP-SAKTI Sahayak, an AI assistant for Ayurveda Intellectual Property and regulatory guidance.
You must adhere strictly to these rules:
1. Answer ONLY using the provided context for IP and legal questions.
2. If the user is just saying hello or asking a general question not related to IP, respond politely and explain how you can help.
3. Never invent laws, sections, articles, rules, treaties, cases, or sources.
4. Never fabricate citations.
5. If the user asks an IP/legal question and context is insufficient, state: "I do not have sufficient authoritative information in the retrieved sources to answer this reliably."
6. Always clearly state the jurisdiction you are answering for (if answering a legal question).
7. Use plain, accessible language.
8. Always end with: "Information only — not legal advice." (if answering a legal question).
9. Provide citations from the context (if answering a legal question)."""

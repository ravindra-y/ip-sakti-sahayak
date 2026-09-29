import sys
import os
from pathlib import Path

# Add the backend directory to sys.path so we can import app modules
backend_dir = Path(__file__).parent.parent
sys.path.append(str(backend_dir))

import asyncio
from app.config import settings
from app.services.gemini_client import GeminiClient

async def main():
    print("Testing Gemini API integration...")
    api_key = settings.gemini_api_key
    
    if not api_key:
        print("\nError: GEMINI_API_KEY is not set in your .env file.")
        print("Please add GEMINI_API_KEY=your_api_key to backend/.env and try again.")
        sys.exit(1)
        
    print(f"API Key found (starts with: {api_key[:10]}...)")
    
    client = GeminiClient(api_key=api_key)
    
    if not client.check_availability():
        print("\nError: Client availability check failed.")
        sys.exit(1)
        
    print("\nSending a test prompt to Gemini: 'Say hello in 3 words.'")
    try:
        response = await client.generate(
            prompt="Say hello in 3 words.",
            system_prompt="You are a helpful assistant.",
            max_tokens=20
        )
        print(f"\nSuccess! Gemini responded:\n\"{response.strip()}\"")
        print("\nYour Gemini API integration is working perfectly!")
    except Exception as e:
        print(f"\nError connecting to Gemini API: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())

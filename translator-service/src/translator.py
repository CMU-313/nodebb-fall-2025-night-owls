import ollama

client = ollama.Client()
MODEL_NAME = "llama3.2"


def get_translation(post: str) -> str:
    context = """
    Translate the following text into natural, fluent English. Preserve the meaning, tone, and any cultural context. Do not add explanations.
"""

    response = client.chat(
        model=MODEL_NAME,
        messages=[
            {
                "role": "user",
                "content": post
            },
            {
                "role": "system",
                "content": context
            }
        ]
    )
    return response.message.content


def detect_language(content: str) -> str:
    """Detect the language using LLM"""
    context = """
    Your task is to identify the main language of the input text and state the English name of that language.
    Provide only the one most used language in the text.
    Do not respond with any introductions or text other than the name of the language.
    """
    
    response = client.chat(
        model=MODEL_NAME,
        messages=[
            {
                "role": "user",
                "content": content
            },
            {
                "role": "system",
                "content": context
            }
        ]
    )
    return response.message.content.strip()


def translate_content(content: str) -> tuple[bool, str]:
    try:
        # Detect if content is in English
        language = detect_language(content)
        is_english = "english" in language.lower()
        
        if is_english:
            return True, content
        
        # Not English, translate it
        translated = get_translation(content)
        
        # Verify translation is valid (ASCII only for English)
        if not translated.isascii():
            # LLM failed to translate properly, return error message
            translated = "Sorry, an error occurred when translating this post"
        
        return False, translated
    except Exception:
        # Handle any LLM errors gracefully
        return False, "Sorry, an error occurred when translating this post"

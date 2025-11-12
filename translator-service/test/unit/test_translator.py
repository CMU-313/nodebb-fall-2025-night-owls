from src.translator import translate_content
from unittest.mock import patch, MagicMock


def test_llm_normal_response():
    # Mock the LLM client to return a normal translation
    with patch('src.translator.client') as mock_client:
        # First call is for language detection, second is for translation
        mock_response_lang = MagicMock()
        mock_response_lang.message.content = "German"
        
        mock_response_translation = MagicMock()
        mock_response_translation.message.content = "This is a German message"
        
        mock_client.chat.side_effect = [mock_response_lang, mock_response_translation]
        
        is_english, translated_content = translate_content("Dies ist eine Nachricht auf Deutsch")
        
        assert is_english == False
        assert translated_content == "This is a German message"

def test_llm_gibberish_response():
    # Mock the LLM client to return gibberish (non-ASCII response)
    with patch('src.translator.client') as mock_client:
        mock_response_lang = MagicMock()
        mock_response_lang.message.content = "German"
        
        mock_response_gibberish = MagicMock()
        mock_response_gibberish.message.content = "I don't understand your request 无法翻译"
        
        mock_client.chat.side_effect = [mock_response_lang, mock_response_gibberish]
        
        is_english, translated_content = translate_content("Dies ist eine Nachricht auf Deutsch")
        
        assert is_english == False
        assert translated_content == "Sorry, an error occurred when translating this post"

def test_english_content():
    # Mock the LLM client to detect English
    with patch('src.translator.client') as mock_client:
        mock_response_lang = MagicMock()
        mock_response_lang.message.content = "English"
        
        mock_client.chat.return_value = mock_response_lang
        
        is_english, translated_content = translate_content("This is an English message")
        
        assert is_english == True
        assert translated_content == "This is an English message"
# Free/Open Source Stack

This project is designed to demo core interview-preparation features without paid services.

## Works Without Paid APIs

- Browser `SpeechRecognition`: live voice transcript where supported.
- Browser `MediaRecorder`: audio/video answer preview.
- Browser `getUserMedia`: webcam and microphone access.
- Browser canvas sampling: local video presence signals such as lighting, movement, and eye-line proxy.
- Flask fallback logic: question generation and answer evaluation still work when AI keys are missing.
- JSON file storage: interview sessions and analytics are saved locally.
- spaCy/PyPDF2/python-docx: resume parsing and text extraction.
- Recharts: analytics charts.

## Optional Free/External Enhancements

- Hugging Face Inference API: optional free token for cloud LLM generation.
- Gemini API: optional provider if a key is available.
- Local Transformers: optional local model path if `transformers` and a model are installed.

## Privacy Note

Webcam frames are not sent to the backend. The frontend sends only derived coaching scores such as engagement, lighting, and eye-contact proxy.

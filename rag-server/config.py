import os
from dotenv import load_dotenv

load_dotenv()

QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

FAQ_COLLECTION_NAME = "faq"
FAQ_FILE_PATH = "data/faq.json"

EMBEDDING_MODEL_NAME = "jhgan/ko-sroberta-multitask"
GEMINI_MODEL_NAME = "models/gemini-3.1-flash-lite"

VECTOR_SIZE = 768
SCORE_THRESHOLD = 0.1
SEARCH_LIMIT = 3
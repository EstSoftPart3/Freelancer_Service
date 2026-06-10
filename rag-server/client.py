from qdrant_client import QdrantClient
from sentence_transformers import SentenceTransformer
import google.generativeai as genai

from config import (
    QDRANT_URL,
    QDRANT_API_KEY,
    GEMINI_API_KEY,
    GEMINI_MODEL_NAME,
    EMBEDDING_MODEL_NAME
)

client = QdrantClient(
    url=QDRANT_URL,
    api_key=QDRANT_API_KEY
)

genai.configure(
    api_key=GEMINI_API_KEY
)

gemini_model = genai.GenerativeModel(
    GEMINI_MODEL_NAME
)

model = SentenceTransformer(
    EMBEDDING_MODEL_NAME
)
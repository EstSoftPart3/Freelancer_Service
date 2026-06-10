from fastapi import FastAPI

from service import (
    get_faq_list,
    get_qdrant_collections,
    create_faq_collection,
    get_embedding_test,
    load_faq_data,
    count_faq_points,
    search_faq_data,
    get_gemini_model_list,
    ask_chat_data
)

app = FastAPI()


@app.get("/")
def home():
    return {
        "message": "RAG Server RUNNING"
    }


@app.get("/faq")
def get_faq():
    return get_faq_list()


@app.get("/qdrant/test")
def qdrant_test():
    return get_qdrant_collections()


@app.post("/qdrant/create-collection")
def create_collection():
    return create_faq_collection()


@app.get("/embedding/test")
def embedding_test():
    return get_embedding_test()


@app.post("/faq/load")
def load_faq():
    return load_faq_data()


@app.get("/qdrant/count")
def count_points():
    return count_faq_points()


@app.get("/faq/search")
def search_faq(query: str):
    return search_faq_data(query)


@app.get("/gemini/models")
def gemini_models():
    return get_gemini_model_list()


@app.get("/chat/ask")
def ask_chat(query: str):
    return ask_chat_data(query)
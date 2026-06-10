import json

import google.generativeai as genai
from qdrant_client.models import Distance, VectorParams, PointStruct

from client import client, model, gemini_model
from config import (
    FAQ_COLLECTION_NAME,
    FAQ_FILE_PATH,
    VECTOR_SIZE,
    SEARCH_LIMIT,
    SCORE_THRESHOLD
)


def get_faq_list():
    with open(
        FAQ_FILE_PATH,
        "r",
        encoding="utf-8"
    ) as f:
        faq_list = json.load(f)

    return faq_list


def get_qdrant_collections():
    collections = client.get_collections()
    return collections.model_dump()


def create_faq_collection():
    client.recreate_collection(
        collection_name=FAQ_COLLECTION_NAME,
        vectors_config=VectorParams(
            size=VECTOR_SIZE,
            distance=Distance.COSINE
        )
    )

    return {
        "message": "faq collection created"
    }


def get_embedding_test():
    vector = model.encode("상담사 연결은 어덯게 하나요?")

    return {
        "dimension": len(vector)
    }


def load_faq_data():
    faq_list = get_faq_list()

    points = []

    for faq in faq_list:
        text = faq["question"] + "\n" + faq["answer"]

        vector = model.encode(text).tolist()

        point = PointStruct(
            id=faq["id"],
            vector=vector,
            payload={
                "id": faq["id"],
                "role": faq["role"],
                "question": faq["question"],
                "answer": faq["answer"]
            }
        )

        points.append(point)

    if len(points) == 0:
        return {
            "message": "faq data is empty",
            "count": 0
        }

    client.upsert(
        collection_name=FAQ_COLLECTION_NAME,
        points=points
    )

    return {
        "message": "faq_loaded",
        "count": len(points)
    }


def count_faq_points():
    result = client.count(
        collection_name=FAQ_COLLECTION_NAME
    )

    return result.model_dump()


def search_faq_data(query: str):
    query_vector = model.encode(query).tolist()

    results = client.query_points(
        collection_name=FAQ_COLLECTION_NAME,
        query=query_vector,
        limit=10
    )

    return [
        {
            "score": point.score,
            "id": point.payload.get("id"),
            "role": point.payload.get("role"),
            "question": point.payload.get("question"),
            "answer": point.payload.get("answer")
        }
        for point in results.points
    ]


def get_gemini_model_list():
    models = []

    for model_item in genai.list_models():
        models.append(model_item.name)

    return models


def ask_chat_data(query: str):
    query_vector = model.encode(query).tolist()

    results = client.query_points(
        collection_name=FAQ_COLLECTION_NAME,
        query=query_vector,
        limit=SEARCH_LIMIT
    )

    contexts = []

    for point in results.points:
        if point.score >= SCORE_THRESHOLD:
            contexts.append(
                f"""
                질문: {point.payload["question"]}
                답변: {point.payload["answer"]}
                """
            )

    if len(contexts) == 0:
        return {
            "answer": "질문 내용을 조금 더 구체적으로 입력해 주세요. 예를 들어 프로젝트 지원, 소속 신청, 커뮤니티 이용처럼 궁금한 기능을 함께 적어주시면 더 정확히 안내해 드릴 수 있습니다."
        }

    context_text = "\n".join(contexts)

    prompt = f"""
    너는 서비스 FAQ 기반 AI 상담사야
    아래 FAQ 내용만 근거로 답변해라
    FAQ에 없는 내용은 절대 추측하지마
    사용자에게는 자연스럽게 답변해줘, 핵심만 뽑아서
    

    [FAQ]
    {context_text}

    [사용자 질문]
    {query}

    [답변]
    
    """

    response = gemini_model.generate_content(prompt)

    return {
        "answer": response.text
    }
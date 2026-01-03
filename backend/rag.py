import os
import chromadb
from chromadb.utils import embedding_functions
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

CHROMA_PATH = "./chroma_db"
COLLECTION_NAME = "cars"

from langchain_community.llms import CTransformers

def get_llm():
    if os.getenv("OPENAI_API_KEY"):
        return ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
    elif os.getenv("GOOGLE_API_KEY"):
        return ChatGoogleGenerativeAI(model="gemini-pro", temperature=0)
    else:
        # Local fallback using TinyLlama (Auto-downloads if missing)
        return CTransformers(
            model="TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF",
            model_file="tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf",
            model_type="llama",
            config={'max_new_tokens': 512, 'temperature': 0.1, 'context_length': 2048, 'repetition_penalty': 1.1}
        )

def get_retriever():
    client = chromadb.PersistentClient(path=CHROMA_PATH)
    embedding_func = embedding_functions.SentenceTransformerEmbeddingFunction(model_name="all-MiniLM-L6-v2")
    collection = client.get_collection(name=COLLECTION_NAME, embedding_function=embedding_func)
    
    def retrieve(query, k=5):
        results = collection.query(query_texts=[query], n_results=k)
        docs = results['documents'][0] if results['documents'] else []
        metas = results['metadatas'][0] if results['metadatas'] else []
        
        context_list = []
        for doc, meta in zip(docs, metas):
            context_list.append(doc)
        
        return "\n\n".join(context_list)
        
    return retrieve

def rag_pipeline(query: str):
    llm = get_llm()
    retrieve = get_retriever()
    
    # Retrieval
    context = retrieve(query, k=5) 
    
    # TinyLlama prompt format
    template = """<|system|>
You are a helpful car assistant. Use the provided context to answer the user's question about cars.
If the answer is not in the context, say "I don't know based on the data".
Context:
{context}
</s>
<|user|>
{question}
</s>
<|assistant|>"""
    
    prompt = ChatPromptTemplate.from_template(template)
    
    chain = (
        {"context": lambda x: context, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )
    
    return chain.invoke(query)

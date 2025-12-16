import os
import sys

# Ensure we can import from current directory
sys.path.append(os.getcwd())

try:
    print("Importing rag_pipeline...")
    from rag import rag_pipeline
    # Inspect Retrieval
    from rag import get_retriever
    retrieve = get_retriever()
    query = "What is the horsepower and transmission type of the 2017 Toyota 86?"
    print(f"Querying: {query}")
    context = retrieve(query)
    print("--- Retrieved Context ---")
    print(context)
    print("-------------------------")
    
    print("Running rag_pipeline...")
    response = rag_pipeline(query)
    print("Response received:")
    print(response)
except Exception as e:
    import traceback
    traceback.print_exc()

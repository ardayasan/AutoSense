import pandas as pd
import chromadb
from chromadb.utils import embedding_functions
import os
from tqdm import tqdm

DATA_PATH = "../data.csv"
CHROMA_PATH = "./chroma_db"
COLLECTION_NAME = "cars"

def clean_data(df):
    # Basic cleaning
    df.columns = df.columns.str.lower().str.replace(" ", "_")
    df = df.fillna("Unknown")
    return df

def create_car_description(row):
    # Create a natural language description for RAG
    return (
        f"The {row['year']} {row['make']} {row['model']} is a {row['vehicle_size']} {row['vehicle_style']} with {row['number_of_doors']} doors. "
        f"Category: {row['market_category']}. "
        f"It has an MSRP of ${row['msrp']}. "
        f"Engine: {row['engine_hp']} HP, {row['engine_cylinders']} cylinders, {row['engine_fuel_type']}. "
        f"Transmission: {row['transmission_type']}, Driven Wheels: {row['driven_wheels']}. "
        f"Fuel Economy: {row['city_mpg']} City MPG / {row['highway_mpg']} Highway MPG. "
        f"Popularity score: {row['popularity']}."
    )

def ingest():
    print("Loading data...")
    if not os.path.exists(DATA_PATH):
        print(f"Error: {DATA_PATH} not found.")
        return

    df = pd.read_csv(DATA_PATH)
    df = clean_data(df)
    
    print(f"Processing {len(df)} records...")
    
    documents = []
    metadatas = []
    ids = []
    
    for idx, row in tqdm(df.iterrows(), total=len(df)):
        description = create_car_description(row)
        documents.append(description)
        ids.append(str(idx))
        
        # Store all columns as metadata for filtering/retrieval
        metadata = row.to_dict()
        # Convert non-string/int/float types to string just in case
        for k, v in metadata.items():
            if not isinstance(v, (str, int, float, bool)):
                metadata[k] = str(v)
        metadatas.append(metadata)

    print("Initializing Vector Database...")
    client = chromadb.PersistentClient(path=CHROMA_PATH)
    
    # Use default embedding function (all-MiniLM-L6-v2)
    embedding_func = embedding_functions.SentenceTransformerEmbeddingFunction(model_name="all-MiniLM-L6-v2")
    
    # Delete if exists to start fresh
    try:
        client.delete_collection(name=COLLECTION_NAME)
    except:
        pass
        
    collection = client.create_collection(
        name=COLLECTION_NAME,
        embedding_function=embedding_func
    )
    
    print("Adding documents to collection (this may take a while)...")
    # Batch add to avoid memory issues
    batch_size = 500
    for i in range(0, len(documents), batch_size):
        end = min(i + batch_size, len(documents))
        collection.add(
            documents=documents[i:end],
            metadatas=metadatas[i:end],
            ids=ids[i:end]
        )
        print(f"Added batch {i} to {end}")
        
    print("Ingestion complete!")

if __name__ == "__main__":
    ingest()

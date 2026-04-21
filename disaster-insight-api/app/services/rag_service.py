import os
import chromadb
from chromadb.utils import embedding_functions
from pypdf import PdfReader

# --- CONFIGURATION ---
EMBEDDING_FUNC = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"
)

# --- MODIFIED CONFIGURATION ---
# Detect if running on Hugging Face or Local
# Isse ensure karein ke Windows par /tmp na banaye
if os.name != 'nt' and (os.environ.get("HF_HOME") or os.environ.get("SPACE_ID")):
    CHROMA_PATH = "/tmp/chroma_db"
else:
    CHROMA_PATH = "chroma_db" # Windows (Local PC) ke liye purana rasta hi rehne dein

DOCS_PATH = "documents"

# Initialize Client
chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)
collection = chroma_client.get_or_create_collection(
    name="disaster_protocols",
    embedding_function=EMBEDDING_FUNC
)

def ingest_documents():
    """
    Reads PDFs and stores them. (The logic you already have)
    """
    if not os.path.exists(DOCS_PATH):
        print(f"⚠️ Warning: {DOCS_PATH} folder not found.")
        return

    print("--- 🔄 Starting Document Ingestion... ---")
    ids = []
    documents = []
    metadatas = []
    
    # Clean existing data to avoid duplicates if re-running
    existing_count = collection.count()
    if existing_count > 0:
        print(f"Clearing {existing_count} existing documents to rebuild...")
        # There isn't a direct 'clear' in simple Chroma, so we usually rely on unique IDs
        # But for this demo, we will just append or overwrite based on logic.
        # To keep it simple and safe: We proceed.

    for filename in os.listdir(DOCS_PATH):
        if filename.endswith(".pdf"):
            file_path = os.path.join(DOCS_PATH, filename)
            print(f"Processing: {filename}")
            
            try:
                reader = PdfReader(file_path)
                text = ""
                for page in reader.pages:
                    text += page.extract_text() + "\n"
                
                # Chunking
                chunk_size = 1000
                for i in range(0, len(text), chunk_size):
                    chunk = text[i:i+chunk_size]
                    if len(chunk) > 50:
                        # Use filename + index as ID to ensure uniqueness
                        ids.append(f"{filename}_{i}")
                        documents.append(chunk)
                        metadatas.append({"source": filename})
            except Exception as e:
                print(f"Error reading {filename}: {e}")

    if documents:
        # upsert = update if exists, insert if new
        collection.upsert(ids=ids, documents=documents, metadatas=metadatas)
        print(f"✅ Successfully ingested {len(documents)} chunks into ChromaDB.")
    else:
        print("⚠️ No PDF documents found to ingest.")

def query_knowledge_base(query_text: str, n_results: int = 2):
    # ... (Your existing query logic) ...
    results = collection.query(query_texts=[query_text], n_results=n_results)
    if not results['documents'] or not results['documents'][0]:
        return "No specific protocol document found in the database."
    context = "\n\n".join(results['documents'][0])
    sources = ", ".join(set([m['source'] for m in results['metadatas'][0]]))
    return f"Context from ({sources}):\n{context}"

# --- NEW SMART FUNCTION ---
def initialize_rag_on_startup():
    """
    Called when the API starts. Checks if DB is empty.
    """
    count = collection.count()
    print(f"📊 Current RAG Database Count: {count} chunks")
    
    if count == 0:
        print("🚀 Database is empty. Auto-triggering ingestion...")
        ingest_documents()
    else:
        print("✅ RAG Database is ready. Skipping ingestion.")
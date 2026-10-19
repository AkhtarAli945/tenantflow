import { MongoClient } from "mongodb";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const client = new MongoClient(process.env.MONGODB_URI);
const collection = client.db("tenantflow").collection("chunks");

// Local, free embeddings (384 dimensions)
const embeddings = new HuggingFaceTransformersEmbeddings({
  model: "Xenova/all-MiniLM-L6-v2",
});

const store = new MongoDBAtlasVectorSearch(embeddings, {
  collection,
  indexName: "vector_index",
  textKey: "text",
  embeddingKey: "embedding",
});

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 800,
  chunkOverlap: 120,
});

// Split a tenant's document and store every chunk with its tenantId
export async function ingestText({ tenantId, docId, filename, text }) {
  const docs = await splitter.createDocuments([text], [
    { tenantId, docId, filename },
  ]);
  await store.addDocuments(docs);
  return docs.length;
}

// Retrieve only this tenant's chunks
export async function retrieve(tenantId, query, k = 4) {
  return store.similaritySearch(query, k, {
    preFilter: { tenantId: { $eq: tenantId } },
  });
}

// Remove all chunks that belong to one uploaded document
export async function removeDoc(docId) {
  await collection.deleteMany({ docId });
}

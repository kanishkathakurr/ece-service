# ECE Pipeline Microservice

Reusable, product-agnostic Node.js + TypeScript microservice for document ingestion, parsing, chunking, embedding generation, Qdrant vector storage, retrieval, source metadata, bounding box preservation, and generic structured extraction.

## Tech Stack

- Node.js
- TypeScript
- Express
- Zod
- LiteParse
- Vercel AI SDK
- OpenAI embedding provider
- Qdrant
- Docker Compose
- Local file storage

## Features

- Upload/register documents
- Parse PDFs using LiteParse
- Extract text, page numbers, blocks, and bounding boxes
- Metadata-preserving chunking
- Generate embeddings using Vercel AI SDK
- Store vectors and metadata in Qdrant
- Search/retrieve relevant chunks
- Return source metadata, page numbers, block IDs, scores, and bounding boxes
- Generic schema-driven extraction
- Delete document vectors from Qdrant
- Health check endpoint

## Setup

```bash
npm install
docker compose up -d
cp .env.example .env
npm run dev

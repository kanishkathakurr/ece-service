import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  UPLOAD_DIR: z.string().default("uploads"),
  QDRANT_URL: z.string().default("http://localhost:6333"),
  QDRANT_COLLECTION: z.string().default("ece_chunks"),
  OPENAI_API_KEY: z.string(),
  EMBEDDING_MODEL: z.string().default("text-embedding-3-small")
});

export const env = envSchema.parse(process.env);

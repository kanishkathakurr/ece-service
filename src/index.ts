import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { healthRouter } from "./routes/health.routes.js";
import { documentsRouter } from "./routes/documents.routes.js";
import { searchRouter } from "./routes/search.routes.js";
import { extractRouter } from "./routes/extract.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    message: "ECE Service API is running",
    routes: [
      "/health",
      "/documents/upload",
      "/documents/:documentId/index",
      "/documents/:documentId/status",
      "/documents/:documentId/chunks",
      "/documents/:documentId",
      "/search",
      "/extract"
    ]
  });
});

app.use(healthRouter);
app.use(documentsRouter);
app.use(searchRouter);
app.use(extractRouter);

app.listen(env.PORT, () => {
  console.log(`ECE service running on http://localhost:${env.PORT}`);
});

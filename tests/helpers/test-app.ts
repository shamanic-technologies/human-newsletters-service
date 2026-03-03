import express from "express";
import cors from "cors";
import { requireHeaders } from "../../src/middleware/required-headers.js";
import healthRoutes from "../../src/routes/health.js";

export function createTestApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(requireHeaders);
  app.use(healthRoutes);

  // Test endpoint to verify headers are parsed
  app.get("/v1/test-headers", (req, res) => {
    res.json(req.serviceHeaders);
  });

  app.use((_req: express.Request, res: express.Response) => {
    res.status(404).json({ error: "Not found" });
  });
  return app;
}

export function getAuthHeaders() {
  return {
    "X-API-Key": "test-api-key",
    "Content-Type": "application/json",
  };
}

export function getFullHeaders() {
  return {
    ...getAuthHeaders(),
    "x-org-id": "00000000-0000-0000-0000-000000000001",
    "x-user-id": "00000000-0000-0000-0000-000000000002",
    "x-run-id": "00000000-0000-0000-0000-000000000003",
  };
}

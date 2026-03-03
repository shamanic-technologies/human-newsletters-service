import { describe, it, expect } from "vitest";
import request from "supertest";
import express from "express";
import { requireApiKey } from "../../src/middleware/auth.js";

describe("requireApiKey middleware", () => {
  const app = express();
  app.use(express.json());
  app.get("/test", requireApiKey, (_req, res) => {
    res.json({ ok: true });
  });

  it("allows requests with valid API key", async () => {
    const res = await request(app)
      .get("/test")
      .set("X-API-Key", "test-api-key");
    expect(res.status).toBe(200);
  });

  it("rejects requests without API key", async () => {
    const res = await request(app).get("/test");
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  });

  it("rejects requests with wrong API key", async () => {
    const res = await request(app)
      .get("/test")
      .set("X-API-Key", "wrong-key");
    expect(res.status).toBe(401);
  });
});

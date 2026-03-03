import { describe, it, expect } from "vitest";
import request from "supertest";
import { createTestApp, getFullHeaders } from "../helpers/test-app.js";

describe("requireHeaders middleware", () => {
  const app = createTestApp();

  describe("exempt paths", () => {
    it("allows /health without any headers", async () => {
      const res = await request(app).get("/health");
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("ok");
    });
  });

  describe("required headers validation", () => {
    it("rejects requests missing all required headers", async () => {
      const res = await request(app).get("/v1/test-headers");
      expect(res.status).toBe(400);
      expect(res.body.error).toContain("x-org-id");
      expect(res.body.error).toContain("x-user-id");
      expect(res.body.error).toContain("x-run-id");
    });

    it("rejects requests missing x-run-id only", async () => {
      const res = await request(app)
        .get("/v1/test-headers")
        .set("x-org-id", "org-1")
        .set("x-user-id", "user-1");
      expect(res.status).toBe(400);
      expect(res.body.error).toContain("x-run-id");
      expect(res.body.error).not.toContain("x-org-id");
      expect(res.body.error).not.toContain("x-user-id");
    });

    it("rejects requests missing x-org-id only", async () => {
      const res = await request(app)
        .get("/v1/test-headers")
        .set("x-user-id", "user-1")
        .set("x-run-id", "run-1");
      expect(res.status).toBe(400);
      expect(res.body.error).toContain("x-org-id");
      expect(res.body.error).not.toContain("x-user-id");
      expect(res.body.error).not.toContain("x-run-id");
    });

    it("rejects requests missing x-user-id only", async () => {
      const res = await request(app)
        .get("/v1/test-headers")
        .set("x-org-id", "org-1")
        .set("x-run-id", "run-1");
      expect(res.status).toBe(400);
      expect(res.body.error).toContain("x-user-id");
    });

    it("passes when all required headers are present", async () => {
      const res = await request(app)
        .get("/v1/test-headers")
        .set(getFullHeaders());
      expect(res.status).toBe(200);
    });

    it("parses headers into serviceHeaders on the request", async () => {
      const res = await request(app)
        .get("/v1/test-headers")
        .set(getFullHeaders());
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        orgId: "00000000-0000-0000-0000-000000000001",
        userId: "00000000-0000-0000-0000-000000000002",
        runId: "00000000-0000-0000-0000-000000000003",
      });
    });
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { createRun, completeRun, failRun, addRunCosts } from "../../src/services/runs.js";

describe("runs-service client", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("createRun", () => {
    it("sends correct request to runs-service", async () => {
      const mockRun = {
        id: "new-run-id",
        parentRunId: "parent-run-id",
        organizationId: "org-1",
        userId: "user-1",
        serviceName: "human-newsletters-service",
        taskName: "create-newsletter",
        status: "running",
      };

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockRun),
      });
      vi.stubGlobal("fetch", mockFetch);

      const result = await createRun({
        orgId: "org-1",
        userId: "user-1",
        parentRunId: "parent-run-id",
        taskName: "create-newsletter",
      });

      expect(result).toEqual(mockRun);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://runs-mock.test/v1/runs",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            "X-API-Key": "test-runs-key",
          }),
          body: JSON.stringify({
            parentRunId: "parent-run-id",
            organizationId: "org-1",
            userId: "user-1",
            serviceName: "human-newsletters-service",
            taskName: "create-newsletter",
          }),
        })
      );
    });

    it("sets parentRunId from the caller's runId", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: "new-run" }),
      });
      vi.stubGlobal("fetch", mockFetch);

      await createRun({
        orgId: "org-1",
        userId: "user-1",
        parentRunId: "callers-run-id",
        taskName: "test",
      });

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.parentRunId).toBe("callers-run-id");
    });

    it("throws on non-ok response", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: false,
          status: 500,
          text: () => Promise.resolve("Internal error"),
        })
      );

      await expect(
        createRun({
          orgId: "org-1",
          userId: "user-1",
          parentRunId: "run-1",
          taskName: "test",
        })
      ).rejects.toThrow("runs-service returned 500");
    });
  });

  describe("completeRun", () => {
    it("patches run status to completed", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });
      vi.stubGlobal("fetch", mockFetch);

      await completeRun("run-123");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://runs-mock.test/v1/runs/run-123",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ status: "completed" }),
        })
      );
    });
  });

  describe("failRun", () => {
    it("patches run status to failed", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });
      vi.stubGlobal("fetch", mockFetch);

      await failRun("run-456");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://runs-mock.test/v1/runs/run-456",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ status: "failed" }),
        })
      );
    });
  });

  describe("addRunCosts", () => {
    it("posts costs to the run", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });
      vi.stubGlobal("fetch", mockFetch);

      await addRunCosts("run-789", [
        { costName: "email-send", units: 5 },
        { costName: "template-render", units: 1 },
      ]);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://runs-mock.test/v1/runs/run-789/costs",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            costs: [
              { costName: "email-send", units: 5 },
              { costName: "template-render", units: 1 },
            ],
          }),
        })
      );
    });
  });
});

import { Router } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db } from "../db/index.js";
import { newsletters } from "../db/schema.js";
import { requireApiKey } from "../middleware/auth.js";
import { createRun, completeRun, failRun } from "../services/runs.js";

const router = Router();

router.post("/v1/newsletters", requireApiKey, async (req, res) => {
  const { orgId, userId, runId } = req.serviceHeaders;

  let run;
  try {
    run = await createRun({
      orgId,
      userId,
      parentRunId: runId,
      taskName: "create-newsletter",
    });
  } catch (err) {
    console.error("Failed to create run:", err);
    res.status(502).json({ error: "Failed to register run" });
    return;
  }

  try {
    const { title } = req.body;
    if (!title) {
      res.status(400).json({ error: "title is required" });
      return;
    }

    const [created] = await db
      .insert(newsletters)
      .values({ orgId, userId, title })
      .returning();

    await completeRun(run.id);
    res.status(201).json(created);
  } catch (err) {
    console.error("Error creating newsletter:", err);
    if (run) await failRun(run.id).catch(() => {});
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/v1/newsletters", requireApiKey, async (req, res) => {
  try {
    const { orgId } = req.serviceHeaders;
    const { status, limit: limitStr, offset: offsetStr } = req.query;

    const conditions = [eq(newsletters.orgId, orgId)];
    if (status) conditions.push(eq(newsletters.status, status as string));

    const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions);
    const limit = Math.min(Number(limitStr) || 50, 200);
    const offset = Number(offsetStr) || 0;

    const result = await db
      .select()
      .from(newsletters)
      .where(whereClause)
      .orderBy(desc(newsletters.createdAt))
      .limit(limit)
      .offset(offset);

    res.json({ newsletters: result, limit, offset });
  } catch (err) {
    console.error("Error listing newsletters:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/v1/newsletters/:id", requireApiKey, async (req, res) => {
  try {
    const { orgId } = req.serviceHeaders;
    const { id } = req.params;

    const [newsletter] = await db
      .select()
      .from(newsletters)
      .where(and(eq(newsletters.id, id), eq(newsletters.orgId, orgId)))
      .limit(1);

    if (!newsletter) {
      res.status(404).json({ error: "Newsletter not found" });
      return;
    }

    res.json(newsletter);
  } catch (err) {
    console.error("Error getting newsletter:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

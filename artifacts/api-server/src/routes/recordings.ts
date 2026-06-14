import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { recordingsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import {
  CreateRecordingBody,
  GetRecordingParams,
  DeleteRecordingParams,
  ListRecordingsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/recordings", async (req, res) => {
  try {
    const query = ListRecordingsQueryParams.parse(req.query);
    const recordings = query.sessionId
      ? await db.select().from(recordingsTable).where(eq(recordingsTable.sessionId, query.sessionId))
      : await db.select().from(recordingsTable);
    res.json(recordings);
  } catch (err) {
    res.status(500).json({ error: "Failed to list recordings" });
  }
});

router.post("/recordings", async (req, res) => {
  try {
    const body = CreateRecordingBody.parse(req.body);
    const [recording] = await db.insert(recordingsTable).values({
      name: body.name,
      sessionId: body.sessionId,
      events: body.events,
      duration: body.duration,
      bpm: body.bpm,
    }).returning();
    res.status(201).json(recording);
  } catch (err) {
    res.status(400).json({ error: "Invalid recording data" });
  }
});

router.get("/recordings/:id", async (req, res) => {
  try {
    const { id } = GetRecordingParams.parse({ id: Number(req.params.id) });
    const [recording] = await db.select().from(recordingsTable).where(eq(recordingsTable.id, id));
    if (!recording) {
      return res.status(404).json({ error: "Recording not found" });
    }
    return res.json(recording);
  } catch (_err) {
    return res.status(400).json({ error: "Invalid recording ID" });
  }
});

router.delete("/recordings/:id", async (req, res) => {
  try {
    const { id } = DeleteRecordingParams.parse({ id: Number(req.params.id) });
    await db.delete(recordingsTable).where(eq(recordingsTable.id, id));
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: "Failed to delete recording" });
  }
});

export default router;

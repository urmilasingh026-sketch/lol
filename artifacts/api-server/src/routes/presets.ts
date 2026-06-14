import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { presetsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import {
  CreatePresetBody,
  DeletePresetParams,
  ListPresetsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/presets", async (req, res) => {
  try {
    const query = ListPresetsQueryParams.parse(req.query);
    const presets = query.sessionId
      ? await db.select().from(presetsTable).where(eq(presetsTable.sessionId, query.sessionId))
      : await db.select().from(presetsTable);
    res.json(presets);
  } catch (err) {
    res.status(500).json({ error: "Failed to list presets" });
  }
});

router.post("/presets", async (req, res) => {
  try {
    const body = CreatePresetBody.parse(req.body);
    const [preset] = await db.insert(presetsTable).values({
      name: body.name,
      sessionId: body.sessionId,
      settings: body.settings,
      isPublic: body.isPublic ?? false,
    }).returning();
    res.status(201).json(preset);
  } catch (err) {
    res.status(400).json({ error: "Invalid preset data" });
  }
});

router.delete("/presets/:id", async (req, res) => {
  try {
    const { id } = DeletePresetParams.parse({ id: Number(req.params.id) });
    await db.delete(presetsTable).where(eq(presetsTable.id, id));
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: "Failed to delete preset" });
  }
});

export default router;

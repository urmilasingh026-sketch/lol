import { pgTable, text, serial, jsonb, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const recordingsTable = pgTable("recordings", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default("Untitled Recording"),
  sessionId: text("session_id").notNull(),
  events: jsonb("events").notNull().default([]),
  duration: integer("duration").notNull().default(0),
  bpm: integer("bpm").notNull().default(120),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertRecordingSchema = createInsertSchema(recordingsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertRecording = z.infer<typeof insertRecordingSchema>;
export type Recording = typeof recordingsTable.$inferSelect;

export const presetsTable = pgTable("presets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sessionId: text("session_id").notNull(),
  settings: jsonb("settings").notNull().default({}),
  isPublic: boolean("is_public").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPresetSchema = createInsertSchema(presetsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPreset = z.infer<typeof insertPresetSchema>;
export type Preset = typeof presetsTable.$inferSelect;

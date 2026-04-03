import {
  pgTable,
  serial,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

export const brainEntries = pgTable(
  "brain_entries",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    path: text("path").notNull(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    category: text("category").default("general"),
    tags: text("tags").array().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [unique().on(table.userId, table.path)]
);

export const actionLogs = pgTable("action_logs", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  action: text("action").notNull(),
  toolName: text("tool_name").notNull(),
  riskLevel: text("risk_level").notNull(),
  status: text("status").notNull(),
  inputSummary: text("input_summary"),
  outputSummary: text("output_summary"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

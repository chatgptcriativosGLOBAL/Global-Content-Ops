import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const workflowState = sqliteTable("workflow_state", {
  id: integer("id").primaryKey(),
  state: text("state").notNull(),
  updatedAt: text("updated_at").notNull(),
});

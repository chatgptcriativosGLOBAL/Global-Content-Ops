import { env } from "cloudflare:workers";
import { initialWorkflow, type WorkflowState } from "../../../lib/workflow";

async function ensureDatabase() {
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS workflow_state (
      id INTEGER PRIMARY KEY,
      state TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,
  ).run();
}

export async function GET() {
  await ensureDatabase();
  const row = await env.DB.prepare("SELECT state FROM workflow_state WHERE id = ?")
    .bind(1)
    .first<{ state: string }>();

  if (!row) {
    const now = new Date().toISOString();
    await env.DB.prepare(
      "INSERT INTO workflow_state (id, state, updated_at) VALUES (?, ?, ?)",
    )
      .bind(1, JSON.stringify(initialWorkflow), now)
      .run();
    return Response.json(initialWorkflow);
  }

  return Response.json(JSON.parse(row.state) as WorkflowState);
}

export async function PUT(request: Request) {
  await ensureDatabase();
  const next = (await request.json()) as WorkflowState;
  await env.DB.prepare(
    `INSERT INTO workflow_state (id, state, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET state = excluded.state, updated_at = excluded.updated_at`,
  )
    .bind(1, JSON.stringify(next), new Date().toISOString())
    .run();
  return Response.json(next);
}

export async function DELETE() {
  await ensureDatabase();
  await env.DB.prepare("DELETE FROM workflow_state WHERE id = ?").bind(1).run();
  return Response.json(initialWorkflow);
}

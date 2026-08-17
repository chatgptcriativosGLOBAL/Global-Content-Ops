export type WorkflowState = {
  version: "V3" | "V4";
  status: "client_review" | "change_requested" | "v4_ready" | "approved";
  packageId: string;
  releaseId: string | null;
  changeRequest: string | null;
  todaySent: boolean;
  notifications: Array<{ id: string; text: string; time: string; unread: boolean }>;
};

export const initialWorkflow: WorkflowState = {
  version: "V3",
  status: "client_review",
  packageId: "AP-1308-04",
  releaseId: null,
  changeRequest: null,
  todaySent: false,
  notifications: [
    { id: "n1", text: "V3 enviada para sua aprovação", time: "Há 12 min", unread: true },
    { id: "n2", text: "Brand Guard concluído com score 100", time: "Há 35 min", unread: true },
    { id: "n3", text: "Novo comentário interno no conteúdo", time: "Ontem", unread: false },
  ],
};

export const statusLabel: Record<WorkflowState["status"], string> = {
  client_review: "Cliente revisando",
  change_requested: "Alteração solicitada",
  v4_ready: "V4 pronta para reaprovação",
  approved: "Aprovado para publicação",
};

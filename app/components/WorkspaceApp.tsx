"use client";

import { useEffect, useMemo, useState } from "react";
import { initialWorkflow, statusLabel, type WorkflowState } from "../../lib/workflow";

type Module = "inbox" | "calendar" | "content-room" | "compare" | "approval-package" | "client-review" | "approved-release" | "today-trend";

const routes: Array<{ href: string; label: string; icon: string; section?: string; badge?: string }> = [
  { href: "/inbox", label: "Para você", icon: "⌂", section: "Operação", badge: "6" },
  { href: "/calendar", label: "Calendário", icon: "□" },
  { href: "/content-room", label: "Content Room", icon: "C" },
  { href: "/today-trend", label: "Today / Trend", icon: "↗", badge: "2" },
  { href: "/client-review", label: "Client Review", icon: "✓", section: "Aprovação" },
  { href: "/compare", label: "Compare", icon: "◫" },
  { href: "/approval-package", label: "Approval Package", icon: "P" },
  { href: "/approved-release", label: "Approved Release", icon: "R" },
];

const pageTitles: Record<Module, string> = {
  inbox: "Para você",
  calendar: "Calendário editorial",
  "content-room": "Content Room",
  compare: "Compare",
  "approval-package": "Approval Package",
  "client-review": "Client Review",
  "approved-release": "Approved Release",
  "today-trend": "Today / Trend",
};

export function WorkspaceApp({ module }: { module: Module }) {
  const pathname = `/${module}`;
  const [role, setRole] = useState<"agency" | "client">("agency");
  const [workflow, setWorkflow] = useState<WorkflowState>(initialWorkflow);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [changeOpen, setChangeOpen] = useState(false);
  const [changeText, setChangeText] = useState("Reduzir um pouco mais a mão e aproximar o packshot do centro.");

  useEffect(() => {
    setRole((window.localStorage.getItem("docile-role") as "agency" | "client") || "agency");
    fetch("/api/workflow")
      .then((response) => response.json())
      .then(setWorkflow)
      .catch(() => setWorkflow(initialWorkflow))
      .finally(() => setLoading(false));
  }, []);

  async function persist(next: WorkflowState, message: string) {
    setWorkflow(next);
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3200);
    await fetch("/api/workflow", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(next),
    });
  }

  async function resetDemo() {
    const response = await fetch("/api/workflow", { method: "DELETE" });
    setWorkflow(await response.json());
    setNotice("Cenário reiniciado para um novo teste.");
    window.location.assign("/inbox");
  }

  function requestChange() {
    const next: WorkflowState = {
      ...workflow,
      status: "change_requested",
      changeRequest: changeText,
      notifications: [
        { id: crypto.randomUUID(), text: "Cliente solicitou alteração na V3", time: "Agora", unread: true },
        ...workflow.notifications,
      ],
    };
    setChangeOpen(false);
    persist(next, "Change Request enviado. A V3 foi bloqueada para aprovação.");
    window.location.assign("/content-room");
  }

  function createV4() {
    const next: WorkflowState = {
      ...workflow,
      version: "V4",
      status: "v4_ready",
      packageId: "AP-1308-05",
      notifications: [
        { id: crypto.randomUUID(), text: "V4 pronta para reaprovação", time: "Agora", unread: true },
        ...workflow.notifications,
      ],
    };
    persist(next, "V4 criada e novo Approval Package gerado.");
  }

  function approve() {
    const next: WorkflowState = {
      ...workflow,
      status: "approved",
      releaseId: workflow.version === "V4" ? "AR-1308-05" : "AR-1308-04",
      notifications: [
        { id: crypto.randomUUID(), text: `${workflow.version} aprovada. Release disponível.`, time: "Agora", unread: true },
        ...workflow.notifications,
      ],
    };
    persist(next, `${workflow.version} aprovada. Approved Release gerado.`);
    window.location.assign("/approved-release");
  }

  const visibleRoutes = useMemo(
    () => role === "client" ? routes.filter((r) => !["/today-trend"].includes(r.href)) : routes,
    [role],
  );

  return (
    <div className="workspace">
      <aside className={mobileNav ? "sidebar open" : "sidebar"}>
        <div className="brand-lockup">
          <span className="brand-mark">G</span>
          <span><b>GLOBAL</b><small>CONTENT OPS</small></span>
        </div>
        <div className="client-chip"><span className="docile-dot">D</span><div><small>CLIENTE</small><b>Docile</b></div><span>⌄</span></div>
        <nav>
          {visibleRoutes.map((item) => (
            <div key={item.href}>
              {item.section && <p className="nav-section">{item.section}</p>}
              <a href={item.href} className={pathname === item.href ? "active" : ""} onClick={() => setMobileNav(false)}>
                <span className="nav-icon">{item.icon}</span>{item.label}{item.badge && <em>{item.badge}</em>}
              </a>
            </div>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="user-mini"><span>{role === "agency" ? "AG" : "CM"}</span><div><b>{role === "agency" ? "Ana · Global" : "Cliente Marketing"}</b><small>{role === "agency" ? "Atendimento" : "Aprovador"}</small></div></div>
          <button onClick={resetDemo}>Reiniciar cenário</button>
          <a href="/login">Sair</a>
        </div>
      </aside>
      <main className="main-panel">
        <header className="topbar">
          <button className="menu-button" onClick={() => setMobileNav(!mobileNav)} aria-label="Abrir menu">☰</button>
          <div><small>{role === "agency" ? "GLOBAL × DOCILE" : "DOCILE · ÁREA DO CLIENTE"}</small><h1>{pageTitles[module]}</h1></div>
          <div className="top-actions">
            <a className="button button-quiet desktop-only" href="/calendar">＋ Novo conteúdo</a>
            <button className="notification-button" onClick={() => setNotificationsOpen(!notificationsOpen)} aria-label="Notificações">♢<span /></button>
            <span className="avatar">{role === "agency" ? "AG" : "CM"}</span>
          </div>
        </header>
        {notificationsOpen && <Notifications items={workflow.notifications} />}
        <div className="page-shell">
          {loading ? <LoadingState /> : <ModuleContent module={module} workflow={workflow} role={role} onChange={() => setChangeOpen(true)} onApprove={approve} onCreateV4={createV4} onPersist={persist} />}
        </div>
      </main>
      {notice && <div className="toast"><span>✓</span>{notice}</div>}
      {changeOpen && (
        <div className="modal-backdrop" onMouseDown={() => setChangeOpen(false)}>
          <div className="modal-card" onMouseDown={(event) => event.stopPropagation()}>
            <span className="modal-icon">↻</span><h2>Solicitar alteração</h2><p>O pedido ficará vinculado à {workflow.version} e visível para a agência.</p>
            <label>O que precisa mudar?<textarea value={changeText} onChange={(e) => setChangeText(e.target.value)} /></label>
            <label>Onde?<select><option>Card 2 · Imagem</option><option>Legenda</option><option>Carrossel completo</option></select></label>
            <div className="modal-actions"><button className="button button-quiet" onClick={() => setChangeOpen(false)}>Cancelar</button><button className="button button-danger" onClick={requestChange}>Enviar Change Request</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

function ModuleContent(props: {
  module: Module; workflow: WorkflowState; role: "agency" | "client";
  onChange: () => void; onApprove: () => void; onCreateV4: () => void;
  onPersist: (next: WorkflowState, message: string) => void;
}) {
  switch (props.module) {
    case "inbox": return <Inbox {...props} />;
    case "calendar": return <Calendar workflow={props.workflow} />;
    case "content-room": return <ContentRoom {...props} />;
    case "compare": return <Compare workflow={props.workflow} />;
    case "approval-package": return <ApprovalPackage workflow={props.workflow} />;
    case "client-review": return <ClientReview {...props} />;
    case "approved-release": return <ApprovedRelease workflow={props.workflow} />;
    case "today-trend": return <TodayTrend workflow={props.workflow} onPersist={props.onPersist} />;
  }
}

function PageIntro({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="page-intro"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2>{title}</h2><p>{description}</p></div>{action}</div>;
}

function Inbox({ workflow, role }: { workflow: WorkflowState; role: "agency" | "client" }) {
  const client = role === "client";
  return <>
    <PageIntro eyebrow="SEGUNDA, 17 DE AGOSTO" title={client ? "Suas aprovações" : "Bom dia, Ana."} description={client ? "Veja o que precisa da sua decisão agora." : "A operação está sob controle. Três itens precisam da sua atenção."} action={<a className="button button-primary" href="/calendar">Abrir calendário →</a>} />
    <div className="metrics">
      <Metric label={client ? "Para revisar" : "Aguardando cliente"} value={workflow.status === "approved" ? "5" : "6"} note="2 vencem hoje" tone="orange" />
      <Metric label="Alterações solicitadas" value={workflow.status === "change_requested" ? "4" : "3"} note="1 crítico" tone="red" />
      <Metric label="Aprovados esta semana" value={workflow.status === "approved" ? "13" : "12"} note="prontos para release" tone="green" />
      <Metric label="Today / Trend" value="2" note="fluxo expresso" tone="blue" />
    </div>
    <div className="inbox-grid">
      <section className="surface priority-surface"><div className="surface-title"><div><h3>Prioridades</h3><p>Ordenadas por prazo e impacto.</p></div><button>Ver todas</button></div>
        <Priority tone={workflow.status === "change_requested" ? "red" : workflow.status === "approved" ? "green" : "orange"} status={statusLabel[workflow.status]} title="Você aceita… dividir um Docile comigo?" meta={`Instagram Feed · Carrossel · ${workflow.version}`} deadline={workflow.status === "approved" ? "Concluído" : "Hoje, 18h"} href="/content-room" />
        <Priority tone="blue" status="TODAY" title="Trend de oportunidade" meta="TikTok · Vídeo vertical · V1" deadline="Hoje, 16h" href="/today-trend" />
        <Priority tone="red" status="Alteração" title="Levando Docile para dividir" meta="Instagram Feed · Carrossel · V2" deadline="Amanhã" href="/content-room" />
      </section>
      <section className="surface operation-card"><div className="surface-title"><div><h3>Operação de hoje</h3><p>Visão geral do workspace.</p></div></div><div className="operation-grid"><MiniMetric label="SLA médio" value="8h 14m" trend="↓ 12%" /><MiniMetric label="Integridade" value="100%" trend="Tudo certo" /><MiniMetric label="Pendências" value="9" trend="3 críticas" /><MiniMetric label="Publicações" value="4" trend="Hoje" /></div><div className="progress-line"><span style={{ width: "74%" }} /></div><small>74% da operação do dia concluída</small></section>
    </div>
  </>;
}

function Metric({ label, value, note, tone }: { label: string; value: string; note: string; tone: string }) { return <div className="metric surface"><span className={`metric-icon ${tone}`}>●</span><small>{label}</small><b>{value}</b><em className={tone}>{note}</em></div>; }
function MiniMetric({ label, value, trend }: { label: string; value: string; trend: string }) { return <div><small>{label}</small><b>{value}</b><span>{trend}</span></div>; }
function Priority({ tone, status, title, meta, deadline, href }: { tone: string; status: string; title: string; meta: string; deadline: string; href: string }) { return <a className="priority-row" href={href}><div className={`content-thumb ${tone}`}><span>DOCILE</span></div><div className="priority-copy"><span className={`badge ${tone}`}>{status}</span><h4>{title}</h4><p>{meta}</p></div><div className="deadline"><small>Prazo</small><b>{deadline}</b><span>→</span></div></a>; }

function Calendar({ workflow }: { workflow: WorkflowState }) {
  const events = [
    ["10", "Websérie 35 anos", "YouTube · Vídeo", "green"], ["11", "Docilovers", "IG Feed · Estático", "green"], ["12", "Vimos alguma coisa?", "IG Feed · Estático", "green"],
    ["13", "Você aceita… dividir um Docile comigo?", `IG · Carrossel · ${workflow.version}`, workflow.status === "approved" ? "green" : workflow.status === "change_requested" ? "red" : "orange"],
    ["14", "Levando Docile para dividir", "IG · Carrossel", "red"], ["17", "Trend de oportunidade", "TikTok · TODAY", "blue"], ["18", "Não passe para o lado…", "IG · Carrossel", "orange"],
  ];
  return <><PageIntro title="Agosto 2026" description="Planejamento editorial e estado de cada entrega." action={<button className="button button-primary">＋ Novo conteúdo</button>} /><div className="calendar-toolbar"><div><button className="active">Mês</button><button>Semana</button><button>Lista</button></div><div><select><option>Todos os canais</option><option>Instagram</option><option>TikTok</option></select><select><option>Todos os status</option><option>Em aprovação</option><option>Aprovado</option></select></div></div><section className="surface calendar"><div className="weekdays">{["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"].map(x => <b key={x}>{x}</b>)}</div><div className="calendar-days">{Array.from({ length: 14 }, (_, index) => { const date = String(index + 10); const event = events.find(e => e[0] === date); return <div className={date === "17" ? "today-cell" : ""} key={date}><span>{date}</span>{event && <a href={date === "17" ? "/today-trend" : date === "13" ? "/content-room" : "/calendar"} className={`calendar-event ${event[3]}`}><b>{event[1]}</b><small>{event[2]}</small></a>}</div>; })}</div></section></>;
}

function ContentRoom({ workflow, role, onCreateV4 }: { workflow: WorkflowState; role: "agency" | "client"; onCreateV4: () => void }) {
  const [tab, setTab] = useState("Briefing"); const [format, setFormat] = useState("Carrossel");
  return <><PageIntro eyebrow={`CI-1308-04 · ${workflow.version}`} title="Você aceita… dividir um Docile comigo?" description="Instagram · Feed · Carrossel · 13 de agosto" action={<span className={`status-pill ${workflow.status}`}>{statusLabel[workflow.status]}</span>} /><div className="content-room-grid"><section><div className="format-tabs">{["Feed", "Carrossel", "Reels", "Stories", "TikTok", "YouTube"].map(x => <button className={format === x ? "active" : ""} key={x} onClick={() => setFormat(x)}>{x}</button>)}</div><CreativePreview format={format} version={workflow.version} /><div className="content-tabs">{["Briefing", "Copy", "Assets", "Versions", "Comments", "Approval"].map(x => <button className={tab === x ? "active" : ""} key={x} onClick={() => setTab(x)}>{x}</button>)}</div><TabPanel tab={tab} workflow={workflow} /></section><aside className="details-stack"><InfoCard title="Estrutura" rows={[["Canal", "Instagram"], ["Placement", "Feed"], ["Mídia", "Imagem"], ["Estrutura", "Carrossel"]]} /><InfoCard title="Brand Guard" rows={[["Score", "100/100"], ["Paleta", "OK"], ["Packshot", "OK"], ["Safe area", "OK"]]} good /><InfoCard title="Aprovação" rows={[["Package", workflow.packageId], ["Versão", workflow.version], ["Copy", "V2"]]} action={<><a className="button button-quiet button-wide" href="/compare">Comparar versões</a><a className="button button-primary button-wide" href="/client-review">Abrir Client Review</a>{role === "agency" && workflow.status === "change_requested" && <button className="button button-dark button-wide" onClick={onCreateV4}>Criar V4 e reenviar</button>}</>} /></aside></div></>;
}

function CreativePreview({ format, version, compact = false }: { format: string; version: string; compact?: boolean }) {
  const vertical = ["Reels", "Stories", "TikTok"].includes(format);
  return <div className={`social-preview ${vertical ? "vertical" : ""} ${compact ? "compact" : ""}`}><div className="social-head"><span>D</span><div><b>docileoficial</b><small>{format === "Carrossel" ? "Instagram Carrossel · 1/5" : format}</small></div><em>•••</em></div><div className={`creative-art ${version === "V4" ? "v4" : ""}`}><div className="sweet sweet-one" /><div className="sweet sweet-two" /><span className="creative-label">MARSHMALLOW HERO</span><h3>{version === "V4" ? "gentileza fica melhor quando é compartilhada" : "dividir é um gesto de gentileza"}</h3>{vertical && <span className="play-button">▶</span>}</div>{!vertical && <><div className="carousel-dots"><i /><i /><i /><i /><i /></div><p><b>Bora de Docile?</b> Prometo deixar você ficar com o último. 🤭 🧡</p></>}</div>;
}

function TabPanel({ tab, workflow }: { tab: string; workflow: WorkflowState }) {
  if (tab === "Briefing") return <div className="tab-panel form-grid"><label>Tema<input defaultValue="Você aceita… dividir um Docile comigo?" /></label><label>Objetivo<input defaultValue="Conexão emocional" /></label><label className="wide">Direcional<textarea defaultValue="Formato nativo digital para inserir diferentes produtos e incentivar compartilhamento." /></label></div>;
  if (tab === "Copy") return <div className="tab-panel"><label>Legenda<textarea defaultValue="Bora de Docile? Prometo deixar você ficar com o último. 🤭 🧡\n\n#Docile #FeitosDeGentileza" /></label><span className="badge green">Copy V2</span></div>;
  if (tab === "Assets") return <div className="tab-panel"><FileRow badge={workflow.version} title={`docile_carrossel_${workflow.version.toLowerCase()}.png`} meta="Google Drive · 1080×1350 · 5 cards" /><FileRow badge="V2" title="docile_carrossel_v2.png" meta="Versão anterior" /></div>;
  if (tab === "Versions") return <div className="tab-panel"><Timeline workflow={workflow} /></div>;
  if (tab === "Comments") return <div className="tab-panel"><FileRow badge="CR" title="Cliente Marketing" meta={workflow.changeRequest || "A mão ainda está muito grande."} /><FileRow badge="INT" title="Atendimento" meta="Validar com criação antes de reenviar." /></div>;
  return <div className="tab-panel"><InfoCard title="Package congelado" rows={[["Package", workflow.packageId], ["Asset", workflow.version], ["Copy", "V2"]]} /></div>;
}

function FileRow({ badge, title, meta }: { badge: string; title: string; meta: string }) { return <div className="file-row"><span>{badge}</span><div><b>{title}</b><small>{meta}</small></div><button>•••</button></div>; }
function InfoCard({ title, rows, good, action }: { title: string; rows: string[][]; good?: boolean; action?: React.ReactNode }) { return <section className="surface info-card"><h3>{title}</h3>{rows.map(row => <div className="info-row" key={row[0]}><span>{row[0]}</span><b className={good && row[0] !== "Score" ? "good" : ""}>{row[1]}</b></div>)}{action && <div className="card-actions">{action}</div>}</section>; }

function Timeline({ workflow }: { workflow: WorkflowState }) { return <div className="version-timeline"><div className="done"><span>✓</span><div><b>V2 · Change Request</b><small>Cliente solicitou ajustes visuais</small></div></div><div className={workflow.version === "V3" ? "current" : "done"}><span>{workflow.version === "V3" ? "3" : "✓"}</span><div><b>V3 · {workflow.version === "V3" ? "Atual" : "Substituída"}</b><small>Brand Guard 100/100</small></div></div>{workflow.version === "V4" && <div className="current"><span>4</span><div><b>V4 · Atual</b><small>Pronta para reaprovação</small></div></div>}</div>; }

function Compare({ workflow }: { workflow: WorkflowState }) { const [overlay, setOverlay] = useState(false); const [split, setSplit] = useState(54); const previous = workflow.version === "V4" ? "V3" : "V2"; return <><PageIntro title={`${previous} × ${workflow.version}`} description="Confira visualmente o que mudou antes de decidir." action={<a className="button button-primary" href="/client-review">Ir para decisão →</a>} /><div className="compare-toggle"><button className={!overlay ? "active" : ""} onClick={() => setOverlay(false)}>Lado a lado</button><button className={overlay ? "active" : ""} onClick={() => setOverlay(true)}>Sobreposição</button></div>{overlay ? <section className="surface overlay-card"><div className="overlay-stage"><div className="overlay-layer"><CreativePreview format="Carrossel" version={previous} compact /></div><div className="overlay-layer top" style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}><CreativePreview format="Carrossel" version={workflow.version} compact /></div><span className="split-line" style={{ left: `${split}%` }} /></div><input type="range" value={split} min="5" max="95" onChange={(e) => setSplit(Number(e.target.value))} /></section> : <div className="compare-grid"><section className="surface compare-card"><div><b>{previous}</b><span className="badge gray">Anterior</span></div><CreativePreview format="Carrossel" version={previous} compact /><p>Feedback: mão menor e packshot maior.</p></section><section className="surface compare-card"><div><b>{workflow.version}</b><span className="badge green">Atual</span></div><CreativePreview format="Carrossel" version={workflow.version} compact /><p>✓ Feedback resolvido nesta versão.</p></section></div>}<section className="resolved-feedback"><span>✓</span><div><b>Feedback resolvido</b><p>Elemento principal reduzido e produto reposicionado para ganhar legibilidade.</p></div></section></>;
}

function ApprovalPackage({ workflow }: { workflow: WorkflowState }) { return <><PageIntro eyebrow={workflow.packageId} title="Pacote congelado para decisão" description="A combinação exata de criativo, copy e placement que o cliente está revisando." action={<span className="status-pill client_review">Em aprovação</span>} /><div className="package-grid"><section className="surface package-hero"><CreativePreview format="Carrossel" version={workflow.version} compact /></section><aside className="details-stack"><InfoCard title="Conteúdo do package" rows={[["Asset", workflow.version], ["Copy", "V2"], ["Placement", "Instagram Feed"], ["Brand Guard", "100/100"]]} good /><InfoCard title="Aprovadores" rows={[["Atendimento", "Aprovado"], ["Criação", "Aprovado"], ["Cliente Marketing", workflow.status === "approved" ? "Aprovado" : "Pendente"]]} /><a className="button button-primary button-wide" href="/client-review">Abrir revisão do cliente →</a></aside></div></>;
}

function ClientReview({ workflow, onChange, onApprove }: { workflow: WorkflowState; onChange: () => void; onApprove: () => void }) { return <><PageIntro eyebrow={`${workflow.packageId} · 1 DE 4`} title="Sua decisão" description="Compare com a versão anterior e aprove somente quando estiver tudo certo." /><div className="review-layout"><div className="phone"><div className="phone-top"><span>9:41</span><b>Docile Approval</b><span>•••</span></div><div className="review-progress"><span /></div><CreativePreview format="Carrossel" version={workflow.version} compact /><div className="phone-actions"><a className="button button-quiet button-wide" href="/compare">◫ Comparar com anterior</a><div><button className="button button-danger" onClick={onChange}>Solicitar alteração</button><button className="button button-primary" onClick={onApprove}>Aprovar {workflow.version}</button></div></div></div><aside className="details-stack"><InfoCard title="Resumo" rows={[["Formato", "Carrossel Feed"], ["Versão", workflow.version], ["Package", workflow.packageId], ["Prazo", "Hoje, 18h"]]} /><section className="surface info-card"><h3>Como funciona</h3><div className="decision-flow"><div className="done"><span>✓</span><div><b>Agência validou</b><small>Brand Guard e atendimento concluídos</small></div></div><div className="current"><span>2</span><div><b>Você decide</b><small>Aprovar ou solicitar alteração</small></div></div><div><span>3</span><div><b>Approved Release</b><small>Gerado após sua aprovação</small></div></div></div></section></aside></div></>;
}

function ApprovedRelease({ workflow }: { workflow: WorkflowState }) { if (!workflow.releaseId) return <EmptyRelease />; return <><PageIntro eyebrow={workflow.releaseId} title="Aprovado para publicação" description="Esta é a fonte única e rastreável para o handoff de publicação." action={<span className="release-seal">✓ APPROVED</span>} /><div className="release-grid"><section className="surface release-preview"><CreativePreview format="Carrossel" version={workflow.version} compact /><div className="integrity"><span>✓</span><div><b>Integridade verificada</b><small>Asset, copy e placement correspondem ao package aprovado.</small></div></div></section><aside className="details-stack"><InfoCard title="Release" rows={[["ID", workflow.releaseId], ["Asset aprovado", workflow.version], ["Copy aprovada", "V2"], ["Canal", "Instagram Feed"], ["Integridade", "100%"]]} good /><button className="button button-primary button-wide">Abrir arquivo para publicar ↗</button><p className="release-note">Somente este release deve ser usado no handoff de publicação.</p></aside></div></> }
function EmptyRelease() { return <div className="empty-state"><span>R</span><h2>Nenhum release gerado ainda</h2><p>O Approved Release aparece aqui automaticamente depois da aprovação do cliente.</p><a className="button button-primary" href="/client-review">Ir para Client Review →</a></div>; }

function TodayTrend({ workflow, onPersist }: { workflow: WorkflowState; onPersist: (next: WorkflowState, message: string) => void }) { function send() { onPersist({ ...workflow, todaySent: true, notifications: [{ id: crypto.randomUUID(), text: "Today/Trend enviado para aprovação expressa", time: "Agora", unread: true }, ...workflow.notifications] }, "Enviado com prioridade alta para o cliente."); } return <><PageIntro eyebrow="EXPRESS LANE" title="Trend de oportunidade" description="Fluxo encurtado para conteúdo com janela de relevância curta." action={<span className="countdown">11h 29m</span>} /><div className="today-grid"><section className="surface today-main"><div className="today-header"><span>↗</span><div><b>Janela de oportunidade</b><p>Publicar hoje até 20h para aproveitar o pico da conversa.</p></div></div><CreativePreview format="TikTok" version="V3" compact /><div className="today-actions"><InfoCard title="Critérios rápidos" rows={[["Brand Guard", "Quick pass"], ["Aprovador", "Cliente Marketing"], ["Canal", "TikTok"]]} good /><button className="button button-primary button-wide" onClick={send} disabled={workflow.todaySent}>{workflow.todaySent ? "✓ Enviado para decisão" : "Enviar para aprovação expressa →"}</button></div></section><aside className="surface info-card"><h3>Express lane</h3><div className="decision-flow"><div className="done"><span>✓</span><div><b>Ideia aprovada</b><small>Atendimento + criação</small></div></div><div className={workflow.todaySent ? "done" : "current"}><span>{workflow.todaySent ? "✓" : "2"}</span><div><b>Enviar cliente</b><small>Notificação prioritária</small></div></div><div className={workflow.todaySent ? "current" : ""}><span>3</span><div><b>Decisão</b><small>Aprovar ou alterar</small></div></div><div><span>4</span><div><b>Release</b><small>Handoff imediato</small></div></div></div></aside></div></> }

function Notifications({ items }: { items: WorkflowState["notifications"] }) { return <div className="notifications"><div><h3>Notificações</h3><button>Marcar como lidas</button></div>{items.slice(0, 5).map(item => <div className={item.unread ? "unread" : ""} key={item.id}><span>●</span><p><b>{item.text}</b><small>{item.time}</small></p></div>)}</div>; }
function LoadingState() { return <div className="loading-state"><span /><span /><span /></div>; }

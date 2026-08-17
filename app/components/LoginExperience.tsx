"use client";

import { useState } from "react";

export function LoginExperience() {
  const [role, setRole] = useState<"agency" | "client">("agency");

  function rememberRole() {
    window.localStorage.setItem("docile-role", role);
  }

  return (
    <main className="login-page">
      <section className="login-story">
        <div className="brand-lockup brand-lockup-light">
          <span className="brand-mark">G</span>
          <span><b>GLOBAL</b><small>CONTENT OPS</small></span>
        </div>
        <div className="login-message">
          <p className="eyebrow">GLOBAL × DOCILE</p>
          <h1>Da ideia aprovada ao arquivo certo para publicar.</h1>
          <p>Planejamento, revisão e handoff em um só fluxo — com cada decisão registrada.</p>
        </div>
        <div className="login-proof">
          <span>18 conteúdos em operação</span>
          <span>100% de integridade</span>
        </div>
      </section>
      <section className="login-form-wrap">
        <div className="login-form">
          <span className="product-pill">AMBIENTE DE VALIDAÇÃO</span>
          <h2>Bem-vindo de volta</h2>
          <p>Escolha um perfil para percorrer a experiência.</p>
          <label>E-mail<input defaultValue="demo@global.ag" /></label>
          <label>Senha<input type="password" defaultValue="12345678" /></label>
          <div className="role-picker" aria-label="Perfil de acesso">
            <button className={role === "agency" ? "selected" : ""} onClick={() => setRole("agency")}>
              <b>Agência</b><span>Planejar, produzir e enviar</span>
            </button>
            <button className={role === "client" ? "selected" : ""} onClick={() => setRole("client")}>
              <b>Cliente</b><span>Revisar, comparar e decidir</span>
            </button>
          </div>
          <a className="button button-primary button-wide" href="/inbox" onClick={rememberRole}>
            Entrar como {role === "agency" ? "Agência" : "Cliente"} <span>→</span>
          </a>
          <small className="form-note">Dados demonstrativos · Nenhuma senha real é necessária</small>
        </div>
      </section>
    </main>
  );
}

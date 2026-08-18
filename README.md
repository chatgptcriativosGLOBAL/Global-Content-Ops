# Global Content Ops · Docile

Aplicação web de validação para o fluxo de operação, revisão e aprovação de
conteúdo entre Global e Docile.

## O que está incluído

- login demonstrativo para Agência e Cliente;
- Inbox e Calendário editorial;
- Content Room com previews por placement;
- Compare lado a lado e por sobreposição;
- Approval Package e Client Review;
- Change Request → V4 → reaprovação;
- Approved Release;
- Today / Trend;
- estado de workflow persistido em Cloudflare D1.

## Desenvolvimento local

Requer Node.js `>=22.13.0`.

```bash
npm install
npm run dev
```

A aplicação fica disponível em `http://localhost:3000`.

## Validação

```bash
npm run build
npm test
```

## Estrutura

- `app/`: páginas, componentes e API do workflow;
- `lib/`: modelo de estado do produto;
- `db/` e `drizzle/`: schema e migração do banco;
- `public/`: assets públicos e imagem social;
- `worker/`: entrada de produção compatível com Cloudflare Workers.

## Ambiente publicado

[Abrir Docile Content Ops](https://docile-content-ops.agencia-glob-4404.chatgpt.site)

O ambiente atual é um MVP de validação. Autenticação externa, integrações com
Drive, notificações reais e controles avançados de permissão ficam para a fase
de backend robusto.

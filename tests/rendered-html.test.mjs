import assert from "node:assert/strict";
import test from "node:test";

async function render(pathname) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html", host: "localhost" },
    }),
    {
      ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
    },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("renders the Global + Docile login experience", async () => {
  const response = await render("/login");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /GLOBAL \+ DOCILE/);
  assert.match(html, /Bem-vindo de volta/);
  assert.match(html, /Entrar como[\s\S]*Agência/);
  assert.match(html, /href="\/inbox"/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/i);
});

test("renders a real workspace route", async () => {
  const response = await render("/compare");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Compare/);
  assert.match(html, /<h1>Compare<\/h1>/);
  assert.match(html, /href="\/client-review"/);
  assert.match(html, /href="\/content-room"/);
});

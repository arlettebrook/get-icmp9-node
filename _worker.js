export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const params = url.searchParams;

    // 如果没有 uuid，当作前端页面请求
    if (!params.has("uuid")) {
      return new Response(getHTML(url.origin), {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      });
    }

    /* ================= 原有功能开始（保持不变） ================= */

    const server = params.get("server") || "tunnel.icmp9.com";
    const port = parseInt(params.get("port") || "443", 10);
    const uuid = params.get("uuid") || "";
    const servername = params.get("servername") || server;
    const tls = (params.get("tls") || "true") === "true";

    // 获取 API 数据
    let apiData = null;
    try {
      const apiResp = await fetch("https://api.icmp9.com/online.php", {
        cf: { cacheTtl: 60, cacheEverything: true },
      });
      apiData = await apiResp.json();
    } catch (e) {
      apiData = null;
    }

    const proxies = [];
    const proxyNames = ["DIRECT"];

    if (apiData && apiData.success && Array.isArray(apiData.countries)) {
      for (const country of apiData.countries) {
        const code = (country.code || "").toUpperCase();
        const name = `${country.emoji} ${code} | ${country.name}`;
        const path = `/${country.code}`;

        proxies.push({
          name,
          type: "vmess",
          server,
          port,
          uuid,
          alterId: 0,
          cipher: "auto",
          tls,
          servername,
          network: "ws",
          path,
        });

        proxyNames.push(name);
      }
    }

    // 生成 YAML
    let yaml = "";
    yaml += "mixed-port: 7890\n";
    yaml += "allow-lan: true\n";
    yaml += "mode: rule\n";
    yaml += "log-level: info\n\n";

    yaml += "proxies:\n";
    for (const p of proxies) {
      yaml += `  - name: '${p.name}'\n`;
      yaml += `    type: ${p.type}\n`;
      yaml += `    server: '${p.server}'\n`;
      yaml += `    port: ${p.port}\n`;
      yaml += `    uuid: ${p.uuid}\n`;
      yaml += `    alterId: 0\n`;
      yaml += `    cipher: auto\n`;
      yaml += `    tls: ${p.tls ? "true" : "false"}\n`;
      yaml += `    servername: '${p.servername}'\n`;
      yaml += `    network: ws\n`;
      yaml += `    ws-opts:\n`;
      yaml += `      path: '${p.path}'\n`;
      yaml += `      headers:\n`;
      yaml += `        Host: '${p.servername}'\n`;
    }

    yaml += "\nproxy-groups:\n";
    yaml += "  - name: '🚀 节点选择'\n";
    yaml += "    type: select\n";
    yaml += "    proxies:\n";
    for (const name of proxyNames) {
      yaml += `      - '${name}'\n`;
    }

    yaml += "\nrules:\n";
    yaml += "  - MATCH, 🚀 节点选择\n";

    return new Response(yaml, {
      headers: {
        "Content-Type": "text/yaml; charset=utf-8",
      },
    });
  },
};

/* ================= 前端 HTML ================= */

function getHTML(origin) {
  return `<!DOCTYPE html>
<html lang="zh-CN" data-theme="dark">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>ICMP9 Clash订阅生成器</title>

<style>
/* =====================
   主题变量
===================== */
:root {
  /* 背景 */
  --bg: radial-gradient(1200px 600px at 10% -10%, #0f172a 0%, #020617 70%);
  --card: rgba(10, 15, 35, 0.88);

  /* 文本 */
  --text: #e5e7eb;
  --sub: #94a3b8;

  /* 边框 & 高亮 */
  --border: rgba(99,102,241,.28);
  --focus: rgba(99,102,241,.45);

  /* 主色 */
  --primary: linear-gradient(135deg, #38bdf8, #6366f1);

  /* 阴影 */
  --shadow-card: 0 30px 60px rgba(0,0,0,.55);
  --shadow-btn: 0 14px 40px rgba(99,102,241,.5);
}

[data-theme="light"] {
  --bg: radial-gradient(1200px 600px at 10% -10%, #e0e7ff 0%, #f8fafc 65%);
  --card: rgba(255,255,255,.95);

  --text: #0f172a;
  --sub: #475569;

  --border: rgba(99,102,241,.25);
  --focus: rgba(79,70,229,.35);

  --primary: linear-gradient(135deg, #2563eb, #4f46e5);

  --shadow-card: 0 30px 60px rgba(0,0,0,.18);
  --shadow-btn: 0 14px 40px rgba(79,70,229,.4);
}

/* =====================
   基础样式
===================== */
* {
  box-sizing: border-box;
  transition: background .25s, color .25s, border .25s, box-shadow .25s;
}

body {
  margin: 0;
  min-height: 100vh;
  padding: 24px 16px;
  font-family: system-ui, -apple-system, BlinkMacSystemFont;
  background: var(--bg);
  color: var(--text);
}

/* =====================
   卡片
===================== */
.card {
  max-width: 520px;
  margin: auto;
  padding: 22px;
  border-radius: 22px;
  background: var(--card);
  backdrop-filter: blur(16px);
  box-shadow: var(--shadow-card);
  border: 1px solid var(--border);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

h1 {
  font-size: 18px;
  margin: 0;
  letter-spacing: .4px;
}

.toggle {
  font-size: 22px;
  cursor: pointer;
  user-select: none;
}

/* =====================
   表单
===================== */
label {
  display: block;
  margin-top: 16px;
  font-size: 12px;
  color: var(--sub);
}

input, select {
  width: 100%;
  margin-top: 6px;
  padding: 13px 14px;
  font-size: 15px;
  color: var(--text);
  background: rgba(255,255,255,.04);
  border-radius: 14px;
  border: 1px solid var(--border);
  outline: none;
}

input::placeholder {
  color: #64748b;
}

input:focus, select:focus {
  border-color: var(--focus);
  box-shadow: 0 0 0 3px rgba(99,102,241,.2);
}

select:disabled {
  opacity: .75;
  cursor: not-allowed;
}

/* =====================
   按钮
===================== */
button {
  width: 100%;
  margin-top: 20px;
  padding: 15px;
  border-radius: 16px;
  border: none;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  background: var(--primary);
  box-shadow: var(--shadow-btn);
}

button:hover {
  transform: translateY(-1px);
}

.copy {
  margin-top: 12px;
  background: transparent;
  color: var(--text);
  border: 1px dashed var(--border);
  box-shadow: none;
}

.copy:hover {
  background: rgba(99,102,241,.08);
}

/* =====================
   结果
===================== */
.result {
  margin-top: 16px;
  padding: 14px;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: rgba(99,102,241,.06);
  font-size: 13px;
  word-break: break-all;
}

.result a {
  color: #60a5fa;
  text-decoration: none;
}

.result a:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  h1 { font-size: 16px; }
}
</style>
</head>

<body>
<div class="card">
  <div class="header">
    <h1>🚀 ICMP9 Clash订阅生成器</h1>
    <div class="toggle" id="themeToggle">🌙</div>
  </div>

  <label>UUID（自动保存）</label>
  <input id="uuid" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />

  <label>Server</label>
  <input id="server" value="tunnel.icmp9.com" />

  <label>Port</label>
  <input id="port" value="443" />

  <label>Server Name (SNI)</label>
  <input id="servername" value="tunnel.icmp9.com" />

  <label>TLS（已锁定）</label>
  <select disabled>
    <option>true</option>
  </select>

  <button id="genBtn">生成订阅链接</button>
  <button class="copy" id="copyBtn">📋 复制订阅链接</button>

  <div class="result" id="result"></div>
</div>

<script>
/* =====================
   工具
===================== */
const $ = id => document.getElementById(id);
const STORAGE = {
  UUID: "uuid",
  THEME: "theme"
};

let currentUrl = "";

/* =====================
   订阅生成
===================== */
function gen() {
  const uuid = $('uuid').value.trim();
  if (!uuid) return alert("UUID 不能为空");

  localStorage.setItem(STORAGE.UUID, uuid);

  const server = $('server').value;
  const port = $('port').value;
  const servername = $('servername').value || "tunnel.icmp9.com";

  currentUrl =
    location.origin +
    "/?uuid=" + encodeURIComponent(uuid) +
    "&server=" + encodeURIComponent(server) +
    "&port=" + encodeURIComponent(port) +
    "&servername=" + encodeURIComponent(servername) +
    "&tls=true";

  $('result').innerHTML =
  '<a href="' + currentUrl + '" target="_blank">' + currentUrl + '</a>';
}

/* =====================
   复制
===================== */
function copy() {
  if (!currentUrl) return alert("请先生成订阅链接");
  navigator.clipboard.writeText(currentUrl)
    .then(() => alert("已复制到剪贴板"));
}

/* =====================
   主题
===================== */
function toggleTheme() {
  const html = document.documentElement;
  const next = html.dataset.theme === "dark" ? "light" : "dark";
  html.dataset.theme = next;
  localStorage.setItem(STORAGE.THEME, next);
  $('themeToggle').textContent = next === "dark" ? "🌙" : "☀️";
}

/* =====================
   初始化
===================== */
$('genBtn').onclick = gen;
$('copyBtn').onclick = copy;
$('themeToggle').onclick = toggleTheme;

const savedUUID = localStorage.getItem(STORAGE.UUID);
if (savedUUID) $('uuid').value = savedUUID;

const theme = localStorage.getItem(STORAGE.THEME) || "dark";
document.documentElement.dataset.theme = theme;
$('themeToggle').textContent = theme === "dark" ? "🌙" : "☀️";
</script>
</body>
</html>`;
}
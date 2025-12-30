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
<title>Clash 订阅生成器</title>

<style>
:root {
  --bg: #0f172a;
  --card: #020617;
  --text: #e5e7eb;
  --sub: #94a3b8;
  --border: #1e293b;
  --primary: #38bdf8;
}

[data-theme="light"] {
  --bg: #f8fafc;
  --card: #ffffff;
  --text: #0f172a;
  --sub: #475569;
  --border: #cbd5e1;
  --primary: #0284c7;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont;
  background: var(--bg);
  color: var(--text);
  padding: 16px;
}

.card {
  max-width: 520px;
  margin: auto;
  background: var(--card);
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 12px 30px rgba(0,0,0,.25);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

h1 {
  font-size: 18px;
  margin: 0;
}

.toggle {
  cursor: pointer;
  font-size: 20px;
}

label {
  display: block;
  margin-top: 14px;
  font-size: 13px;
  color: var(--sub);
}

input {
  width: 100%;
  margin-top: 6px;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text);
  font-size: 15px;
}

button {
  width: 100%;
  margin-top: 18px;
  padding: 14px;
  border-radius: 12px;
  border: none;
  font-size: 15px;
  cursor: pointer;
  background: var(--primary);
  color: #fff;
  font-weight: bold;
}

.copy {
  background: transparent;
  border: 1px dashed var(--border);
  color: var(--text);
  margin-top: 10px;
}

.result {
  margin-top: 12px;
  word-break: break-all;
  font-size: 13px;
  color: var(--primary);
}

@media (max-width: 480px) {
  h1 { font-size: 16px; }
  button { padding: 16px; }
}
</style>
</head>

<body>
<div class="card">
  <div class="header">
    <h1>🚀 Clash 订阅生成器</h1>
    <div class="toggle" onclick="toggleTheme()">🌙</div>
  </div>

  <label>UUID（自动保存）</label>
  <input id="uuid" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"/>

  <label>Server</label>
  <input id="server" value="tunnel.icmp9.com"/>

  <label>Port</label>
  <input id="port" value="443"/>

  <label>Server Name (SNI)</label>
  <input id="servername" value="tunnel.icmp9.com"/>

  <button onclick="gen()">生成订阅链接</button>
  <button class="copy" onclick="copy()">📋 复制订阅链接</button>

  <div class="result" id="result"></div>
</div>

<script>
const $ = id => document.getElementById(id);
let currentUrl = "";

// 生成订阅
function gen() {
  const uuid = $('uuid').value.trim();
  if (!uuid) {
    alert("UUID 不能为空");
    return;
  }

  // 保存 UUID
  localStorage.setItem("uuid", uuid);

  const server = $('server').value;
  const port = $('port').value;
  const servername = $('servername').value || "tunnel.icmp9.com";

  // TLS 始终为 true
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

// 复制订阅
function copy() {
  if (!currentUrl) {
    alert("请先生成订阅链接");
    return;
  }
  navigator.clipboard.writeText(currentUrl).then(() => {
    alert("已复制到剪贴板");
  });
}

// UUID 自动回填
const savedUUID = localStorage.getItem("uuid");
if (savedUUID) $('uuid').value = savedUUID;

// 主题切换
function toggleTheme() {
  const html = document.documentElement;
  const next = html.dataset.theme === "dark" ? "light" : "dark";
  html.dataset.theme = next;
  localStorage.setItem("theme", next);
  document.querySelector(".toggle").textContent =
    next === "dark" ? "🌙" : "☀️";
}

// 主题记忆
const theme = localStorage.getItem("theme") || "dark";
document.documentElement.dataset.theme = theme;
document.querySelector(".toggle").textContent =
  theme === "dark" ? "🌙" : "☀️";
</script>
</body>
</html>`;
}
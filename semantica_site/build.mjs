/**
 * 静态站点生成器（零依赖）
 * 用法：node build.mjs
 * 输入：../Semantica架构设计.md、../Semantica使用教程.md
 * 输出：index.html、architecture.html、tutorial.html、assets/search-index.js
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SITE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SITE, "..");
const BUILD_DATE = "2026-11-06";

/* ---------------- Markdown 子集解析 ---------------- */

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function slugify(text) {
  return text
    .replace(/`/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, "")
    .trim()
    .replace(/\s+/g, "-");
}

function inline(text, ctx) {
  const codes = [];
  let s = text.replace(/`([^`]+)`/g, (m, c) => {
    codes.push(c);
    return "\u0000" + (codes.length - 1) + "\u0000";
  });
  s = esc(s);
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, label, href) => {
    const url = ctx.rewrite(href);
    const ext = /^https?:/.test(url) ? ' target="_blank" rel="noopener"' : "";
    return '<a href="' + url + '"' + ext + ">" + label + "</a>";
  });
  s = s.replace(/\u0000(\d+)\u0000/g, (m, i) => "<code>" + esc(codes[+i]) + "</code>");
  return s;
}

function splitRow(line) {
  let s = line.trim();
  if (s.startsWith("|")) s = s.slice(1);
  if (s.endsWith("|")) s = s.slice(0, -1);
  return s.split("|").map((c) => c.trim());
}

function renderCode(code, ctx, lang) {
  if (code.includes("semantica-gateway（nginx") || code.includes("semantica-gateway(nginx")) {
    return (
      '<figure class="arch-figure">' + ctx.archSvg + "</figure>" +
      '<details class="ascii-diagram"><summary>展开原始文本拓扑图</summary>' +
      '<div class="code-block"><pre><code>' + esc(code) + "</code></pre></div></details>"
    );
  }
  const cls = lang ? ' class="language-' + esc(lang) + '"' : "";
  return '<div class="code-block"><pre><code' + cls + ">" + esc(code) + "</code></pre></div>";
}

function mdToHtml(md, ctx) {
  const lines = md.replace(/\r\n?/g, "\n").split("\n");
  const out = [];
  const toc = [];
  let i = 0;
  let para = [];
  const used = new Set();

  const flush = () => {
    if (!para.length) return;
    const text = para.join("\n").trim();
    if (text) out.push("<p>" + inline(text, ctx) + "</p>");
    para = [];
  };

  while (i < lines.length) {
    const line = lines[i];

    const fence = line.match(/^```(.*)$/);
    if (fence) {
      flush();
      const lang = fence[1].trim();
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      i++;
      out.push(renderCode(buf.join("\n"), ctx, lang));
      continue;
    }

    if (!line.trim()) { flush(); i++; continue; }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      flush();
      const level = heading[1].length;
      const raw = heading[2].trim();
      let id = slugify(raw);
      if (!id) id = "section";
      let unique = id;
      let n = 2;
      while (used.has(unique)) unique = id + "-" + n++;
      used.add(unique);
      if (level === 2 || level === 3) toc.push({ level, id: unique, title: raw.replace(/`/g, "") });
      out.push(
        "<h" + level + ' id="' + unique + '">' + inline(raw, ctx) + "</h" + level + ">"
      );
      i++;
      continue;
    }

    if (/^([-*_])\1{2,}$/.test(line.trim())) { flush(); out.push("<hr>"); i++; continue; }

    if (line.startsWith(">")) {
      flush();
      const buf = [];
      while (i < lines.length && lines[i].startsWith(">")) buf.push(lines[i++].replace(/^>\s?/, ""));
      const chunks = buf.join("\n").split(/\n\s*\n/).filter((c) => c.trim());
      out.push(
        "<blockquote>" +
          chunks.map((c) => "<p>" + inline(c.trim().replace(/\n/g, " "), ctx) + "</p>").join("") +
          "</blockquote>"
      );
      continue;
    }

    // 表格
    if (
      line.includes("|") &&
      i + 1 < lines.length &&
      /^\s*\|?[\s:|-]+\|?\s*$/.test(lines[i + 1]) &&
      lines[i + 1].includes("-")
    ) {
      flush();
      const head = splitRow(line);
      const align = splitRow(lines[i + 1]).map((c) => {
        const l = c.startsWith(":");
        const r = c.endsWith(":");
        return l && r ? "center" : r ? "right" : l ? "left" : "";
      });
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].trim() && lines[i].includes("|")) {
        rows.push(splitRow(lines[i]));
        i++;
      }
      let html = '<div class="table-wrap"><table><thead><tr>';
      head.forEach((c, k) => {
        html += "<th" + (align[k] ? ' style="text-align:' + align[k] + '"' : "") + ">" + inline(c, ctx) + "</th>";
      });
      html += "</tr></thead><tbody>";
      rows.forEach((r) => {
        html += "<tr>";
        head.forEach((_, k) => {
          html += "<td" + (align[k] ? ' style="text-align:' + align[k] + '"' : "") + ">" + inline(r[k] || "", ctx) + "</td>";
        });
        html += "</tr>";
      });
      html += "</tbody></table></div>";
      out.push(html);
      continue;
    }

    // 列表
    if (/^\s*([-*+]|\d+[.)])\s+/.test(line)) {
      flush();
      const res = parseList(lines, i, ctx);
      out.push(res.html);
      i = res.next;
      continue;
    }

    para.push(line);
    i++;
  }
  flush();
  return { html: out.join("\n"), toc };
}

function parseList(lines, start, ctx) {
  const items = [];
  let i = start;
  let baseIndent = null;

  while (i < lines.length) {
    const line = lines[i];
    const m = line.match(/^(\s*)([-*+]|\d+[.)])\s+(.*)$/);
    if (m) {
      if (baseIndent === null) baseIndent = m[1].length;
      items.push({ indent: m[1].length, ordered: /^\d/.test(m[2]), text: [m[3]] });
      i++;
      continue;
    }
    // 缩进续行
    if (items.length && /^\s+\S/.test(line) && line.trim()) {
      items[items.length - 1].text.push(line.trim());
      i++;
      continue;
    }
    break;
  }

  const root = { indent: -1, children: [] };
  const stack = [root];
  items.forEach((it) => {
    while (stack.length > 1 && it.indent <= stack[stack.length - 1].indent) stack.pop();
    const node = { indent: it.indent, ordered: it.ordered, text: it.text, children: [] };
    stack[stack.length - 1].children.push(node);
    stack.push(node);
  });

  function render(node) {
    if (!node.children.length) return "";
    const tag = node.children[0].ordered ? "ol" : "ul";
    const body = node.children
      .map((c) => "<li>" + inline(c.text.join("\n"), ctx) + render(c) + "</li>")
      .join("");
    return "<" + tag + ">" + body + "</" + tag + ">";
  }

  return { html: render(root), next: i };
}

/* ---------------- 页面模板 ---------------- */

const ICONS = {
  search:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  sun: '<svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.4M12 19.6V22M2 12h2.4M19.6 12H22M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M19.1 4.9l-1.7 1.7M6.6 17.4l-1.7 1.7"/></svg>',
  moon: '<svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13M13 6l6 6-6 6"/></svg>',
  layers:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5"/></svg>',
  book:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z"/><path d="M19 18v3H6.5"/></svg>',
  plug:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-12 0V8ZM12 17v4"/></svg>',
};

const BRAND_MARK =
  '<svg viewBox="0 0 24 24" fill="none" stroke="#04171a" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">' +
  '<circle cx="12" cy="5.5" r="2.2"/><circle cx="5.5" cy="16.5" r="2.2"/><circle cx="18.5" cy="16.5" r="2.2"/>' +
  '<path d="M10.7 7.4 6.9 14.6M13.3 7.4l3.8 7.2M7.7 16.5h8.6"/></svg>';

function shell({ title, description, active, sidebarToc, body, home, pager }) {
  const nav = [
    ["index.html", "概览", "home"],
    ["architecture.html", "架构设计", "arch"],
    ["tutorial.html", "使用教程", "tutorial"],
  ]
    .map(
      ([href, label, key]) =>
        '<a href="' + href + '"' + (active === key ? ' class="active"' : "") + ">" + label + "</a>"
    )
    .join("");

  const tocHtml = sidebarToc
    ? '<div class="side-title">本页目录</div><ul class="toc">' +
      sidebarToc
        .map(
          (t) =>
            '<li class="lv' + t.level + '"><a href="#' + t.id + '">' + esc(t.title) + "</a></li>"
        )
        .join("") +
      "</ul>"
    : "";

  const sideCard = sidebarToc
    ? '<div class="side-card"><b>配套文档</b>' +
      (active === "arch"
        ? '<a href="tutorial.html">使用教程</a>：界面操作、智能体提问、MCP 接入。'
        : '<a href="architecture.html">架构设计</a>：组件职责、数据流、设计决策。') +
      "</div>"
    : "";

  return `<!doctype html>
<html lang="zh-CN" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="assets/site.css">
</head>
<body>
<div class="progress"></div>
<header class="topbar">
  <a class="brand" href="index.html">
    <span class="brand-mark">${BRAND_MARK}</span>
    <span>Semantica</span>
    <span class="brand-sub">文档中心</span>
  </a>
  <nav class="topnav">${nav}</nav>
  <button class="icon-btn menu-btn" data-menu-toggle aria-label="目录">${ICONS.menu}</button>
  <button class="search-trigger" data-search-open>
    ${ICONS.search}<span>搜索文档…</span><kbd>Ctrl K</kbd>
  </button>
  <button class="icon-btn" data-theme-toggle aria-label="切换主题">${ICONS.sun}${ICONS.moon}</button>
</header>

<div class="layout${home ? " home" : ""}">
  ${sidebarToc ? '<aside class="sidebar">' + tocHtml + sideCard + "</aside>" : ""}
  <main class="content">
${body}
${pager || ""}
  </main>
</div>

<footer class="site-footer">
  <span>Semantica 语义知识图谱 · 文档中心</span>
  <span>分支 semantica-system · 更新于 ${BUILD_DATE}</span>
</footer>

<div class="search-overlay">
  <div class="search-panel">
    <div class="search-field">
      ${ICONS.search}
      <input type="text" placeholder="搜索章节、工具、命令…" autocomplete="off" spellcheck="false">
      <span class="esc">ESC</span>
    </div>
    <div class="search-results"></div>
    <div class="search-hint">输入关键词开始检索，↑↓ 选择，Enter 跳转</div>
  </div>
</div>

<script src="assets/search-index.js"></script>
<script src="assets/site.js"></script>
</body>
</html>`;
}

/* ---------------- 构建 ---------------- */

const archSvg = fs.readFileSync(path.join(SITE, "assets", "arch.svg"), "utf8");

const rewrite = (href) => {
  if (href.startsWith("file:///")) {
    if (href.includes("Semantica\u67b6\u6784\u8bbe\u8ba1")) return "architecture.html";
    if (href.includes("Semantica\u4f7f\u7528\u6559\u7a0b")) return "tutorial.html";
  }
  return href;
};

function loadDoc(file) {
  const md = fs.readFileSync(path.join(ROOT, file), "utf8");
  const m = md.match(/^#\s+(.+)$/m);
  const docTitle = m ? m[1].trim() : file.replace(/\.md$/, "");
  const body = md.replace(/^#\s+.*$/m, "").trim();
  const parsed = mdToHtml(body, { rewrite, archSvg });
  return { docTitle, html: parsed.html, toc: parsed.toc, raw: body };
}

const docs = {
  architecture: loadDoc("Semantica架构设计.md"),
  tutorial: loadDoc("Semantica使用教程.md"),
};

/* 首页 */
const homeBody = `
<section class="hero">
  <span class="hero-badge"><span class="pulse"></span>内部平台 · 语义知识图谱</span>
  <h1>让数据长成<span class="grad">一张可推理的图</span></h1>
  <p class="hero-lead">
    Semantica 把分散在关系数据库里的合同、单位、项目与审批记录，收进一张共享的知识图谱；
    人用浏览器浏览它，智能体通过 MCP 使用它。这里是它的架构说明与上手指南。
  </p>
  <div class="hero-actions">
    <a class="btn btn-primary" href="tutorial.html">开始使用 ${ICONS.arrow}</a>
    <a class="btn btn-ghost" href="architecture.html">了解架构</a>
  </div>
  <div class="stats">
    <div class="stat"><b>5</b><span>运行服务</span></div>
    <div class="stat"><b>16</b><span>MCP 工具</span></div>
    <div class="stat"><b>2</b><span>部署环境</span></div>
    <div class="stat"><b>2.6 万</b><span>真实实体（69）</span></div>
  </div>
</section>

<section class="section">
  <div class="section-head">
    <div class="eyebrow">Architecture</div>
    <h2>一张图看懂系统</h2>
    <p>两个对外端口、三个服务容器、一个图数据库；所有请求先过网关。</p>
  </div>
  <figure class="arch-figure">${archSvg}</figure>
</section>

<section class="section">
  <div class="section-head">
    <div class="eyebrow">Documents</div>
    <h2>从哪一篇开始</h2>
    <p>想动手就看去教程，想理解取舍就去看架构。</p>
  </div>
  <div class="cards">
    <a class="card" href="architecture.html">
      <span class="card-icon">${ICONS.layers}</span>
      <h3>架构设计</h3>
      <p>总体拓扑、七大组件职责、技术栈、写入与读取数据流，以及 12 条关键设计决策与演进路线。</p>
      <span class="card-link">阅读架构 ${ICONS.arrow}</span>
    </a>
    <a class="card" href="tutorial.html">
      <span class="card-icon">${ICONS.book}</span>
      <h3>使用教程</h3>
      <p>登录与界面导览、JupyterLab 抽取实验、合同专家提问技巧、MCP 接入示例与 16 个工具速查。</p>
      <span class="card-link">阅读教程 ${ICONS.arrow}</span>
    </a>
  </div>
</section>

<section class="section">
  <div class="section-head">
    <div class="eyebrow">Principles</div>
    <h2>四条设计底线</h2>
    <p>决定了系统为什么长成现在这样。</p>
  </div>
  <div class="features">
    <div class="feature">
      <span class="tag">upstream</span>
      <h4>不改上游源码</h4>
      <p>上游 Semantica 0.7.0 的 src/ 保持原样，定制以启动包装、构建期补丁、独立侧车三种形式叠加，升级不痛。</p>
    </div>
    <div class="feature">
      <span class="tag">storage</span>
      <h4>图谱落在 Neo4j</h4>
      <p>摆脱“整张图在进程内存里”的规模限制，界面退化为定期刷新的只读副本。</p>
    </div>
    <div class="feature">
      <span class="tag">agent</span>
      <h4>智能体只走侧车</h4>
      <p>独立容器承担协议适配、工具语义、鉴权限流与审计，上线回滚不动 Explorer。</p>
    </div>
    <div class="feature">
      <span class="tag">auth</span>
      <h4>两套凭据域</h4>
      <p>人用 Basic Auth，机器用 Bearer；令牌只在 /mcp 生效，浏览器永远拿不到 API Key。</p>
    </div>
    <div class="feature">
      <span class="tag">readonly</span>
      <h4>只读副本保护</h4>
      <p>Neo4j 为主库时 Explorer 写接口 403，写入统一收敛到 MCP 与接入作业。</p>
    </div>
    <div class="feature">
      <span class="tag">offline</span>
      <h4>完全离线部署</h4>
      <p>镜像与 Python wheel 带哈希锁定，内网无外网也能构建，密钥只留在状态根。</p>
    </div>
  </div>
</section>

<section class="section">
  <div class="section-head">
    <div class="eyebrow">Quick Start</div>
    <h2>五分钟上手</h2>
    <p>四个入口，对应四类使用者。</p>
  </div>
  <div class="steps">
    <div class="step">
      <h4>打开 Explorer 看图谱</h4>
      <p>访问 <code>http://10.100.0.69:18835</code>，用团队账号登录，在“图谱浏览”里搜索实体名称或编号。</p>
    </div>
    <div class="step">
      <h4>在 JupyterLab 跑抽取</h4>
      <p>访问 <code>:18836</code>，打开 <code>examples/01_文档抽取</code>，或用 <code>semantica_lab.push()</code> 推送自己的结果。</p>
    </div>
    <div class="step">
      <h4>向合同专家提问</h4>
      <p>访问 <code>:18180</code> 进入 Chat 页，带编号提问最准，例如“HT-2022-0001 和 DW-0001 是什么关系？”。</p>
    </div>
    <div class="step">
      <h4>用 MCP 接入自己的程序</h4>
      <p>向运维申请客户端令牌，POST 到 <code>:18835/mcp</code>，先调 <code>graph_schema</code> 再写查询。</p>
    </div>
  </div>
  <div class="chips">
    <span class="chip">nginx</span><span class="chip">FastAPI</span><span class="chip">Neo4j 2025.03</span>
    <span class="chip">JupyterLab 4.6</span><span class="chip">MCP Streamable HTTP</span>
    <span class="chip">AgentScope 2.0.4</span><span class="chip">Docker Compose</span>
  </div>
</section>
`;

const pagerFor = (key) => {
  if (key === "arch") {
    return `<nav class="pager"><a href="tutorial.html"><div class="dir">下一篇</div><div class="name">使用教程</div></a></nav>`;
  }
  return `<nav class="pager"><a href="architecture.html"><div class="dir">上一篇</div><div class="name">架构设计</div></a></nav>`;
};

const archHead = `
<div class="doc-head">
  <div class="eyebrow">Architecture</div>
  <h1>Semantica 架构设计</h1>
  <p class="doc-sub">从浏览器到 Neo4j：系统由哪些组件构成、数据怎样流动、关键取舍为什么这样定。</p>
  <div class="doc-meta">
    <span><i></i>分支 semantica-system</span>
    <span>MCP 修订号 6 · 精简档 16 工具</span>
    <span>两台服务器均已切换 Neo4j 主库</span>
  </div>
</div>`;

const tutorialHead = `
<div class="doc-head">
  <div class="eyebrow">Tutorial</div>
  <h1>Semantica 使用教程</h1>
  <p class="doc-sub">面向团队成员与接入开发者：界面怎么用、实验怎么做、智能体怎么问、MCP 怎么接。</p>
  <div class="doc-meta">
    <span><i></i>适用版本 2026-11-06</span>
    <span>Explorer · JupyterLab · AgentScope</span>
    <span>运维操作见部署与运维手册</span>
  </div>
</div>`;

fs.writeFileSync(
  path.join(SITE, "index.html"),
  shell({
    title: "Semantica 文档中心 · 语义知识图谱",
    description: "Semantica 语义知识图谱系统的架构设计与使用教程。",
    active: "home",
    home: true,
    sidebarToc: null,
    body: homeBody,
  })
);

fs.writeFileSync(
  path.join(SITE, "architecture.html"),
  shell({
    title: "架构设计 · Semantica 文档中心",
    description: "Semantica 总体架构、组件职责、数据流与关键设计决策。",
    active: "arch",
    sidebarToc: docs.architecture.toc,
    body: archHead + '<article class="prose">' + docs.architecture.html + "</article>",
    pager: pagerFor("arch"),
  })
);

fs.writeFileSync(
  path.join(SITE, "tutorial.html"),
  shell({
    title: "使用教程 · Semantica 文档中心",
    description: "Semantica 使用教程：界面导览、JupyterLab 实验、智能体提问与 MCP 接入。",
    active: "tutorial",
    sidebarToc: docs.tutorial.toc,
    body: tutorialHead + '<article class="prose">' + docs.tutorial.html + "</article>",
    pager: pagerFor("tutorial"),
  })
);

/* 搜索索引 */
function plain(md) {
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\|/g, " ")
    .replace(/[#>*`_\-]/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function buildIndex(doc, page) {
  const lines = doc.raw.split("\n");
  const entries = [];
  let current = null;
  let buf = [];
  let skip = false;

  const push = () => {
    if (!current) return;
    const text = plain(buf.join("\n"));
    if (text) entries.push({ p: page, id: current.id, t: current.title, x: text.slice(0, 900) });
    buf = [];
  };

  for (const line of lines) {
    const h = line.match(/^#{2,3}\s+(.+)$/);
    if (h) {
      push();
      const title = h[1].trim();
      const id = slugify(title);
      current = { id, title };
      skip = title === "目录";
      continue;
    }
    if (line.startsWith("```")) { buf.push(" "); continue; }
    if (!skip) buf.push(line);
  }
  push();
  return entries;
}

const index = [...buildIndex(docs.architecture, "architecture.html"), ...buildIndex(docs.tutorial, "tutorial.html")];
fs.writeFileSync(
  path.join(SITE, "assets", "search-index.js"),
  "window.__SEMANTICA_INDEX__ = " + JSON.stringify(index, null, 0) + ";\n"
);

console.log(
  "构建完成：" + index.length + " 个索引条目，" +
    "architecture " + docs.architecture.toc.length + " 个标题，" +
    "tutorial " + docs.tutorial.toc.length + " 个标题"
);

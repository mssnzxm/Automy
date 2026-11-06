/* Semantica 文档中心 · 站点交互（无依赖） */
(function () {
  "use strict";

  var root = document.documentElement;

  /* ---------- 主题 ---------- */
  var THEME_KEY = "semantica-theme";
  try {
    var saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") {
      root.dataset.theme = saved;
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
      root.dataset.theme = "light";
    } else {
      root.dataset.theme = "dark";
    }
  } catch (e) {
    root.dataset.theme = "dark";
  }

  function syncThemeIcons() {
    var light = root.dataset.theme === "light";
    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      btn.setAttribute("aria-label", light ? "切换到深色模式" : "切换到浅色模式");
      var sun = btn.querySelector(".icon-sun");
      var moon = btn.querySelector(".icon-moon");
      if (sun) sun.style.display = light ? "none" : "block";
      if (moon) moon.style.display = light ? "block" : "none";
    });
  }
  syncThemeIcons();

  document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      root.dataset.theme = root.dataset.theme === "light" ? "dark" : "light";
      try { localStorage.setItem(THEME_KEY, root.dataset.theme); } catch (e) {}
      syncThemeIcons();
    });
  });

  /* ---------- 移动端侧栏 ---------- */
  var sidebar = document.querySelector(".sidebar");
  var menuBtn = document.querySelector("[data-menu-toggle]");
  if (menuBtn && sidebar) {
    menuBtn.addEventListener("click", function () {
      sidebar.classList.toggle("open");
    });
    sidebar.addEventListener("click", function (e) {
      if (e.target.closest("a")) sidebar.classList.remove("open");
    });
    document.addEventListener("click", function (e) {
      if (window.innerWidth > 1080) return;
      if (!sidebar.classList.contains("open")) return;
      if (sidebar.contains(e.target) || menuBtn.contains(e.target)) return;
      sidebar.classList.remove("open");
    });
  }

  /* ---------- 阅读进度 ---------- */
  var bar = document.querySelector(".progress");
  function updateProgress() {
    if (!bar) return;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    var p = h > 0 ? (window.scrollY / h) * 100 : 0;
    bar.style.width = Math.min(100, Math.max(0, p)) + "%";
  }
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
  updateProgress();

  /* ---------- 目录高亮 ---------- */
  var tocLinks = Array.prototype.slice.call(document.querySelectorAll(".toc a[href^='#']"));
  if (tocLinks.length && "IntersectionObserver" in window) {
    var map = {};
    tocLinks.forEach(function (a) {
      var id = decodeURIComponent(a.getAttribute("href").slice(1));
      map[id] = a;
    });
    var visible = {};

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          visible[en.target.id] = en.isIntersecting ? en.intersectionRatio : 0;
        });
        var bestId = null;
        var bestTop = Infinity;
        Object.keys(visible).forEach(function (id) {
          var el = document.getElementById(id);
          if (!el) return;
          var top = Math.abs(el.getBoundingClientRect().top - 96);
          if (visible[id] > 0 && top < bestTop) { bestTop = top; bestId = id; }
        });
        if (!bestId) {
          // 滚到末尾时选最后一个可见标题
          var passed = Object.keys(map).filter(function (id) {
            var el = document.getElementById(id);
            return el && el.getBoundingClientRect().top < 120;
          });
          bestId = passed.length ? passed[passed.length - 1] : null;
        }
        tocLinks.forEach(function (a) { a.classList.remove("active"); });
        if (bestId && map[bestId]) map[bestId].classList.add("active");
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: [0, 0.2, 0.6, 1] }
    );

    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  }

  /* ---------- 代码复制 ---------- */
  document.querySelectorAll(".code-block").forEach(function (block) {
    var pre = block.querySelector("pre");
    if (!pre) return;
    var btn = document.createElement("button");
    btn.className = "copy-btn";
    btn.type = "button";
    btn.textContent = "复制";
    btn.addEventListener("click", function () {
      var text = pre.innerText;
      var done = function () {
        btn.textContent = "已复制";
        btn.classList.add("done");
        setTimeout(function () {
          btn.textContent = "复制";
          btn.classList.remove("done");
        }, 1600);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done, function () { fallback(text, done); });
      } else {
        fallback(text, done);
      }
    });
    block.appendChild(btn);
  });

  function fallback(text, done) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); done(); } catch (e) {}
    document.body.removeChild(ta);
  }

  /* ---------- 站内搜索 ---------- */
  var index = window.__SEMANTICA_INDEX__ || [];
  var overlay = document.querySelector(".search-overlay");
  var input = overlay ? overlay.querySelector("input") : null;
  var results = overlay ? overlay.querySelector(".search-results") : null;
  var hint = overlay ? overlay.querySelector(".search-hint") : null;
  var selected = -1;
  var current = [];

  var PAGE_LABEL = { "architecture.html": "架构设计", "tutorial.html": "使用教程", "index.html": "概览" };

  function openSearch() {
    if (!overlay) return;
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
    setTimeout(function () { if (input) input.focus(); }, 20);
  }
  function closeSearch() {
    if (!overlay) return;
    overlay.classList.remove("open");
    document.body.style.overflow = "";
    selected = -1;
  }

  document.querySelectorAll("[data-search-open]").forEach(function (el) {
    el.addEventListener("click", openSearch);
  });

  document.addEventListener("keydown", function (e) {
    var tag = (e.target.tagName || "").toLowerCase();
    var typing = tag === "input" || tag === "textarea" || e.target.isContentEditable;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      openSearch();
      return;
    }
    if (e.key === "/" && !typing && !overlay.classList.contains("open")) {
      e.preventDefault();
      openSearch();
      return;
    }
    if (!overlay.classList.contains("open")) return;
    if (e.key === "Escape") { closeSearch(); }
    if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
    if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
    if (e.key === "Enter") {
      if (current[selected]) {
        e.preventDefault();
        window.location.href = current[selected].href;
      }
    }
  });

  if (overlay) {
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeSearch();
    });
  }

  function move(delta) {
    if (!current.length) return;
    selected = (selected + delta + current.length) % current.length;
    var items = results.querySelectorAll(".search-item");
    items.forEach(function (el, i) { el.classList.toggle("sel", i === selected); });
    var el = items[selected];
    if (el && el.scrollIntoView) el.scrollIntoView({ block: "nearest" });
  }

  function highlight(text, terms) {
    var safe = escapeHtml(text);
    terms.forEach(function (t) {
      if (!t) return;
      safe = safe.replace(new RegExp("(" + escapeReg(t) + ")", "gi"), "<mark>$1</mark>");
    });
    return safe;
  }
  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function escapeReg(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function search(q) {
    q = q.trim();
    if (!q) return [];
    var terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    var scored = [];
    index.forEach(function (item) {
      var title = (item.t || "").toLowerCase();
      var body = (item.x || "").toLowerCase();
      var score = 0;
      var all = true;
      terms.forEach(function (t) {
        var inTitle = title.indexOf(t) >= 0;
        var count = body.split(t).length - 1;
        if (!inTitle && !count) { all = false; return; }
        score += (inTitle ? 60 : 0) + Math.min(count, 8) * 3;
      });
      if (all) scored.push({ item: item, score: score });
    });
    scored.sort(function (a, b) { return b.score - a.score; });
    return scored.slice(0, 14).map(function (s) { return s.item; });
  }

  if (input && results) {
    input.addEventListener("input", function () {
      var q = input.value;
      var items = search(q);
      current = items.map(function (it) {
        return { href: it.p + "#" + it.id, item: it };
      });
      selected = items.length ? 0 : -1;
      if (!q.trim()) {
        results.innerHTML = "";
        if (hint) hint.style.display = "";
        return;
      }
      if (hint) hint.style.display = "none";
      if (!items.length) {
        results.innerHTML = '<div class="search-hint">没有匹配结果，试试更短的关键词</div>';
        return;
      }
      var terms = q.trim().toLowerCase().split(/\s+/);
      results.innerHTML = items
        .map(function (it, i) {
          var snippet = it.x.length > 90 ? it.x.slice(0, 90) + "…" : it.x;
          return (
            '<a class="search-item' + (i === 0 ? " sel" : "") + '" href="' + it.p + "#" + it.id + '">' +
            '<div class="si-page">' + (PAGE_LABEL[it.p] || it.p) + "</div>" +
            '<div class="si-title">' + highlight(it.t, terms) + "</div>" +
            '<div class="si-text">' + highlight(snippet, terms) + "</div>" +
            "</a>"
          );
        })
        .join("");
    });
  }
})();

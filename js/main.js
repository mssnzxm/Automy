/* ==========================================================================
   数据湖仓一体教程 · 全站共享脚本（js/main.js）
   原生 JavaScript：无模块、无依赖、无 fetch/XHR，file:// 协议直接可用
   ========================================================================== */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {

    /* ---------- 1. 导航高亮：按当前页面文件名匹配 .site-nav 链接 ---------- */
    var page = location.pathname.split('/').pop();
    if (!page) {
      page = 'index.html'; /* 路径以 / 结尾时视为首页 */
    }

    var nav = document.getElementById('site-nav');
    if (nav) {
      nav.querySelectorAll('a').forEach(function (link) {
        var href = (link.getAttribute('href') || '');
        href = href.split('/').pop().split('#')[0].split('?')[0];
        if (href === page) {
          link.classList.add('active');
        }
      });
    }

    /* ---------- 2. 移动端汉堡按钮：展开 / 收起导航下拉面板 ---------- */
    var navToggle = document.getElementById('nav-toggle');
    if (navToggle && nav) {
      navToggle.addEventListener('click', function () {
        nav.classList.toggle('open');
      });
    }

    /* ---------- 3. 返回顶部按钮：滚动超过 400px 显示，点击平滑回顶 ---------- */
    var btnTop = document.getElementById('btn-top');

    function onScroll() {
      if (!btnTop) {
        return;
      }
      if (window.scrollY > 400) {
        btnTop.classList.add('visible');
      } else {
        btnTop.classList.remove('visible');
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (btnTop) {
      btnTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    /* ---------- 4. 本页导航（.toc）：点击锚点平滑滚动到对应区块 ---------- */
    var toc = document.querySelector('.toc');
    if (toc) {
      toc.querySelectorAll('a[href^="#"]').forEach(function (link) {
        link.addEventListener('click', function (event) {
          var target = document.getElementById(link.getAttribute('href').slice(1));
          if (target) {
            event.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      });
    }
  });
})();

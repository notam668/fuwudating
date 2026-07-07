/* =====================================================
   盐城工学院2026级新生服务大厅 · 交互脚本
   模块化 JavaScript · 零依赖 · 渐进增强
   ===================================================== */

(function () {
    "use strict";

    /* ---------- 1. 工具函数 ---------- */
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

    const on = (el, evt, handler, opts) => {
        if (!el) return;
        el.addEventListener(evt, handler, opts);
    };

    /* ---------- 2. Toast 轻提示 ---------- */
    let toastTimer = null;
    function showToast(msg, duration = 1800) {
        let toast = $("#__toast__");
        if (!toast) {
            toast = document.createElement("div");
            toast.id = "__toast__";
            toast.className = "toast";
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.classList.add("visible");
        if (toastTimer) clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            toast.classList.remove("visible");
        }, duration);
    }

    /* ---------- 3. 导航栏滚动阴影 ---------- */
    function initNavScroll() {
        const nav = $(".nav-bar");
        if (!nav) return;
        const onScroll = () => {
            if (window.scrollY > 10) nav.classList.add("scrolled");
            else nav.classList.remove("scrolled");
        };
        on(window, "scroll", onScroll, { passive: true });
        onScroll();
    }

    /* ---------- 4. 滚动入场动画（IntersectionObserver） ---------- */
    function initReveal() {
        const items = $$(".reveal");
        if (!items.length) return;

        if (!("IntersectionObserver" in window)) {
            items.forEach((el) => el.classList.add("in-view"));
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("in-view");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
        );

        items.forEach((el) => observer.observe(el));
    }

    /* ---------- 5. 返回顶部按钮 ---------- */
    function initBackToTop() {
        const btn = $("#backToTop");
        if (!btn) return;

        const toggle = () => {
            if (window.scrollY > 400) btn.classList.add("visible");
            else btn.classList.remove("visible");
        };

        on(window, "scroll", toggle, { passive: true });
        on(btn, "click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
        toggle();
    }

    /* ---------- 6. 开学倒计时 ---------- */
    function initCountdown() {
        const els = {
            days: $("#countdown-days"),
            hours: $("#countdown-hours"),
            minutes: $("#countdown-minutes"),
            seconds: $("#countdown-seconds"),
        };

        // 目标：2026 年 9 月 3 日 00:00:00 (CST)
        const target = new Date("2026-09-03T00:00:00+08:00").getTime();

        const pad = (n) => n.toString().padStart(2, "0");

        const update = () => {
            const now = Date.now();
            const diff = target - now;

            if (diff <= 0) {
                if (els.days) els.days.textContent = "00";
                if (els.hours) els.hours.textContent = "00";
                if (els.minutes) els.minutes.textContent = "00";
                if (els.seconds) els.seconds.textContent = "00";
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / (1000 * 60)) % 60);
            const seconds = Math.floor((diff / 1000) % 60);

            if (els.days) els.days.textContent = pad(days);
            if (els.hours) els.hours.textContent = pad(hours);
            if (els.minutes) els.minutes.textContent = pad(minutes);
            if (els.seconds) els.seconds.textContent = pad(seconds);
        };

        update();
        setInterval(update, 1000);
    }

    /* ---------- 7. 访问统计动画 ---------- */
    function initCounterAnimation() {
        const counters = $$("[data-counter]");
        if (!counters.length) return;

        const animate = (el) => {
            const target = parseFloat(el.dataset.counter);
            const duration = 1800;
            const start = performance.now();
            const isFloat = target % 1 !== 0;

            const tick = (now) => {
                const progress = Math.min((now - start) / duration, 1);
                // easeOutCubic
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = target * eased;
                el.textContent = isFloat ? current.toFixed(2) : Math.floor(current).toString();

                if (progress < 1) requestAnimationFrame(tick);
                else el.textContent = isFloat ? target.toFixed(2) : target.toString();
            };

            requestAnimationFrame(tick);
        };

        if (!("IntersectionObserver" in window)) {
            counters.forEach(animate);
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        animate(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.3 }
        );

        counters.forEach((el) => observer.observe(el));
    }

    /* ---------- 8. FAQ 手风琴 ---------- */
    function initFaq() {
        const items = $$(".faq-item");
        if (!items.length) return;

        items.forEach((item) => {
            const q = item.querySelector(".faq-question");
            on(q, "click", () => {
                const isOpen = item.classList.contains("open");
                // 可选：只允许打开一个；这里允许多个
                if (isOpen) item.classList.remove("open");
                else item.classList.add("open");
            });
        });
    }

    /* ---------- 9. 宫格点击反馈 + 跳转 ---------- */
    function initGridItems() {
        const items = $$(".grid-item[data-action], .quick-nav-item[data-action]");
        items.forEach((item) => {
            on(item, "click", (e) => {
                const action = item.dataset.action;
                const title = item.dataset.title || "";

                if (!action) {
                    showToast("即将上线：" + (title || "该功能"));
                    return;
                }

                // 外链跳转
                if (action.startsWith("http")) {
                    e.preventDefault();
                    showToast("正在前往：" + (title || "详情页"));
                    setTimeout(() => window.open(action, "_blank", "noopener"), 400);
                    return;
                }

                // 锚点跳转
                if (action.startsWith("#")) {
                    e.preventDefault();
                    const target = document.querySelector(action);
                    if (target) {
                        target.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                    return;
                }

                // 复制 / 其他动作
                if (action === "copy") {
                    const text = item.dataset.copyText || "";
                    if (text && navigator.clipboard) {
                        navigator.clipboard.writeText(text).then(() => {
                            showToast("已复制：" + text);
                        }).catch(() => showToast("复制失败"));
                    } else {
                        showToast(text || "无内容");
                    }
                    return;
                }

                // 默认：提示
                showToast(title || "即将上线");
            });
        });
    }

    /* ---------- 10. Banner 粒子装饰（canvas，性能友好，增强版） ---------- */
    function initBannerParticles() {
        const canvas = $("#bannerParticles");
        if (!canvas) return;

        // 减少动画偏好：不绘制粒子
        const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReduced) {
            canvas.style.display = "none";
            return;
        }

        const ctx = canvas.getContext("2d");
        let w = 0, h = 0;
        const DPR = Math.min(window.devicePixelRatio || 1, 2);

        const resize = () => {
            w = canvas.clientWidth;
            h = canvas.clientHeight;
            canvas.width = w * DPR;
            canvas.height = h * DPR;
            ctx.scale(DPR, DPR);
        };

        resize();
        on(window, "resize", () => {
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            resize();
        });

        // 生成粒子：数量增加，颜色多样化
        const count = Math.max(30, Math.min(80, Math.floor((w * h) / 12000)));
        const colors = [
            "255, 255, 255",
            "253, 230, 138",
            "187, 247, 208",
            "255, 255, 255"
        ];

        const particles = Array.from({ length: count }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            r: Math.random() * 2.5 + 0.6,
            vx: (Math.random() - 0.5) * 0.4,
            vy: -Math.random() * 0.4 - 0.08,
            alpha: Math.random() * 0.6 + 0.2,
            alphaSpeed: (Math.random() - 0.5) * 0.01,
            color: colors[Math.floor(Math.random() * colors.length)],
            phase: Math.random() * Math.PI * 2,
        }));

        // 鼠标视差偏移
        let mouseX = 0, mouseY = 0;
        let targetX = 0, targetY = 0;
        on(canvas, "mousemove", (e) => {
            const rect = canvas.getBoundingClientRect();
            targetX = (e.clientX - rect.left - w / 2) / w;
            targetY = (e.clientY - rect.top - h / 2) / h;
        });
        on(canvas, "mouseleave", () => {
            targetX = 0;
            targetY = 0;
        });

        let time = 0;
        const render = () => {
            time += 0.016;
            ctx.clearRect(0, 0, w, h);

            // 平滑的鼠标视差
            mouseX += (targetX - mouseX) * 0.05;
            mouseY += (targetY - mouseY) * 0.05;
            const parallaxX = mouseX * 15;
            const parallaxY = mouseY * 15;

            particles.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;

                // 透明度呼吸变化
                p.alpha += p.alphaSpeed;
                if (p.alpha > 0.8 || p.alpha < 0.15) p.alphaSpeed *= -1;

                if (p.y < -10) {
                    p.y = h + 10;
                    p.x = Math.random() * w;
                }
                if (p.x < -10) p.x = w + 10;
                if (p.x > w + 10) p.x = -10;

                const drawX = p.x + parallaxX * (0.3 + p.r * 0.2);
                const drawY = p.y + parallaxY * (0.3 + p.r * 0.2);

                // 外圈光晕
                if (p.r > 1.5) {
                    const gradient = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, p.r * 3);
                    gradient.addColorStop(0, `rgba(${p.color}, ${p.alpha * 0.5})`);
                    gradient.addColorStop(1, `rgba(${p.color}, 0)`);
                    ctx.beginPath();
                    ctx.arc(drawX, drawY, p.r * 3, 0, Math.PI * 2);
                    ctx.fillStyle = gradient;
                    ctx.fill();
                }

                // 核心粒子
                ctx.beginPath();
                ctx.arc(drawX, drawY, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
                ctx.fill();
            });

            requestAnimationFrame(render);
        };

        render();
    }

    /* ---------- 10.5. 动态生成内容区装饰元素 ---------- */
    function initContentDecorations() {
        const mainContent = $(".main-content");
        if (!mainContent) return;

        // 创建几个大尺寸模糊色块作为背景装饰
        const blobs = [
            { color: "rgba(45, 159, 102, 0.08)", size: 220, top: "5%", left: "-5%", duration: 18 },
            { color: "rgba(245, 158, 11, 0.06)", size: 180, top: "25%", right: "-4%", duration: 22 },
            { color: "rgba(37, 99, 235, 0.05)", size: 200, top: "55%", left: "-3%", duration: 25 },
            { color: "rgba(139, 92, 246, 0.05)", size: 160, top: "78%", right: "-2%", duration: 20 },
        ];

        blobs.forEach((b, i) => {
            const div = document.createElement("div");
            div.className = "content-deco blob";
            div.style.width = b.size + "px";
            div.style.height = b.size + "px";
            div.style.background = b.color;
            div.style.top = b.top;
            if (b.left !== undefined) div.style.left = b.left;
            if (b.right !== undefined) div.style.right = b.right;
            div.style.animationDuration = b.duration + "s";
            div.style.animationDelay = (i * 2) + "s";
            mainContent.insertBefore(div, mainContent.firstChild);
        });

        // 为宫格图标设置错峰动画延迟
        $$(".grid-item").forEach((item, i) => {
            const wrapper = item.querySelector(".icon-wrapper");
            if (wrapper) {
                wrapper.style.setProperty("--icon-delay", i % 8);
            }
        });
    }

    /* ---------- 10.6. Banner 动态装饰：随机生成浮动圆圈 ---------- */
    function initBannerDecorations() {
        const banner = $(".banner");
        if (!banner) return;

        // 已在 HTML 中声明，这里不需要重复添加
        // 仅为已有的 float-deco 设置随机延迟
        $$(".float-deco", banner).forEach((el, i) => {
            el.style.animationDelay = (i * 0.8) + "s";
        });
    }

    /* ---------- 11. 当前年份 & 日期显示 ---------- */
    function initDynamicDate() {
        const el = $("#currentYear");
        if (el) el.textContent = new Date().getFullYear().toString();
    }

    /* ---------- 12. 新闻列表点击提示（占位功能） ---------- */
    function initNewsList() {
        const items = $$(".news-item");
        items.forEach((item) => {
            on(item, "click", () => {
                const title = item.querySelector(".news-title")?.textContent.trim();
                showToast("查看详情：" + (title || "最新公告"));
            });
        });
    }

    /* ---------- 入口：DOM 就绪后执行 ---------- */
    function init() {
        initNavScroll();
        initReveal();
        initBackToTop();
        initCountdown();
        initCounterAnimation();
        initFaq();
        initGridItems();
        initBannerParticles();
        initContentDecorations();
        initBannerDecorations();
        initDynamicDate();
        initNewsList();

        // 为 counter 数字增加错峰延迟（增强动画）
        $$("[data-counter]").forEach((el, i) => {
            if (el.parentElement) {
                el.parentElement.style.transitionDelay = (i * 0.15) + "s";
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

    // 对外暴露（便于调试）
    window.YCITService = { showToast };
})();

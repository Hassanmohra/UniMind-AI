```javascript
(function () {
    "use strict";

    // =========================================================
    // UniMind AI - Student Dashboard
    // =========================================================

    const STORAGE_KEY = "unimind_dashboard_stats";

    // ---------------------------------------------------------
    // الإحصائيات المحلية
    // ---------------------------------------------------------

    const defaultStats = {
        chats: 0,
        summaries: 0,
        quizzes: 0,
        flashcards: 0,
        planners: 0,
        cv: 0
    };

    function getStats() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);

            if (!saved) {
                return { ...defaultStats };
            }

            return {
                ...defaultStats,
                ...JSON.parse(saved)
            };
        } catch (error) {
            return { ...defaultStats };
        }
    }

    function saveStats(stats) {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(stats)
            );
        } catch (error) {
            console.warn(
                "UniMind Dashboard: could not save stats."
            );
        }
    }

    function incrementStat(key) {
        const stats = getStats();

        if (typeof stats[key] !== "number") {
            stats[key] = 0;
        }

        stats[key]++;

        saveStats(stats);

        updateDashboardStats();
    }

    // ---------------------------------------------------------
    // اسم الطالب
    // ---------------------------------------------------------

    function getUserName() {
        try {
            if (
                window.UniMindAuth &&
                typeof window.UniMindAuth.getUserName === "function"
            ) {
                const name = window.UniMindAuth.getUserName();

                if (name) {
                    return name;
                }
            }
        } catch (error) {}

        return "الطالب";
    }

    // ---------------------------------------------------------
    // إنشاء CSS
    // ---------------------------------------------------------

    function createStyles() {
        if (document.getElementById("unimind-dashboard-styles")) {
            return;
        }

        const style = document.createElement("style");

        style.id = "unimind-dashboard-styles";

        style.textContent = `
            #unimind-dashboard {
                position: fixed;
                inset: 0;
                z-index: 99999;
                display: none;
                align-items: center;
                justify-content: center;
                padding: 20px;
                direction: rtl;
                font-family: inherit;
            }

            #unimind-dashboard.active {
                display: flex;
            }

            .unimind-dashboard-overlay {
                position: absolute;
                inset: 0;
                background: rgba(15, 23, 42, .68);
                backdrop-filter: blur(8px);
            }

            .unimind-dashboard-box {
                position: relative;
                z-index: 2;
                width: min(900px, 100%);
                max-height: 90vh;
                overflow-y: auto;
                background: var(--card-bg, #ffffff);
                color: var(--text-color, #111827);
                border-radius: 24px;
                padding: 28px;
                box-shadow: 0 25px 80px rgba(0,0,0,.25);
                animation: unimindDashboardShow .25s ease;
            }

            @keyframes unimindDashboardShow {
                from {
                    opacity: 0;
                    transform: translateY(20px) scale(.98);
                }

                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }

            .unimind-dashboard-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 15px;
                margin-bottom: 25px;
            }

            .unimind-dashboard-title {
                margin: 0;
                font-size: 28px;
                font-weight: 800;
            }

            .unimind-dashboard-subtitle {
                margin: 7px 0 0;
                opacity: .7;
                font-size: 14px;
            }

            .unimind-dashboard-close {
                width: 42px;
                height: 42px;
                border: 0;
                border-radius: 12px;
                background: rgba(100,100,100,.1);
                color: inherit;
                cursor: pointer;
                font-size: 20px;
            }

            .unimind-dashboard-close:hover {
                background: rgba(100,100,100,.18);
            }

            .unimind-dashboard-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 15px;
            }

            .unimind-dashboard-card {
                padding: 22px;
                border-radius: 18px;
                background: rgba(99,102,241,.07);
                border: 1px solid rgba(99,102,241,.12);
                text-align: right;
                transition: .2s ease;
            }

            .unimind-dashboard-card:hover {
                transform: translateY(-3px);
            }

            .unimind-dashboard-icon {
                font-size: 28px;
                margin-bottom: 12px;
            }

            .unimind-dashboard-number {
                font-size: 30px;
                font-weight: 800;
                line-height: 1;
                margin-bottom: 8px;
            }

            .unimind-dashboard-label {
                font-size: 14px;
                opacity: .72;
            }

            .unimind-dashboard-note {
                margin-top: 22px;
                padding: 15px 18px;
                border-radius: 14px;
                background: rgba(59,130,246,.08);
                border: 1px solid rgba(59,130,246,.12);
                font-size: 13px;
                line-height: 1.8;
            }

            @media (max-width: 700px) {
                .unimind-dashboard-box {
                    padding: 20px;
                    border-radius: 20px;
                }

                .unimind-dashboard-grid {
                    grid-template-columns: repeat(2, 1fr);
                }

                .unimind-dashboard-title {
                    font-size: 23px;
                }
            }

            @media (max-width: 450px) {
                .unimind-dashboard-grid {
                    grid-template-columns: 1fr;
                }
            }
        `;

        document.head.appendChild(style);
    }

    // ---------------------------------------------------------
    // إنشاء لوحة التحكم
    // ---------------------------------------------------------

    function createDashboard() {
        if (document.getElementById("unimind-dashboard")) {
            return;
        }

        createStyles();

        const dashboard = document.createElement("div");

        dashboard.id = "unimind-dashboard";

        dashboard.innerHTML = `
            <div class="unimind-dashboard-overlay"></div>

            <div class="unimind-dashboard-box">

                <div class="unimind-dashboard-header">

                    <div>
                        <h2 class="unimind-dashboard-title">
                            🎓 لوحتي
                        </h2>

                        <p class="unimind-dashboard-subtitle">
                            أهلاً بك،
                            <strong id="unimind-dashboard-user">
                                الطالب
                            </strong>
                            👋
                        </p>
                    </div>

                    <button
                        type="button"
                        class="unimind-dashboard-close"
                        id="unimind-dashboard-close"
                        aria-label="إغلاق"
                    >
                        ×
                    </button>

                </div>

                <div class="unimind-dashboard-grid">

                    <div class="unimind-dashboard-card">
                        <div class="unimind-dashboard-icon">
                            🤖
                        </div>

                        <div
                            class="unimind-dashboard-number"
                            id="dashboard-chats"
                        >
                            0
                        </div>

                        <div class="unimind-dashboard-label">
                            جلسات مساعد الدراسة
                        </div>
                    </div>

                    <div class="unimind-dashboard-card">
                        <div class="unimind-dashboard-icon">
                            📄
                        </div>

                        <div
                            class="unimind-dashboard-number"
                            id="dashboard-summaries"
                        >
                            0
                        </div>

                        <div class="unimind-dashboard-label">
                            ملخصات المحاضرات
                        </div>
                    </div>

                    <div class="unimind-dashboard-card">
                        <div class="unimind-dashboard-icon">
                            🧠
                        </div>

                        <div
                            class="unimind-dashboard-number"
                            id="dashboard-quizzes"
                        >
                            0
                        </div>

                        <div class="unimind-dashboard-label">
                            الاختبارات الذكية
                        </div>
                    </div>

                    <div class="unimind-dashboard-card">
                        <div class="unimind-dashboard-icon">
                            🗂️
                        </div>

                        <div
                            class="unimind-dashboard-number"
                            id="dashboard-flashcards"
                        >
                            0
                        </div>

                        <div class="unimind-dashboard-label">
                            البطاقات التعليمية
                        </div>
                    </div>

                    <div class="unimind-dashboard-card">
                        <div class="unimind-dashboard-icon">
                            📅
                        </div>

                        <div
                            class="unimind-dashboard-number"
                            id="dashboard-planners"
                        >
                            0
                        </div>

                        <div class="unimind-dashboard-label">
                            خطط الدراسة
                        </div>
                    </div>

                    <div class="unimind-dashboard-card">
                        <div class="unimind-dashboard-icon">
                            📄
                        </div>

                        <div
                            class="unimind-dashboard-number"
                            id="dashboard-cv"
                        >
                            0
                        </div>

                        <div class="unimind-dashboard-label">
                            السير الذاتية
                        </div>
                    </div>

                </div>

                <div class="unimind-dashboard-note">
                    💡 هذه الإحصائيات محفوظة حاليًا على جهازك.
                    في المرحلة القادمة يمكن ربطها بحسابك في Supabase
                    لتظهر لك بياناتك من أي جهاز.
                </div>

            </div>
        `;

        document.body.appendChild(dashboard);

        const closeButton = document.getElementById(
            "unimind-dashboard-close"
        );

        const overlay = dashboard.querySelector(
            ".unimind-dashboard-overlay"
        );

        if (closeButton) {
            closeButton.addEventListener(
                "click",
                closeDashboard
            );
        }

        if (overlay) {
            overlay.addEventListener(
                "click",
                closeDashboard
            );
        }

        updateDashboardStats();
    }

    // ---------------------------------------------------------
    // تحديث الإحصائيات
    // ---------------------------------------------------------

    function updateDashboardStats() {
        const stats = getStats();

        const elements = {
            chats: document.getElementById("dashboard-chats"),
            summaries: document.getElementById("dashboard-summaries"),
            quizzes: document.getElementById("dashboard-quizzes"),
            flashcards: document.getElementById("dashboard-flashcards"),
            planners: document.getElementById("dashboard-planners"),
            cv: document.getElementById("dashboard-cv")
        };

        Object.keys(elements).forEach(function (key) {
            if (elements[key]) {
                elements[key].textContent =
                    String(stats[key] || 0);
            }
        });
    }

    // ---------------------------------------------------------
    // فتح اللوحة
    // ---------------------------------------------------------

    function openDashboard() {
        createDashboard();

        const dashboard =
            document.getElementById("unimind-dashboard");

        const userElement =
            document.getElementById(
                "unimind-dashboard-user"
            );

        if (userElement) {
            userElement.textContent = getUserName();
        }

        updateDashboardStats();

        if (dashboard) {
            dashboard.classList.add("active");
            document.body.style.overflow = "hidden";
        }
    }

    // ---------------------------------------------------------
    // إغلاق اللوحة
    // ---------------------------------------------------------

    function closeDashboard() {
        const dashboard =
            document.getElementById("unimind-dashboard");

        if (dashboard) {
            dashboard.classList.remove("active");
        }

        document.body.style.overflow = "";
    }

    // ---------------------------------------------------------
    // إنشاء زر لوحة الطالب
    // ---------------------------------------------------------

    function bindDashboardButton() {
        const loginButton =
            document.getElementById("loginButton");

        if (!loginButton) {
            setTimeout(bindDashboardButton, 500);
            return;
        }

        let dashboardButton =
            document.getElementById(
                "unimind-dashboard-button"
            );

        if (!dashboardButton) {
            dashboardButton =
                document.createElement("button");

            dashboardButton.id =
                "unimind-dashboard-button";

            dashboardButton.type = "button";

            dashboardButton.innerHTML =
                "🎓 لوحتي";

            dashboardButton.style.cssText = `
                display: none;
                align-items: center;
                justify-content: center;
                gap: 6px;
                padding: 9px 14px;
                border: 1px solid rgba(99,102,241,.25);
                border-radius: 12px;
                background: rgba(99,102,241,.08);
                color: inherit;
                font-family: inherit;
                font-size: 14px;
                font-weight: 700;
                cursor: pointer;
                transition: .2s ease;
            `;

            dashboardButton.addEventListener(
                "mouseenter",
                function () {
                    dashboardButton.style.transform =
                        "translateY(-1px)";
                }
            );

            dashboardButton.addEventListener(
                "mouseleave",
                function () {
                    dashboardButton.style.transform =
                        "translateY(0)";
                }
            );

            dashboardButton.addEventListener(
                "click",
                function () {
                    openDashboard();
                }
            );

            loginButton.insertAdjacentElement(
                "afterend",
                dashboardButton
            );
        }

        function updateButton() {
            const text =
                (loginButton.textContent || "").trim();

            const loggedIn =
                text.includes("👤") ||
                (
                    text !== "" &&
                    text !== "تسجيل الدخول" &&
                    text !== "Login"
                );

            dashboardButton.style.display =
                loggedIn
                    ? "inline-flex"
                    : "none";
        }

        updateButton();

        const observer =
            new MutationObserver(function () {
                updateButton();
            });

        observer.observe(loginButton, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }

    // ---------------------------------------------------------
    // زر ESC لإغلاق اللوحة
    // ---------------------------------------------------------

    document.addEventListener(
        "keydown",
        function (event) {
            if (event.key === "Escape") {
                closeDashboard();
            }
        }
    );

    // ---------------------------------------------------------
    // API عامة للمشروع
    // ---------------------------------------------------------

    window.UniMindDashboard = {
        open: openDashboard,
        close: closeDashboard,
        increment: incrementStat,
        getStats: getStats,
        update: updateDashboardStats
    };

    // ---------------------------------------------------------
    // التشغيل
    // ---------------------------------------------------------

    function initializeDashboard() {
        createStyles();
        bindDashboardButton();
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initializeDashboard
        );
    } else {
        initializeDashboard();
    }

})();
```

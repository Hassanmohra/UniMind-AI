```javascript
(function () {
    "use strict";

    // =========================================================
    // UniMind AI - Student Dashboard
    // =========================================================

    const STORAGE_KEY = "unimind_dashboard_stats";

    const defaultStats = {
        chats: 0,
        summaries: 0,
        quizzes: 0,
        flashcards: 0,
        planners: 0,
        cv: 0
    };

    // =========================================================
    // الإحصائيات
    // =========================================================

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
            console.warn("UniMind: stats save failed");
        }
    }

    function incrementStat(key) {
        const stats = getStats();

        if (typeof stats[key] !== "number") {
            stats[key] = 0;
        }

        stats[key]++;

        saveStats(stats);
        updateStats();
    }

    // =========================================================
    // اسم المستخدم
    // =========================================================

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

    // =========================================================
    // CSS
    // =========================================================

    function addStyles() {
        if (document.getElementById("unimind-dashboard-css")) {
            return;
        }

        const style = document.createElement("style");

        style.id = "unimind-dashboard-css";

        style.textContent = `
            #unimind-dashboard-button {
                display: inline-flex !important;
                align-items: center;
                justify-content: center;
                gap: 6px;
                padding: 9px 15px;
                margin-right: 8px;
                border: 1px solid rgba(99,102,241,.25);
                border-radius: 12px;
                background: rgba(99,102,241,.08);
                color: inherit;
                font-family: inherit;
                font-size: 14px;
                font-weight: 700;
                cursor: pointer;
                transition: all .2s ease;
            }

            #unimind-dashboard-button:hover {
                transform: translateY(-2px);
                background: rgba(99,102,241,.15);
            }

            #unimind-dashboard {
                position: fixed;
                inset: 0;
                z-index: 999999;
                display: none;
                align-items: center;
                justify-content: center;
                padding: 20px;
                direction: rtl;
            }

            #unimind-dashboard.active {
                display: flex;
            }

            .unimind-dashboard-overlay {
                position: absolute;
                inset: 0;
                background: rgba(15,23,42,.70);
                backdrop-filter: blur(8px);
            }

            .unimind-dashboard-box {
                position: relative;
                z-index: 2;
                width: min(900px, 100%);
                max-height: 90vh;
                overflow-y: auto;
                padding: 28px;
                border-radius: 24px;
                background: var(--card-bg, #ffffff);
                color: var(--text-color, #111827);
                box-shadow: 0 25px 80px rgba(0,0,0,.30);
                animation: unimindDashboardIn .25s ease;
            }

            @keyframes unimindDashboardIn {
                from {
                    opacity: 0;
                    transform: translateY(20px) scale(.97);
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
                font-size: 22px;
                cursor: pointer;
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
                font-size: 13px;
                line-height: 1.8;
            }

            @media (max-width: 700px) {
                .unimind-dashboard-grid {
                    grid-template-columns: repeat(2, 1fr);
                }

                .unimind-dashboard-box {
                    padding: 20px;
                }
            }

            @media (max-width: 450px) {
                .unimind-dashboard-grid {
                    grid-template-columns: 1fr;
                }

                #unimind-dashboard-button {
                    padding: 8px 10px;
                    font-size: 12px;
                }
            }
        `;

        document.head.appendChild(style);
    }

    // =========================================================
    // إنشاء لوحة الطالب
    // =========================================================

    function createDashboard() {
        if (document.getElementById("unimind-dashboard")) {
            return;
        }

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
                    >
                        ×
                    </button>

                </div>

                <div class="unimind-dashboard-grid">

                    <div class="unimind-dashboard-card">
                        <div class="unimind-dashboard-icon">🤖</div>

                        <div
                            class="unimind-dashboard-number"
                            id="dashboard-chats"
                        >0</div>

                        <div class="unimind-dashboard-label">
                            جلسات مساعد الدراسة
                        </div>
                    </div>

                    <div class="unimind-dashboard-card">
                        <div class="unimind-dashboard-icon">📄</div>

                        <div
                            class="unimind-dashboard-number"
                            id="dashboard-summaries"
                        >0</div>

                        <div class="unimind-dashboard-label">
                            ملخصات المحاضرات
                        </div>
                    </div>

                    <div class="unimind-dashboard-card">
                        <div class="unimind-dashboard-icon">🧠</div>

                        <div
                            class="unimind-dashboard-number"
                            id="dashboard-quizzes"
                        >0</div>

                        <div class="unimind-dashboard-label">
                            الاختبارات الذكية
                        </div>
                    </div>

                    <div class="unimind-dashboard-card">
                        <div class="unimind-dashboard-icon">🗂️</div>

                        <div
                            class="unimind-dashboard-number"
                            id="dashboard-flashcards"
                        >0</div>

                        <div class="unimind-dashboard-label">
                            البطاقات التعليمية
                        </div>
                    </div>

                    <div class="unimind-dashboard-card">
                        <div class="unimind-dashboard-icon">📅</div>

                        <div
                            class="unimind-dashboard-number"
                            id="dashboard-planners"
                        >0</div>

                        <div class="unimind-dashboard-label">
                            خطط الدراسة
                        </div>
                    </div>

                    <div class="unimind-dashboard-card">
                        <div class="unimind-dashboard-icon">📑</div>

                        <div
                            class="unimind-dashboard-number"
                            id="dashboard-cv"
                        >0</div>

                        <div class="unimind-dashboard-label">
                            السير الذاتية
                        </div>
                    </div>

                </div>

                <div class="unimind-dashboard-note">
                    💡 الإحصائيات محفوظة حاليًا على جهازك.
                    سنربطها لاحقًا بحساب Supabase حتى تظهر
                    بياناتك على أي جهاز.
                </div>

            </div>
        `;

        document.body.appendChild(dashboard);

        document
            .getElementById("unimind-dashboard-close")
            .addEventListener("click", closeDashboard);

        document
            .querySelector(".unimind-dashboard-overlay")
            .addEventListener("click", closeDashboard);

        updateStats();
    }

    // =========================================================
    // تحديث الإحصائيات
    // =========================================================

    function updateStats() {
        const stats = getStats();

        const ids = {
            chats: "dashboard-chats",
            summaries: "dashboard-summaries",
            quizzes: "dashboard-quizzes",
            flashcards: "dashboard-flashcards",
            planners: "dashboard-planners",
            cv: "dashboard-cv"
        };

        Object.keys(ids).forEach(function (key) {
            const element =
                document.getElementById(ids[key]);

            if (element) {
                element.textContent =
                    String(stats[key] || 0);
            }
        });
    }

    // =========================================================
    // فتح اللوحة
    // =========================================================

    function openDashboard() {
        createDashboard();

        const dashboard =
            document.getElementById("unimind-dashboard");

        const user =
            document.getElementById(
                "unimind-dashboard-user"
            );

        if (user) {
            user.textContent = getUserName();
        }

        updateStats();

        dashboard.classList.add("active");

        document.body.style.overflow = "hidden";
    }

    // =========================================================
    // إغلاق اللوحة
    // =========================================================

    function closeDashboard() {
        const dashboard =
            document.getElementById("unimind-dashboard");

        if (dashboard) {
            dashboard.classList.remove("active");
        }

        document.body.style.overflow = "";
    }

    // =========================================================
    // إنشاء زر لوحتي
    // =========================================================

    function createDashboardButton() {
        if (
            document.getElementById(
                "unimind-dashboard-button"
            )
        ) {
            return;
        }

        const button =
            document.createElement("button");

        button.id =
            "unimind-dashboard-button";

        button.type = "button";

        button.innerHTML =
            "🎓 لوحتي";

        button.title =
            "فتح لوحة الطالب";

        button.addEventListener(
            "click",
            openDashboard
        );

        const loginButton =
            document.getElementById("loginButton");

        if (loginButton) {
            loginButton.insertAdjacentElement(
                "afterend",
                button
            );
        } else {
            document.body.appendChild(button);

            button.style.position = "fixed";
            button.style.top = "20px";
            button.style.right = "20px";
            button.style.zIndex = "99998";
        }
    }

    // =========================================================
    // ESC
    // =========================================================

    document.addEventListener(
        "keydown",
        function (event) {
            if (event.key === "Escape") {
                closeDashboard();
            }
        }
    );

    // =========================================================
    // API عامة
    // =========================================================

    window.UniMindDashboard = {
        open: openDashboard,
        close: closeDashboard,
        increment: incrementStat,
        getStats: getStats,
        update: updateStats
    };

    // =========================================================
    // تشغيل
    // =========================================================

    function init() {
        addStyles();
        createDashboard();
        createDashboardButton();

        console.log(
            "UniMind Dashboard: loaded successfully"
        );
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            init
        );
    } else {
        init();
    }

})();
```

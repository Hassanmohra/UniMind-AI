(function () {
    "use strict";

    // =========================================================
    // UniMind AI - Student Dashboard
    // Enhanced Stable Version
    // =========================================================

    const STORAGE_KEY = "unimind_dashboard_stats";
    const ACTIVITY_KEY = "unimind_dashboard_activity";

    const defaultStats = {
        chats: 0,
        summaries: 0,
        quizzes: 0,
        flashcards: 0,
        planners: 0,
        cv: 0
    };

    // =========================================================
    // STORAGE
    // =========================================================

    function getStats() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);

            if (!saved) {
                return { ...defaultStats };
            }

            const parsed = JSON.parse(saved);

            return {
                ...defaultStats,
                ...parsed
            };
        } catch (error) {
            console.warn(
                "UniMind Dashboard: failed to load stats."
            );

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
                "UniMind Dashboard: failed to save stats."
            );
        }
    }

    // =========================================================
    // ACTIVITY
    // =========================================================

    function getLastActivity() {
        try {
            return (
                localStorage.getItem(ACTIVITY_KEY) ||
                null
            );
        } catch (error) {
            return null;
        }
    }

    function saveLastActivity() {
        try {
            localStorage.setItem(
                ACTIVITY_KEY,
                new Date().toISOString()
            );
        } catch (error) {
            console.warn(
                "UniMind Dashboard: activity save failed."
            );
        }
    }

    function formatLastActivity() {
        const value = getLastActivity();

        if (!value) {
            return "لم يبدأ النشاط بعد";
        }

        try {
            const date = new Date(value);

            return date.toLocaleString(
                "ar",
                {
                    dateStyle: "medium",
                    timeStyle: "short"
                }
            );
        } catch (error) {
            return "نشاط مسجل";
        }
    }

    // =========================================================
    // STATISTICS
    // =========================================================

    function getTotalActivity() {
        const stats = getStats();

        return Object.values(stats).reduce(
            function (total, value) {
                return total + (Number(value) || 0);
            },
            0
        );
    }

    function getProgress() {
        const total = getTotalActivity();

        return Math.min(
            100,
            Math.round((total / 30) * 100)
        );
    }

    function getLevel() {
        const total = getTotalActivity();

        if (total >= 50) {
            return {
                name: "طالب متقدم",
                icon: "🏆"
            };
        }

        if (total >= 30) {
            return {
                name: "طالب نشيط",
                icon: "🚀"
            };
        }

        if (total >= 15) {
            return {
                name: "طالب مجتهد",
                icon: "⭐"
            };
        }

        if (total >= 5) {
            return {
                name: "طالب متعلم",
                icon: "📚"
            };
        }

        return {
            name: "بداية رائعة",
            icon: "🌱"
        };
    }

    function incrementStat(key) {
        if (
            !Object.prototype.hasOwnProperty.call(
                defaultStats,
                key
            )
        ) {
            console.warn(
                "UniMind Dashboard: unknown statistic:",
                key
            );

            return;
        }

        const stats = getStats();

        if (typeof stats[key] !== "number") {
            stats[key] = 0;
        }

        stats[key]++;

        saveStats(stats);
        saveLastActivity();
        updateStats();

        console.log(
            "UniMind Dashboard:",
            key,
            stats[key]
        );
    }

    // =========================================================
    // USER NAME
    // =========================================================

    function getUserName() {
        try {
            if (
                window.UniMindAuth &&
                typeof window.UniMindAuth.getUserName ===
                    "function"
            ) {
                const name =
                    window.UniMindAuth.getUserName();

                if (name) {
                    return name;
                }
            }

            if (
                window.UniMindAuth &&
                typeof window.UniMindAuth.getUser ===
                    "function"
            ) {
                const user =
                    window.UniMindAuth.getUser();

                if (user) {
                    const metadata =
                        user.user_metadata ||
                        user.userMetadata ||
                        {};

                    const name =
                        metadata.full_name ||
                        metadata.fullName ||
                        metadata.name ||
                        metadata.display_name ||
                        metadata.displayName;

                    if (name) {
                        return name;
                    }

                    if (user.email) {
                        return user.email.split("@")[0];
                    }
                }
            }
        } catch (error) {
            console.warn(
                "UniMind Dashboard: user name unavailable."
            );
        }

        return "الطالب";
    }

    // =========================================================
    // STYLES
    // =========================================================

    function addStyles() {
        if (
            document.getElementById(
                "unimind-dashboard-css"
            )
        ) {
            return;
        }

        const style =
            document.createElement("style");

        style.id =
            "unimind-dashboard-css";

        style.textContent = `
            #unimind-dashboard-button {
                display: inline-flex !important;
                align-items: center;
                justify-content: center;
                gap: 7px;
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
                white-space: nowrap;
                transition: .2s ease;
            }

            #unimind-dashboard-button:hover {
                transform: translateY(-2px);
                background: rgba(99,102,241,.15);
                box-shadow: 0 6px 18px rgba(99,102,241,.15);
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
                background: rgba(15,23,42,.72);
                backdrop-filter: blur(8px);
            }

            .unimind-dashboard-box {
                position: relative;
                z-index: 2;
                width: min(950px, 100%);
                max-height: 90vh;
                overflow-y: auto;
                padding: 30px;
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
                margin-bottom: 22px;
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
                transition: .2s ease;
            }

            .unimind-dashboard-close:hover {
                background: rgba(100,100,100,.18);
                transform: rotate(5deg);
            }

            .unimind-dashboard-overview {
                display: grid;
                grid-template-columns: 1.4fr 1fr;
                gap: 15px;
                margin-bottom: 18px;
            }

            .unimind-dashboard-progress-card,
            .unimind-dashboard-level-card {
                padding: 20px;
                border-radius: 18px;
                background: rgba(99,102,241,.07);
                border: 1px solid rgba(99,102,241,.12);
            }

            .unimind-dashboard-progress-top {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 10px;
                margin-bottom: 12px;
            }

            .unimind-dashboard-progress-title {
                font-weight: 800;
            }

            .unimind-dashboard-progress-value {
                font-weight: 800;
            }

            .unimind-dashboard-progress-bar {
                height: 10px;
                overflow: hidden;
                border-radius: 99px;
                background: rgba(100,100,100,.12);
            }

            .unimind-dashboard-progress-fill {
                width: 0%;
                height: 100%;
                border-radius: inherit;
                background: linear-gradient(
                    90deg,
                    #6366f1,
                    #8b5cf6
                );
                transition: width .4s ease;
            }

            .unimind-dashboard-level {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .unimind-dashboard-level-icon {
                font-size: 34px;
            }

            .unimind-dashboard-level-name {
                font-size: 18px;
                font-weight: 800;
            }

            .unimind-dashboard-level-total {
                margin-top: 4px;
                font-size: 13px;
                opacity: .65;
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
                box-shadow: 0 8px 25px rgba(0,0,0,.06);
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
                margin-top: 18px;
                padding: 15px 18px;
                border-radius: 14px;
                background: rgba(59,130,246,.08);
                font-size: 13px;
                line-height: 1.8;
            }

            .unimind-dashboard-activity {
                margin-top: 12px;
                padding: 15px 18px;
                border-radius: 14px;
                background: rgba(16,185,129,.08);
                font-size: 13px;
                line-height: 1.8;
            }

            .unimind-dashboard-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 10px;
                margin-top: 20px;
                flex-wrap: wrap;
            }

            .unimind-dashboard-reset {
                border: 0;
                border-radius: 10px;
                padding: 9px 14px;
                background: rgba(239,68,68,.08);
                color: inherit;
                font-family: inherit;
                font-size: 13px;
                font-weight: 700;
                cursor: pointer;
                transition: .2s ease;
            }

            .unimind-dashboard-reset:hover {
                background: rgba(239,68,68,.16);
                transform: translateY(-1px);
            }

            .unimind-dashboard-refresh {
                border: 0;
                border-radius: 10px;
                padding: 9px 14px;
                background: rgba(99,102,241,.09);
                color: inherit;
                font-family: inherit;
                font-size: 13px;
                font-weight: 700;
                cursor: pointer;
                transition: .2s ease;
            }

            .unimind-dashboard-refresh:hover {
                background: rgba(99,102,241,.16);
                transform: translateY(-1px);
            }

            @media (max-width: 700px) {
                .unimind-dashboard-overview {
                    grid-template-columns: 1fr;
                }

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

                .unimind-dashboard-title {
                    font-size: 23px;
                }
            }
        `;

        document.head.appendChild(style);
    }

    // =========================================================
    // CREATE DASHBOARD
    // =========================================================

    function createDashboard() {
        if (
            document.getElementById(
                "unimind-dashboard"
            )
        ) {
            return;
        }

        const dashboard =
            document.createElement("div");

        dashboard.id =
            "unimind-dashboard";

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
                        aria-label="إغلاق">
                        ×
                    </button>

                </div>

                <div class="unimind-dashboard-overview">

                    <div class="unimind-dashboard-progress-card">

                        <div class="unimind-dashboard-progress-top">

                            <span class="unimind-dashboard-progress-title">
                                📈 تقدمك في UniMind
                            </span>

                            <span
                                class="unimind-dashboard-progress-value"
                                id="dashboard-progress-value">
                                0%
                            </span>

                        </div>

                        <div class="unimind-dashboard-progress-bar">

                            <div
                                class="unimind-dashboard-progress-fill"
                                id="dashboard-progress-fill">
                            </div>

                        </div>

                    </div>

                    <div class="unimind-dashboard-level-card">

                        <div class="unimind-dashboard-level">

                            <div
                                class="unimind-dashboard-level-icon"
                                id="dashboard-level-icon">
                                🌱
                            </div>

                            <div>

                                <div
                                    class="unimind-dashboard-level-name"
                                    id="dashboard-level-name">
                                    بداية رائعة
                                </div>

                                <div
                                    class="unimind-dashboard-level-total"
                                    id="dashboard-total">
                                    0 نشاط
                                </div>

                            </div>

                        </div>

                    </div>

                </div>

                <div class="unimind-dashboard-grid">

                    <div class="unimind-dashboard-card">
                        <div class="unimind-dashboard-icon">🤖</div>
                        <div
                            class="unimind-dashboard-number"
                            id="dashboard-chats">
                            0
                        </div>
                        <div class="unimind-dashboard-label">
                            جلسات مساعد الدراسة
                        </div>
                    </div>

                    <div class="unimind-dashboard-card">
                        <div class="unimind-dashboard-icon">📄</div>
                        <div
                            class="unimind-dashboard-number"
                            id="dashboard-summaries">
                            0
                        </div>
                        <div class="unimind-dashboard-label">
                            ملخصات المحاضرات
                        </div>
                    </div>

                    <div class="unimind-dashboard-card">
                        <div class="unimind-dashboard-icon">🧠</div>
                        <div
                            class="unimind-dashboard-number"
                            id="dashboard-quizzes">
                            0
                        </div>
                        <div class="unimind-dashboard-label">
                            الاختبارات الذكية
                        </div>
                    </div>

                    <div class="unimind-dashboard-card">
                        <div class="unimind-dashboard-icon">🗂️</div>
                        <div
                            class="unimind-dashboard-number"
                            id="dashboard-flashcards">
                            0
                        </div>
                        <div class="unimind-dashboard-label">
                            البطاقات التعليمية
                        </div>
                    </div>

                    <div class="unimind-dashboard-card">
                        <div class="unimind-dashboard-icon">📅</div>
                        <div
                            class="unimind-dashboard-number"
                            id="dashboard-planners">
                            0
                        </div>
                        <div class="unimind-dashboard-label">
                            خطط الدراسة
                        </div>
                    </div>

                    <div class="unimind-dashboard-card">
                        <div class="unimind-dashboard-icon">📑</div>
                        <div
                            class="unimind-dashboard-number"
                            id="dashboard-cv">
                            0
                        </div>
                        <div class="unimind-dashboard-label">
                            السير الذاتية
                        </div>
                    </div>

                </div>

                <div class="unimind-dashboard-activity">

                    🕒 <strong>آخر نشاط:</strong>

                    <span id="dashboard-last-activity">
                        لم يبدأ النشاط بعد
                    </span>

                </div>

                <div class="unimind-dashboard-note">

                    💡 الإحصائيات محفوظة حاليًا
                    على هذا الجهاز.

                    <br>

                    يمكنك استخدامها حتى بعد إغلاق
                    المتصفح، ما دمت تستخدم نفس الجهاز
                    والمتصفح.

                </div>

                <div class="unimind-dashboard-footer">

                    <span>
                        📊 إحصائيات استخدام UniMind AI
                    </span>

                    <div style="
                        display:flex;
                        gap:8px;
                        flex-wrap:wrap;
                    ">

                        <button
                            type="button"
                            class="unimind-dashboard-refresh"
                            id="unimind-dashboard-refresh">
                            🔄 تحديث
                        </button>

                        <button
                            type="button"
                            class="unimind-dashboard-reset"
                            id="unimind-dashboard-reset">
                            🗑️ تصفير الإحصائيات
                        </button>

                    </div>

                </div>

            </div>
        `;

        document.body.appendChild(dashboard);

        const closeButton =
            document.getElementById(
                "unimind-dashboard-close"
            );

        if (closeButton) {
            closeButton.addEventListener(
                "click",
                closeDashboard
            );
        }

        const overlay =
            dashboard.querySelector(
                ".unimind-dashboard-overlay"
            );

        if (overlay) {
            overlay.addEventListener(
                "click",
                closeDashboard
            );
        }

        const resetButton =
            document.getElementById(
                "unimind-dashboard-reset"
            );

        if (resetButton) {
            resetButton.addEventListener(
                "click",
                resetStats
            );
        }

        const refreshButton =
            document.getElementById(
                "unimind-dashboard-refresh"
            );

        if (refreshButton) {
            refreshButton.addEventListener(
                "click",
                updateStats
            );
        }

        updateStats();
    }

    // =========================================================
    // UPDATE DASHBOARD
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

        Object.keys(ids).forEach(
            function (key) {
                const element =
                    document.getElementById(
                        ids[key]
                    );

                if (element) {
                    element.textContent =
                        String(
                            Number(stats[key]) || 0
                        );
                }
            }
        );

        const total =
            getTotalActivity();

        const progress =
            getProgress();

        const level =
            getLevel();

        const progressValue =
            document.getElementById(
                "dashboard-progress-value"
            );

        if (progressValue) {
            progressValue.textContent =
                progress + "%";
        }

        const progressFill =
            document.getElementById(
                "dashboard-progress-fill"
            );

        if (progressFill) {
            progressFill.style.width =
                progress + "%";
        }

        const levelIcon =
            document.getElementById(
                "dashboard-level-icon"
            );

        if (levelIcon) {
            levelIcon.textContent =
                level.icon;
        }

        const levelName =
            document.getElementById(
                "dashboard-level-name"
            );

        if (levelName) {
            levelName.textContent =
                level.name;
        }

        const totalElement =
            document.getElementById(
                "dashboard-total"
            );

        if (totalElement) {
            totalElement.textContent =
                total === 1
                    ? "نشاط واحد"
                    : total + " نشاط";
        }

        const lastActivity =
            document.getElementById(
                "dashboard-last-activity"
            );

        if (lastActivity) {
            lastActivity.textContent =
                formatLastActivity();
        }
    }

    // =========================================================
    // RESET
    // =========================================================

    function resetStats() {
        const confirmed =
            window.confirm(
                "هل تريد تصفير جميع إحصائيات لوحة الطالب؟"
            );

        if (!confirmed) {
            return;
        }

        saveStats({
            ...defaultStats
        });

        try {
            localStorage.removeItem(
                ACTIVITY_KEY
            );
        } catch (error) {
            console.warn(
                "UniMind Dashboard: activity reset failed."
            );
        }

        updateStats();
    }

    // =========================================================
    // OPEN
    // =========================================================

    function openDashboard() {
        createDashboard();

        const dashboard =
            document.getElementById(
                "unimind-dashboard"
            );

        const user =
            document.getElementById(
                "unimind-dashboard-user"
            );

        if (user) {
            user.textContent =
                getUserName();
        }

        updateStats();

        if (dashboard) {
            dashboard.classList.add(
                "active"
            );

            document.body.style.overflow =
                "hidden";
        }
    }

    // =========================================================
    // CLOSE
    // =========================================================

    function closeDashboard() {
        const dashboard =
            document.getElementById(
                "unimind-dashboard"
            );

        if (dashboard) {
            dashboard.classList.remove(
                "active"
            );
        }

        document.body.style.overflow =
            "";
    }

    // =========================================================
    // HEADER BUTTON
    // =========================================================

    function createDashboardButton() {
        const existing =
            document.getElementById(
                "unimind-dashboard-button"
            );

        if (existing) {
            return existing;
        }

        const button =
            document.createElement(
                "button"
            );

        button.id =
            "unimind-dashboard-button";

        button.type =
            "button";

        button.innerHTML =
            "🎓 لوحتي";

        button.title =
            "فتح لوحة الطالب";

        button.setAttribute(
            "aria-label",
            "فتح لوحة الطالب"
        );

        button.addEventListener(
            "click",
            openDashboard
        );

        const loginButton =
            document.getElementById(
                "loginButton"
            );

        if (
            loginButton &&
            loginButton.parentElement
        ) {
            loginButton.insertAdjacentElement(
                "afterend",
                button
            );

            return button;
        }

        const header =
            document.querySelector(
                "header"
            );

        if (header) {
            const headerContainer =
                header.querySelector(
                    ".header-actions, .nav-actions, .actions"
                );

            if (headerContainer) {
                headerContainer.appendChild(
                    button
                );

                return button;
            }

            header.appendChild(button);

            button.style.margin =
                "10px";

            return button;
        }

        document.body.appendChild(
            button
        );

        button.style.position =
            "fixed";

        button.style.top =
            "20px";

        button.style.right =
            "20px";

        button.style.zIndex =
            "999998";

        return button;
    }

    // =========================================================
    // ENSURE BUTTON
    // =========================================================

    function ensureDashboardButton() {
        createDashboardButton();

        let attempts = 0;

        const retryTimer =
            setInterval(
                function () {
                    attempts++;

                    const button =
                        document.getElementById(
                            "unimind-dashboard-button"
                        );

                    if (!button) {
                        createDashboardButton();
                    }

                    if (attempts >= 20) {
                        clearInterval(
                            retryTimer
                        );
                    }
                },
                500
            );
    }

    // =========================================================
    // OBSERVE DOM
    // =========================================================

    function observePageChanges() {
        if (
            typeof MutationObserver ===
            "undefined"
        ) {
            return;
        }

        const observer =
            new MutationObserver(
                function () {
                    if (
                        !document.getElementById(
                            "unimind-dashboard-button"
                        )
                    ) {
                        createDashboardButton();
                    }
                }
            );

        observer.observe(
            document.body,
            {
                childList: true,
                subtree: true
            }
        );
    }

    // =========================================================
    // ESC KEY
    // =========================================================

    document.addEventListener(
        "keydown",
        function (event) {
            if (
                event.key ===
                "Escape"
            ) {
                closeDashboard();
            }
        }
    );

    // =========================================================
    // PUBLIC API
    // =========================================================

    window.UniMindDashboard = {
        open: openDashboard,
        close: closeDashboard,
        increment: incrementStat,
        getStats: getStats,
        update: updateStats,
        reset: resetStats,
        getUserName: getUserName,
        getTotalActivity: getTotalActivity,
        getProgress: getProgress,
        getLevel: getLevel
    };

    // =========================================================
    // INITIALIZATION
    // =========================================================

    function init() {
        addStyles();

        createDashboard();

        ensureDashboardButton();

        observePageChanges();

        console.log(
            "UniMind Dashboard: enhanced version loaded successfully"
        );
    }

    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            init
        );
    } else {
        init();
    }

})();

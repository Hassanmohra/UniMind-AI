(function () {
    "use strict";

    // =========================================================
    // UniMind AI - Student Dashboard
    // =========================================================

    const DASHBOARD_ID = "unimind-dashboard";

    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function getUserName() {
        try {
            if (window.UniMindAuth && typeof window.UniMindAuth.getUserName === "function") {
                return window.UniMindAuth.getUserName();
            }
        } catch (error) {
            console.warn("Dashboard user name error:", error);
        }

        return "الطالب";
    }

    function getInitial(name) {
        const text = String(name || "ط").trim();
        return text.charAt(0).toUpperCase();
    }

    function getStats() {
        try {
            return JSON.parse(
                localStorage.getItem("unimind_dashboard_stats") || "{}"
            );
        } catch {
            return {};
        }
    }

    function saveStats(stats) {
        localStorage.setItem(
            "unimind_dashboard_stats",
            JSON.stringify(stats)
        );
    }

    function incrementStat(key) {
        const stats = getStats();

        stats[key] = Number(stats[key] || 0) + 1;

        saveStats(stats);

        updateDashboardStats();
    }

    function updateDashboardStats() {
        const stats = getStats();

        const values = {
            chats: stats.chats || 0,
            summaries: stats.summaries || 0,
            quizzes: stats.quizzes || 0,
            flashcards: stats.flashcards || 0,
            planners: stats.planners || 0,
            cv: stats.cv || 0
        };

        Object.keys(values).forEach(function (key) {
            const element = document.querySelector(
                '[data-dashboard-stat="' + key + '"]'
            );

            if (element) {
                element.textContent = values[key];
            }
        });
    }

    function createDashboard() {
        if (document.getElementById(DASHBOARD_ID)) {
            return;
        }

        const style = document.createElement("style");

        style.id = "unimind-dashboard-style";

        style.textContent = `
            #${DASHBOARD_ID} {
                position: fixed;
                inset: 0;
                z-index: 99980;
                display: none;
            }

            #${DASHBOARD_ID}.active {
                display: block;
            }

            .unimind-dashboard-overlay {
                position: absolute;
                inset: 0;
                background: rgba(15, 23, 42, 0.72);
                backdrop-filter: blur(8px);
            }

            .unimind-dashboard-window {
                position: relative;
                width: min(950px, calc(100% - 30px));
                max-height: calc(100vh - 40px);
                overflow-y: auto;
                margin: 20px auto;
                padding: 28px;
                border-radius: 28px;
                background: #ffffff;
                box-shadow: 0 30px 80px rgba(0,0,0,.28);
                box-sizing: border-box;
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
                gap: 20px;
                margin-bottom: 25px;
            }

            .unimind-dashboard-user {
                display: flex;
                align-items: center;
                gap: 14px;
            }

            .unimind-dashboard-avatar {
                width: 58px;
                height: 58px;
                border-radius: 18px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #2563eb;
                color: #ffffff;
                font-size: 23px;
                font-weight: 800;
            }

            .unimind-dashboard-user h2 {
                margin: 0;
                font-size: 22px;
                color: #111827;
            }

            .unimind-dashboard-user p {
                margin: 5px 0 0;
                color: #64748b;
                font-size: 13px;
            }

            #unimind-dashboard-close {
                width: 42px;
                height: 42px;
                border: 0;
                border-radius: 12px;
                background: #f1f5f9;
                color: #374151;
                font-size: 23px;
                cursor: pointer;
            }

            .unimind-dashboard-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 15px;
            }

            .unimind-dashboard-card {
                padding: 20px;
                border: 1px solid #e5e7eb;
                border-radius: 20px;
                background: #ffffff;
            }

            .unimind-dashboard-card-icon {
                width: 44px;
                height: 44px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 13px;
                background: #eff6ff;
                font-size: 21px;
                margin-bottom: 12px;
            }

            .unimind-dashboard-card strong {
                display: block;
                color: #111827;
                font-size: 14px;
            }

            .unimind-dashboard-number {
                margin-top: 7px;
                font-size: 27px;
                font-weight: 800;
                color: #2563eb;
            }

            .unimind-dashboard-section {
                margin-top: 22px;
                padding: 22px;
                border-radius: 20px;
                background: #f8fafc;
                border: 1px solid #e5e7eb;
            }

            .unimind-dashboard-section h3 {
                margin: 0 0 15px;
                color: #111827;
                font-size: 17px;
            }

            .unimind-dashboard-activity {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 10px;
            }

            .unimind-dashboard-activity-item {
                padding: 13px;
                border-radius: 13px;
                background: #ffffff;
                border: 1px solid #e5e7eb;
                color: #374151;
                font-size: 13px;
            }

            .unimind-dashboard-empty {
                color: #64748b;
                font-size: 13px;
                padding: 8px 0;
            }

            body.dark-mode #${DASHBOARD_ID} .unimind-dashboard-window {
                background: #0f172a;
            }

            body.dark-mode #${DASHBOARD_ID} .unimind-dashboard-user h2,
            body.dark-mode #${DASHBOARD_ID} .unimind-dashboard-card strong,
            body.dark-mode #${DASHBOARD_ID} .unimind-dashboard-section h3 {
                color: #f8fafc;
            }

            body.dark-mode #${DASHBOARD_ID} .unimind-dashboard-user p,
            body.dark-mode #${DASHBOARD_ID} .unimind-dashboard-empty {
                color: #94a3b8;
            }

            body.dark-mode #${DASHBOARD_ID} .unimind-dashboard-card {
                background: #111827;
                border-color: #1e293b;
            }

            body.dark-mode #${DASHBOARD_ID} .unimind-dashboard-section {
                background: #020617;
                border-color: #1e293b;
            }

            body.dark-mode #${DASHBOARD_ID} .unimind-dashboard-activity-item {
                background: #111827;
                border-color: #1e293b;
                color: #e5e7eb;
            }

            body.dark-mode #unimind-dashboard-close {
                background: #1e293b;
                color: #e5e7eb;
            }

            @media (max-width: 700px) {
                .unimind-dashboard-window {
                    width: calc(100% - 18px);
                    margin: 9px auto;
                    max-height: calc(100vh - 18px);
                    padding: 18px;
                    border-radius: 22px;
                }

                .unimind-dashboard-grid {
                    grid-template-columns: repeat(2, 1fr);
                }

                .unimind-dashboard-activity {
                    grid-template-columns: 1fr;
                }
            }

            @media (max-width: 450px) {
                .unimind-dashboard-grid {
                    grid-template-columns: 1fr;
                }

                .unimind-dashboard-header {
                    align-items: flex-start;
                }
            }
        `;

        document.head.appendChild(style);

        const modal = document.createElement("div");

        modal.id = DASHBOARD_ID;

        modal.innerHTML = `
            <div class="unimind-dashboard-overlay"></div>

            <div
                class="unimind-dashboard-window"
                role="dialog"
                aria-modal="true"
                aria-label="لوحة الطالب"
            >

                <div class="unimind-dashboard-header">

                    <div class="unimind-dashboard-user">

                        <div
                            class="unimind-dashboard-avatar"
                            id="unimind-dashboard-avatar"
                        >
                            ح
                        </div>

                        <div>
                            <h2>
                                مرحبًا،
                                <span id="unimind-dashboard-name">
                                    الطالب
                                </span>
                                👋
                            </h2>

                            <p>
                                لوحة التحكم الدراسية الخاصة بك
                            </p>
                        </div>

                    </div>

                    <button
                        type="button"
                        id="unimind-dashboard-close"
                        aria-label="إغلاق"
                    >
                        ×
                    </button>

                </div>


                <div class="unimind-dashboard-grid">

                    <div class="unimind-dashboard-card">

                        <div class="unimind-dashboard-card-icon">
                            🤖
                        </div>

                        <strong>
                            مساعد الدراسة
                        </strong>

                        <div
                            class="unimind-dashboard-number"
                            data-dashboard-stat="chats"
                        >
                            0
                        </div>

                    </div>


                    <div class="unimind-dashboard-card">

                        <div class="unimind-dashboard-card-icon">
                            📄
                        </div>

                        <strong>
                            الملخصات
                        </strong>

                        <div
                            class="unimind-dashboard-number"
                            data-dashboard-stat="summaries"
                        >
                            0
                        </div>

                    </div>


                    <div class="unimind-dashboard-card">

                        <div class="unimind-dashboard-card-icon">
                            🧠
                        </div>

                        <strong>
                            الاختبارات
                        </strong>

                        <div
                            class="unimind-dashboard-number"
                            data-dashboard-stat="quizzes"
                        >
                            0
                        </div>

                    </div>


                    <div class="unimind-dashboard-card">

                        <div class="unimind-dashboard-card-icon">
                            🃏
                        </div>

                        <strong>
                            البطاقات التعليمية
                        </strong>

                        <div
                            class="unimind-dashboard-number"
                            data-dashboard-stat="flashcards"
                        >
                            0
                        </div>

                    </div>


                    <div class="unimind-dashboard-card">

                        <div class="unimind-dashboard-card-icon">
                            📅
                        </div>

                        <strong>
                            خطط الدراسة
                        </strong>

                        <div
                            class="unimind-dashboard-number"
                            data-dashboard-stat="planners"
                        >
                            0
                        </div>

                    </div>


                    <div class="unimind-dashboard-card">

                        <div class="unimind-dashboard-card-icon">
                            💼
                        </div>

                        <strong>
                            السير الذاتية
                        </strong>

                        <div
                            class="unimind-dashboard-number"
                            data-dashboard-stat="cv"
                        >
                            0
                        </div>

                    </div>

                </div>


                <div class="unimind-dashboard-section">

                    <h3>
                        📊 نشاطك الدراسي
                    </h3>

                    <div class="unimind-dashboard-activity">

                        <div class="unimind-dashboard-activity-item">
                            🤖 استخدمت مساعد الدراسة
                        </div>

                        <div class="unimind-dashboard-activity-item">
                            📄 أنشأت ملخصًا
                        </div>

                        <div class="unimind-dashboard-activity-item">
                            🧠 أنشأت اختبارًا
                        </div>

                        <div class="unimind-dashboard-activity-item">
                            🃏 أنشأت بطاقات تعليمية
                        </div>

                    </div>

                </div>


                <div class="unimind-dashboard-section">

                    <h3>
                        💡 ملاحظة
                    </h3>

                    <div class="unimind-dashboard-empty">
                        سيتم تطوير هذه اللوحة لاحقًا لعرض البيانات
                        الحقيقية المحفوظة في حسابك وقاعدة البيانات.
                    </div>

                </div>

            </div>
        `;

        document.body.appendChild(modal);

        const closeButton = document.getElementById(
            "unimind-dashboard-close"
        );

        const overlay = modal.querySelector(
            ".unimind-dashboard-overlay"
        );

        if (closeButton) {
            closeButton.addEventListener("click", closeDashboard);
        }

        if (overlay) {
            overlay.addEventListener("click", closeDashboard);
        }

        document.addEventListener("keydown", function (event) {
            if (
                event.key === "Escape" &&
                modal.classList.contains("active")
            ) {
                closeDashboard();
            }
        });
    }

    function openDashboard() {
        createDashboard();

        const modal = document.getElementById(DASHBOARD_ID);

        if (!modal) {
            return;
        }

        const name = getUserName();

        const nameElement = document.getElementById(
            "unimind-dashboard-name"
        );

        const avatarElement = document.getElementById(
            "unimind-dashboard-avatar"
        );

        if (nameElement) {
            nameElement.textContent = name;
        }

        if (avatarElement) {
            avatarElement.textContent = getInitial(name);
        }

        updateDashboardStats();

        modal.classList.add("active");

        document.body.style.overflow = "hidden";
    }

    function closeDashboard() {
        const modal = document.getElementById(DASHBOARD_ID);

        if (!modal) {
            return;
        }

        modal.classList.remove("active");

        document.body.style.overflow = "";
    }

    function bindDashboardButton() {
        const loginButton = document.getElementById("loginButton");

        if (!loginButton) {
            return;
        }

        if (document.getElementById("unimind-dashboard-button")) {
            return;
        }

        const button = document.createElement("button");

        button.type = "button";
        button.id = "unimind-dashboard-button";
        button.className = "login-btn";
        button.textContent = "لوحتي 🎓";

        button.style.display = "none";

        button.addEventListener("click", openDashboard);

        loginButton.parentNode.insertBefore(
            button,
            loginButton.nextSibling
        );

        function updateButton() {
            let loggedIn = false;

            try {
                if (
                    window.UniMindAuth &&
                    typeof window.UniMindAuth.getCurrentSession === "function"
                ) {
                    loggedIn = !!window.UniMindAuth.getCurrentSession();
                }
            } catch {}

            button.style.display = loggedIn ? "inline-flex" : "none";
        }

        updateButton();

        window.addEventListener(
            "unimind-auth-updated",
            updateButton
        );

        setInterval(updateButton, 3000);
    }

    function exposeAPI() {
        window.UniMindDashboard = {
            open: openDashboard,
            close: closeDashboard,
            increment: incrementStat,
            getStats: getStats
        };
    }

    function start() {
        createDashboard();
        bindDashboardButton();
        exposeAPI();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start);
    } else {
        start();
    }

})();

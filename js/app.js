(function () {
    "use strict";

    // =========================================================
    // UniMind AI
    // Complete Frontend Controller
    // Arabic / RTL / Supabase / AI Tools
    // =========================================================

    const API_URL =
        "https://yzsfublvnwknjnayfosm.supabase.co/functions/v1/unimind-chat";

    const SUPABASE_URL =
        "https://yzsfublvnwknjnayfosm.supabase.co";

    const SUPABASE_ANON_KEY =
        "sb_publishable_vTD_YtnzjdWQBmAK-6Dtkg_n0s_w18f";

    let supabaseClient = null;
    let supabaseLoadingPromise = null;
    let currentUser = null;

    let selectedLectureFile = null;

    let quizState = {
        questions: [],
        current: 0,
        score: 0,
        answered: false
    };

    let flashcardState = {
        cards: [],
        current: 0,
        flipped: false
    };

    let studyPlan = [];

    let appStarted = false;

    // =========================================================
    // BASIC HELPERS
    // =========================================================

    function $(id) {
        return document.getElementById(id);
    }

    function escapeHTML(value) {
        if (value === null || value === undefined) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function lockBody() {
        document.body.classList.add("unimind-modal-open");
    }

    function unlockBody() {
        document.body.classList.remove("unimind-modal-open");
    }

    function safeText(value) {
        return String(value || "").trim();
    }

    // =========================================================
    // SUPABASE
    // =========================================================

    function loadSupabase() {
        if (window.supabase) {
            return Promise.resolve(window.supabase);
        }

        if (supabaseLoadingPromise) {
            return supabaseLoadingPromise;
        }

        supabaseLoadingPromise = new Promise((resolve, reject) => {
            const script = document.createElement("script");

            script.src =
                "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

            script.async = true;

            script.onload = function () {
                if (!window.supabase) {
                    reject(
                        new Error(
                            "تعذر تحميل مكتبة Supabase."
                        )
                    );
                    return;
                }

                resolve(window.supabase);
            };

            script.onerror = function () {
                reject(
                    new Error(
                        "تعذر تحميل مكتبة Supabase."
                    )
                );
            };

            document.head.appendChild(script);
        });

        return supabaseLoadingPromise;
    }

    async function getSupabase() {
        if (supabaseClient) {
            return supabaseClient;
        }

        const supabase = await loadSupabase();

        supabaseClient = supabase.createClient(
            SUPABASE_URL,
            SUPABASE_ANON_KEY
        );

        return supabaseClient;
    }

    // =========================================================
    // AI API
    // =========================================================

    async function askAI(message) {
        message = safeText(message);

        if (!message) {
            throw new Error("الرجاء كتابة رسالة أولاً.");
        }

        let response;

        try {
            response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json"
                },
                body: JSON.stringify({
                    message
                })
            });
        } catch (error) {
            console.error("UniMind network error:", error);

            throw new Error(
                "تعذر الاتصال بمساعد UniMind AI. تحقق من اتصال الإنترنت."
            );
        }

        const rawText = await response.text();

        console.log(
            "UniMind AI response:",
            response.status,
            rawText
        );

        if (!response.ok) {
            let msg = rawText;

            try {
                const parsed = JSON.parse(rawText);
                msg =
                    extractTextFromResponse(parsed) ||
                    rawText;
            } catch (_) {}

            throw new Error(
                msg ||
                    `تعذر الاتصال بمساعد UniMind AI. رمز الخطأ: ${response.status}`
            );
        }

        if (!rawText.trim()) {
            throw new Error("الخادم أرسل رداً فارغاً.");
        }

        const cleaned = rawText.trim();

        if (!looksLikeJSON(cleaned)) {
            return cleaned;
        }

        let data;

        try {
            data = JSON.parse(cleaned);
        } catch (_) {
            const extracted = extractJSONFromText(cleaned);

            if (extracted !== null) {
                data = extracted;
            } else {
                return cleaned;
            }
        }

        if (typeof data === "string") {
            return data;
        }

        const answer = extractTextFromResponse(data);

        if (answer) {
            return answer;
        }

        if (
            data &&
            typeof data === "object" &&
            (Array.isArray(data.questions) ||
                Array.isArray(data.cards))
        ) {
            return JSON.stringify(data);
        }

        return JSON.stringify(data, null, 2);
    }

    function looksLikeJSON(text) {
        const value = safeText(text);

        return (
            (value.startsWith("{") &&
                value.endsWith("}")) ||
            (value.startsWith("[") &&
                value.endsWith("]"))
        );
    }

    function extractJSONFromText(text) {
        if (!text) {
            return null;
        }

        try {
            return JSON.parse(text);
        } catch (_) {}

        const firstObject = text.indexOf("{");
        const lastObject = text.lastIndexOf("}");

        if (
            firstObject !== -1 &&
            lastObject > firstObject
        ) {
            try {
                return JSON.parse(
                    text.slice(
                        firstObject,
                        lastObject + 1
                    )
                );
            } catch (_) {}
        }

        const firstArray = text.indexOf("[");
        const lastArray = text.lastIndexOf("]");

        if (
            firstArray !== -1 &&
            lastArray > firstArray
        ) {
            try {
                return JSON.parse(
                    text.slice(
                        firstArray,
                        lastArray + 1
                    )
                );
            } catch (_) {}
        }

        return null;
    }

    function extractTextFromResponse(data) {
        if (
            data === null ||
            data === undefined
        ) {
            return "";
        }

        if (typeof data === "string") {
            return data.trim();
        }

        if (Array.isArray(data)) {
            for (const item of data) {
                const result =
                    extractTextFromResponse(item);

                if (result) {
                    return result;
                }
            }

            return "";
        }

        if (typeof data !== "object") {
            return String(data);
        }

        const keys = [
            "answer",
            "response",
            "reply",
            "message",
            "content",
            "text",
            "output",
            "result"
        ];

        for (const key of keys) {
            if (
                Object.prototype.hasOwnProperty.call(
                    data,
                    key
                )
            ) {
                const result =
                    extractTextFromResponse(
                        data[key]
                    );

                if (result) {
                    return result;
                }
            }
        }

        if (Array.isArray(data.choices)) {
            for (const choice of data.choices) {
                const result =
                    extractTextFromResponse(
                        choice
                    );

                if (result) {
                    return result;
                }
            }
        }

        if (data.data) {
            const result =
                extractTextFromResponse(data.data);

            if (result) {
                return result;
            }
        }

        return "";
    }

    // =========================================================
    // RUNTIME STYLES
    // =========================================================

    function injectStyles() {
        if ($("unimindRuntimeStyles")) {
            return;
        }

        const style = document.createElement("style");

        style.id = "unimindRuntimeStyles";

        style.textContent = `
            .unimind-modal-open {
                overflow: hidden !important;
            }

            .unimind-overlay {
                position: fixed;
                inset: 0;
                z-index: 999999;
                background: rgba(15, 23, 42, .65);
                backdrop-filter: blur(8px);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                box-sizing: border-box;
            }

            .unimind-modal {
                width: min(900px, 100%);
                max-height: 90vh;
                overflow: hidden;
                background: #fff;
                color: #172033;
                border-radius: 24px;
                box-shadow: 0 25px 80px rgba(0,0,0,.25);
                display: flex;
                flex-direction: column;
                direction: rtl;
            }

            .unimind-modal-header {
                padding: 18px 22px;
                border-bottom: 1px solid #e5e7eb;
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 15px;
            }

            .unimind-modal-title {
                margin: 0;
                font-size: 20px;
                font-weight: 800;
            }

            .unimind-close {
                border: 0;
                width: 40px;
                height: 40px;
                border-radius: 12px;
                background: #f1f5f9;
                cursor: pointer;
                font-size: 22px;
            }

            .unimind-modal-body {
                padding: 22px;
                overflow-y: auto;
            }

            .unimind-input,
            .unimind-textarea,
            .unimind-select {
                width: 100%;
                box-sizing: border-box;
                border: 1px solid #dbe3ef;
                border-radius: 14px;
                padding: 13px;
                font-family: inherit;
                font-size: 15px;
                outline: none;
                background: white;
            }

            .unimind-textarea {
                min-height: 150px;
                resize: vertical;
            }

            .unimind-input:focus,
            .unimind-textarea:focus,
            .unimind-select:focus {
                border-color: #6366f1;
                box-shadow: 0 0 0 4px rgba(99,102,241,.1);
            }

            .unimind-btn {
                border: 0;
                border-radius: 14px;
                padding: 12px 18px;
                font-family: inherit;
                font-weight: 700;
                cursor: pointer;
                transition: .2s;
            }

            .unimind-btn:hover {
                transform: translateY(-1px);
            }

            .unimind-btn:disabled {
                opacity: .6;
                cursor: not-allowed;
                transform: none;
            }

            .unimind-btn-primary {
                background: #4f46e5;
                color: white;
            }

            .unimind-btn-secondary {
                background: #eef2ff;
                color: #4338ca;
            }

            .unimind-btn-danger {
                background: #fee2e2;
                color: #b91c1c;
            }

            .unimind-row {
                display: flex;
                gap: 10px;
                align-items: center;
            }

            .unimind-row-wrap {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
            }

            .unimind-muted {
                color: #64748b;
                font-size: 14px;
                line-height: 1.8;
            }

            .unimind-error {
                margin-top: 14px;
                padding: 12px;
                border-radius: 12px;
                background: #fef2f2;
                color: #b91c1c;
                border: 1px solid #fecaca;
                line-height: 1.7;
            }

            .unimind-success {
                margin-top: 14px;
                padding: 12px;
                border-radius: 12px;
                background: #f0fdf4;
                color: #166534;
                border: 1px solid #bbf7d0;
                line-height: 1.7;
            }

            .unimind-chat {
                height: 420px;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 12px;
                padding: 8px;
            }

            .unimind-message {
                max-width: 82%;
                padding: 12px 15px;
                border-radius: 16px;
                line-height: 1.8;
                white-space: pre-wrap;
            }

            .unimind-message-user {
                align-self: flex-start;
                background: #4f46e5;
                color: white;
                border-bottom-left-radius: 5px;
            }

            .unimind-message-ai {
                align-self: flex-end;
                background: #f1f5f9;
                color: #172033;
                border-bottom-right-radius: 5px;
            }

            .unimind-chat-form {
                display: flex;
                gap: 10px;
                margin-top: 15px;
            }

            .unimind-chat-form input {
                flex: 1;
            }

            .unimind-dropzone {
                border: 2px dashed #cbd5e1;
                border-radius: 18px;
                padding: 30px;
                text-align: center;
                cursor: pointer;
                background: #f8fafc;
            }

            .unimind-dropzone:hover {
                border-color: #6366f1;
                background: #eef2ff;
            }

            .unimind-result {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 16px;
                padding: 18px;
                line-height: 1.9;
                white-space: pre-wrap;
            }

            .unimind-flashcard {
                min-height: 230px;
                border-radius: 22px;
                background: linear-gradient(
                    135deg,
                    #eef2ff,
                    #f8fafc
                );
                border: 1px solid #dbeafe;
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
                padding: 30px;
                cursor: pointer;
                font-size: 21px;
                font-weight: 700;
                line-height: 1.8;
            }

            .unimind-auth-tabs {
                display: flex;
                gap: 8px;
                margin-bottom: 20px;
                background: #f1f5f9;
                padding: 5px;
                border-radius: 14px;
            }

            .unimind-auth-tab {
                flex: 1;
                border: 0;
                background: transparent;
                padding: 11px;
                border-radius: 10px;
                cursor: pointer;
                font-family: inherit;
                font-weight: 700;
            }

            .unimind-auth-tab.active {
                background: white;
                color: #4f46e5;
            }

            .unimind-account-avatar {
                width: 65px;
                height: 65px;
                border-radius: 50%;
                background: #eef2ff;
                color: #4f46e5;
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: 26px;
                font-weight: 800;
                margin: 0 auto 15px;
            }

            .unimind-question-option {
                width: 100%;
                text-align: right;
                margin-top: 10px;
                padding: 13px;
                border-radius: 13px;
                border: 1px solid #dbe3ef;
                background: white;
                cursor: pointer;
                font-family: inherit;
            }

            .unimind-question-option:hover {
                background: #eef2ff;
                border-color: #6366f1;
            }

            .unimind-question-option.correct {
                background: #dcfce7;
                border-color: #22c55e;
            }

            .unimind-question-option.wrong {
                background: #fee2e2;
                border-color: #ef4444;
            }

            .unimind-stat {
                padding: 15px;
                border-radius: 15px;
                background: #f8fafc;
                text-align: center;
            }

            @media(max-width:650px) {
                .unimind-overlay {
                    padding: 10px;
                }

                .unimind-modal {
                    max-height: 94vh;
                    border-radius: 18px;
                }

                .unimind-modal-body {
                    padding: 16px;
                }

                .unimind-message {
                    max-width: 92%;
                }

                .unimind-chat-form {
                    flex-direction: column;
                }

                .unimind-btn {
                    width: 100%;
                }
            }

            body.dark-mode .unimind-modal {
                background: #111827;
                color: #f8fafc;
            }

            body.dark-mode .unimind-modal-header {
                border-color: #374151;
            }

            body.dark-mode .unimind-close {
                background: #1f2937;
                color: #fff;
            }

            body.dark-mode .unimind-input,
            body.dark-mode .unimind-textarea,
            body.dark-mode .unimind-select {
                background: #1f2937;
                color: white;
                border-color: #374151;
            }

            body.dark-mode .unimind-result,
            body.dark-mode .unimind-message-ai,
            body.dark-mode .unimind-stat {
                background: #1f2937;
                color: #f8fafc;
                border-color: #374151;
            }
        `;

        document.head.appendChild(style);
    }

    // =========================================================
    // MODAL
    // =========================================================

    function createModal(options = {}) {
        const overlay = document.createElement("div");
        overlay.className = "unimind-overlay";

        const modal = document.createElement("div");
        modal.className = "unimind-modal";

        const header = document.createElement("div");
        header.className = "unimind-modal-header";

        const title = document.createElement("h2");
        title.className = "unimind-modal-title";
        title.textContent =
            options.title || "UniMind AI";

        const closeButton = document.createElement("button");
        closeButton.type = "button";
        closeButton.className = "unimind-close";
        closeButton.innerHTML = "×";
        closeButton.setAttribute("aria-label", "إغلاق");

        header.appendChild(title);
        header.appendChild(closeButton);

        const body = document.createElement("div");
        body.className = "unimind-modal-body";

        if (options.content) {
            if (typeof options.content === "string") {
                body.innerHTML = options.content;
            } else {
                body.appendChild(options.content);
            }
        }

        modal.appendChild(header);
        modal.appendChild(body);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        lockBody();

        let closed = false;

        function close() {
            if (closed) return;

            closed = true;
            overlay.remove();
            unlockBody();

            if (typeof options.onClose === "function") {
                options.onClose();
            }
        }

        closeButton.addEventListener("click", close);

        overlay.addEventListener("click", function (event) {
            if (event.target === overlay) {
                close();
            }
        });

        function escapeHandler(event) {
            if (event.key === "Escape") {
                close();
                document.removeEventListener(
                    "keydown",
                    escapeHandler
                );
            }
        }

        document.addEventListener(
            "keydown",
            escapeHandler
        );

        return {
            overlay,
            modal,
            body,
            title,
            close
        };
    }

    // =========================================================
    // AUTH PROFILE
    // =========================================================

    async function ensureUserProfile(user) {
        if (!user) return;

        try {
            const client = await getSupabase();

            const { data, error } =
                await client
                    .from("profiles")
                    .select(
                        "id, full_name, avatar_url, language, theme"
                    )
                    .eq("id", user.id)
                    .maybeSingle();

            if (error) {
                console.warn(
                    "Profile lookup:",
                    error
                );
                return;
            }

            if (!data) {
                const { error: insertError } =
                    await client
                        .from("profiles")
                        .insert({
                            id: user.id,
                            full_name:
                                user.user_metadata
                                    ?.full_name ||
                                "",
                            language:
                                localStorage.getItem(
                                    "unimind-language"
                                ) || "ar",
                            theme:
                                document.body.classList.contains(
                                    "dark-mode"
                                )
                                    ? "dark"
                                    : "light"
                        });

                if (
                    insertError &&
                    insertError.code !== "23505"
                ) {
                    console.warn(
                        "Profile creation:",
                        insertError
                    );
                }
            }
        } catch (error) {
            console.warn(
                "Profile initialization:",
                error
            );
        }
    }

    async function loadUserPreferences(user) {
        if (!user) return;

        try {
            const client = await getSupabase();

            const { data, error } =
                await client
                    .from("profiles")
                    .select(
                        "full_name, language, theme"
                    )
                    .eq("id", user.id)
                    .maybeSingle();

            if (error || !data) {
                return;
            }

            if (
                data.language === "ar" ||
                data.language === "en"
            ) {
                localStorage.setItem(
                    "unimind-language",
                    data.language
                );

                document.documentElement.lang =
                    data.language;

                document.documentElement.dir =
                    data.language === "ar"
                        ? "rtl"
                        : "ltr";
            }

            if (
                data.theme === "dark" ||
                data.theme === "light"
            ) {
                localStorage.setItem(
                    "unimind-theme",
                    data.theme
                );

                document.body.classList.toggle(
                    "dark-mode",
                    data.theme === "dark"
                );
            }
        } catch (error) {
            console.warn(
                "Preferences:",
                error
            );
        }
    }

    async function saveUserPreference(
        field,
        value
    ) {
        if (!currentUser) return;

        if (
            field !== "theme" &&
            field !== "language"
        ) {
            return;
        }

        try {
            const client = await getSupabase();

            await client
                .from("profiles")
                .update({
                    [field]: value
                })
                .eq(
                    "id",
                    currentUser.id
                );
        } catch (error) {
            console.warn(
                "Save preference:",
                error
            );
        }
    }

    // =========================================================
    // AUTH UI
    // =========================================================

    function getUserName(user) {
        if (!user) {
            return "مستخدم UniMind";
        }

        return (
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split("@")[0] ||
            "مستخدم UniMind"
        );
    }

    function updateAuthUI() {
        const loginButton = $("loginButton");

        if (!loginButton) return;

        if (currentUser) {
            loginButton.textContent =
                "👤 " +
                getUserName(currentUser);

            loginButton.dataset.unimindAccount =
                "true";

            loginButton.removeAttribute(
                "data-unimind-login"
            );
        } else {
            loginButton.textContent =
                "تسجيل الدخول";

            loginButton.dataset.unimindLogin =
                "true";

            delete loginButton.dataset.unimindAccount;
        }
    }

    function getAuthErrorMessage(error) {
        const message =
            error?.message || "";

        const text = message.toLowerCase();

        if (
            text.includes(
                "invalid login credentials"
            )
        ) {
            return "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
        }

        if (
            text.includes(
                "email not confirmed"
            )
        ) {
            return "يرجى تأكيد البريد الإلكتروني أولاً.";
        }

        if (
            text.includes(
                "user already registered"
            )
        ) {
            return "هذا البريد الإلكتروني مسجل بالفعل.";
        }

        if (
            text.includes("rate limit")
        ) {
            return "تم تجاوز عدد المحاولات. حاول لاحقاً.";
        }

        if (
            text.includes("network")
        ) {
            return "تعذر الاتصال بالخادم.";
        }

        return (
            message ||
            "حدث خطأ غير متوقع. حاول مرة أخرى."
        );
    }

    // =========================================================
    // AUTH MODAL
    // =========================================================

    function openAuthModal(
        defaultTab = "login"
    ) {
        const modal = createModal({
            title: "حساب UniMind AI"
        });

        modal.body.innerHTML = `
            <div class="unimind-auth-tabs">
                <button
                    type="button"
                    class="unimind-auth-tab"
                    id="unimindLoginTab"
                >
                    تسجيل الدخول
                </button>

                <button
                    type="button"
                    class="unimind-auth-tab"
                    id="unimindRegisterTab"
                >
                    إنشاء حساب
                </button>
            </div>

            <div id="unimindAuthContent"></div>

            <div id="unimindAuthStatus"></div>
        `;

        const loginTab =
            $("unimindLoginTab");

        const registerTab =
            $("unimindRegisterTab");

        const content =
            $("unimindAuthContent");

        const status =
            $("unimindAuthStatus");

        function setStatus(message, type) {
            status.className =
                type === "success"
                    ? "unimind-success"
                    : "unimind-error";

            status.textContent = message;
        }

        function clearStatus() {
            status.className = "";
            status.textContent = "";
        }

        function renderLogin() {
            loginTab.classList.add("active");
            registerTab.classList.remove("active");

            content.innerHTML = `
                <form id="unimindLoginForm">

                    <div style="margin-bottom:15px;">
                        <label>البريد الإلكتروني</label>
                        <input
                            type="email"
                            id="unimindLoginEmail"
                            class="unimind-input"
                            placeholder="example@email.com"
                            required
                        >
                    </div>

                    <div style="margin-bottom:18px;">
                        <label>كلمة المرور</label>
                        <input
                            type="password"
                            id="unimindLoginPassword"
                            class="unimind-input"
                            required
                        >
                    </div>

                    <button
                        type="submit"
                        id="unimindLoginSubmit"
                        class="unimind-btn unimind-btn-primary"
                        style="width:100%;"
                    >
                        تسجيل الدخول
                    </button>

                </form>

                <div
                    style="
                        text-align:center;
                        margin-top:18px;
                    "
                    class="unimind-muted"
                >
                    ليس لديك حساب؟
                    <button
                        type="button"
                        id="unimindGoRegister"
                        style="
                            border:0;
                            background:none;
                            color:#4f46e5;
                            font-family:inherit;
                            font-weight:800;
                            cursor:pointer;
                        "
                    >
                        إنشاء حساب
                    </button>
                </div>
            `;

            $("unimindGoRegister").onclick =
                function () {
                    renderRegister();
                };

            $("unimindLoginForm").onsubmit =
                async function (event) {
                    event.preventDefault();

                    clearStatus();

                    const submit =
                        $("unimindLoginSubmit");

                    const email =
                        $("unimindLoginEmail")
                            .value
                            .trim();

                    const password =
                        $("unimindLoginPassword")
                            .value;

                    submit.disabled = true;
                    submit.textContent =
                        "جارٍ تسجيل الدخول...";

                    try {
                        const client =
                            await getSupabase();

                        const { data, error } =
                            await client.auth
                                .signInWithPassword({
                                    email,
                                    password
                                });

                        if (error) {
                            throw error;
                        }

                        currentUser =
                            data?.user || null;

                        if (currentUser) {
                            await ensureUserProfile(
                                currentUser
                            );

                            await loadUserPreferences(
                                currentUser
                            );
                        }

                        updateAuthUI();

                        setStatus(
                            "تم تسجيل الدخول بنجاح.",
                            "success"
                        );

                        await sleep(600);

                        modal.close();

                    } catch (error) {
                        console.error(
                            "Login:",
                            error
                        );

                        setStatus(
                            getAuthErrorMessage(
                                error
                            ),
                            "error"
                        );

                        submit.disabled = false;
                        submit.textContent =
                            "تسجيل الدخول";
                    }
                };
        }

        function renderRegister() {
            loginTab.classList.remove("active");
            registerTab.classList.add("active");

            content.innerHTML = `
                <form id="unimindRegisterForm">

                    <div style="margin-bottom:14px;">
                        <label>الاسم الكامل</label>
                        <input
                            type="text"
                            id="unimindRegisterName"
                            class="unimind-input"
                            required
                        >
                    </div>

                    <div style="margin-bottom:14px;">
                        <label>البريد الإلكتروني</label>
                        <input
                            type="email"
                            id="unimindRegisterEmail"
                            class="unimind-input"
                            required
                        >
                    </div>

                    <div style="margin-bottom:14px;">
                        <label>كلمة المرور</label>
                        <input
                            type="password"
                            id="unimindRegisterPassword"
                            class="unimind-input"
                            minlength="6"
                            required
                        >
                    </div>

                    <div style="margin-bottom:18px;">
                        <label>تأكيد كلمة المرور</label>
                        <input
                            type="password"
                            id="unimindRegisterConfirm"
                            class="unimind-input"
                            minlength="6"
                            required
                        >
                    </div>

                    <button
                        type="submit"
                        id="unimindRegisterSubmit"
                        class="unimind-btn unimind-btn-primary"
                        style="width:100%;"
                    >
                        إنشاء الحساب
                    </button>

                </form>

                <div
                    style="
                        text-align:center;
                        margin-top:18px;
                    "
                    class="unimind-muted"
                >
                    لديك حساب؟
                    <button
                        type="button"
                        id="unimindGoLogin"
                        style="
                            border:0;
                            background:none;
                            color:#4f46e5;
                            font-family:inherit;
                            font-weight:800;
                            cursor:pointer;
                        "
                    >
                        تسجيل الدخول
                    </button>
                </div>
            `;

            $("unimindGoLogin").onclick =
                function () {
                    renderLogin();
                };

            $("unimindRegisterForm").onsubmit =
                async function (event) {
                    event.preventDefault();

                    const name =
                        $("unimindRegisterName")
                            .value
                            .trim();

                    const email =
                        $("unimindRegisterEmail")
                            .value
                            .trim();

                    const password =
                        $("unimindRegisterPassword")
                            .value;

                    const confirm =
                        $("unimindRegisterConfirm")
                            .value;

                    if (password.length < 6) {
                        setStatus(
                            "كلمة المرور يجب أن تكون 6 أحرف على الأقل."
                        );
                        return;
                    }

                    if (password !== confirm) {
                        setStatus(
                            "كلمتا المرور غير متطابقتين."
                        );
                        return;
                    }

                    const submit =
                        $("unimindRegisterSubmit");

                    submit.disabled = true;
                    submit.textContent =
                        "جارٍ إنشاء الحساب...";

                    try {
                        const client =
                            await getSupabase();

                        const { data, error } =
                            await client.auth
                                .signUp({
                                    email,
                                    password,
                                    options: {
                                        data: {
                                            full_name:
                                                name
                                        }
                                    }
                                });

                        if (error) {
                            throw error;
                        }

                        currentUser =
                            data?.user || null;

                        if (
                            currentUser &&
                            data?.session
                        ) {
                            await ensureUserProfile(
                                currentUser
                            );

                            await loadUserPreferences(
                                currentUser
                            );

                            updateAuthUI();

                            setStatus(
                                "تم إنشاء الحساب وتسجيل الدخول.",
                                "success"
                            );

                            await sleep(600);

                            modal.close();
                        } else {
                            setStatus(
                                "تم إنشاء الحساب. تحقق من بريدك الإلكتروني لتفعيل الحساب.",
                                "success"
                            );

                            submit.disabled = false;
                            submit.textContent =
                                "إنشاء الحساب";
                        }

                    } catch (error) {
                        console.error(
                            "Register:",
                            error
                        );

                        setStatus(
                            getAuthErrorMessage(
                                error
                            )
                        );

                        submit.disabled = false;
                        submit.textContent =
                            "إنشاء الحساب";
                    }
                };
        }

        loginTab.onclick = renderLogin;
        registerTab.onclick = renderRegister;

        if (defaultTab === "register") {
            renderRegister();
        } else {
            renderLogin();
        }
    }

    // =========================================================
    // ACCOUNT
    // =========================================================

    async function logoutUser() {
        try {
            const client = await getSupabase();

            const { error } =
                await client.auth.signOut();

            if (error) {
                throw error;
            }

            currentUser = null;
            updateAuthUI();

            alert("تم تسجيل الخروج بنجاح.");

        } catch (error) {
            console.error(
                "Logout:",
                error
            );

            alert(
                "تعذر تسجيل الخروج. حاول مرة أخرى."
            );
        }
    }

    function openAccountModal() {
        if (!currentUser) {
            openAuthModal("login");
            return;
        }

        const modal = createModal({
            title: "حسابي"
        });

        const name =
            getUserName(currentUser);

        const email =
            currentUser.email || "";

        const initial =
            name.charAt(0).toUpperCase();

        modal.body.innerHTML = `
            <div style="text-align:center;">

                <div class="unimind-account-avatar">
                    ${escapeHTML(initial)}
                </div>

                <h3 style="margin:0 0 5px;">
                    ${escapeHTML(name)}
                </h3>

                <div class="unimind-muted">
                    ${escapeHTML(email)}
                </div>

            </div>

            <div
                style="
                    display:grid;
                    gap:10px;
                    margin-top:25px;
                "
            >
                <button
                    type="button"
                    id="unimindEditProfile"
                    class="unimind-btn unimind-btn-secondary"
                >
                    ✏️ تعديل الاسم
                </button>

                <button
                    type="button"
                    id="unimindChangePassword"
                    class="unimind-btn unimind-btn-secondary"
                >
                    🔐 تغيير كلمة المرور
                </button>

                <button
                    type="button"
                    id="unimindLogout"
                    class="unimind-btn unimind-btn-danger"
                >
                    🚪 تسجيل الخروج
                </button>
            </div>
        `;

        $("unimindLogout").onclick =
            async function () {
                modal.close();
                await logoutUser();
            };

        $("unimindEditProfile").onclick =
            function () {
                modal.close();
                openEditProfileModal();
            };

        $("unimindChangePassword").onclick =
            function () {
                modal.close();
                openChangePasswordModal();
            };
    }

    function openEditProfileModal() {
        if (!currentUser) return;

        const modal = createModal({
            title: "تعديل الملف الشخصي"
        });

        modal.body.innerHTML = `
            <form id="unimindEditProfileForm">

                <div style="margin-bottom:18px;">
                    <label>الاسم الكامل</label>

                    <input
                        type="text"
                        id="unimindProfileName"
                        class="unimind-input"
                        value="${escapeHTML(
                            getUserName(currentUser)
                        )}"
                        required
                    >
                </div>

                <button
                    type="submit"
                    id="unimindSaveProfile"
                    class="unimind-btn unimind-btn-primary"
                    style="width:100%;"
                >
                    حفظ التغييرات
                </button>

                <div id="unimindProfileStatus"></div>

            </form>
        `;

        $("unimindEditProfileForm").onsubmit =
            async function (event) {
                event.preventDefault();

                const newName =
                    $("unimindProfileName")
                        .value
                        .trim();

                const status =
                    $("unimindProfileStatus");

                const submit =
                    $("unimindSaveProfile");

                if (!newName) {
                    status.innerHTML =
                        `<div class="unimind-error">
                            الرجاء كتابة الاسم.
                        </div>`;
                    return;
                }

                submit.disabled = true;
                submit.textContent =
                    "جارٍ الحفظ...";

                try {
                    const client =
                        await getSupabase();

                    const { data, error } =
                        await client.auth
                            .updateUser({
                                data: {
                                    full_name:
                                        newName
                                }
                            });

                    if (error) {
                        throw error;
                    }

                    currentUser =
                        data?.user ||
                        currentUser;

                    await ensureUserProfile(
                        currentUser
                    );

                    await client
                        .from("profiles")
                        .update({
                            full_name:
                                newName
                        })
                        .eq(
                            "id",
                            currentUser.id
                        );

                    updateAuthUI();

                    status.innerHTML =
                        `<div class="unimind-success">
                            تم تحديث الاسم بنجاح.
                        </div>`;

                    await sleep(700);

                    modal.close();

                } catch (error) {
                    console.error(
                        "Profile update:",
                        error
                    );

                    status.innerHTML =
                        `<div class="unimind-error">
                            ${escapeHTML(
                                getAuthErrorMessage(
                                    error
                                )
                            )}
                        </div>`;
                }

                submit.disabled = false;
                submit.textContent =
                    "حفظ التغييرات";
            };
    }

    function openChangePasswordModal() {
        if (!currentUser) return;

        const modal = createModal({
            title: "تغيير كلمة المرور"
        });

        modal.body.innerHTML = `
            <form id="unimindPasswordForm">

                <div style="margin-bottom:14px;">
                    <label>كلمة المرور الجديدة</label>

                    <input
                        type="password"
                        id="unimindNewPassword"
                        class="unimind-input"
                        minlength="6"
                        required
                    >
                </div>

                <div style="margin-bottom:18px;">
                    <label>تأكيد كلمة المرور</label>

                    <input
                        type="password"
                        id="unimindConfirmPassword"
                        class="unimind-input"
                        minlength="6"
                        required
                    >
                </div>

                <button
                    type="submit"
                    id="unimindChangePasswordSubmit"
                    class="unimind-btn unimind-btn-primary"
                    style="width:100%;"
                >
                    تغيير كلمة المرور
                </button>

                <div id="unimindPasswordStatus"></div>

            </form>
        `;

        $("unimindPasswordForm").onsubmit =
            async function (event) {
                event.preventDefault();

                const password =
                    $("unimindNewPassword").value;

                const confirm =
                    $("unimindConfirmPassword").value;

                const status =
                    $("unimindPasswordStatus");

                const submit =
                    $("unimindChangePasswordSubmit");

                if (password.length < 6) {
                    status.innerHTML =
                        `<div class="unimind-error">
                            كلمة المرور يجب أن تكون 6 أحرف على الأقل.
                        </div>`;
                    return;
                }

                if (password !== confirm) {
                    status.innerHTML =
                        `<div class="unimind-error">
                            كلمتا المرور غير متطابقتين.
                        </div>`;
                    return;
                }

                submit.disabled = true;
                submit.textContent =
                    "جارٍ التحديث...";

                try {
                    const client =
                        await getSupabase();

                    const { error } =
                        await client.auth
                            .updateUser({
                                password
                            });

                    if (error) {
                        throw error;
                    }

                    status.innerHTML =
                        `<div class="unimind-success">
                            تم تغيير كلمة المرور بنجاح.
                        </div>`;

                    await sleep(800);

                    modal.close();

                } catch (error) {
                    status.innerHTML =
                        `<div class="unimind-error">
                            ${escapeHTML(
                                getAuthErrorMessage(
                                    error
                                )
                            )}
                        </div>`;
                }

                submit.disabled = false;
                submit.textContent =
                    "تغيير كلمة المرور";
            };
    }

    // =========================================================
    // CHAT ASSISTANT
    // =========================================================

    function openChatModal(initialMessage = "") {
        const container =
            $("unimind-chat-modal");

        if (container) {
            container.innerHTML = "";
        }

        const modal = createModal({
            title:
                "🧠 مساعد الدراسة الذكي"
        });

        const chatId =
            "unimindChatMessages_" +
            Date.now();

        modal.body.innerHTML = `
            <div
                id="${chatId}"
                class="unimind-chat"
            >
                <div
                    class="unimind-message unimind-message-ai"
                >
                    مرحباً 👋
                    <br>
                    أنا مساعد UniMind AI.
                    <br>
                    اسألني عن أي موضوع دراسي وسأساعدك في فهمه.
                </div>
            </div>

            <form
                id="unimindChatForm"
                class="unimind-chat-form"
            >
                <input
                    id="unimindChatInput"
                    class="unimind-input"
                    placeholder="اكتب سؤالك الدراسي هنا..."
                    autocomplete="off"
                >

                <button
                    type="submit"
                    id="unimindChatSend"
                    class="unimind-btn unimind-btn-primary"
                >
                    إرسال
                </button>
            </form>
        `;

        const chat =
            $(chatId);

        const input =
            $("unimindChatInput");

        const form =
            $("unimindChatForm");

        const send =
            $("unimindChatSend");

        function addMessage(
            text,
            type
        ) {
            const message =
                document.createElement("div");

            message.className =
                "unimind-message " +
                (
                    type === "user"
                        ? "unimind-message-user"
                        : "unimind-message-ai"
                );

            message.textContent =
                text;

            chat.appendChild(
                message
            );

            chat.scrollTop =
                chat.scrollHeight;
        }

        form.onsubmit =
            async function (event) {
                event.preventDefault();

                const question =
                    input.value.trim();

                if (!question) {
                    return;
                }

                addMessage(
                    question,
                    "user"
                );

                input.value = "";
                input.disabled = true;
                send.disabled = true;
                send.textContent =
                    "جاري...";

                const loading =
                    document.createElement("div");

                loading.className =
                    "unimind-message unimind-message-ai";

                loading.textContent =
                    "🧠 يفكر UniMind AI...";

                chat.appendChild(
                    loading
                );

                try {
                    const answer =
                        await askAI(
                            question
                        );

                    loading.remove();

                    addMessage(
                        answer,
                        "ai"
                    );

                } catch (error) {
                    loading.remove();

                    addMessage(
                        error.message ||
                            "حدث خطأ أثناء الاتصال بالمساعد.",
                        "ai"
                    );
                }

                input.disabled = false;
                send.disabled = false;
                send.textContent =
                    "إرسال";

                input.focus();
            };

        if (initialMessage) {
            input.value =
                initialMessage;
        }

        setTimeout(
            () => input.focus(),
            100
        );
    }

    // =========================================================
    // LECTURE SUMMARIZER
    // =========================================================

    function openLectureSummarizer() {
        const existing =
            $("unimindLectureRuntimeModal");

        if (existing) {
            existing.remove();
        }

        const modal = createModal({
            title:
                "📄 تلخيص المحاضرات"
        });

        modal.overlay.id =
            "unimindLectureRuntimeModal";

        modal.body.innerHTML = `
            <p class="unimind-muted">
                ارفع ملفاً نصياً أو الصق محتوى المحاضرة،
                وسيقوم UniMind AI بإعداد ملخص منظم.
            </p>

            <div
                id="unimindRuntimeDropzone"
                class="unimind-dropzone"
            >
                📄
                <br>
                اضغط لاختيار ملف
                <br>
                <span class="unimind-muted">
                    TXT أو نص المحاضرة
                </span>
            </div>

            <input
                type="file"
                id="unimindRuntimeFile"
                accept=".txt,text/plain"
                style="display:none;"
            >

            <div
                id="unimindRuntimeFileInfo"
                style="margin-top:12px;"
            ></div>

            <textarea
                id="unimindLectureText"
                class="unimind-textarea"
                placeholder="أو الصق نص المحاضرة هنا..."
                style="margin-top:15px;"
            ></textarea>

            <button
                type="button"
                id="unimindRuntimeSummarize"
                class="unimind-btn unimind-btn-primary"
                style="
                    width:100%;
                    margin-top:15px;
                "
            >
                🧠 إنشاء الملخص
            </button>

            <div
                id="unimindLectureResult"
            ></div>
        `;

        const dropzone =
            $("unimindRuntimeDropzone");

        const fileInput =
            $("unimindRuntimeFile");

        const textArea =
            $("unimindLectureText");

        const fileInfo =
            $("unimindRuntimeFileInfo");

        const summarize =
            $("unimindRuntimeSummarize");

        const result =
            $("unimindLectureResult");

        dropzone.onclick =
            () => fileInput.click();

        fileInput.onchange =
            function () {
                const file =
                    fileInput.files?.[0];

                if (!file) {
                    return;
                }

                selectedLectureFile =
                    file;

                fileInfo.innerHTML =
                    `<div class="unimind-success">
                        📄 ${escapeHTML(
                            file.name
                        )}
                        <br>
                        الحجم:
                        ${(
                            file.size / 1024
                        ).toFixed(1)}
                        KB
                    </div>`;

                if (
                    file.type ===
                        "text/plain" ||
                    file.name
                        .toLowerCase()
                        .endsWith(".txt")
                ) {
                    const reader =
                        new FileReader();

                    reader.onload =
                        function (event) {
                            textArea.value =
                                event.target.result ||
                                "";
                        };

                    reader.readAsText(
                        file
                    );
                }
            };

        summarize.onclick =
            async function () {
                const text =
                    textArea.value.trim();

                if (!text) {
                    result.innerHTML =
                        `<div class="unimind-error">
                            الرجاء رفع ملف نصي أو لصق محتوى المحاضرة أولاً.
                        </div>`;
                    return;
                }

                summarize.disabled =
                    true;

                summarize.textContent =
                    "🧠 جارٍ إنشاء الملخص...";

                result.innerHTML =
                    `<div class="unimind-muted">
                        UniMind AI يعمل الآن...
                    </div>`;

                try {
                    const prompt = `
أنت مساعد جامعي ذكي.

قم بتلخيص المحاضرة التالية باللغة العربية.

المطلوب:
1. ملخص واضح.
2. أهم الأفكار.
3. المصطلحات المهمة.
4. النقاط التي يجب على الطالب مراجعتها.
5. أسئلة مراجعة قصيرة.

نص المحاضرة:

${text}
                    `;

                    const answer =
                        await askAI(
                            prompt
                        );

                    result.innerHTML = `
                        <div class="unimind-result">
                            ${escapeHTML(
                                answer
                            )}
                        </div>

                        <button
                            type="button"
                            id="unimindCopyRuntimeSummary"
                            class="unimind-btn unimind-btn-secondary"
                            style="
                                margin-top:10px;
                                width:100%;
                            "
                        >
                            📋 نسخ الملخص
                        </button>
                    `;

                    $("unimindCopyRuntimeSummary")
                        .onclick =
                        async function () {
                            try {
                                await navigator.clipboard.writeText(
                                    answer
                                );

                                this.textContent =
                                    "✅ تم النسخ";
                            } catch (_) {
                                alert(
                                    "تعذر نسخ الملخص."
                                );
                            }
                        };

                } catch (error) {
                    result.innerHTML =
                        `<div class="unimind-error">
                            ${escapeHTML(
                                error.message
                            )}
                        </div>`;
                }

                summarize.disabled =
                    false;

                summarize.textContent =
                    "🧠 إنشاء الملخص";
            };
    }

    // =========================================================
    // QUIZ
    // =========================================================

    async function openQuizModal() {
        const modal = createModal({
            title:
                "🧠 الاختبارات الذكية"
        });

        modal.body.innerHTML = `
            <div id="unimindQuizContent">

                <p class="unimind-muted">
                    اكتب موضوعاً دراسياً وسينشئ UniMind AI اختباراً لك.
                </p>

                <textarea
                    id="unimindQuizTopic"
                    class="unimind-textarea"
                    placeholder="مثال: أساسيات أمن المعلومات"
                ></textarea>

                <select
                    id="unimindQuizCount"
                    class="unimind-select"
                    style="margin-top:12px;"
                >
                    <option value="5">5 أسئلة</option>
                    <option value="10" selected>
                        10 أسئلة
                    </option>
                    <option value="15">15 سؤالاً</option>
                </select>

                <button
                    type="button"
                    id="unimindGenerateQuiz"
                    class="unimind-btn unimind-btn-primary"
                    style="
                        width:100%;
                        margin-top:15px;
                    "
                >
                    إنشاء الاختبار
                </button>

                <div id="unimindQuizArea"></div>

            </div>
        `;

        $("unimindGenerateQuiz").onclick =
            async function () {
                const topic =
                    $("unimindQuizTopic")
                        .value
                        .trim();

                const count =
                    $("unimindQuizCount")
                        .value;

                const area =
                    $("unimindQuizArea");

                if (!topic) {
                    area.innerHTML =
                        `<div class="unimind-error">
                            اكتب موضوع الاختبار أولاً.
                        </div>`;
                    return;
                }

                this.disabled = true;
                this.textContent =
                    "🧠 جارٍ إنشاء الاختبار...";

                area.innerHTML =
                    `<div class="unimind-muted">
                        انتظر قليلاً...
                    </div>`;

                try {
                    const prompt = `
أنشئ اختباراً جامعياً باللغة العربية.

الموضوع:
${topic}

عدد الأسئلة:
${count}

أعد النتيجة بصيغة JSON فقط بالشكل التالي:

{
  "questions": [
    {
      "question": "السؤال",
      "options": ["الخيار الأول","الخيار الثاني","الخيار الثالث","الخيار الرابع"],
      "answer": 0
    }
  ]
}

answer هو رقم الخيار الصحيح ويبدأ من 0.
                    `;

                    const answer =
                        await askAI(
                            prompt
                        );

                    let data =
                        extractJSONFromText(
                            answer
                        );

                    if (
                        !data ||
                        !Array.isArray(
                            data.questions
                        )
                    ) {
                        throw new Error(
                            "لم يتمكن النظام من إنشاء اختبار بالصيغة المطلوبة."
                        );
                    }

                    quizState.questions =
                        data.questions;

                    quizState.current =
                        0;

                    quizState.score =
                        0;

                    quizState.answered =
                        false;

                    renderQuizQuestion(
                        area
                    );

                } catch (error) {
                    area.innerHTML =
                        `<div class="unimind-error">
                            ${escapeHTML(
                                error.message
                            )}
                        </div>`;
                }

                this.disabled = false;
                this.textContent =
                    "إنشاء الاختبار";
            };
    }

    function renderQuizQuestion(area) {
        const question =
            quizState.questions[
                quizState.current
            ];

        if (!question) {
            area.innerHTML = `
                <div class="unimind-success">
                    <h3>
                        🎉 انتهى الاختبار
                    </h3>

                    <p>
                        نتيجتك:
                        <strong>
                            ${quizState.score}
                        </strong>
                        من
                        <strong>
                            ${quizState.questions.length}
                        </strong>
                    </p>
                </div>
            `;

            return;
        }

        quizState.answered = false;

        const options =
            Array.isArray(
                question.options
            )
                ? question.options
                : [];

        area.innerHTML = `
            <div
                style="
                    margin-top:25px;
                "
            >

                <div class="unimind-muted">
                    السؤال
                    ${quizState.current + 1}
                    من
                    ${quizState.questions.length}
                </div>

                <h3>
                    ${escapeHTML(
                        question.question
                    )}
                </h3>

                <div>
                    ${options
                        .map(
                            (option, index) => `
                                <button
                                    type="button"
                                    class="unimind-question-option"
                                    data-answer="${index}"
                                >
                                    ${escapeHTML(
                                        option
                                    )}
                                </button>
                            `
                        )
                        .join("")}
                </div>

            </div>
        `;

        area
            .querySelectorAll(
                ".unimind-question-option"
            )
            .forEach(button => {
                button.onclick =
                    function () {
                        if (
                            quizState.answered
                        ) {
                            return;
                        }

                        quizState.answered =
                            true;

                        const selected =
                            Number(
                                this.dataset.answer
                            );

                        const correct =
                            Number(
                                question.answer
                            );

                        if (
                            selected ===
                            correct
                        ) {
                            quizState.score++;

                            this.classList.add(
                                "correct"
                            );
                        } else {
                            this.classList.add(
                                "wrong"
                            );

                            const correctButton =
                                area.querySelector(
                                    `[data-answer="${correct}"]`
                                );

                            if (
                                correctButton
                            ) {
                                correctButton.classList.add(
                                    "correct"
                                );
                            }
                        }

                        setTimeout(
                            () => {
                                quizState.current++;

                                renderQuizQuestion(
                                    area
                                );
                            },
                            900
                        );
                    };
            });
    }

    // =========================================================
    // FLASHCARDS
    // =========================================================

    async function openFlashcardsModal() {
        const modal = createModal({
            title:
                "🃏 البطاقات التعليمية"
        });

        modal.body.innerHTML = `
            <p class="unimind-muted">
                أنشئ بطاقات تساعدك على الحفظ والمراجعة.
            </p>

            <textarea
                id="unimindFlashcardTopic"
                class="unimind-textarea"
                placeholder="اكتب موضوع المحاضرة أو المادة..."
            ></textarea>

            <button
                type="button"
                id="unimindGenerateFlashcards"
                class="unimind-btn unimind-btn-primary"
                style="
                    width:100%;
                    margin-top:15px;
                "
            >
                إنشاء البطاقات
            </button>

            <div id="unimindFlashcardArea"></div>
        `;

        $("unimindGenerateFlashcards").onclick =
            async function () {
                const topic =
                    $("unimindFlashcardTopic")
                        .value
                        .trim();

                const area =
                    $("unimindFlashcardArea");

                if (!topic) {
                    area.innerHTML =
                        `<div class="unimind-error">
                            اكتب موضوعاً أولاً.
                        </div>`;
                    return;
                }

                this.disabled = true;
                this.textContent =
                    "🧠 جارٍ الإنشاء...";

                try {
                    const prompt = `
أنشئ 10 بطاقات تعليمية باللغة العربية حول:

${topic}

أعد JSON فقط:

{
  "cards": [
    {
      "front": "سؤال أو مصطلح",
      "back": "الإجابة المختصرة"
    }
  ]
}
                    `;

                    const answer =
                        await askAI(
                            prompt
                        );

                    const data =
                        extractJSONFromText(
                            answer
                        );

                    if (
                        !data ||
                        !Array.isArray(
                            data.cards
                        )
                    ) {
                        throw new Error(
                            "تعذر إنشاء البطاقات."
                        );
                    }

                    flashcardState.cards =
                        data.cards;

                    flashcardState.current =
                        0;

                    flashcardState.flipped =
                        false;

                    renderFlashcard(
                        area
                    );

                } catch (error) {
                    area.innerHTML =
                        `<div class="unimind-error">
                            ${escapeHTML(
                                error.message
                            )}
                        </div>`;
                }

                this.disabled = false;
                this.textContent =
                    "إنشاء البطاقات";
            };
    }

    function renderFlashcard(area) {
        const card =
            flashcardState.cards[
                flashcardState.current
            ];

        if (!card) {
            area.innerHTML =
                `<div class="unimind-success">
                    انتهت البطاقات 🎉
                </div>`;
            return;
        }

        const text =
            flashcardState.flipped
                ? card.back
                : card.front;

        area.innerHTML = `
            <div style="margin-top:20px;">

                <div
                    class="unimind-flashcard"
                    id="unimindFlashcard"
                >
                    ${escapeHTML(text)}
                </div>

                <p
                    class="unimind-muted"
                    style="text-align:center;"
                >
                    اضغط على البطاقة لقلبها
                </p>

                <div class="unimind-row">
                    <button
                        type="button"
                        id="unimindPreviousCard"
                        class="unimind-btn unimind-btn-secondary"
                    >
                        السابق
                    </button>

                    <button
                        type="button"
                        id="unimindNextCard"
                        class="unimind-btn unimind-btn-primary"
                        style="flex:1;"
                    >
                        التالي
                    </button>
                </div>

            </div>
        `;

        $("unimindFlashcard").onclick =
            function () {
                flashcardState.flipped =
                    !flashcardState.flipped;

                renderFlashcard(area);
            };

        $("unimindPreviousCard").onclick =
            function () {
                if (
                    flashcardState.current >
                    0
                ) {
                    flashcardState.current--;

                    flashcardState.flipped =
                        false;

                    renderFlashcard(area);
                }
            };

        $("unimindNextCard").onclick =
            function () {
                if (
                    flashcardState.current <
                    flashcardState.cards.length -
                        1
                ) {
                    flashcardState.current++;

                    flashcardState.flipped =
                        false;

                    renderFlashcard(area);
                } else {
                    area.innerHTML =
                        `<div class="unimind-success">
                            🎉 أحسنت! انتهيت من جميع البطاقات.
                        </div>`;
                }
            };
    }

    // =========================================================
    // STUDY PLANNER
    // =========================================================

    async function openPlannerModal() {
        const modal = createModal({
            title:
                "📅 مخطط الدراسة الذكي"
        });

        modal.body.innerHTML = `
            <p class="unimind-muted">
                أدخل المواد والوقت المتاح لك وسينشئ UniMind خطة دراسة.
            </p>

            <textarea
                id="unimindPlannerSubjects"
                class="unimind-textarea"
                placeholder="مثال:
برمجة
أمن معلومات
قواعد بيانات
وسائط متعددة"
            ></textarea>

            <input
                id="unimindPlannerHours"
                class="unimind-input"
                type="number"
                min="1"
                max="16"
                value="3"
                placeholder="عدد الساعات اليومية"
                style="margin-top:12px;"
            >

            <button
                type="button"
                id="unimindGeneratePlan"
                class="unimind-btn unimind-btn-primary"
                style="
                    width:100%;
                    margin-top:15px;
                "
            >
                إنشاء خطة الدراسة
            </button>

            <div id="unimindPlannerResult"></div>
        `;

        $("unimindGeneratePlan").onclick =
            async function () {
                const subjects =
                    $("unimindPlannerSubjects")
                        .value
                        .trim();

                const hours =
                    $("unimindPlannerHours")
                        .value;

                const result =
                    $("unimindPlannerResult");

                if (!subjects) {
                    result.innerHTML =
                        `<div class="unimind-error">
                            اكتب المواد الدراسية أولاً.
                        </div>`;
                    return;
                }

                this.disabled = true;
                this.textContent =
                    "🧠 جارٍ إنشاء الخطة...";

                try {
                    const answer =
                        await askAI(`
أنشئ خطة دراسة يومية باللغة العربية.

المواد:
${subjects}

عدد الساعات اليومية:
${hours}

اجعل الخطة عملية ومنظمة، مع:
- المادة
- الوقت
- المهمة
- استراحة قصيرة
                        `);

                    result.innerHTML =
                        `<div
                            class="unimind-result"
                            style="margin-top:18px;"
                        >
                            ${escapeHTML(
                                answer
                            )}
                        </div>`;

                } catch (error) {
                    result.innerHTML =
                        `<div class="unimind-error">
                            ${escapeHTML(
                                error.message
                            )}
                        </div>`;
                }

                this.disabled = false;
                this.textContent =
                    "إنشاء خطة الدراسة";
            };
    }

    // =========================================================
    // CV ASSISTANT
    // =========================================================

    async function openCVModal() {
        const modal = createModal({
            title:
                "📄 مساعد السيرة الذاتية"
        });

        modal.body.innerHTML = `
            <p class="unimind-muted">
                أدخل معلوماتك وسيساعدك UniMind AI في كتابة سيرة ذاتية احترافية.
            </p>

            <textarea
                id="unimindCVInfo"
                class="unimind-textarea"
                placeholder="الاسم، التخصص، المهارات، الخبرات، المشاريع، الدورات..."
            ></textarea>

            <button
                type="button"
                id="unimindGenerateCV"
                class="unimind-btn unimind-btn-primary"
                style="
                    width:100%;
                    margin-top:15px;
                "
            >
                إنشاء السيرة الذاتية
            </button>

            <div id="unimindCVResult"></div>
        `;

        $("unimindGenerateCV").onclick =
            async function () {
                const info =
                    $("unimindCVInfo")
                        .value
                        .trim();

                const result =
                    $("unimindCVResult");

                if (!info) {
                    result.innerHTML =
                        `<div class="unimind-error">
                            اكتب معلوماتك أولاً.
                        </div>`;
                    return;
                }

                this.disabled = true;
                this.textContent =
                    "🧠 جارٍ إعداد السيرة...";

                try {
                    const answer =
                        await askAI(`
اكتب سيرة ذاتية احترافية باللغة العربية اعتماداً على المعلومات التالية:

${info}

رتبها إلى:
- نبذة شخصية
- التعليم
- المهارات
- الخبرات
- المشاريع
- الدورات
- معلومات إضافية

لا تخترع معلومات غير موجودة.
                        `);

                    result.innerHTML =
                        `<div
                            class="unimind-result"
                            style="margin-top:18px;"
                        >
                            ${escapeHTML(
                                answer
                            )}
                        </div>`;

                } catch (error) {
                    result.innerHTML =
                        `<div class="unimind-error">
                            ${escapeHTML(
                                error.message
                            )}
                        </div>`;
                }

                this.disabled = false;
                this.textContent =
                    "إنشاء السيرة الذاتية";
            };
    }

    // =========================================================
    // THEME
    // =========================================================

    function initializeTheme() {
        const saved =
            localStorage.getItem(
                "unimind-theme"
            );

        if (saved === "dark") {
            document.body.classList.add(
                "dark-mode"
            );
        } else if (saved === "light") {
            document.body.classList.remove(
                "dark-mode"
            );
        }
    }

    function toggleTheme() {
        const dark =
            document.body.classList.toggle(
                "dark-mode"
            );

        const theme =
            dark ? "dark" : "light";

        localStorage.setItem(
            "unimind-theme",
            theme
        );

        saveUserPreference(
            "theme",
            theme
        );
    }

    // =========================================================
    // LANGUAGE
    // =========================================================

    function toggleLanguage() {
        const html =
            document.documentElement;

        const current =
            html.lang || "ar";

        const next =
            current === "ar"
                ? "en"
                : "ar";

        localStorage.setItem(
            "unimind-language",
            next
        );

        html.lang = next;

        html.dir =
            next === "ar"
                ? "rtl"
                : "ltr";

        saveUserPreference(
            "language",
            next
        );

        alert(
            next === "en"
                ? "تم تحويل اتجاه الصفحة إلى الإنجليزية. المحتوى الحالي ما زال عربيًا."
                : "تمت إعادة الصفحة إلى العربية."
        );
    }

    // =========================================================
    // EXISTING LECTURE MODAL
    // =========================================================

    function initializeExistingLectureModal() {
        const modal =
            document.querySelector(
                ".unimind-lecture-modal"
            );

        if (!modal) {
            return;
        }

        const overlay =
            $("unimind-lecture-overlay");

        const close =
            $("unimind-lecture-close");

        const choose =
            $("unimind-choose-file");

        const fileInput =
            $("unimind-lecture-file");

        const remove =
            $("unimind-remove-file");

        const summarize =
            $("unimind-summarize-button");

        if (
            overlay &&
            close
        ) {
            close.onclick =
                function () {
                    overlay.style.display =
                        "none";

                    unlockBody();
                };
        }

        if (
            choose &&
            fileInput
        ) {
            choose.onclick =
                function () {
                    fileInput.click();
                };
        }

        if (fileInput) {
            fileInput.onchange =
                function () {
                    const file =
                        fileInput.files?.[0];

                    if (!file) {
                        return;
                    }

                    selectedLectureFile =
                        file;

                    const name =
                        $("unimind-file-name");

                    const size =
                        $("unimind-file-size");

                    const selected =
                        $("unimind-selected-file");

                    if (name) {
                        name.textContent =
                            file.name;
                    }

                    if (size) {
                        size.textContent =
                            (
                                file.size /
                                1024
                            ).toFixed(1) +
                            " KB";
                    }

                    if (selected) {
                        selected.style.display =
                            "";
                    }

                    if (
                        file.type ===
                            "text/plain" ||
                        file.name
                            .toLowerCase()
                            .endsWith(".txt")
                    ) {
                        const reader =
                            new FileReader();

                        reader.onload =
                            function (event) {
                                const preview =
                                    $("unimind-text-preview");

                                const content =
                                    $("unimind-text-content");

                                if (content) {
                                    content.textContent =
                                        event.target
                                            .result ||
                                        "";
                                }

                                if (preview) {
                                    preview.style.display =
                                        "";
                                }

                                if (summarize) {
                                    summarize.disabled =
                                        false;
                                }
                            };

                        reader.readAsText(
                            file
                        );
                    } else {
                        if (summarize) {
                            summarize.disabled =
                                true;
                        }

                        const status =
                            $("unimind-file-status");

                        if (status) {
                            status.textContent =
                                "النسخة الحالية تدعم قراءة ملفات TXT مباشرة من المتصفح.";
                        }
                    }
                };
        }

        if (remove) {
            remove.onclick =
                function () {
                    selectedLectureFile =
                        null;

                    if (fileInput) {
                        fileInput.value =
                            "";
                    }

                    const selected =
                        $("unimind-selected-file");

                    const preview =
                        $("unimind-text-preview");

                    if (selected) {
                        selected.style.display =
                            "none";
                    }

                    if (preview) {
                        preview.style.display =
                            "none";
                    }

                    if (summarize) {
                        summarize.disabled =
                            true;
                    }
                };
        }

        if (summarize) {
            summarize.onclick =
                async function () {
                    const content =
                        $("unimind-text-content");

                    const result =
                        $("unimind-summary-result");

                    const resultContent =
                        $("unimind-summary-content");

                    const text =
                        content?.textContent?.trim();

                    if (!text) {
                        if (result) {
                            result.style.display =
                                "";
                        }

                        if (
                            resultContent
                        ) {
                            resultContent.textContent =
                                "لم يتم العثور على نص للمحاضرة.";
                        }

                        return;
                    }

                    summarize.disabled =
                        true;

                    summarize.textContent =
                        "🧠 جارٍ التلخيص...";

                    try {
                        const answer =
                            await askAI(`
لخص المحاضرة التالية باللغة العربية بطريقة مناسبة لطالب جامعي:

${text}

أظهر:
1. الملخص
2. أهم النقاط
3. المصطلحات المهمة
4. نقاط المراجعة
5. أسئلة للمراجعة
                            `);

                        if (result) {
                            result.style.display =
                                "";
                        }

                        if (
                            resultContent
                        ) {
                            resultContent.textContent =
                                answer;
                        }

                    } catch (error) {
                        if (
                            resultContent
                        ) {
                            resultContent.textContent =
                                error.message;
                        }

                    } finally {
                        summarize.disabled =
                            false;

                        summarize.textContent =
                            "🧠 إنشاء الملخص";
                    }
                };
        }

        const copy =
            $("unimind-copy-summary");

        if (copy) {
            copy.onclick =
                async function () {
                    const content =
                        $("unimind-summary-content");

                    if (!content) {
                        return;
                    }

                    try {
                        await navigator.clipboard.writeText(
                            content.textContent ||
                                ""
                        );

                        copy.textContent =
                            "✅ تم النسخ";

                        setTimeout(
                            () => {
                                copy.textContent =
                                    "📋 نسخ الملخص";
                            },
                            1500
                        );

                    } catch (_) {
                        alert(
                            "تعذر نسخ الملخص."
                        );
                    }
                };
        }
    }

    // =========================================================
    // MAIN BUTTONS
    // =========================================================

    function bindMainButtons() {
        const bindings = [
            [
                "themeToggle",
                toggleTheme
            ],

            [
                "languageToggle",
                toggleLanguage
            ],

            [
                "loginButton",
                function () {
                    if (currentUser) {
                        openAccountModal();
                    } else {
                        openAuthModal("login");
                    }
                }
            ],

            [
                "ctaStartButton",
                function () {
                    openChatModal();
                }
            ],

            [
                "heroDemoButton",
                function () {
                    openChatModal(
                        "اشرح لي كيف يمكنني استخدام UniMind AI في الدراسة؟"
                    );
                }
            ],

            [
                "heroChatButton",
                function () {
                    openChatModal();
                }
            ],

            [
                "studyAssistantButton",
                function () {
                    openChatModal();
                }
            ],

            [
                "lectureSummarizerButton",
                function () {
                    openLectureSummarizer();
                }
            ],

            [
                "quizButton",
                function () {
                    openQuizModal();
                }
            ],

            [
                "flashcardsButton",
                function () {
                    openFlashcardsModal();
                }
            ],

            [
                "plannerButton",
                function () {
                    openPlannerModal();
                }
            ],

            [
                "cvButton",
                function () {
                    openCVModal();
                }
            ],

            [
                "freePlanButton",
                function () {
                    if (currentUser) {
                        openAccountModal();
                    } else {
                        openAuthModal("register");
                    }
                }
            ],

            [
                "studentPlanButton",
                function () {
                    if (currentUser) {
                        alert(
                            "خطة الطالب جاهزة للربط بنظام الدفع."
                        );
                    } else {
                        openAuthModal("register");
                    }
                }
            ],

            [
                "proPlanButton",
                function () {
                    if (currentUser) {
                        alert(
                            "خطة Pro جاهزة للربط بنظام الدفع."
                        );
                    } else {
                        openAuthModal("register");
                    }
                }
            ],

            [
                "ctaBottomButton",
                function () {
                    openChatModal();
                }
            ]
        ];

        bindings.forEach(
            ([id, handler]) => {
                const element = $(id);

                if (!element) {
                    console.warn(
                        "UniMind missing button:",
                        id
                    );
                    return;
                }

                element.addEventListener(
                    "click",
                    function (event) {
                        event.preventDefault();

                        try {
                            handler();
                        } catch (error) {
                            console.error(
                                `Button ${id} error:`,
                                error
                            );
                        }
                    }
                );
            }
        );
    }

    // =========================================================
    // AUTH INITIALIZATION
    // =========================================================

    async function initializeAuth() {
        try {
            const client =
                await getSupabase();

            const {
                data,
                error
            } =
                await client.auth.getSession();

            if (
                !error &&
                data?.session?.user
            ) {
                currentUser =
                    data.session.user;

                await ensureUserProfile(
                    currentUser
                );

                await loadUserPreferences(
                    currentUser
                );
            } else {
                currentUser = null;
            }

            updateAuthUI();

            client.auth.onAuthStateChange(
                function (
                    event,
                    session
                ) {
                    currentUser =
                        session?.user ||
                        null;

                    updateAuthUI();

                    if (currentUser) {
                        ensureUserProfile(
                            currentUser
                        ).catch(
                            console.warn
                        );
                    }
                }
            );

        } catch (error) {
            console.warn(
                "Auth initialization skipped:",
                error
            );

            currentUser = null;
            updateAuthUI();
        }
    }

    // =========================================================
    // GLOBAL API
    // =========================================================

    window.UniMindAI = {
        ask: askAI,
        openChat: openChatModal,
        openQuiz: openQuizModal,
        openFlashcards:
            openFlashcardsModal,
        openPlanner:
            openPlannerModal,
        openCV:
            openCVModal,
        openSummarizer:
            openLectureSummarizer
    };

    window.UniMindAuth = {
        login: function () {
            openAuthModal("login");
        },

        register: function () {
            openAuthModal("register");
        },

        account: function () {
            openAccountModal();
        },

        logout: function () {
            return logoutUser();
        },

        getUser: function () {
            return currentUser;
        },

        isLoggedIn: function () {
            return !!currentUser;
        }
    };

    // =========================================================
    // START
    // =========================================================

    async function startUniMind() {
        if (appStarted) {
            return;
        }

        appStarted = true;

        try {
            injectStyles();
        } catch (error) {
            console.error(
                "Style initialization:",
                error
            );
        }

        try {
            initializeTheme();
        } catch (error) {
            console.error(
                "Theme initialization:",
                error
            );
        }

        try {
            bindMainButtons();
        } catch (error) {
            console.error(
                "Main buttons:",
                error
            );
        }

        try {
            initializeExistingLectureModal();
        } catch (error) {
            console.error(
                "Lecture modal:",
                error
            );
        }

        try {
            await initializeAuth();
        } catch (error) {
            console.error(
                "Authentication:",
                error
            );
        }

        console.log(
            "✅ UniMind AI loaded successfully."
        );
    }

    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            startUniMind,
            {
                once: true
            }
        );
    } else {
        startUniMind();
    }
})();

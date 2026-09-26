(function () {
    "use strict";

    // =========================================================
    // UniMind AI
    // Complete Smart Tools + Supabase Authentication
    // Phase 2
    // =========================================================

    const API_URL =
        "https://yzsfublvnwknjnayfosm.supabase.co/functions/v1/unimind-chat";

    // =========================================================
    // SUPABASE CONFIG
    // =========================================================

    const SUPABASE_URL =
        "https://yzsfublvnwknjnayfosm.supabase.co";

    const SUPABASE_ANON_KEY =
        "sb_publishable_vTD_YtnzjdWQBmAK-6Dtkg_n0s_w18f";

    let supabaseClient = null;
    let supabaseLoadingPromise = null;
    let currentUser = null;

    // =========================================================
    // GLOBAL STATE
    // =========================================================

    let selectedLectureFile = null;

    let quizState = {
        questions: [],
        current: 0,
        score: 0,
        answered: false
    };

    let flashcardState = {
        cards: [],
        current: 0
    };

    let studyPlan = [];

    // =========================================================
    // SUPABASE LOADER
    // =========================================================

    function loadSupabase() {
        if (window.supabase) {
            return Promise.resolve(
                window.supabase
            );
        }

        if (supabaseLoadingPromise) {
            return supabaseLoadingPromise;
        }

        supabaseLoadingPromise =
            new Promise(
                (
                    resolve,
                    reject
                ) => {
                    const script =
                        document.createElement(
                            "script"
                        );

                    script.src =
                        "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

                    script.async = true;

                    script.onload =
                        () => {
                            if (
                                !window.supabase
                            ) {
                                reject(
                                    new Error(
                                        "تعذر تحميل مكتبة Supabase."
                                    )
                                );

                                return;
                            }

                            resolve(
                                window.supabase
                            );
                        };

                    script.onerror =
                        () => {
                            reject(
                                new Error(
                                    "تعذر تحميل مكتبة Supabase."
                                )
                            );
                        };

                    document.head.appendChild(
                        script
                    );
                }
            );

        return supabaseLoadingPromise;
    }

    async function getSupabase() {
        if (supabaseClient) {
            return supabaseClient;
        }

        const supabase =
            await loadSupabase();

        supabaseClient =
            supabase.createClient(
                SUPABASE_URL,
                SUPABASE_ANON_KEY
            );

        return supabaseClient;
    }

    // =========================================================
    // BASIC HELPERS
    // =========================================================

    function escapeHTML(value) {
        if (
            value === null ||
            value === undefined
        ) {
            return "";
        }

        return String(value)
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );
    }

    function sleep(ms) {
        return new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    ms
                )
        );
    }

    function getElement(id) {
        return document.getElementById(id);
    }

    function showElement(el) {
        if (!el) return;

        el.style.display = "";
        el.hidden = false;
        el.removeAttribute(
            "hidden"
        );
    }

    function hideElement(el) {
        if (!el) return;

        el.style.display = "none";
        el.hidden = true;
    }

    function lockBody() {
        document.body.classList.add(
            "unimind-modal-open"
        );
    }

    function unlockBody() {
        document.body.classList.remove(
            "unimind-modal-open"
        );
    }

    // =========================================================
    // STYLES
    // =========================================================

    function injectStyles() {
        if (
            document.getElementById(
                "unimindRuntimeStyles"
            )
        ) {
            return;
        }

        const style =
            document.createElement(
                "style"
            );

        style.id =
            "unimindRuntimeStyles";

        style.textContent = `
            .unimind-modal-open {
                overflow: hidden !important;
            }

            .unimind-overlay {
                position: fixed;
                inset: 0;
                background: rgba(15, 23, 42, .62);
                backdrop-filter: blur(8px);
                z-index: 99999;
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
                background: #ffffff;
                border-radius: 24px;
                box-shadow: 0 25px 80px rgba(15, 23, 42, .25);
                display: flex;
                flex-direction: column;
                direction: rtl;
                color: #172033;
            }

            .unimind-modal-header {
                padding: 20px 24px;
                border-bottom: 1px solid #e8edf5;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 15px;
                flex-shrink: 0;
            }

            .unimind-modal-title {
                margin: 0;
                font-size: 20px;
                font-weight: 800;
            }

            .unimind-close {
                border: 0;
                background: #f1f5f9;
                color: #334155;
                width: 40px;
                height: 40px;
                border-radius: 12px;
                cursor: pointer;
                font-size: 20px;
                transition: .2s;
            }

            .unimind-close:hover {
                background: #e2e8f0;
            }

            .unimind-modal-body {
                padding: 24px;
                overflow-y: auto;
                flex: 1;
            }

            .unimind-input,
            .unimind-textarea,
            .unimind-select {
                width: 100%;
                box-sizing: border-box;
                border: 1px solid #dbe3ef;
                background: #fff;
                border-radius: 14px;
                padding: 13px 15px;
                font-family: inherit;
                font-size: 15px;
                outline: none;
                transition: .2s;
            }

            .unimind-input:focus,
            .unimind-textarea:focus,
            .unimind-select:focus {
                border-color: #6366f1;
                box-shadow: 0 0 0 4px rgba(99,102,241,.10);
            }

            .unimind-textarea {
                min-height: 140px;
                resize: vertical;
            }

            .unimind-btn {
                border: 0;
                border-radius: 14px;
                padding: 12px 18px;
                cursor: pointer;
                font-family: inherit;
                font-weight: 700;
                transition: .2s;
            }

            .unimind-btn:disabled {
                opacity: .6;
                cursor: not-allowed;
                transform: none !important;
            }

            .unimind-btn-primary {
                background: #4f46e5;
                color: white;
            }

            .unimind-btn-primary:hover {
                background: #4338ca;
                transform: translateY(-1px);
            }

            .unimind-btn-secondary {
                background: #eef2ff;
                color: #4338ca;
            }

            .unimind-btn-secondary:hover {
                background: #e0e7ff;
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

            .unimind-chat {
                height: 430px;
                overflow-y: auto;
                padding: 10px 4px;
                display: flex;
                flex-direction: column;
                gap: 12px;
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

            .unimind-loading {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                color: #64748b;
            }

            .unimind-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #6366f1;
                animation: unimindPulse 1s infinite;
            }

            @keyframes unimindPulse {
                0%, 100% {
                    opacity: .3;
                    transform: scale(.8);
                }

                50% {
                    opacity: 1;
                    transform: scale(1);
                }
            }

            .unimind-progress {
                height: 8px;
                background: #e2e8f0;
                border-radius: 999px;
                overflow: hidden;
                margin-top: 10px;
            }

            .unimind-progress-bar {
                height: 100%;
                background: #4f46e5;
                transition: width .3s;
            }

            .unimind-dropzone {
                border: 2px dashed #cbd5e1;
                border-radius: 18px;
                padding: 30px;
                text-align: center;
                cursor: pointer;
                background: #f8fafc;
                transition: .2s;
            }

            .unimind-dropzone:hover {
                border-color: #6366f1;
                background: #eef2ff;
            }

            .unimind-file-name {
                margin-top: 12px;
                font-weight: 700;
                color: #334155;
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
                min-height: 240px;
                border-radius: 24px;
                background: linear-gradient(135deg, #eef2ff, #f8fafc);
                border: 1px solid #dbeafe;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 30px;
                text-align: center;
                cursor: pointer;
                user-select: none;
                font-size: 21px;
                font-weight: 700;
                line-height: 1.8;
            }

            .unimind-muted {
                color: #64748b;
                font-size: 14px;
            }

            .unimind-error {
                background: #fef2f2;
                color: #b91c1c;
                border: 1px solid #fecaca;
                border-radius: 14px;
                padding: 14px;
                line-height: 1.8;
            }

            .unimind-success {
                background: #f0fdf4;
                color: #166534;
                border: 1px solid #bbf7d0;
                border-radius: 14px;
                padding: 14px;
                line-height: 1.8;
            }

            .unimind-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 15px;
            }

            .unimind-table th,
            .unimind-table td {
                border: 1px solid #e2e8f0;
                padding: 10px;
                text-align: right;
            }

            .unimind-table th {
                background: #f8fafc;
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
                box-shadow: 0 2px 8px rgba(15,23,42,.08);
            }

            .unimind-auth-status {
                margin-top: 15px;
            }

            .unimind-account-avatar {
                width: 64px;
                height: 64px;
                border-radius: 50%;
                background: #eef2ff;
                color: #4f46e5;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 26px;
                font-weight: 800;
                margin: 0 auto 15px;
            }

            @media (max-width: 650px) {
                .unimind-overlay {
                    padding: 10px;
                }

                .unimind-modal {
                    max-height: 94vh;
                    border-radius: 18px;
                }

                .unimind-modal-header {
                    padding: 16px;
                }

                .unimind-modal-body {
                    padding: 16px;
                }

                .unimind-chat {
                    height: 380px;
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
        `;

        document.head.appendChild(
            style
        );
    }

    // =========================================================
    // AI API
    // =========================================================

    async function askAI(message) {
        if (
            !message ||
            !message.trim()
        ) {
            throw new Error(
                "الرجاء كتابة رسالة أولاً."
            );
        }

        let response;

        try {
            response =
                await fetch(
                    API_URL,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                            "Accept":
                                "application/json"
                        },

                        body: JSON.stringify({
                            message:
                                message.trim()
                        })
                    }
                );
        } catch (
            networkError
        ) {
            console.error(
                "❌ UniMind AI network error:",
                networkError
            );

            throw new Error(
                "تعذر الاتصال بخادم UniMind AI. تأكد من اتصال الإنترنت ثم حاول مرة أخرى."
            );
        }

        let rawText = "";

        try {
            rawText =
                await response.text();
        } catch (
            readError
        ) {
            console.error(
                "❌ UniMind AI response read error:",
                readError
            );

            throw new Error(
                "تعذر قراءة الرد من خادم UniMind AI."
            );
        }

        console.log(
            "🧠 UniMind AI raw response:",
            rawText
        );

        console.log(
            "📡 UniMind AI status:",
            response.status
        );

        if (!response.ok) {
            let errorMessage =
                rawText;

            if (rawText) {
                try {
                    const errorData =
                        JSON.parse(
                            rawText
                        );

                    errorMessage =
                        extractTextFromResponse(
                            errorData
                        ) ||
                        rawText;
                } catch (_) {}
            }

            throw new Error(
                errorMessage ||
                `تعذر الاتصال بمساعد UniMind AI. رمز الخطأ: ${response.status}`
            );
        }

        if (
            !rawText ||
            !rawText.trim()
        ) {
            throw new Error(
                "الخادم أرسل رداً فارغاً."
            );
        }

        const cleanedRawText =
            rawText.trim();

        if (
            !looksLikeJSON(
                cleanedRawText
            )
        ) {
            return cleanedRawText;
        }

        let data;

        try {
            data =
                JSON.parse(
                    cleanedRawText
                );
        } catch (
            jsonError
        ) {
            const extracted =
                extractJSONFromText(
                    cleanedRawText
                );

            if (
                extracted !== null
            ) {
                data =
                    extracted;
            } else {
                return cleanedRawText;
            }
        }

        console.log(
            "📦 UniMind AI parsed response:",
            data
        );

        if (
            typeof data ===
            "string"
        ) {
            const text =
                data.trim();

            if (!text) {
                throw new Error(
                    "الخادم أرسل نصاً فارغاً."
                );
            }

            if (
                looksLikeJSON(
                    text
                )
            ) {
                try {
                    const nested =
                        JSON.parse(
                            text
                        );

                    const nestedAnswer =
                        extractTextFromResponse(
                            nested
                        );

                    if (
                        nestedAnswer
                    ) {
                        return nestedAnswer;
                    }

                    if (
                        nested &&
                        typeof nested ===
                            "object"
                    ) {
                        if (
                            Array.isArray(
                                nested.questions
                            ) ||
                            Array.isArray(
                                nested.cards
                            )
                        ) {
                            return JSON.stringify(
                                nested
                            );
                        }
                    }
                } catch (_) {}
            }

            return text;
        }

        const answer =
            extractTextFromResponse(
                data
            );

        if (answer) {
            return answer;
        }

        if (
            data &&
            typeof data ===
                "object"
        ) {
            if (
                Array.isArray(
                    data.questions
                ) ||
                Array.isArray(
                    data.cards
                )
            ) {
                return JSON.stringify(
                    data
                );
            }
        }

        return JSON.stringify(
            data,
            null,
            2
        );
    }

    function looksLikeJSON(
        text
    ) {
        if (
            !text ||
            typeof text !==
                "string"
        ) {
            return false;
        }

        const trimmed =
            text.trim();

        return (
            (
                trimmed.startsWith(
                    "{"
                ) &&
                trimmed.endsWith(
                    "}"
                )
            ) ||
            (
                trimmed.startsWith(
                    "["
                ) &&
                trimmed.endsWith(
                    "]"
                )
            )
        );
    }

    function extractJSONFromText(
        text
    ) {
        if (
            !text ||
            typeof text !==
                "string"
        ) {
            return null;
        }

        const trimmed =
            text.trim();

        try {
            return JSON.parse(
                trimmed
            );
        } catch (_) {}

        const firstObject =
            trimmed.indexOf(
                "{"
            );

        const lastObject =
            trimmed.lastIndexOf(
                "}"
            );

        if (
            firstObject !== -1 &&
            lastObject >
                firstObject
        ) {
            try {
                return JSON.parse(
                    trimmed.slice(
                        firstObject,
                        lastObject + 1
                    )
                );
            } catch (_) {}
        }

        const firstArray =
            trimmed.indexOf(
                "["
            );

        const lastArray =
            trimmed.lastIndexOf(
                "]"
            );

        if (
            firstArray !== -1 &&
            lastArray >
                firstArray
        ) {
            try {
                return JSON.parse(
                    trimmed.slice(
                        firstArray,
                        lastArray + 1
                    )
                );
            } catch (_) {}
        }

        return null;
    }

    function extractTextFromResponse(
        data
    ) {
        if (
            data === null ||
            data === undefined
        ) {
            return "";
        }

        if (
            typeof data ===
            "string"
        ) {
            return data.trim();
        }

        if (
            Array.isArray(data)
        ) {
            for (
                const item of data
            ) {
                const text =
                    extractTextFromResponse(
                        item
                    );

                if (text) {
                    return text;
                }
            }

            return "";
        }

        if (
            typeof data !==
            "object"
        ) {
            return String(data);
        }

        const preferredKeys = [
            "answer",
            "response",
            "reply",
            "message",
            "content",
            "text",
            "output",
            "result"
        ];

        for (
            const key of preferredKeys
        ) {
            if (
                Object.prototype.hasOwnProperty.call(
                    data,
                    key
                )
            ) {
                const value =
                    data[key];

                if (
                    typeof value ===
                        "string" &&
                    value.trim()
                ) {
                    return value.trim();
                }

                const nested =
                    extractTextFromResponse(
                        value
                    );

                if (nested) {
                    return nested;
                }
            }
        }

        if (
            data.choices &&
            Array.isArray(
                data.choices
            )
        ) {
            for (
                const choice of
                    data.choices
            ) {
                const choiceText =
                    extractTextFromResponse(
                        choice
                    );

                if (
                    choiceText
                ) {
                    return choiceText;
                }
            }
        }

        if (
            data.data
        ) {
            const nested =
                extractTextFromResponse(
                    data.data
                );

            if (nested) {
                return nested;
            }
        }

        return "";
    }

    // =========================================================
    // MODAL SYSTEM
    // =========================================================

    function createModal(
        options = {}
    ) {
        const overlay =
            document.createElement(
                "div"
            );

        overlay.className =
            "unimind-overlay";

        const modal =
            document.createElement(
                "div"
            );

        modal.className =
            "unimind-modal";

        const header =
            document.createElement(
                "div"
            );

        header.className =
            "unimind-modal-header";

        const title =
            document.createElement(
                "h2"
            );

        title.className =
            "unimind-modal-title";

        title.textContent =
            options.title ||
            "UniMind AI";

        const closeButton =
            document.createElement(
                "button"
            );

        closeButton.type =
            "button";

        closeButton.className =
            "unimind-close";

        closeButton.setAttribute(
            "aria-label",
            "إغلاق"
        );

        closeButton.innerHTML =
            "×";

        header.appendChild(
            title
        );

        header.appendChild(
            closeButton
        );

        const body =
            document.createElement(
                "div"
            );

        body.className =
            "unimind-modal-body";

        if (
            options.content
        ) {
            if (
                typeof options.content ===
                "string"
            ) {
                body.innerHTML =
                    options.content;
            } else {
                body.appendChild(
                    options.content
                );
            }
        }

        modal.appendChild(
            header
        );

        modal.appendChild(
            body
        );

        overlay.appendChild(
            modal
        );

        document.body.appendChild(
            overlay
        );

        let closed = false;

        function close() {
            if (closed) return;

            closed = true;

            overlay.remove();

            unlockBody();

            if (
                typeof options.onClose ===
                "function"
            ) {
                options.onClose();
            }
        }

        closeButton.addEventListener(
            "click",
            close
        );

        overlay.addEventListener(
            "click",
            event => {
                if (
                    event.target ===
                    overlay
                ) {
                    close();
                }
            }
        );

        function escHandler(
            event
        ) {
            if (
                event.key ===
                "Escape"
            ) {
                close();

                document.removeEventListener(
                    "keydown",
                    escHandler
                );
            }
        }

        document.addEventListener(
            "keydown",
            escHandler
        );

        lockBody();

        return {
            overlay,
            modal,
            body,
            title,
            close
        };
    }

    // =========================================================
    // AUTHENTICATION
    // =========================================================

    async function ensureUserProfile(
        user
    ) {
        if (!user) return;

        const client =
            await getSupabase();

        const {
            data: existing,
            error: selectError
        } =
            await client
                .from("profiles")
                .select(
                    "id, full_name, avatar_url, language, theme"
                )
                .eq(
                    "id",
                    user.id
                )
                .maybeSingle();

        if (selectError) {
            console.error(
                "Profile select error:",
                selectError
            );

            throw selectError;
        }

        if (!existing) {
            const {
                error
            } =
                await client
                    .from("profiles")
                    .insert({
                        id:
                            user.id,

                        full_name:
                            user.user_metadata
                                ?.full_name ||
                            "",

                        language:
                            localStorage.getItem(
                                "unimind-language"
                            ) ||
                            "ar",

                        theme:
                            document.body.classList.contains(
                                "dark-mode"
                            )
                                ? "dark"
                                : "light"
                    });

            if (
                error &&
                error.code !==
                    "23505"
            ) {
                console.error(
                    "Profile insert error:",
                    error
                );

                throw error;
            }
        }
    }

    async function loadUserPreferences(
        user
    ) {
        if (!user) return;

        try {
            const client =
                await getSupabase();

            const {
                data: profile,
                error
            } =
                await client
                    .from("profiles")
                    .select(
                        "full_name, language, theme"
                    )
                    .eq(
                        "id",
                        user.id
                    )
                    .maybeSingle();

            if (error) {
                console.error(
                    "Profile preference error:",
                    error
                );

                return;
            }

            if (!profile) {
                return;
            }

            if (
                profile.language ===
                    "ar" ||
                profile.language ===
                    "en"
            ) {
                localStorage.setItem(
                    "unimind-language",
                    profile.language
                );

                document.documentElement.lang =
                    profile.language;

                document.documentElement.dir =
                    profile.language ===
                    "ar"
                        ? "rtl"
                        : "ltr";
            }

            if (
                profile.theme ===
                    "dark" ||
                profile.theme ===
                    "light"
            ) {
                localStorage.setItem(
                    "unimind-theme",
                    profile.theme
                );

                document.body.classList.toggle(
                    "dark-mode",
                    profile.theme ===
                        "dark"
                );
            }
        } catch (
            error
        ) {
            console.error(
                "Failed to load user preferences:",
                error
            );
        }
    }

    async function saveUserPreference(
        field,
        value
    ) {
        if (!currentUser) {
            return;
        }

        if (
            field !== "language" &&
            field !== "theme"
        ) {
            return;
        }

        try {
            const client =
                await getSupabase();

            const {
                error
            } =
                await client
                    .from("profiles")
                    .update({
                        [field]:
                            value
                    })
                    .eq(
                        "id",
                        currentUser.id
                    );

            if (error) {
                console.error(
                    `Failed to save ${field}:`,
                    error
                );
            }
        } catch (
            error
        ) {
            console.error(
                `Failed to save ${field}:`,
                error
            );
        }
    }
        // =========================================================
    // USER ACCOUNT
    // =========================================================

    async function getCurrentSession() {
        try {
            const client = await getSupabase();

            const {
                data,
                error
            } = await client.auth.getSession();

            if (error) {
                console.error(
                    "Session error:",
                    error
                );

                return null;
            }

            return data?.session || null;

        } catch (error) {
            console.error(
                "Failed to get session:",
                error
            );

            return null;
        }
    }

    async function refreshCurrentUser() {
        try {
            const client =
                await getSupabase();

            const {
                data,
                error
            } =
                await client.auth.getUser();

            if (error) {
                console.error(
                    "Get user error:",
                    error
                );

                currentUser = null;

                return null;
            }

            currentUser =
                data?.user || null;

            return currentUser;

        } catch (error) {
            console.error(
                "Refresh user error:",
                error
            );

            currentUser = null;

            return null;
        }
    }

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

    function getUserInitial(user) {
        const name =
            getUserName(user).trim();

        return (
            name.charAt(0) ||
            "U"
        ).toUpperCase();
    }

    // =========================================================
    // AUTH UI
    // =========================================================

    function updateAuthUI() {
        const loginButtons =
            document.querySelectorAll(
                "[data-unimind-login]"
            );

        const accountButtons =
            document.querySelectorAll(
                "[data-unimind-account]"
            );

        const logoutButtons =
            document.querySelectorAll(
                "[data-unimind-logout]"
            );

        if (currentUser) {

            loginButtons.forEach(
                button => {
                    button.style.display =
                        "none";
                }
            );

            accountButtons.forEach(
                button => {
                    button.style.display =
                        "";
                }
            );

            logoutButtons.forEach(
                button => {
                    button.style.display =
                        "";
                }
            );

        } else {

            loginButtons.forEach(
                button => {
                    button.style.display =
                        "";
                }
            );

            accountButtons.forEach(
                button => {
                    button.style.display =
                        "none";
                }
            );

            logoutButtons.forEach(
                button => {
                    button.style.display =
                        "none";
                }
            );
        }
    }

    // =========================================================
    // LOGIN / REGISTER MODAL
    // =========================================================

    function openAuthModal(
        defaultTab = "login"
    ) {

        const modal =
            createModal({
                title:
                    "حساب UniMind AI"
            });

        const body =
            modal.body;

        body.innerHTML = `
            <div class="unimind-auth-tabs">

                <button
                    type="button"
                    class="unimind-auth-tab ${
                        defaultTab === "login"
                            ? "active"
                            : ""
                    }"
                    id="unimindLoginTab"
                >
                    تسجيل الدخول
                </button>

                <button
                    type="button"
                    class="unimind-auth-tab ${
                        defaultTab === "register"
                            ? "active"
                            : ""
                    }"
                    id="unimindRegisterTab"
                >
                    إنشاء حساب
                </button>

            </div>

            <div id="unimindAuthContent"></div>

            <div
                id="unimindAuthStatus"
                class="unimind-auth-status"
            ></div>
        `;

        const loginTab =
            body.querySelector(
                "#unimindLoginTab"
            );

        const registerTab =
            body.querySelector(
                "#unimindRegisterTab"
            );

        const content =
            body.querySelector(
                "#unimindAuthContent"
            );

        const status =
            body.querySelector(
                "#unimindAuthStatus"
            );

        function showStatus(
            message,
            type = "error"
        ) {

            status.className =
                `unimind-auth-status ${
                    type === "success"
                        ? "unimind-success"
                        : "unimind-error"
                }`;

            status.textContent =
                message;
        }

        function clearStatus() {
            status.className =
                "unimind-auth-status";

            status.textContent =
                "";
        }

        function setActiveTab(
            tab
        ) {

            const isLogin =
                tab === "login";

            loginTab.classList.toggle(
                "active",
                isLogin
            );

            registerTab.classList.toggle(
                "active",
                !isLogin
            );

            clearStatus();

            if (isLogin) {
                renderLogin();
            } else {
                renderRegister();
            }
        }

        function renderLogin() {

            content.innerHTML = `
                <form
                    id="unimindLoginForm"
                >

                    <div
                        style="
                            margin-bottom:14px;
                        "
                    >
                        <label>
                            البريد الإلكتروني
                        </label>

                        <input
                            type="email"
                            id="unimindLoginEmail"
                            class="unimind-input"
                            placeholder="example@email.com"
                            required
                        >
                    </div>

                    <div
                        style="
                            margin-bottom:18px;
                        "
                    >
                        <label>
                            كلمة المرور
                        </label>

                        <input
                            type="password"
                            id="unimindLoginPassword"
                            class="unimind-input"
                            placeholder="كلمة المرور"
                            required
                        >
                    </div>

                    <button
                        type="submit"
                        class="unimind-btn unimind-btn-primary"
                        style="width:100%;"
                        id="unimindLoginSubmit"
                    >
                        تسجيل الدخول
                    </button>

                </form>

                <div
                    style="
                        margin-top:18px;
                        text-align:center;
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
                            font-weight:800;
                            cursor:pointer;
                            font-family:inherit;
                        "
                    >
                        إنشاء حساب جديد
                    </button>
                </div>
            `;

            const form =
                content.querySelector(
                    "#unimindLoginForm"
                );

            const submit =
                content.querySelector(
                    "#unimindLoginSubmit"
                );

            const goRegister =
                content.querySelector(
                    "#unimindGoRegister"
                );

            goRegister.addEventListener(
                "click",
                () => {
                    setActiveTab(
                        "register"
                    );
                }
            );

            form.addEventListener(
                "submit",
                async event => {

                    event.preventDefault();

                    clearStatus();

                    submit.disabled =
                        true;

                    submit.textContent =
                        "جارٍ تسجيل الدخول...";

                    try {

                        const email =
                            content.querySelector(
                                "#unimindLoginEmail"
                            ).value.trim();

                        const password =
                            content.querySelector(
                                "#unimindLoginPassword"
                            ).value;

                        const client =
                            await getSupabase();

                        const {
                            data,
                            error
                        } =
                            await client.auth.signInWithPassword({
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

                        showStatus(
                            "تم تسجيل الدخول بنجاح.",
                            "success"
                        );

                        await sleep(
                            700
                        );

                        modal.close();

                        window.dispatchEvent(
                            new CustomEvent(
                                "unimind-auth-changed"
                            )
                        );

                    } catch (error) {

                        console.error(
                            "Login error:",
                            error
                        );

                        showStatus(
                            getAuthErrorMessage(
                                error
                            )
                        );

                    } finally {

                        submit.disabled =
                            false;

                        submit.textContent =
                            "تسجيل الدخول";
                    }
                }
            );
        }

        function renderRegister() {

            content.innerHTML = `
                <form
                    id="unimindRegisterForm"
                >

                    <div
                        style="
                            margin-bottom:14px;
                        "
                    >
                        <label>
                            الاسم الكامل
                        </label>

                        <input
                            type="text"
                            id="unimindRegisterName"
                            class="unimind-input"
                            placeholder="اكتب اسمك الكامل"
                            required
                        >
                    </div>

                    <div
                        style="
                            margin-bottom:14px;
                        "
                    >
                        <label>
                            البريد الإلكتروني
                        </label>

                        <input
                            type="email"
                            id="unimindRegisterEmail"
                            class="unimind-input"
                            placeholder="example@email.com"
                            required
                        >
                    </div>

                    <div
                        style="
                            margin-bottom:14px;
                        "
                    >
                        <label>
                            كلمة المرور
                        </label>

                        <input
                            type="password"
                            id="unimindRegisterPassword"
                            class="unimind-input"
                            placeholder="6 أحرف على الأقل"
                            minlength="6"
                            required
                        >
                    </div>

                    <div
                        style="
                            margin-bottom:18px;
                        "
                    >
                        <label>
                            تأكيد كلمة المرور
                        </label>

                        <input
                            type="password"
                            id="unimindRegisterConfirm"
                            class="unimind-input"
                            placeholder="أعد كتابة كلمة المرور"
                            minlength="6"
                            required
                        >
                    </div>

                    <button
                        type="submit"
                        class="unimind-btn unimind-btn-primary"
                        style="width:100%;"
                        id="unimindRegisterSubmit"
                    >
                        إنشاء الحساب
                    </button>

                </form>

                <div
                    style="
                        margin-top:18px;
                        text-align:center;
                    "
                    class="unimind-muted"
                >
                    لديك حساب بالفعل؟

                    <button
                        type="button"
                        id="unimindGoLogin"
                        style="
                            border:0;
                            background:none;
                            color:#4f46e5;
                            font-weight:800;
                            cursor:pointer;
                            font-family:inherit;
                        "
                    >
                        تسجيل الدخول
                    </button>
                </div>
            `;

            const form =
                content.querySelector(
                    "#unimindRegisterForm"
                );

            const submit =
                content.querySelector(
                    "#unimindRegisterSubmit"
                );

            const goLogin =
                content.querySelector(
                    "#unimindGoLogin"
                );

            goLogin.addEventListener(
                "click",
                () => {
                    setActiveTab(
                        "login"
                    );
                }
            );

            form.addEventListener(
                "submit",
                async event => {

                    event.preventDefault();

                    clearStatus();

                    const name =
                        content.querySelector(
                            "#unimindRegisterName"
                        ).value.trim();

                    const email =
                        content.querySelector(
                            "#unimindRegisterEmail"
                        ).value.trim();

                    const password =
                        content.querySelector(
                            "#unimindRegisterPassword"
                        ).value;

                    const confirm =
                        content.querySelector(
                            "#unimindRegisterConfirm"
                        ).value;

                    if (
                        password.length < 6
                    ) {
                        showStatus(
                            "كلمة المرور يجب أن تكون 6 أحرف على الأقل."
                        );

                        return;
                    }

                    if (
                        password !==
                        confirm
                    ) {
                        showStatus(
                            "كلمتا المرور غير متطابقتين."
                        );

                        return;
                    }

                    submit.disabled =
                        true;

                    submit.textContent =
                        "جارٍ إنشاء الحساب...";

                    try {

                        const client =
                            await getSupabase();

                        const {
                            data,
                            error
                        } =
                            await client.auth.signUp({
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

                            showStatus(
                                "تم إنشاء الحساب وتسجيل الدخول بنجاح.",
                                "success"
                            );

                            await sleep(
                                700
                            );

                            modal.close();

                            window.dispatchEvent(
                                new CustomEvent(
                                    "unimind-auth-changed"
                                )
                            );

                        } else {

                            showStatus(
                                "تم إنشاء الحساب. تحقق من بريدك الإلكتروني لتفعيل الحساب.",
                                "success"
                            );

                            submit.disabled =
                                false;

                            submit.textContent =
                                "إنشاء الحساب";
                        }

                    } catch (error) {

                        console.error(
                            "Register error:",
                            error
                        );

                        showStatus(
                            getAuthErrorMessage(
                                error
                            )
                        );

                        submit.disabled =
                            false;

                        submit.textContent =
                            "إنشاء الحساب";
                    }
                }
            );
        }

        loginTab.addEventListener(
            "click",
            () => {
                setActiveTab(
                    "login"
                );
            }
        );

        registerTab.addEventListener(
            "click",
            () => {
                setActiveTab(
                    "register"
                );
            }
        );

        setActiveTab(
            defaultTab
        );
    }

    // =========================================================
    // AUTH ERROR TRANSLATION
    // =========================================================

    function getAuthErrorMessage(
        error
    ) {

        const message =
            error?.message ||
            "";

        const normalized =
            message.toLowerCase();

        if (
            normalized.includes(
                "invalid login credentials"
            )
        ) {
            return "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
        }

        if (
            normalized.includes(
                "email not confirmed"
            )
        ) {
            return "يرجى تأكيد بريدك الإلكتروني أولاً.";
        }

        if (
            normalized.includes(
                "user already registered"
            )
        ) {
            return "هذا البريد الإلكتروني مسجل بالفعل.";
        }

        if (
            normalized.includes(
                "password"
            ) &&
            normalized.includes(
                "6"
            )
        ) {
            return "كلمة المرور يجب أن تكون 6 أحرف على الأقل.";
        }

        if (
            normalized.includes(
                "rate limit"
            )
        ) {
            return "تم تجاوز عدد المحاولات المسموح بها. حاول لاحقاً.";
        }

        if (
            normalized.includes(
                "network"
            )
        ) {
            return "تعذر الاتصال بالخادم. تحقق من الإنترنت.";
        }

        return (
            message ||
            "حدث خطأ غير متوقع. حاول مرة أخرى."
        );
    }

    // =========================================================
    // LOGOUT
    // =========================================================

    async function logoutUser() {

        try {

            const client =
                await getSupabase();

            const {
                error
            } =
                await client.auth.signOut();

            if (error) {
                throw error;
            }

            currentUser =
                null;

            updateAuthUI();

            window.dispatchEvent(
                new CustomEvent(
                    "unimind-auth-changed"
                )
            );

            alert(
                "تم تسجيل الخروج بنجاح."
            );

        } catch (error) {

            console.error(
                "Logout error:",
                error
            );

            alert(
                "تعذر تسجيل الخروج. حاول مرة أخرى."
            );
        }
    }

    // =========================================================
    // ACCOUNT MODAL
    // =========================================================

    async function openAccountModal() {

        if (!currentUser) {

            openAuthModal(
                "login"
            );

            return;
        }

        const modal =
            createModal({
                title:
                    "حسابي"
            });

        const body =
            modal.body;

        const name =
            getUserName(
                currentUser
            );

        const email =
            currentUser.email ||
            "";

        const initial =
            getUserInitial(
                currentUser
            );

        body.innerHTML = `
            <div
                style="
                    text-align:center;
                "
            >

                <div
                    class="unimind-account-avatar"
                >
                    ${escapeHTML(
                        initial
                    )}
                </div>

                <h3
                    style="
                        margin:0 0 5px;
                    "
                >
                    ${escapeHTML(
                        name
                    )}
                </h3>

                <div
                    class="unimind-muted"
                >
                    ${escapeHTML(
                        email
                    )}
                </div>

            </div>

            <div
                style="
                    margin-top:25px;
                    display:grid;
                    gap:12px;
                "
            >

                <button
                    type="button"
                    class="unimind-btn unimind-btn-secondary"
                    id="unimindEditProfile"
                >
                    ✏️ تعديل الاسم
                </button>

                <button
                    type="button"
                    class="unimind-btn unimind-btn-secondary"
                    id="unimindChangePassword"
                >
                    🔐 تغيير كلمة المرور
                </button>

                <button
                    type="button"
                    class="unimind-btn unimind-btn-danger"
                    id="unimindLogout"
                >
                    🚪 تسجيل الخروج
                </button>

            </div>

            <div
                class="unimind-muted"
                style="
                    text-align:center;
                    margin-top:22px;
                "
            >
                UniMind AI
                <br>
                مساعدك الجامعي الذكي
            </div>
        `;

        body.querySelector(
            "#unimindLogout"
        ).addEventListener(
            "click",
            async () => {

                modal.close();

                await logoutUser();
            }
        );

        body.querySelector(
            "#unimindEditProfile"
        ).addEventListener(
            "click",
            () => {

                modal.close();

                openEditProfileModal();
            }
        );

        body.querySelector(
            "#unimindChangePassword"
        ).addEventListener(
            "click",
            () => {

                modal.close();

                openChangePasswordModal();
            }
        );
    }

    // =========================================================
    // EDIT PROFILE
    // =========================================================

    async function openEditProfileModal() {

        if (!currentUser) {
            return;
        }

        const modal =
            createModal({
                title:
                    "تعديل الملف الشخصي"
            });

        const body =
            modal.body;

        const currentName =
            getUserName(
                currentUser
            );

        body.innerHTML = `
            <form
                id="unimindEditProfileForm"
            >

                <div
                    style="
                        margin-bottom:18px;
                    "
                >
                    <label>
                        الاسم الكامل
                    </label>

                    <input
                        type="text"
                        id="unimindProfileName"
                        class="unimind-input"
                        value="${escapeHTML(
                            currentName
                        )}"
                        required
                    >
                </div>

                <button
                    type="submit"
                    class="unimind-btn unimind-btn-primary"
                    style="width:100%;"
                    id="unimindSaveProfile"
                >
                    حفظ التغييرات
                </button>

                <div
                    id="unimindProfileStatus"
                    style="
                        margin-top:15px;
                    "
                ></div>

            </form>
        `;

        const form =
            body.querySelector(
                "#unimindEditProfileForm"
            );

        const submit =
            body.querySelector(
                "#unimindSaveProfile"
            );

        const status =
            body.querySelector(
                "#unimindProfileStatus"
            );

        form.addEventListener(
            "submit",
            async event => {

                event.preventDefault();

                const newName =
                    body.querySelector(
                        "#unimindProfileName"
                    ).value.trim();

                if (!newName) {
                    status.innerHTML = `
                        <div class="unimind-error">
                            الرجاء كتابة الاسم.
                        </div>
                    `;

                    return;
                }

                submit.disabled =
                    true;

                submit.textContent =
                    "جارٍ الحفظ...";

                try {

                    const client =
                        await getSupabase();

                    const {
                        data,
                        error
                    } =
                        await client.auth.updateUser({
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

                    const {
                        error:
                            profileError
                    } =
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

                    if (profileError) {
                        throw profileError;
                    }

                    status.innerHTML = `
                        <div class="unimind-success">
                            تم تحديث الاسم بنجاح.
                        </div>
                    `;

                    updateAuthUI();

                    window.dispatchEvent(
                        new CustomEvent(
                            "unimind-profile-updated"
                        )
                    );

                    await sleep(
                        700
                    );

                    modal.close();

                    openAccountModal();

                } catch (error) {

                    console.error(
                        "Profile update error:",
                        error
                    );

                    status.innerHTML = `
                        <div class="unimind-error">
                            تعذر تحديث الملف الشخصي.
                        </div>
                    `;

                } finally {

                    submit.disabled =
                        false;

                    submit.textContent =
                        "حفظ التغييرات";
                }
            }
        );
    }

    // =========================================================
    // CHANGE PASSWORD
    // =========================================================

    async function openChangePasswordModal() {

        if (!currentUser) {
            return;
        }

        const modal =
            createModal({
                title:
                    "تغيير كلمة المرور"
            });

        const body =
            modal.body;

        body.innerHTML = `
            <form
                id="unimindPasswordForm"
            >

                <div
                    style="
                        margin-bottom:14px;
                    "
                >
                    <label>
                        كلمة المرور الجديدة
                    </label>

                    <input
                        type="password"
                        id="unimindNewPassword"
                        class="unimind-input"
                        minlength="6"
                        required
                    >
                </div>

                <div
                    style="
                        margin-bottom:18px;
                    "
                >
                    <label>
                        تأكيد كلمة المرور
                    </label>

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
                    class="unimind-btn unimind-btn-primary"
                    style="width:100%;"
                    id="unimindChangePasswordSubmit"
                >
                    تغيير كلمة المرور
                </button>

                <div
                    id="unimindPasswordStatus"
                    style="
                        margin-top:15px;
                    "
                ></div>

            </form>
        `;

        const form =
            body.querySelector(
                "#unimindPasswordForm"
            );

        const submit =
            body.querySelector(
                "#unimindChangePasswordSubmit"
            );

        const status =
            body.querySelector(
                "#unimindPasswordStatus"
            );

        form.addEventListener(
            "submit",
            async event => {

                event.preventDefault();

                const password =
                    body.querySelector(
                        "#unimindNewPassword"
                    ).value;

                const confirm =
                    body.querySelector(
                        "#unimindConfirmPassword"
                    ).value;

                if (
                    password.length < 6
                ) {

                    status.innerHTML = `
                        <div class="unimind-error">
                            كلمة المرور يجب أن تكون 6 أحرف على الأقل.
                        </div>
                    `;

                    return;
                }

                if (
                    password !==
                    confirm
                ) {

                    status.innerHTML = `
                        <div class="unimind-error">
                            كلمتا المرور غير متطابقتين.
                        </div>
                    `;

                    return;
                }

                submit.disabled =
                    true;

                submit.textContent =
                    "جارٍ التحديث...";

                try {

                    const client =
                        await getSupabase();

                    const {
                        error
                    } =
                        await client.auth.updateUser({
                            password
                        });

                    if (error) {
                        throw error;
                    }

                    status.innerHTML = `
                        <div class="unimind-success">
                            تم تغيير كلمة المرور بنجاح.
                        </div>
                    `;

                    await sleep(
                        900
                    );

                    modal.close();

                } catch (error) {

                    console.error(
                        "Password update error:",
                        error
                    );

                    status.innerHTML = `
                        <div class="unimind-error">
                            ${
                                escapeHTML(
                                    getAuthErrorMessage(
                                        error
                                    )
                                )
                            }
                        </div>
                    `;

                } finally {

                    submit.disabled =
                        false;

                    submit.textContent =
                        "تغيير كلمة المرور";
                }
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

            const session =
                await getCurrentSession();

            if (
                session &&
                session.user
            ) {

                currentUser =
                    session.user;

                await ensureUserProfile(
                    currentUser
                );

                await loadUserPreferences(
                    currentUser
                );

            } else {

                currentUser =
                    null;
            }

            updateAuthUI();

            client.auth.onAuthStateChange(
                async (
                    event,
                    session
                ) => {

                    console.log(
                        "UniMind Auth Event:",
                        event
                    );

                    currentUser =
                        session?.user ||
                        null;

                    if (
                        currentUser
                    ) {

                        try {

                            await ensureUserProfile(
                                currentUser
                            );

                            await loadUserPreferences(
                                currentUser
                            );

                        } catch (
                            profileError
                        ) {

                            console.error(
                                "Profile initialization error:",
                                profileError
                            );
                        }
                    }

                    updateAuthUI();

                    window.dispatchEvent(
                        new CustomEvent(
                            "unimind-auth-changed"
                        )
                    );
                }
            );

        } catch (error) {

            console.error(
                "UniMind authentication initialization failed:",
                error
            );

            currentUser =
                null;

            updateAuthUI();
        }
    }

    // =========================================================
    // CONNECT EXISTING HTML BUTTONS
    // =========================================================

    function bindExistingButtons() {

        document.addEventListener(
            "click",
            event => {

                const loginButton =
                    event.target.closest(
                        "[data-unimind-login]"
                    );

                if (
                    loginButton
                ) {

                    event.preventDefault();

                    openAuthModal(
                        "login"
                    );

                    return;
                }

                const accountButton =
                    event.target.closest(
                        "[data-unimind-account]"
                    );

                if (
                    accountButton
                ) {

                    event.preventDefault();

                    openAccountModal();

                    return;
                }

                const logoutButton =
                    event.target.closest(
                        "[data-unimind-logout]"
                    );

                if (
                    logoutButton
                ) {

                    event.preventDefault();

                    logoutUser();

                    return;
                }
            }
        );
    }

    // =========================================================
    // AUTO DETECT COMMON BUTTONS
    // =========================================================

    function bindCommonAuthButtons() {

        const allButtons =
            document.querySelectorAll(
                "button, a"
            );

        allButtons.forEach(
            button => {

                const text =
                    (
                        button.textContent ||
                        ""
                    )
                        .trim()
                        .toLowerCase();

                if (
                    !text
                ) {
                    return;
                }

                if (
                    (
                        text.includes(
                            "تسجيل الدخول"
                        ) ||
                        text.includes(
                            "login"
                        )
                    ) &&
                    !button.dataset
                        .unimindLoginBound
                ) {

                    button.dataset
                        .unimindLoginBound =
                        "true";

                    button.addEventListener(
                        "click",
                        event => {

                            event.preventDefault();

                            openAuthModal(
                                "login"
                            );
                        }
                    );
                }

                if (
                    (
                        text.includes(
                            "حسابي"
                        ) ||
                        text.includes(
                            "account"
                        )
                    ) &&
                    !button.dataset
                        .unimindAccountBound
                ) {

                    button.dataset
                        .unimindAccountBound =
                        "true";

                    button.addEventListener(
                        "click",
                        event => {

                            event.preventDefault();

                            openAccountModal();
                        }
                    );
                }

                if (
                    (
                        text.includes(
                            "تسجيل الخروج"
                        ) ||
                        text.includes(
                            "logout"
                        )
                    ) &&
                    !button.dataset
                        .unimindLogoutBound
                ) {

                    button.dataset
                        .unimindLogoutBound =
                        "true";

                    button.addEventListener(
                        "click",
                        event => {

                            event.preventDefault();

                            logoutUser();
                        }
                    );
                }
            }
        );
    }

    // =========================================================
    // GLOBAL API
    // =========================================================

    window.UniMindAuth = {

        login: function () {
            openAuthModal(
                "login"
            );
        },

        register: function () {
            openAuthModal(
                "register"
            );
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
    // START UNI MIND
    // =========================================================

    async function startUniMind() {

        injectStyles();

        bindExistingButtons();

        bindCommonAuthButtons();

        await initializeAuth();

        console.log(
            "✅ UniMind AI Phase 2 loaded successfully."
        );
    }

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            startUniMind
        );

    } else {

        startUniMind();
    }

})();

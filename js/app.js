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
                word-break: break-word;
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
                color: #1e293b;
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
                width: 7px;
                height: 7px;
                background: currentColor;
                border-radius: 50%;
                animation: unimindPulse 1s infinite;
            }

            .unimind-dot:nth-child(2) {
                animation-delay: .15s;
            }

            .unimind-dot:nth-child(3) {
                animation-delay: .3s;
            }

            @keyframes unimindPulse {
                0%, 80%, 100% {
                    opacity: .25;
                    transform: translateY(0);
                }

                40% {
                    opacity: 1;
                    transform: translateY(-3px);
                }
            }

            .unimind-card {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 18px;
                padding: 18px;
                margin-bottom: 15px;
            }

            .unimind-card h3,
            .unimind-card h4 {
                margin-top: 0;
            }

            .unimind-option {
                display: block;
                width: 100%;
                text-align: right;
                padding: 13px 15px;
                margin-top: 10px;
                border: 1px solid #dbe3ef;
                border-radius: 12px;
                background: white;
                cursor: pointer;
                font-family: inherit;
                transition: .2s;
            }

            .unimind-option:hover {
                border-color: #6366f1;
                background: #f5f3ff;
            }

            .unimind-option.correct {
                background: #dcfce7;
                border-color: #22c55e;
            }

            .unimind-option.wrong {
                background: #fee2e2;
                border-color: #ef4444;
            }

            .unimind-progress {
                height: 8px;
                background: #e2e8f0;
                border-radius: 999px;
                overflow: hidden;
                margin: 10px 0 20px;
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
            return answer.trim();
        }

        if (
            data &&
            typeof data ===
                "object" &&
            Array.isArray(
                data.questions
            )
        ) {
            return JSON.stringify(
                data
            );
        }

        if (
            data &&
            typeof data ===
                "object" &&
            Array.isArray(
                data.cards
            )
        ) {
            return JSON.stringify(
                data
            );
        }

        const fallback =
            findFirstUsefulString(
                data
            );

        if (fallback) {
            return fallback;
        }

        throw new Error(
            "وصل رد من الخادم، لكن لم يتم العثور على إجابة."
        );
    }

    // =========================================================
    // RESPONSE HELPERS
    // =========================================================

    function looksLikeJSON(text) {
        if (
            !text ||
            typeof text !==
                "string"
        ) {
            return false;
        }

        const value =
            text.trim();

        return (
            (
                value.startsWith(
                    "{"
                ) &&
                value.endsWith(
                    "}"
                )
            ) ||
            (
                value.startsWith(
                    "["
                ) &&
                value.endsWith(
                    "]"
                )
            ) ||
            value.startsWith(
                "```json"
            ) ||
            value.startsWith(
                "```JSON"
            )
        );
    }

    function extractJSONFromText(
        text
    ) {
        if (!text) return null;

        let cleaned =
            String(text)
                .trim()
                .replace(
                    /^```json\s*/i,
                    ""
                )
                .replace(
                    /^```\s*/i,
                    ""
                )
                .replace(
                    /\s*```$/i,
                    ""
                )
                .trim();

        try {
            return JSON.parse(
                cleaned
            );
        } catch (_) {}

        const objectStart =
            cleaned.indexOf(
                "{"
            );

        const objectEnd =
            cleaned.lastIndexOf(
                "}"
            );

        if (
            objectStart !== -1 &&
            objectEnd >
                objectStart
        ) {
            try {
                return JSON.parse(
                    cleaned.slice(
                        objectStart,
                        objectEnd + 1
                    )
                );
            } catch (_) {}
        }

        const arrayStart =
            cleaned.indexOf(
                "["
            );

        const arrayEnd =
            cleaned.lastIndexOf(
                "]"
            );

        if (
            arrayStart !== -1 &&
            arrayEnd >
                arrayStart
        ) {
            try {
                return JSON.parse(
                    cleaned.slice(
                        arrayStart,
                        arrayEnd + 1
                    )
                );
            } catch (_) {}
        }

        return null;
    }

    function extractTextFromResponse(
        value,
        depth = 0
    ) {
        if (
            depth > 8 ||
            value === null ||
            value === undefined
        ) {
            return null;
        }

        if (
            typeof value ===
            "string"
        ) {
            const text =
                value.trim();

            return text || null;
        }

        if (
            typeof value !==
            "object"
        ) {
            return null;
        }

        const possibleKeys = [
            "answer",
            "message",
            "response",
            "content",
            "result",
            "text",
            "output",
            "reply",
            "completion",
            "generated_text",
            "assistant",
            "ai_response",
            "aiResponse",
            "response_text",
            "responseText"
        ];

        for (
            const key of
                possibleKeys
        ) {
            if (
                Object.prototype.hasOwnProperty.call(
                    value,
                    key
                )
            ) {
                const result =
                    extractTextFromResponse(
                        value[key],
                        depth + 1
                    );

                if (result) {
                    return result;
                }
            }
        }

        if (
            Object.prototype.hasOwnProperty.call(
                value,
                "data"
            )
        ) {
            const result =
                extractTextFromResponse(
                    value.data,
                    depth + 1
                );

            if (result) {
                return result;
            }
        }

        if (
            Object.prototype.hasOwnProperty.call(
                value,
                "body"
            )
        ) {
            const bodyValue =
                value.body;

            if (
                typeof bodyValue ===
                "string"
            ) {
                const bodyText =
                    bodyValue.trim();

                if (
                    looksLikeJSON(
                        bodyText
                    )
                ) {
                    try {
                        const bodyJSON =
                            JSON.parse(
                                bodyText
                            );

                        const result =
                            extractTextFromResponse(
                                bodyJSON,
                                depth + 1
                            );

                        if (result) {
                            return result;
                        }
                    } catch (_) {}
                }

                if (bodyText) {
                    return bodyText;
                }
            }

            const result =
                extractTextFromResponse(
                    bodyValue,
                    depth + 1
                );

            if (result) {
                return result;
            }
        }

        return null;
    }

    function findFirstUsefulString(
        value,
        depth = 0
    ) {
        if (
            depth > 6 ||
            value === null ||
            value === undefined
        ) {
            return null;
        }

        if (
            typeof value ===
            "string"
        ) {
            const text =
                value.trim();

            return text || null;
        }

        if (
            typeof value !==
            "object"
        ) {
            return null;
        }

        const ignoredKeys = [
            "status",
            "success",
            "ok",
            "code",
            "error",
            "id",
            "created_at",
            "updated_at"
        ];

        for (
            const key of
                Object.keys(value)
        ) {
            if (
                ignoredKeys.includes(
                    key
                )
            ) {
                continue;
            }

            const result =
                findFirstUsefulString(
                    value[key],
                    depth + 1
                );

            if (result) {
                return result;
            }
        }

        return null;
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

        closeButton.className =
            "unimind-close";

        closeButton.type =
            "button";

        closeButton.innerHTML =
            "×";

        closeButton.setAttribute(
            "aria-label",
            "إغلاق"
        );

        const body =
            document.createElement(
                "div"
            );

        body.className =
            "unimind-modal-body";

        header.appendChild(
            title
        );

        header.appendChild(
            closeButton
        );

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

    async function handleLogin(
        email,
        password,
        statusElement,
        modal
    ) {
        if (
            !email ||
            !password
        ) {
            statusElement.innerHTML = `
                <div class="unimind-error">
                    الرجاء إدخال البريد الإلكتروني وكلمة المرور.
                </div>
            `;

            return;
        }

        statusElement.innerHTML = `
            <div class="unimind-loading">
                <span class="unimind-dot"></span>
                جاري تسجيل الدخول...
            </div>
        `;

        try {
            const client =
                await getSupabase();

            const {
                data,
                error
            } =
                await client.auth
                    .signInWithPassword({
                        email,
                        password
                    });

            if (error) {
                throw error;
            }

            currentUser =
                data.user;

            await ensureUserProfile(
                currentUser
            );

            await loadUserPreferences(
                currentUser
            );

            statusElement.innerHTML = `
                <div class="unimind-success">
                    ✅ تم تسجيل الدخول بنجاح.
                </div>
            `;

            refreshAuthUI();

            setTimeout(
                () => {
                    modal.close();
                },
                700
            );
        } catch (
            error
        ) {
            console.error(
                "Login error:",
                error
            );

            let message =
                "تعذر تسجيل الدخول.";

            if (
                error.message
                    ?.toLowerCase()
                    .includes(
                        "invalid login credentials"
                    )
            ) {
                message =
                    "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
            } else if (
                error.message
                    ?.toLowerCase()
                    .includes(
                        "email not confirmed"
                    )
            ) {
                message =
                    "يجب تأكيد البريد الإلكتروني أولاً.";
            } else if (
                error.message
            ) {
                message =
                    error.message;
            }

            statusElement.innerHTML = `
                <div class="unimind-error">
                    ❌ ${escapeHTML(
                        message
                    )}
                </div>
            `;
        }
    }

    async function handleSignup(
        fullName,
        email,
        password,
        confirmPassword,
        statusElement,
        modal
    ) {
        if (
            !fullName ||
            !email ||
            !password ||
            !confirmPassword
        ) {
            statusElement.innerHTML = `
                <div class="unimind-error">
                    الرجاء تعبئة جميع الحقول.
                </div>
            `;

            return;
        }

        if (
            password !==
            confirmPassword
        ) {
            statusElement.innerHTML = `
                <div class="unimind-error">
                    كلمتا المرور غير متطابقتين.
                </div>
            `;

            return;
        }

        if (
            password.length < 6
        ) {
            statusElement.innerHTML = `
                <div class="unimind-error">
                    كلمة المرور يجب أن تحتوي على 6 أحرف على الأقل.
                </div>
            `;

            return;
        }

        statusElement.innerHTML = `
            <div class="unimind-loading">
                <span class="unimind-dot"></span>
                جاري إنشاء الحساب...
            </div>
        `;

        try {
            const client =
                await getSupabase();

            const {
                data,
                error
            } =
                await client.auth
                    .signUp({
                        email,
                        password,

                        options: {
                            data: {
                                full_name:
                                    fullName
                            }
                        }
                    });

            if (error) {
                throw error;
            }

            if (data.user) {
                currentUser =
                    data.user;

                if (
                    data.session
                ) {
                    await ensureUserProfile(
                        data.user
                    );

                    await loadUserPreferences(
                        data.user
                    );

                    refreshAuthUI();

                    statusElement.innerHTML = `
                        <div class="unimind-success">
                            ✅ تم إنشاء الحساب وتسجيل الدخول بنجاح.
                        </div>
                    `;

                    setTimeout(
                        () => {
                            modal.close();
                        },
                        900
                    );
                } else {
                    statusElement.innerHTML = `
                        <div class="unimind-success">
                            ✅ تم إنشاء الحساب بنجاح.
                            <br><br>
                            إذا كان تأكيد البريد الإلكتروني مفعلاً في Supabase،
                            تحقق من بريدك الإلكتروني ثم سجل الدخول.
                        </div>
                    `;
                }
            }
        } catch (
            error
        ) {
            console.error(
                "Signup error:",
                error
            );

            let message =
                "تعذر إنشاء الحساب.";

            if (
                error.message
                    ?.toLowerCase()
                    .includes(
                        "user already registered"
                    )
            ) {
                message =
                    "هذا البريد الإلكتروني مسجل مسبقاً.";
            } else if (
                error.message
            ) {
                message =
                    error.message;
            }

            statusElement.innerHTML = `
                <div class="unimind-error">
                    ❌ ${escapeHTML(
                        message
                    )}
                </div>
            `;
        }
    }

    async function handleLogout() {
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

            refreshAuthUI();

            alert(
                "تم تسجيل الخروج بنجاح."
            );
        } catch (
            error
        ) {
            console.error(
                "Logout error:",
                error
            );

            alert(
                "تعذر تسجيل الخروج."
            );
        }
    }

    function getUserDisplayName() {
        if (!currentUser) {
            return "المستخدم";
        }

        const metadata =
            currentUser.user_metadata ||
            {};

        return (
            metadata.full_name ||
            currentUser.email ||
            "المستخدم"
        );
    }

    function getInitials() {
        const name =
            getUserDisplayName();

        if (!name) {
            return "U";
        }

        const parts =
            name
                .trim()
                .split(/\s+/)
                .filter(Boolean);

        if (
            parts.length >= 2
        ) {
            return (
                parts[0][0] +
                parts[1][0]
            ).toUpperCase();
        }

        return name[0].toUpperCase();
    }

    function showAuthModal(
        initialMode = "login"
    ) {
        const modal =
            createModal({
                title:
                    initialMode ===
                    "signup"
                        ? "👤 إنشاء حساب"
                        : "🔐 تسجيل الدخول"
            });

        renderAuthForm(
            modal,
            initialMode
        );

        return modal;
    }

    function renderAuthForm(
        modal,
        mode = "login"
    ) {
        const isSignup =
            mode === "signup";

        modal.title.textContent =
            isSignup
                ? "👤 إنشاء حساب"
                : "🔐 تسجيل الدخول";

        modal.body.innerHTML = `
            <div
                style="
                    max-width:480px;
                    margin:0 auto;
                "
            >

                <div
                    style="
                        text-align:center;
                        margin-bottom:20px;
                    "
                >
                    <div
                        class="unimind-account-avatar"
                    >
                        ${isSignup ? "👤" : "🔐"}
                    </div>

                    <h3 style="margin:0 0 6px;">
                        ${
                            isSignup
                                ? "انضم إلى UniMind AI"
                                : "مرحباً بعودتك"
                        }
                    </h3>

                    <div class="unimind-muted">
                        ${
                            isSignup
                                ? "أنشئ حسابك واحفظ إعداداتك وبياناتك."
                                : "سجل الدخول للوصول إلى حسابك."
                        }
                    </div>
                </div>

                <div
                    class="unimind-auth-tabs"
                >
                    <button
                        type="button"
                        id="unimindLoginTab"
                        class="unimind-auth-tab ${
                            !isSignup
                                ? "active"
                                : ""
                        }"
                    >
                        تسجيل الدخول
                    </button>

                    <button
                        type="button"
                        id="unimindSignupTab"
                        class="unimind-auth-tab ${
                            isSignup
                                ? "active"
                                : ""
                        }"
                    >
                        إنشاء حساب
                    </button>
                </div>

                ${
                    isSignup
                        ? `
                            <label>
                                <strong>
                                    الاسم الكامل
                                </strong>
                            </label>

                            <input
                                id="unimindAuthName"
                                class="unimind-input"
                                type="text"
                                placeholder="اكتب اسمك الكامل"
                                autocomplete="name"
                            />

                            <div style="height:12px;"></div>
                        `
                        : ""
                }

                <label>
                    <strong>
                        البريد الإلكتروني
                    </strong>
                </label>

                <input
                    id="unimindAuthEmail"
                    class="unimind-input"
                    type="email"
                    placeholder="example@email.com"
                    autocomplete="email"
                />

                <div style="height:12px;"></div>

                <label>
                    <strong>
                        كلمة المرور
                    </strong>
                </label>

                <input
                    id="unimindAuthPassword"
                    class="unimind-input"
                    type="password"
                    placeholder="••••••••"
                    autocomplete="${
                        isSignup
                            ? "new-password"
                            : "current-password"
                    }"
                />

                ${
                    isSignup
                        ? `
                            <div style="height:12px;"></div>

                            <label>
                                <strong>
                                    تأكيد كلمة المرور
                                </strong>
                            </label>

                            <input
                                id="unimindAuthConfirmPassword"
                                class="unimind-input"
                                type="password"
                                placeholder="••••••••"
                                autocomplete="new-password"
                            />
                        `
                        : ""
                }

                <button
                    id="unimindAuthSubmit"
                    type="button"
                    class="unimind-btn unimind-btn-primary"
                    style="
                        width:100%;
                        margin-top:18px;
                    "
                >
                    ${
                        isSignup
                            ? "إنشاء الحساب"
                            : "تسجيل الدخول"
                    }
                </button>

                <div
                    id="unimindAuthStatus"
                    class="unimind-auth-status"
                ></div>

            </div>
        `;

        const loginTab =
            document.getElementById(
                "unimindLoginTab"
            );

        const signupTab =
            document.getElementById(
                "unimindSignupTab"
            );

        const submit =
            document.getElementById(
                "unimindAuthSubmit"
            );

        const status =
            document.getElementById(
                "unimindAuthStatus"
            );

        if (loginTab) {
            loginTab.addEventListener(
                "click",
                () => {
                    renderAuthForm(
                        modal,
                        "login"
                    );
                }
            );
        }

        if (signupTab) {
            signupTab.addEventListener(
                "click",
                () => {
                    renderAuthForm(
                        modal,
                        "signup"
                    );
                }
            );
        }

        submit.addEventListener(
            "click",
            async () => {
                submit.disabled =
                    true;

                if (isSignup) {
                    const name =
                        document
                            .getElementById(
                                "unimindAuthName"
                            )
                            ?.value
                            .trim();

                    const email =
                        document
                            .getElementById(
                                "unimindAuthEmail"
                            )
                            ?.value
                            .trim();

                    const password =
                        document
                            .getElementById(
                                "unimindAuthPassword"
                            )
                            ?.value || "";

                    const confirm =
                        document
                            .getElementById(
                                "unimindAuthConfirmPassword"
                            )
                            ?.value || "";

                    await handleSignup(
                        name,
                        email,
                        password,
                        confirm,
                        status,
                        modal
                    );
                } else {
                    const email =
                        document
                            .getElementById(
                                "unimindAuthEmail"
                            )
                            ?.value
                            .trim();

                    const password =
                        document
                            .getElementById(
                                "unimindAuthPassword"
                            )
                            ?.value || "";

                    await handleLogin(
                        email,
                        password,
                        status,
                        modal
                    );
                }

                submit.disabled =
                    false;
            }
        );
    }

    function showAccountModal() {
        const modal =
            createModal({
                title:
                    "👤 حسابي"
            });

        const displayName =
            getUserDisplayName();

        const email =
            currentUser?.email ||
            "";

        modal.body.innerHTML = `
            <div
                style="
                    max-width:480px;
                    margin:0 auto;
                    text-align:center;
                "
            >

                <div
                    class="unimind-account-avatar"
                >
                    ${escapeHTML(
                        getInitials()
                    )}
                </div>

                <h2 style="margin-bottom:6px;">
                    ${escapeHTML(
                        displayName
                    )}
                </h2>

                <div
                    class="unimind-muted"
                    style="margin-bottom:20px;"
                >
                    ${escapeHTML(
                        email
                    )}
                </div>

                <div class="unimind-card">
                    <div>
                        <strong>
                            حالة الحساب
                        </strong>
                    </div>

                    <div
                        style="
                            margin-top:8px;
                            color:#166534;
                        "
                    >
                        ● مسجل الدخول
                    </div>
                </div>

                <button
                    id="unimindLogoutButton"
                    type="button"
                    class="unimind-btn unimind-btn-danger"
                    style="
                        width:100%;
                        margin-top:10px;
                    "
                >
                    🚪 تسجيل الخروج
                </button>

            </div>
        `;

        document
            .getElementById(
                "unimindLogoutButton"
            )
            .addEventListener(
                "click",
                async () => {
                    await handleLogout();

                    modal.close();
                }
            );
    }

    async function initializeAuth() {
        try {
            const client =
                await getSupabase();

            const {
                data
            } =
                await client.auth.getSession();

            currentUser =
                data?.session?.user ||
                null;

            if (currentUser) {
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

            refreshAuthUI();

            client.auth.onAuthStateChange(
                async (
                    event,
                    session
                ) => {
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
                            error
                        ) {
                            console.error(
                                "Auth profile error:",
                                error
                            );
                        }
                    }

                    refreshAuthUI();
                }
            );

            console.log(
                "🔐 Supabase Authentication initialized."
            );
        } catch (
            error
        ) {
            console.error(
                "❌ Supabase initialization error:",
                error
            );

            refreshAuthUI();
        }
    }

    function refreshAuthUI() {
        const buttons =
            document.querySelectorAll(
                "#loginButton, #studentLoginButton, [data-action='login']"
            );

        buttons.forEach(
            button => {
                if (
                    currentUser
                ) {
                    button.textContent =
                        "👤 حسابي";

                    button.setAttribute(
                        "aria-label",
                        "فتح حسابي"
                    );

                    button.dataset.unimindAuthMode =
                        "account";
                } else {
                    button.textContent =
                        "تسجيل الدخول";

                    button.setAttribute(
                        "aria-label",
                        "تسجيل الدخول"
                    );

                    button.dataset.unimindAuthMode =
                        "login";
                }
            }
        );
    }

    function setupLogin() {
        const buttons =
            document.querySelectorAll(
                "#loginButton, #studentLoginButton, [data-action='login']"
            );

        buttons.forEach(
            button => {
                bindOnce(
                    button,
                    () => {
                        if (
                            currentUser
                        ) {
                            showAccountModal();
                        } else {
                            showAuthModal(
                                "login"
                            );
                        }
                    }
                );
            }
        );
    }

    // =========================================================
    // CHAT
    // =========================================================

    function createChatModal() {
        const modal =
            createModal({
                title:
                    "🤖 مساعد الدراسة الذكي"
            });

        const chat =
            document.createElement(
                "div"
            );

        chat.className =
            "unimind-chat";

        chat.id =
            "unimindChatMessages";

        const welcome =
            document.createElement(
                "div"
            );

        welcome.className =
            "unimind-message unimind-message-ai";

        welcome.textContent =
            "مرحباً بك 👋\nأنا مساعد الدراسة الذكي في UniMind AI.\nاسألني عن أي موضوع دراسي وسأساعدك في فهمه.";

        chat.appendChild(
            welcome
        );

        const form =
            document.createElement(
                "form"
            );

        form.className =
            "unimind-chat-form";

        const input =
            document.createElement(
                "input"
            );

        input.className =
            "unimind-input";

        input.placeholder =
            "اكتب سؤالك هنا...";

        input.autocomplete =
            "off";

        const button =
            document.createElement(
                "button"
            );

        button.type =
            "submit";

        button.className =
            "unimind-btn unimind-btn-primary";

        button.textContent =
            "إرسال";

        form.appendChild(
            input
        );

        form.appendChild(
            button
        );

        modal.body.appendChild(
            chat
        );

        modal.body.appendChild(
            form
        );

        form.addEventListener(
            "submit",
            async event => {
                event.preventDefault();

                const message =
                    input.value.trim();

                if (!message) {
                    return;
                }

                addChatMessage(
                    chat,
                    message,
                    "user"
                );

                input.value = "";

                input.disabled =
                    true;

                button.disabled =
                    true;

                const loading =
                    addLoadingMessage(
                        chat
                    );

                try {
                    const answer =
                        await askAI(
                            message
                        );

                    loading.remove();

                    addChatMessage(
                        chat,
                        answer,
                        "ai"
                    );
                } catch (
                    error
                ) {
                    loading.remove();

                    addChatMessage(
                        chat,
                        "حدث خطأ أثناء الاتصال بالمساعد:\n" +
                            (
                                error.message ||
                                "خطأ غير معروف"
                            ),
                        "ai"
                    );
                } finally {
                    input.disabled =
                        false;

                    button.disabled =
                        false;

                    input.focus();
                }
            }
        );

        setTimeout(
            () =>
                input.focus(),
            100
        );

        return modal;
    }

    function addChatMessage(
        container,
        text,
        type
    ) {
        const message =
            document.createElement(
                "div"
            );

        message.className =
            "unimind-message " +
            (
                type === "user"
                    ? "unimind-message-user"
                    : "unimind-message-ai"
            );

        message.textContent =
            text;

        container.appendChild(
            message
        );

        container.scrollTop =
            container.scrollHeight;

        return message;
    }

    function addLoadingMessage(
        container
    ) {
        const message =
            document.createElement(
                "div"
            );

        message.className =
            "unimind-message unimind-message-ai";

        message.innerHTML = `
            <span class="unimind-loading">
                <span class="unimind-dot"></span>
                <span class="unimind-dot"></span>
                <span class="unimind-dot"></span>
                جاري التفكير...
            </span>
        `;

        container.appendChild(
            message
        );

        container.scrollTop =
            container.scrollHeight;

        return message;
    }

    function openChat() {
        createChatModal();
    }

    // =========================================================
    // PDF.JS LOADER
    // =========================================================

    async function loadPDFJS() {
        if (window.pdfjsLib) {
            return window.pdfjsLib;
        }

        if (
            window.__unimindPDFLoading
        ) {
            return window.__unimindPDFLoading;
        }

        window.__unimindPDFLoading =
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
                        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";

                    script.async =
                        true;

                    script.onload =
                        () => {
                            if (
                                !window.pdfjsLib
                            ) {
                                reject(
                                    new Error(
                                        "تم تحميل PDF.js ولكن المكتبة غير متاحة."
                                    )
                                );

                                return;
                            }

                            try {
                                window
                                    .pdfjsLib
                                    .GlobalWorkerOptions
                                    .workerSrc =
                                    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
                            } catch (_) {}

                            resolve(
                                window.pdfjsLib
                            );
                        };

                    script.onerror =
                        () => {
                            reject(
                                new Error(
                                    "تعذر تحميل مكتبة قراءة ملفات PDF."
                                )
                            );
                        };

                    document.head.appendChild(
                        script
                    );
                }
            );

        return window.__unimindPDFLoading;
    }

    // =========================================================
    // MAMMOTH LOADER
    // =========================================================

    async function loadMammoth() {
        if (window.mammoth) {
            return window.mammoth;
        }

        if (
            window.__unimindMammothLoading
        ) {
            return window.__unimindMammothLoading;
        }

        window.__unimindMammothLoading =
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
                        "https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.8.0/mammoth.browser.min.js";

                    script.async =
                        true;

                    script.onload =
                        () => {
                            if (
                                window.mammoth
                            ) {
                                resolve(
                                    window.mammoth
                                );
                            } else {
                                reject(
                                    new Error(
                                        "تعذر تشغيل مكتبة Mammoth."
                                    )
                                );
                            }
                        };

                    script.onerror =
                        () => {
                            reject(
                                new Error(
                                    "تعذر تحميل مكتبة Word."
                                )
                            );
                        };

                    document.head.appendChild(
                        script
                    );
                }
            );

        return window.__unimindMammothLoading;
    }

    // =========================================================
    // FILE TEXT EXTRACTION
    // =========================================================

    async function extractLectureText(
        file
    ) {
        if (!file) {
            throw new Error(
                "لم يتم اختيار ملف."
            );
        }

        const name =
            file.name.toLowerCase();

        if (
            name.endsWith(".txt") ||
            name.endsWith(".md")
        ) {
            return await file.text();
        }

        if (
            name.endsWith(".pdf")
        ) {
            const pdfjs =
                await loadPDFJS();

            const arrayBuffer =
                await file.arrayBuffer();

            const typedArray =
                new Uint8Array(
                    arrayBuffer
                );

            const pdf =
                await pdfjs.getDocument({
                    data: typedArray
                }).promise;

            let fullText = "";

            for (
                let pageNumber = 1;
                pageNumber <=
                pdf.numPages;
                pageNumber++
            ) {
                const page =
                    await pdf.getPage(
                        pageNumber
                    );

                const content =
                    await page.getTextContent();

                const pageText =
                    content.items
                        .map(
                            item =>
                                item.str ||
                                ""
                        )
                        .join(" ");

                fullText +=
                    `\n\n--- الصفحة ${pageNumber} ---\n\n` +
                    pageText;
            }

            return fullText.trim();
        }

        if (
            name.endsWith(".doc") ||
            name.endsWith(".docx")
        ) {
            const mammoth =
                await loadMammoth();

            const arrayBuffer =
                await file.arrayBuffer();

            const result =
                await mammoth.extractRawText({
                    arrayBuffer
                });

            return result.value || "";
        }

        throw new Error(
            "نوع الملف غير مدعوم.\n\n" +
            "الأنواع المدعومة:\n" +
            "PDF, TXT, MD, DOC, DOCX"
        );
    }

    // =========================================================
    // LECTURE SUMMARIZER
    // =========================================================

    function openLectureSummarizer() {
        const modal =
            createModal({
                title:
                    "📄 تلخيص المحاضرات"
            });

        const wrapper =
            document.createElement(
                "div"
            );

        wrapper.innerHTML = `
            <div class="unimind-card">
                <h3>📚 ارفع المحاضرة</h3>

                <p class="unimind-muted">
                    اختر ملف المحاضرة وسأقوم باستخراج النص
                    وتحليله وإنشاء ملخص دراسي واضح.
                </p>

                <div
                    id="unimindLectureDropzone"
                    class="unimind-dropzone"
                >
                    <div style="font-size:42px;">📄</div>

                    <strong>
                        اضغط هنا لاختيار ملف
                    </strong>

                    <div class="unimind-muted">
                        PDF أو TXT أو MD أو DOC أو DOCX
                    </div>

                    <input
                        id="unimindLectureFile"
                        type="file"
                        accept=".pdf,.txt,.md,.doc,.docx"
                        style="display:none;"
                    />

                    <div
                        id="unimindLectureFileName"
                        class="unimind-file-name"
                    >
                        لم يتم اختيار ملف
                    </div>
                </div>
            </div>

            <div class="unimind-card">
                <label>
                    <strong>
                        أو الصق نص المحاضرة مباشرة
                    </strong>
                </label>

                <textarea
                    id="unimindLectureText"
                    class="unimind-textarea"
                    placeholder="الصق نص المحاضرة هنا..."
                ></textarea>
            </div>

            <div class="unimind-row-wrap">
                <button
                    id="unimindSummarizeBtn"
                    type="button"
                    class="unimind-btn unimind-btn-primary"
                >
                    ✨ تلخيص المحاضرة
                </button>

                <button
                    id="unimindKeyPointsBtn"
                    type="button"
                    class="unimind-btn unimind-btn-secondary"
                >
                    🎯 استخراج النقاط المهمة
                </button>
            </div>

            <div
                id="unimindLectureStatus"
                style="margin-top:15px;"
            ></div>

            <div
                id="unimindLectureResult"
                style="margin-top:15px;"
            ></div>
        `;

        modal.body.appendChild(
            wrapper
        );

        const dropzone =
            document.getElementById(
                "unimindLectureDropzone"
            );

        const fileInput =
            document.getElementById(
                "unimindLectureFile"
            );

        const fileName =
            document.getElementById(
                "unimindLectureFileName"
            );

        const textInput =
            document.getElementById(
                "unimindLectureText"
            );

        const summarizeBtn =
            document.getElementById(
                "unimindSummarizeBtn"
            );

        const keyPointsBtn =
            document.getElementById(
                "unimindKeyPointsBtn"
            );

        const status =
            document.getElementById(
                "unimindLectureStatus"
            );

        const result =
            document.getElementById(
                "unimindLectureResult"
            );

        dropzone.addEventListener(
            "click",
            () => {
                fileInput.click();
            }
        );

        fileInput.addEventListener(
            "change",
            () => {
                if (
                    fileInput.files &&
                    fileInput.files[0]
                ) {
                    handleLectureFile(
                        fileInput.files[0],
                        fileName,
                        status
                    );
                }
            }
        );

        dropzone.addEventListener(
            "dragover",
            event => {
                event.preventDefault();

                dropzone.style.borderColor =
                    "#6366f1";
            }
        );

        dropzone.addEventListener(
            "dragleave",
            () => {
                dropzone.style.borderColor =
                    "";
            }
        );

        dropzone.addEventListener(
            "drop",
            event => {
                event.preventDefault();

                dropzone.style.borderColor =
                    "";

                const file =
                    event.dataTransfer
                        .files?.[0];

                if (file) {
                    selectedLectureFile =
                        file;

                    handleLectureFile(
                        file,
                        fileName,
                        status
                    );
                }
            }
        );

        summarizeBtn.addEventListener(
            "click",
            async () => {
                await processLecture(
                    "summary",
                    textInput,
                    result,
                    status,
                    summarizeBtn,
                    keyPointsBtn
                );
            }
        );

        keyPointsBtn.addEventListener(
            "click",
            async () => {
                await processLecture(
                    "keypoints",
                    textInput,
                    result,
                    status,
                    summarizeBtn,
                    keyPointsBtn
                );
            }
        );
    }

    function handleLectureFile(
        file,
        fileNameElement,
        statusElement
    ) {
        selectedLectureFile =
            file;

        const extension =
            file.name
                .split(".")
                .pop()
                .toLowerCase();

        let icon = "📄";

        if (
            extension === "pdf"
        ) {
            icon = "📕";
        }

        if (
            extension === "doc" ||
            extension === "docx"
        ) {
            icon = "📘";
        }

        if (
            extension === "txt" ||
            extension === "md"
        ) {
            icon = "📝";
        }

        fileNameElement.textContent =
            `${icon} ${file.name}`;

        statusElement.innerHTML = `
            <div class="unimind-success">
                تم اختيار الملف بنجاح. يمكنك الآن الضغط على
                <strong>تلخيص المحاضرة</strong>.
            </div>
        `;
    }

    async function processLecture(
        mode,
        textInput,
        result,
        status,
        summarizeBtn,
        keyPointsBtn
    ) {
        result.innerHTML = "";

        let text =
            textInput.value.trim();

        summarizeBtn.disabled =
            true;

        keyPointsBtn.disabled =
            true;

        status.innerHTML = `
            <div class="unimind-loading">
                <span class="unimind-dot"></span>
                جاري قراءة المحاضرة وتحليلها...
            </div>
        `;

        try {
            if (
                !text &&
                selectedLectureFile
            ) {
                text =
                    await extractLectureText(
                        selectedLectureFile
                    );
            }

            if (
                !text ||
                !text.trim()
            ) {
                throw new Error(
                    "لم يتم العثور على نص.\n" +
                    "اختر ملفاً أو الصق نص المحاضرة."
                );
            }

            text =
                text.trim();

            if (
                text.length >
                30000
            ) {
                text =
                    text.slice(
                        0,
                        30000
                    );

                status.innerHTML = `
                    <div class="unimind-success">
                        تم استخراج نص طويل، لذلك سيتم تحليل أول
                        30,000 حرف فقط.
                    </div>
                `;
            }

            let prompt = "";

            if (
                mode === "summary"
            ) {
                prompt = `
أنت مساعد دراسي جامعي.

أريد منك تلخيص المحاضرة التالية باللغة العربية بشكل منظم وواضح.

استخدم فقط المعلومات الموجودة في النص.
لا تضف معلومات غير موجودة في المحاضرة.

رتب الإجابة بهذا الشكل:

1. عنوان المحاضرة
2. ملخص عام
3. أهم المفاهيم
4. أهم النقاط
5. المصطلحات والتعريفات
6. الأشياء التي يجب على الطالب حفظها
7. أسئلة مراجعة في النهاية

نص المحاضرة:

${text}
                `;
            } else {
                prompt = `
أنت مساعد دراسي جامعي.

استخرج من المحاضرة التالية أهم النقاط التي يجب على الطالب التركيز عليها.

استخدم فقط المعلومات الموجودة في النص.
لا تضف معلومات خارج المحاضرة.

رتب الإجابة بهذا الشكل:

- أهم الأفكار
- أهم التعريفات
- القوانين أو القواعد إن وجدت
- المصطلحات المهمة
- النقاط التي قد تأتي في الاختبار
- 10 أسئلة مراجعة

نص المحاضرة:

${text}
                `;
            }

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
            `;

            status.innerHTML = `
                <div class="unimind-success">
                    ✅ اكتمل تحليل المحاضرة بنجاح.
                </div>
            `;
        } catch (
            error
        ) {
            status.innerHTML = `
                <div class="unimind-error">
                    ❌ ${escapeHTML(
                        error.message ||
                        "حدث خطأ غير معروف."
                    )}
                </div>
            `;
        } finally {
            summarizeBtn.disabled =
                false;

            keyPointsBtn.disabled =
                false;
        }
    }

    // =========================================================
    // QUIZ
    // =========================================================

    function openQuiz() {
        const modal =
            createModal({
                title:
                    "🧠 الاختبار الذكي"
            });

        const body =
            modal.body;

        body.innerHTML = `
            <div class="unimind-card">
                <h3>
                    أنشئ اختباراً من موضوعك
                </h3>

                <textarea
                    id="unimindQuizTopic"
                    class="unimind-textarea"
                    placeholder="مثال: أساسيات أمن المعلومات..."
                ></textarea>

                <div style="margin-top:15px;">
                    <label>
                        عدد الأسئلة
                    </label>

                    <select
                        id="unimindQuizCount"
                        class="unimind-select"
                    >
                        <option value="5">
                            5 أسئلة
                        </option>

                        <option
                            value="10"
                            selected
                        >
                            10 أسئلة
                        </option>

                        <option value="15">
                            15 سؤالاً
                        </option>
                    </select>
                </div>

                <button
                    id="unimindGenerateQuiz"
                    class="unimind-btn unimind-btn-primary"
                    style="margin-top:15px;"
                    type="button"
                >
                    ✨ إنشاء الاختبار
                </button>
            </div>

            <div id="unimindQuizArea"></div>
        `;

        const topic =
            document.getElementById(
                "unimindQuizTopic"
            );

        const count =
            document.getElementById(
                "unimindQuizCount"
            );

        const generate =
            document.getElementById(
                "unimindGenerateQuiz"
            );

        const area =
            document.getElementById(
                "unimindQuizArea"
            );

        generate.addEventListener(
            "click",
            async () => {
                const topicText =
                    topic.value.trim();

                if (!topicText) {
                    area.innerHTML = `
                        <div class="unimind-error">
                            اكتب موضوع الاختبار أولاً.
                        </div>
                    `;

                    return;
                }

                generate.disabled =
                    true;

                area.innerHTML = `
                    <div class="unimind-card">
                        ⏳ جاري إنشاء الاختبار...
                    </div>
                `;

                try {
                    const prompt = `
أنشئ اختباراً تعليمياً باللغة العربية عن الموضوع التالي:

${topicText}

عدد الأسئلة: ${count.value}

أريد JSON فقط بدون أي نص إضافي، بالشكل التالي:

{
  "questions": [
    {
      "question": "السؤال",
      "options": [
        "الخيار الأول",
        "الخيار الثاني",
        "الخيار الثالث",
        "الخيار الرابع"
      ],
      "answer": 0,
      "explanation": "شرح مختصر"
    }
  ]
}

مهم:
answer يجب أن يكون رقم الخيار الصحيح من 0 إلى 3.
                    `;

                    const answer =
                        await askAI(
                            prompt
                        );

                    const questions =
                        parseQuizResponse(
                            answer
                        );

                    if (
                        !questions.length
                    ) {
                        throw new Error(
                            "تعذر استخراج أسئلة صحيحة من رد الذكاء الاصطناعي."
                        );
                    }

                    quizState = {
                        questions,
                        current: 0,
                        score: 0,
                        answered: false
                    };

                    renderQuiz(
                        area
                    );
                } catch (
                    error
                ) {
                    area.innerHTML = `
                        <div class="unimind-error">
                            ❌ ${escapeHTML(
                                error.message ||
                                "حدث خطأ أثناء إنشاء الاختبار."
                            )}
                        </div>
                    `;
                } finally {
                    generate.disabled =
                        false;
                }
            }
        );
    }

    function parseQuizResponse(
        text
    ) {
        if (!text) {
            return [];
        }

        let cleaned =
            String(text)
                .trim()
                .replace(
                    /^```json/i,
                    ""
                )
                .replace(
                    /^```/i,
                    ""
                )
                .replace(
                    /```$/i,
                    ""
                )
                .trim();

        try {
            const data =
                JSON.parse(
                    cleaned
                );

            return normalizeQuestions(
                data.questions ||
                data
            );
        } catch (_) {}

        const start =
            cleaned.indexOf(
                "{"
            );

        const end =
            cleaned.lastIndexOf(
                "}"
            );

        if (
            start !== -1 &&
            end !== -1
        ) {
            try {
                const data =
                    JSON.parse(
                        cleaned.slice(
                            start,
                            end + 1
                        )
                    );

                return normalizeQuestions(
                    data.questions ||
                    data
                );
            } catch (_) {}
        }

        const arrayStart =
            cleaned.indexOf(
                "["
            );

        const arrayEnd =
            cleaned.lastIndexOf(
                "]"
            );

        if (
            arrayStart !== -1 &&
            arrayEnd !== -1
        ) {
            try {
                const data =
                    JSON.parse(
                        cleaned.slice(
                            arrayStart,
                            arrayEnd + 1
                        )
                    );

                return normalizeQuestions(
                    data
                );
            } catch (_) {}
        }

        return [];
    }

    function normalizeQuestions(
        items
    ) {
        if (
            !Array.isArray(items)
        ) {
            return [];
        }

        return items
            .map(
                item => {
                    if (!item) {
                        return null;
                    }

                    const question =
                        item.question ||
                        item.q ||
                        item.text ||
                        "";

                    const options =
                        item.options ||
                        item.choices ||
                        item.answers ||
                        [];

                    let answer =
                        item.answer ??
                        item.correctAnswer ??
                        item.correct ??
                        0;

                    if (
                        typeof answer ===
                            "string" &&
                        !/^\d+$/.test(
                            answer
                        )
                    ) {
                        const index =
                            options.findIndex(
                                option =>
                                    String(
                                        option
                                    ).trim() ===
                                    answer.trim()
                            );

                        answer =
                            index >= 0
                                ? index
                                : 0;
                    } else {
                        answer =
                            Number(
                                answer
                            );
                    }

                    if (
                        !question ||
                        !Array.isArray(
                            options
                        ) ||
                        options.length <
                            2
                    ) {
                        return null;
                    }

                    return {
                        question:
                            String(
                                question
                            ),

                        options:
                            options.map(
                                String
                            ),

                        answer:
                            Math.max(
                                0,
                                Math.min(
                                    answer,
                                    options.length -
                                        1
                                )
                            ),

                        explanation:
                            item.explanation ||
                            item.explain ||
                            ""
                    };
                }
            )
            .filter(Boolean);
    }

    function renderQuiz(
        area
    ) {
        const question =
            quizState.questions[
                quizState.current
            ];

        if (!question) {
            renderQuizResult(
                area
            );

            return;
        }

        const total =
            quizState.questions.length;

        const current =
            quizState.current +
            1;

        const progress =
            ((current - 1) /
                total) *
            100;

        area.innerHTML = `
            <div class="unimind-card">
                <div>
                    السؤال ${current}
                    من ${total}
                </div>

                <div class="unimind-progress">
                    <div
                        class="unimind-progress-bar"
                        style="width:${progress}%"
                    ></div>
                </div>

                <h3>
                    ${escapeHTML(
                        question.question
                    )}
                </h3>

                <div
                    id="unimindQuizOptions"
                ></div>

                <div
                    id="unimindQuizExplanation"
                    style="margin-top:15px;"
                ></div>
            </div>
        `;

        const options =
            document.getElementById(
                "unimindQuizOptions"
            );

        question.options.forEach(
            (
                option,
                index
            ) => {
                const button =
                    document.createElement(
                        "button"
                    );

                button.type =
                    "button";

                button.className =
                    "unimind-option";

                button.textContent =
                    option;

                button.addEventListener(
                    "click",
                    () =>
                        answerQuiz(
                            index,
                            area
                        )
                );

                options.appendChild(
                    button
                );
            }
        );
    }

    function answerQuiz(
        index,
        area
    ) {
        if (
            quizState.answered
        ) {
            return;
        }

        quizState.answered =
            true;

        const question =
            quizState.questions[
                quizState.current
            ];

        const buttons =
            document.querySelectorAll(
                "#unimindQuizOptions .unimind-option"
            );

        buttons.forEach(
            (
                button,
                buttonIndex
            ) => {
                if (
                    buttonIndex ===
                    question.answer
                ) {
                    button.classList.add(
                        "correct"
                    );
                }

                if (
                    buttonIndex ===
                        index &&
                    index !==
                        question.answer
                ) {
                    button.classList.add(
                        "wrong"
                    );
                }

                button.disabled =
                    true;
            }
        );

        if (
            index ===
            question.answer
        ) {
            quizState.score++;
        }

        const explanation =
            document.getElementById(
                "unimindQuizExplanation"
            );

        explanation.innerHTML = `
            <div class="${
                index ===
                question.answer
                    ? "unimind-success"
                    : "unimind-error"
            }">
                <strong>
                    ${
                        index ===
                        question.answer
                            ? "✅ إجابة صحيحة!"
                            : "❌ إجابة غير صحيحة"
                    }
                </strong>

                ${
                    question.explanation
                        ? `<br>${escapeHTML(
                              question.explanation
                          )}`
                        : ""
                }

                <br><br>

                <button
                    id="unimindNextQuestion"
                    class="unimind-btn unimind-btn-primary"
                    type="button"
                >
                    ${
                        quizState.current +
                            1 <
                        quizState.questions.length
                            ? "السؤال التالي ←"
                            : "عرض النتيجة"
                    }
                </button>
            </div>
        `;

        document
            .getElementById(
                "unimindNextQuestion"
            )
            .addEventListener(
                "click",
                () => {
                    quizState.current++;

                    quizState.answered =
                        false;

                    renderQuiz(
                        area
                    );
                }
            );
    }

    function renderQuizResult(
        area
    ) {
        const total =
            quizState.questions.length;

        const score =
            quizState.score;

        const percentage =
            total
                ? Math.round(
                      (score /
                          total) *
                          100
                  )
                : 0;

        area.innerHTML = `
            <div class="unimind-card">
                <h2>
                    🎉 انتهى الاختبار
                </h2>

                <div class="unimind-success">
                    النتيجة:
                    <strong>
                        ${score} / ${total}
                    </strong>

                    <br>

                    النسبة:
                    <strong>
                        ${percentage}%
                    </strong>
                </div>

                <button
                    id="unimindRestartQuiz"
                    class="unimind-btn unimind-btn-primary"
                    style="margin-top:15px;"
                    type="button"
                >
                    🔄 إعادة الاختبار
                </button>
            </div>
        `;

        document
            .getElementById(
                "unimindRestartQuiz"
            )
            .addEventListener(
                "click",
                () => {
                    quizState.current =
                        0;

                    quizState.score =
                        0;

                    quizState.answered =
                        false;

                    renderQuiz(
                        area
                    );
                }
            );
    }

    // =========================================================
    // FLASHCARDS
    // =========================================================

    function openFlashcards() {
        const modal =
            createModal({
                title:
                    "🗂️ البطاقات التعليمية"
            });

        modal.body.innerHTML = `
            <div class="unimind-card">
                <h3>
                    أنشئ بطاقات تعليمية
                </h3>

                <textarea
                    id="unimindFlashcardTopic"
                    class="unimind-textarea"
                    placeholder="مثال: الشبكات وأمن المعلومات..."
                ></textarea>

                <button
                    id="unimindGenerateFlashcards"
                    class="unimind-btn unimind-btn-primary"
                    style="margin-top:15px;"
                    type="button"
                >
                    ✨ إنشاء البطاقات
                </button>
            </div>

            <div
                id="unimindFlashcardArea"
            ></div>
        `;

        const topic =
            document.getElementById(
                "unimindFlashcardTopic"
            );

        const button =
            document.getElementById(
                "unimindGenerateFlashcards"
            );

        const area =
            document.getElementById(
                "unimindFlashcardArea"
            );

        button.addEventListener(
            "click",
            async () => {
                const value =
                    topic.value.trim();

                if (!value) {
                    area.innerHTML = `
                        <div class="unimind-error">
                            اكتب موضوع البطاقات أولاً.
                        </div>
                    `;

                    return;
                }

                button.disabled =
                    true;

                area.innerHTML = `
                    <div class="unimind-card">
                        ⏳ جاري إنشاء البطاقات...
                    </div>
                `;

                try {
                    const prompt = `
أنشئ بطاقات تعليمية باللغة العربية عن:

${value}

أريد JSON فقط:

{
  "cards": [
    {
      "front": "السؤال أو المصطلح",
      "back": "الإجابة أو التعريف"
    }
  ]
}

أنشئ 10 بطاقات.
                    `;

                    const answer =
                        await askAI(
                            prompt
                        );

                    const cards =
                        parseFlashcards(
                            answer
                        );

                    if (
                        !cards.length
                    ) {
                        throw new Error(
                            "تعذر إنشاء البطاقات."
                        );
                    }

                    flashcardState = {
                        cards,
                        current: 0
                    };

                    renderFlashcards(
                        area
                    );
                } catch (
                    error
                ) {
                    area.innerHTML = `
                        <div class="unimind-error">
                            ❌ ${escapeHTML(
                                error.message
                            )}
                        </div>
                    `;
                } finally {
                    button.disabled =
                        false;
                }
            }
        );
    }

    function parseFlashcards(
        text
    ) {
        if (!text) {
            return [];
        }

        let cleaned =
            String(text)
                .replace(
                    /^```json/i,
                    ""
                )
                .replace(
                    /^```/i,
                    ""
                )
                .replace(
                    /```$/i,
                    ""
                )
                .trim();

        try {
            const data =
                JSON.parse(
                    cleaned
                );

            return normalizeFlashcards(
                data.cards ||
                data
            );
        } catch (_) {}

        const start =
            cleaned.indexOf(
                "{"
            );

        const end =
            cleaned.lastIndexOf(
                "}"
            );

        if (
            start !== -1 &&
            end !== -1
        ) {
            try {
                const data =
                    JSON.parse(
                        cleaned.slice(
                            start,
                            end + 1
                        )
                    );

                return normalizeFlashcards(
                    data.cards ||
                    data
                );
            } catch (_) {}
        }

        const arrayStart =
            cleaned.indexOf(
                "["
            );

        const arrayEnd =
            cleaned.lastIndexOf(
                "]"
            );

        if (
            arrayStart !== -1 &&
            arrayEnd !== -1
        ) {
            try {
                const data =
                    JSON.parse(
                        cleaned.slice(
                            arrayStart,
                            arrayEnd + 1
                        )
                    );

                return normalizeFlashcards(
                    data
                );
            } catch (_) {}
        }

        return [];
    }

    function normalizeFlashcards(
        items
    ) {
        if (
            !Array.isArray(items)
        ) {
            return [];
        }

        return items
            .map(
                item => ({
                    front: String(
                        item.front ||
                        item.question ||
                        item.term ||
                        ""
                    ),

                    back: String(
                        item.back ||
                        item.answer ||
                        item.definition ||
                        ""
                    )
                })
            )
            .filter(
                card =>
                    card.front &&
                    card.back
            );
    }

    function renderFlashcards(
        area
    ) {
        if (
            !flashcardState.cards.length
        ) {
            return;
        }

        const card =
            flashcardState.cards[
                flashcardState.current
            ];

        let showingBack =
            false;

        area.innerHTML = `
            <div class="unimind-muted">
                البطاقة
                ${
                    flashcardState.current +
                    1
                }
                من
                ${flashcardState.cards.length}
            </div>

            <div
                id="unimindFlashcard"
                class="unimind-flashcard"
                style="margin-top:10px;"
            >
                ${escapeHTML(
                    card.front
                )}
            </div>

            <p
                class="unimind-muted"
                style="text-align:center;"
            >
                اضغط على البطاقة لقلبها
            </p>

            <div class="unimind-row-wrap">
                <button
                    id="unimindPrevCard"
                    class="unimind-btn unimind-btn-secondary"
                    type="button"
                >
                    → السابقة
                </button>

                <button
                    id="unimindNextCard"
                    class="unimind-btn unimind-btn-primary"
                    type="button"
                >
                    التالية ←
                </button>
            </div>
        `;

        const flashcard =
            document.getElementById(
                "unimindFlashcard"
            );

        flashcard.addEventListener(
            "click",
            () => {
                showingBack =
                    !showingBack;

                flashcard.textContent =
                    showingBack
                        ? card.back
                        : card.front;
            }
        );

        document
            .getElementById(
                "unimindPrevCard"
            )
            .addEventListener(
                "click",
                () => {
                    if (
                        flashcardState.current >
                        0
                    ) {
                        flashcardState.current--;

                        renderFlashcards(
                            area
                        );
                    }
                }
            );

        document
            .getElementById(
                "unimindNextCard"
            )
            .addEventListener(
                "click",
                () => {
                    if (
                        flashcardState.current <
                        flashcardState.cards.length -
                            1
                    ) {
                        flashcardState.current++;

                        renderFlashcards(
                            area
                        );
                    }
                }
            );
    }

    // =========================================================
    // STUDY PLANNER
    // =========================================================

    function openPlanner() {
        const modal =
            createModal({
                title:
                    "📅 مخطط الدراسة الذكي"
            });

        modal.body.innerHTML = `
            <div class="unimind-card">
                <h3>
                    أنشئ خطة دراسية
                </h3>

                <input
                    id="unimindPlanSubjects"
                    class="unimind-input"
                    placeholder="المواد: برمجة، شبكات، أمن معلومات..."
                />

                <input
                    id="unimindPlanDays"
                    class="unimind-input"
                    type="number"
                    min="1"
                    max="30"
                    value="7"
                    style="margin-top:10px;"
                />

                <input
                    id="unimindPlanHours"
                    class="unimind-input"
                    type="number"
                    min="1"
                    max="16"
                    value="3"
                    style="margin-top:10px;"
                    placeholder="عدد ساعات الدراسة يومياً"
                />

                <button
                    id="unimindGeneratePlan"
                    class="unimind-btn unimind-btn-primary"
                    style="margin-top:15px;"
                    type="button"
                >
                    ✨ إنشاء الخطة
                </button>
            </div>

            <div
                id="unimindPlanResult"
            ></div>
        `;

        const subjects =
            document.getElementById(
                "unimindPlanSubjects"
            );

        const days =
            document.getElementById(
                "unimindPlanDays"
            );

        const hours =
            document.getElementById(
                "unimindPlanHours"
            );

        const button =
            document.getElementById(
                "unimindGeneratePlan"
            );

        const result =
            document.getElementById(
                "unimindPlanResult"
            );

        button.addEventListener(
            "click",
            async () => {
                const subjectText =
                    subjects.value.trim();

                if (!subjectText) {
                    result.innerHTML = `
                        <div class="unimind-error">
                            اكتب المواد الدراسية أولاً.
                        </div>
                    `;

                    return;
                }

                button.disabled =
                    true;

                result.innerHTML = `
                    <div class="unimind-card">
                        ⏳ جاري إعداد الخطة...
                    </div>
                `;

                try {
                    const prompt = `
أنشئ خطة دراسية باللغة العربية.

المواد:
${subjectText}

عدد الأيام:
${days.value}

عدد ساعات الدراسة يومياً:
${hours.value}

رتب الخطة يومياً مع:
- المادة
- الموضوع
- الوقت المقترح
- مهمة اليوم

اجعلها عملية ومناسبة لطالب جامعي.
                    `;

                    const answer =
                        await askAI(
                            prompt
                        );

                    studyPlan =
                        answer;

                    result.innerHTML = `
                        <div class="unimind-result">
                            ${escapeHTML(
                                answer
                            )}
                        </div>
                    `;
                } catch (
                    error
                ) {
                    result.innerHTML = `
                        <div class="unimind-error">
                            ❌ ${escapeHTML(
                                error.message
                            )}
                        </div>
                    `;
                } finally {
                    button.disabled =
                        false;
                }
            }
        );
    }

    // =========================================================
    // CV ASSISTANT
    // =========================================================

    function openCVAssistant() {
        const modal =
            createModal({
                title:
                    "📄 مساعد السيرة الذاتية"
            });

        modal.body.innerHTML = `
            <div class="unimind-card">
                <h3>
                    أنشئ أو حسّن سيرتك الذاتية
                </h3>

                <textarea
                    id="unimindCVInput"
                    class="unimind-textarea"
                    placeholder="اكتب معلوماتك هنا..."
                ></textarea>

                <select
                    id="unimindCVLanguage"
                    class="unimind-select"
                    style="margin-top:10px;"
                >
                    <option value="العربية">
                        العربية
                    </option>

                    <option value="English">
                        English
                    </option>
                </select>

                <button
                    id="unimindGenerateCV"
                    class="unimind-btn unimind-btn-primary"
                    style="margin-top:15px;"
                    type="button"
                >
                    ✨ تحسين السيرة الذاتية
                </button>
            </div>

            <div
                id="unimindCVResult"
            ></div>
        `;

        const input =
            document.getElementById(
                "unimindCVInput"
            );

        const language =
            document.getElementById(
                "unimindCVLanguage"
            );

        const button =
            document.getElementById(
                "unimindGenerateCV"
            );

        const result =
            document.getElementById(
                "unimindCVResult"
            );

        button.addEventListener(
            "click",
            async () => {
                const value =
                    input.value.trim();

                if (!value) {
                    result.innerHTML = `
                        <div class="unimind-error">
                            اكتب بيانات سيرتك الذاتية أولاً.
                        </div>
                    `;

                    return;
                }

                button.disabled =
                    true;

                result.innerHTML = `
                    <div class="unimind-card">
                        ⏳ جاري تحسين السيرة الذاتية...
                    </div>
                `;

                try {
                    const prompt = `
أنت خبير في كتابة السير الذاتية.

حسّن السيرة الذاتية التالية.

اللغة المطلوبة:
${language.value}

اجعلها:
- احترافية
- واضحة
- مناسبة للتوظيف
- منظمة
- بدون اختلاق معلومات غير موجودة

البيانات:

${value}
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
                    `;
                } catch (
                    error
                ) {
                    result.innerHTML = `
                        <div class="unimind-error">
                            ❌ ${escapeHTML(
                                error.message
                            )}
                        </div>
                    `;
                } finally {
                    button.disabled =
                        false;
                }
            }
        );
    }

    // =========================================================
    // BUTTON BINDING
    // =========================================================

    function bindOnce(
        element,
        handler
    ) {
        if (!element) {
            return false;
        }

        if (
            element.dataset &&
            element.dataset.unimindBound ===
                "true"
        ) {
            return false;
        }

        element.addEventListener(
            "click",
            function (event) {
                event.preventDefault();
                event.stopPropagation();

                try {
                    handler(event);
                } catch (
                    error
                ) {
                    console.error(
                        "UniMind button error:",
                        error
                    );
                }
            }
        );

        if (element.dataset) {
            element.dataset.unimindBound =
                "true";
        }

        return true;
    }

    function bindSelectors(
        selectors,
        handler
    ) {
        let found = false;

        selectors.forEach(
            selector => {
                document
                    .querySelectorAll(
                        selector
                    )
                    .forEach(
                        element => {
                            if (
                                bindOnce(
                                    element,
                                    handler
                                )
                            ) {
                                found =
                                    true;
                            }
                        }
                    );
            }
        );

        return found;
    }

    function findClickableByText(
        phrases
    ) {
        const elements =
            document.querySelectorAll(
                "button, a, [role='button'], .feature-card, .feature-item, .tool-card, .tool-item"
            );

        for (
            const element of
                elements
        ) {
            const text =
                (
                    element.innerText ||
                    element.textContent ||
                    ""
                )
                    .trim()
                    .toLowerCase();

            if (!text) {
                continue;
            }

            for (
                const phrase of
                    phrases
            ) {
                if (
                    text.includes(
                        phrase.toLowerCase()
                    )
                ) {
                    return element;
                }
            }
        }

        return null;
    }

    function setupButtons() {
        bindSelectors(
            [
                "#studyAssistantButton",
                "#studyAssistantBtn",
                "#studyAssistant",
                "#aiChatButton",
                "#aiChatBtn",
                "#chatButton",
                "#chatBtn",
                "#assistantButton",
                "#assistantBtn",
                "[data-action='chat']",
                "[data-action='assistant']",
                "[data-feature='chat']",
                "[data-feature='assistant']"
            ],
            openChat
        );

        bindSelectors(
            [
                "#lectureSummarizerButton",
                "#lectureSummarizerBtn",
                "#lectureSummarizer",
                "#summarizerButton",
                "#summarizerBtn",
                "#lectureButton",
                "#lectureBtn",
                "#lectureSummaryButton",
                "#lectureSummaryBtn",
                "[data-action='lecture']",
                "[data-action='summarizer']",
                "[data-action='summary']",
                "[data-feature='lecture']",
                "[data-feature='summarizer']"
            ],
            openLectureSummarizer
        );

        bindSelectors(
            [
                "#quizButton",
                "#quizBtn",
                "#smartQuizButton",
                "#smartQuizBtn",
                "#quiz",
                "[data-action='quiz']",
                "[data-feature='quiz']"
            ],
            openQuiz
        );

        bindSelectors(
            [
                "#flashcardsButton",
                "#flashcardsBtn",
                "#flashcardButton",
                "#flashcardBtn",
                "#flashcards",
                "[data-action='flashcards']",
                "[data-action='flashcard']",
                "[data-feature='flashcards']"
            ],
            openFlashcards
        );

        bindSelectors(
            [
                "#plannerButton",
                "#plannerBtn",
                "#studyPlannerButton",
                "#studyPlannerBtn",
                "#planner",
                "[data-action='planner']",
                "[data-action='study-planner']",
                "[data-feature='planner']"
            ],
            openPlanner
        );

        bindSelectors(
            [
                "#cvButton",
                "#cvBtn",
                "#cvAssistantButton",
                "#cvAssistantBtn",
                "#cvAssistant",
                "[data-action='cv']",
                "[data-action='cv-assistant']",
                "[data-feature='cv']"
            ],
            openCVAssistant
        );

        bindSelectors(
            [
                "#ctaStartButton",
                "#ctaBottomButton",
                "#heroDemoButton",
                "#heroChatButton",
                "#startLearningButton",
                "#tryDemoButton"
            ],
            openChat
        );

        const chatElement =
            findClickableByText([
                "مساعد الدراسة الذكي",
                "مساعد الدراسة",
                "مساعد ذكي",
                "ai chat"
            ]);

        if (chatElement) {
            bindOnce(
                chatElement,
                openChat
            );
        }

        const lectureElement =
            findClickableByText([
                "تلخيص المحاضرات",
                "تلخيص المحاضرة",
                "تلخيص محاضرة",
                "lecture summarizer",
                "summarizer"
            ]);

        if (lectureElement) {
            bindOnce(
                lectureElement,
                openLectureSummarizer
            );
        }

        const quizElement =
            findClickableByText([
                "اختبار",
                "اختبارات",
                "quiz"
            ]);

        if (quizElement) {
            bindOnce(
                quizElement,
                openQuiz
            );
        }

        const flashElement =
            findClickableByText([
                "بطاقات",
                "البطاقات التعليمية",
                "flashcards"
            ]);

        if (flashElement) {
            bindOnce(
                flashElement,
                openFlashcards
            );
        }

        const plannerElement =
            findClickableByText([
                "مخطط الدراسة",
                "خطة الدراسة",
                "study planner"
            ]);

        if (plannerElement) {
            bindOnce(
                plannerElement,
                openPlanner
            );
        }

        const cvElement =
            findClickableByText([
                "السيرة الذاتية",
                "مساعد السيرة",
                "cv assistant"
            ]);

        if (cvElement) {
            bindOnce(
                cvElement,
                openCVAssistant
            );
        }

        console.log(
            "UniMind AI buttons connected successfully."
        );
    }

    // =========================================================
    // THEME
    // =========================================================

    function setupTheme() {
        const themeButtons =
            document.querySelectorAll(
                "[data-theme], #themeToggle, #themeButton"
            );

        themeButtons.forEach(
            button => {
                bindOnce(
                    button,
                    () => {
                        document.body.classList.toggle(
                            "dark-mode"
                        );

                        const isDark =
                            document.body.classList.contains(
                                "dark-mode"
                            );

                        const theme =
                            isDark
                                ? "dark"
                                : "light";

                        localStorage.setItem(
                            "unimind-theme",
                            theme
                        );

                        saveUserPreference(
                            "theme",
                            theme
                        );
                    }
                );
            }
        );

        const savedTheme =
            localStorage.getItem(
                "unimind-theme"
            );

        if (
            savedTheme === "dark"
        ) {
            document.body.classList.add(
                "dark-mode"
            );
        }
    }

    // =========================================================
    // LANGUAGE
    // =========================================================

    function setupLanguage() {
        const languageButtons =
            document.querySelectorAll(
                "[data-language], #languageToggle, #languageButton"
            );

        languageButtons.forEach(
            button => {
                bindOnce(
                    button,
                    () => {
                        const current =
                            document
                                .documentElement
                                .lang ||
                            "ar";

                        const next =
                            current ===
                            "ar"
                                ? "en"
                                : "ar";

                        document
                            .documentElement
                            .lang =
                            next;

                        document
                            .documentElement
                            .dir =
                            next ===
                            "ar"
                                ? "rtl"
                                : "ltr";

                        localStorage.setItem(
                            "unimind-language",
                            next
                        );

                        saveUserPreference(
                            "language",
                            next
                        );
                    }
                );
            }
        );

        const saved =
            localStorage.getItem(
                "unimind-language"
            );

        if (saved) {
            document
                .documentElement
                .lang =
                saved;

            document
                .documentElement
                .dir =
                saved === "ar"
                    ? "rtl"
                    : "ltr";
        }
    }

    // =========================================================
    // KEYBOARD SHORTCUTS
    // =========================================================

    function setupKeyboard() {
        document.addEventListener(
            "keydown",
            event => {
                if (
                    event.ctrlKey &&
                    event.shiftKey &&
                    event.key.toLowerCase() ===
                        "a"
                ) {
                    event.preventDefault();

                    openChat();
                }
            }
        );
    }

    // =========================================================
    // GLOBAL FUNCTIONS
    // =========================================================

    window.UniMindAI = {
        openChat,
        openLectureSummarizer,
        openQuiz,
        openFlashcards,
        openPlanner,
        openCVAssistant,
        askAI,
        extractLectureText,
        showAuthModal,
        showAccountModal,
        handleLogout
    };

    window.openChat =
        openChat;

    window.openLectureSummarizer =
        openLectureSummarizer;

    window.openQuiz =
        openQuiz;

    window.openFlashcards =
        openFlashcards;

    window.openPlanner =
        openPlanner;

    window.openCVAssistant =
        openCVAssistant;

    // =========================================================
    // STARTUP
    // =========================================================

    async function init() {
        injectStyles();

        setupButtons();

        setupTheme();

        setupLanguage();

        setupLogin();

        setupKeyboard();

        console.log(
            "🚀 UniMind AI initialized successfully."
        );

        await initializeAuth();
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

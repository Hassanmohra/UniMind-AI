document.addEventListener("DOMContentLoaded", () => {

    const API_URL =
        "https://yzsfublvnwknjnayfosm.supabase.co/functions/v1/unimind-chat";

    let savedScrollY = 0;


    /* =========================================================
       CHAT MODAL
    ========================================================= */

    function createChatModal() {

        const modal = document.createElement("div");

        modal.id = "unimind-chat-modal";
        modal.className = "unimind-chat-modal";

        modal.innerHTML = `
            <div class="unimind-chat-overlay"></div>

            <div class="unimind-chat-window">

                <div class="unimind-chat-header">

                    <div class="unimind-chat-brand">

                        <div class="unimind-chat-logo">
                            ✦
                        </div>

                        <div>
                            <strong>
                                UniMind AI
                            </strong>

                            <span>
                                AI Assistant Online
                            </span>
                        </div>

                    </div>

                    <div class="unimind-chat-actions">

                        <button
                            type="button"
                            id="unimind-chat-new"
                            aria-label="محادثة جديدة"
                        >
                            ＋
                        </button>

                        <button
                            type="button"
                            id="unimind-chat-close"
                            aria-label="إغلاق"
                        >
                            ×
                        </button>

                    </div>

                </div>


                <div
                    class="unimind-chat-messages"
                    id="unimind-chat-messages"
                >

                    <div class="unimind-welcome-message">

                        <div class="unimind-welcome-icon">
                            ✦
                        </div>

                        <h2>
                            كيف يمكنني مساعدتك اليوم؟
                        </h2>

                        <p>
                            اسألني عن المحاضرات، البرمجة،
                            المواد الجامعية، الاختبارات،
                            الأبحاث أو أي موضوع تدرسه.
                        </p>

                    </div>


                    <div class="unimind-suggestions">

                        <button
                            type="button"
                            data-suggestion="اشرح لي هذه المحاضرة بطريقة بسيطة"
                        >
                            📚 اشرح محاضرة
                        </button>

                        <button
                            type="button"
                            data-suggestion="أنشئ لي خطة دراسية لهذا الأسبوع"
                        >
                            📅 أنشئ خطة دراسة
                        </button>

                        <button
                            type="button"
                            data-suggestion="اختبرني في موضوع جامعي"
                        >
                            🧠 اختبر معلوماتي
                        </button>

                        <button
                            type="button"
                            data-suggestion="اشرح لي مفهومًا في البرمجة"
                        >
                            💻 اشرح البرمجة
                        </button>

                    </div>

                </div>


                <div class="unimind-chat-input-area">

                    <textarea
                        id="unimind-chat-input"
                        placeholder="اكتب سؤالك هنا..."
                        rows="1"
                    ></textarea>

                    <button
                        type="button"
                        id="unimind-chat-send"
                        aria-label="إرسال"
                    >
                        ➤
                    </button>

                </div>


                <div class="unimind-chat-footer">

                    UniMind AI يمكن أن يخطئ.
                    تحقق من المعلومات المهمة.

                    <span>
                        اضغط Enter للإرسال
                    </span>

                </div>

            </div>
        `;

        return modal;
    }


    /* =========================================================
       OPEN CHAT
       تعديل آمن فقط لفتح النافذة
    ========================================================= */

    function openChat() {

        let modal =
            document.getElementById(
                "unimind-chat-modal"
            );


        if (!modal) {

            modal =
                createChatModal();

            document.body.appendChild(modal);

            initializeChat();
        }


        /*
         * حفظ مكان الصفحة الحالي
         * حتى لا يقفز الموقع إلى الأسفل
         */

        savedScrollY =
            window.scrollY ||
            window.pageYOffset ||
            0;


        /*
         * لا نغيّر CSS الأساسي للتصميم.
         * فقط نضيف class الفتح الموجودة أصلًا.
         */

        modal.classList.add("active");

        document.body.classList.add(
            "unimind-chat-open"
        );


        /*
         * التركيز بدون تحريك الصفحة
         */

        const textarea =
            modal.querySelector(
                "#unimind-chat-input"
            );


        setTimeout(() => {

            try {

                textarea?.focus({
                    preventScroll: true
                });

            } catch {

                textarea?.focus();

            }

        }, 250);
    }


    /* =========================================================
       CLOSE CHAT
    ========================================================= */

    function closeChat() {

        const modal =
            document.getElementById(
                "unimind-chat-modal"
            );


        if (!modal) {
            return;
        }


        modal.classList.remove("active");

        document.body.classList.remove(
            "unimind-chat-open"
        );


        /*
         * إعادة الصفحة إلى مكانها
         */

        requestAnimationFrame(() => {

            window.scrollTo(
                0,
                savedScrollY
            );

        });
    }


    /* =========================================================
       INITIALIZE CHAT
    ========================================================= */

    function initializeChat() {

        const modal =
            document.getElementById(
                "unimind-chat-modal"
            );


        if (!modal) {
            return;
        }


        const closeButton =
            modal.querySelector(
                "#unimind-chat-close"
            );


        const overlay =
            modal.querySelector(
                ".unimind-chat-overlay"
            );


        const newButton =
            modal.querySelector(
                "#unimind-chat-new"
            );


        const sendButton =
            modal.querySelector(
                "#unimind-chat-send"
            );


        const textarea =
            modal.querySelector(
                "#unimind-chat-input"
            );


        /* CLOSE */

        closeButton?.addEventListener(
            "click",
            (event) => {

                event.preventDefault();
                event.stopPropagation();

                closeChat();

            }
        );


        /* OVERLAY */

        overlay?.addEventListener(
            "click",
            () => {

                closeChat();

            }
        );


        /* NEW CHAT */

        newButton?.addEventListener(
            "click",
            () => {

                const messages =
                    modal.querySelector(
                        "#unimind-chat-messages"
                    );


                if (!messages) {
                    return;
                }


                messages.innerHTML = `

                    <div class="unimind-welcome-message">

                        <div class="unimind-welcome-icon">
                            ✦
                        </div>

                        <h2>
                            كيف يمكنني مساعدتك اليوم؟
                        </h2>

                        <p>
                            اسألني عن المحاضرات،
                            البرمجة، المواد الجامعية،
                            الاختبارات أو الأبحاث.
                        </p>

                    </div>


                    <div class="unimind-suggestions">

                        <button
                            type="button"
                            data-suggestion="اشرح لي هذه المحاضرة بطريقة بسيطة"
                        >
                            📚 اشرح محاضرة
                        </button>

                        <button
                            type="button"
                            data-suggestion="أنشئ لي خطة دراسية لهذا الأسبوع"
                        >
                            📅 أنشئ خطة دراسة
                        </button>

                        <button
                            type="button"
                            data-suggestion="اختبرني في موضوع جامعي"
                        >
                            🧠 اختبر معلوماتي
                        </button>

                        <button
                            type="button"
                            data-suggestion="اشرح لي مفهومًا في البرمجة"
                        >
                            💻 اشرح البرمجة
                        </button>

                    </div>
                `;

                initializeSuggestions();

            }
        );


        /* SEND */

        sendButton?.addEventListener(
            "click",
            () => {

                sendMessage();

            }
        );


        /* ENTER */

        textarea?.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.key === "Enter" &&
                    !event.shiftKey
                ) {

                    event.preventDefault();

                    sendMessage();

                }

            }
        );


        /* AUTO RESIZE */

        textarea?.addEventListener(
            "input",
            () => {

                textarea.style.height =
                    "auto";

                textarea.style.height =
                    Math.min(
                        textarea.scrollHeight,
                        140
                    ) + "px";

            }
        );


        initializeSuggestions();
    }


    /* =========================================================
       SUGGESTIONS
    ========================================================= */

    function initializeSuggestions() {

        document
            .querySelectorAll(
                "#unimind-chat-modal [data-suggestion]"
            )
            .forEach(
                (button) => {

                    button.onclick = () => {

                        const modal =
                            document.getElementById(
                                "unimind-chat-modal"
                            );


                        const textarea =
                            modal?.querySelector(
                                "#unimind-chat-input"
                            );


                        if (!textarea) {
                            return;
                        }


                        textarea.value =
                            button.dataset.suggestion || "";


                        textarea.dispatchEvent(
                            new Event("input")
                        );


                        try {

                            textarea.focus({
                                preventScroll: true
                            });

                        } catch {

                            textarea.focus();

                        }

                    };

                }
            );
    }


    /* =========================================================
       SEND MESSAGE
    ========================================================= */

    async function sendMessage() {

        const modal =
            document.getElementById(
                "unimind-chat-modal"
            );


        const textarea =
            modal?.querySelector(
                "#unimind-chat-input"
            );


        const messages =
            modal?.querySelector(
                "#unimind-chat-messages"
            );


        if (
            !textarea ||
            !messages
        ) {

            return;

        }


        const message =
            textarea.value.trim();


        if (!message) {
            return;
        }


        addUserMessage(
            messages,
            message
        );


        textarea.value = "";
        textarea.style.height = "auto";


        const loading =
            addLoadingMessage(
                messages
            );


        scrollMessagesToBottom(
            messages
        );


        try {

            const reply =
                await callUniMindAI(
                    message
                );


            loading.remove();


            addAIMessage(
                messages,
                reply
            );


        } catch (error) {

            loading.remove();


            addAIMessage(
                messages,
                getReadableError(
                    error
                )
            );

        }


        scrollMessagesToBottom(
            messages
        );
    }


    /* =========================================================
       USER MESSAGE
    ========================================================= */

    function addUserMessage(
        container,
        text
    ) {

        const element =
            document.createElement(
                "div"
            );


        element.className =
            "unimind-message unimind-user-message";


        element.innerHTML = `
            <div class="unimind-message-content">
                ${escapeHTML(text)}
            </div>
        `;


        container.appendChild(
            element
        );
    }


    /* =========================================================
       LOADING
    ========================================================= */

    function addLoadingMessage(
        container
    ) {

        const element =
            document.createElement(
                "div"
            );


        element.className =
            "unimind-message unimind-ai-message unimind-loading";


        element.innerHTML = `

            <div class="unimind-message-header">

                <span>
                    ✦
                </span>

                UniMind AI

            </div>

            <div class="unimind-loading-dots">

                <span></span>
                <span></span>
                <span></span>

            </div>

        `;


        container.appendChild(
            element
        );


        return element;
    }


    /* =========================================================
       AI MESSAGE
    ========================================================= */

    function addAIMessage(
        container,
        text
    ) {

        const element =
            document.createElement(
                "div"
            );


        element.className =
            "unimind-message unimind-ai-message";


        element.innerHTML = `

            <div class="unimind-message-header">

                <span>
                    ✦
                </span>

                UniMind AI

            </div>

            <div class="unimind-message-content">

                ${formatAIResponse(text)}

            </div>

        `;


        container.appendChild(
            element
        );
    }


    /* =========================================================
       GEMINI / SUPABASE
    ========================================================= */

    async function callUniMindAI(
        message
    ) {

        const response =
            await fetch(
                API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        message: message
                    })
                }
            );


        const data =
            await response
                .json()
                .catch(() => ({}));


        if (!response.ok) {

            const error =
                new Error(
                    data?.details ||
                    data?.error ||
                    `HTTP_${response.status}`
                );


            error.status =
                response.status;


            throw error;
        }


        if (
            !data ||
            typeof data.reply !== "string"
        ) {

            throw new Error(
                "INVALID_RESPONSE"
            );

        }


        return data.reply;
    }


    /* =========================================================
       ERROR HANDLING
    ========================================================= */

    function getReadableError(
        error
    ) {

        const message =
            String(
                error?.message ||
                error ||
                ""
            );


        if (
            error?.status === 401 ||
            message.includes("401")
        ) {

            return "حدث خطأ في المصادقة مع خدمة الذكاء الاصطناعي.";

        }


        if (
            error?.status === 403 ||
            message.includes("403")
        ) {

            return "تم رفض الطلب من خدمة الذكاء الاصطناعي.";

        }


        if (
            error?.status === 429 ||
            message.includes("429")
        ) {

            return "تم الوصول إلى حد الاستخدام مؤقتًا. حاول مرة أخرى بعد قليل.";

        }


        if (
            message.includes("503") ||
            message.includes("HTTP_503") ||
            message.includes("high demand")
        ) {

            return "خدمة Gemini مشغولة حاليًا بسبب ارتفاع الطلب. حاول مرة أخرى بعد قليل.";

        }


        if (
            message.includes("GEMINI_API_KEY")
        ) {

            return "مفتاح Gemini غير مضبوط في الخادم.";

        }


        if (
            message.includes("Gemini API Error")
        ) {

            return "حدث خطأ أثناء الاتصال بخدمة Gemini.";

        }


        if (
            message.includes("INVALID_RESPONSE")
        ) {

            return "تم الاتصال بالخدمة ولكن لم تصل إجابة صحيحة.";

        }


        return "حدث خطأ أثناء الاتصال بمساعد UniMind AI. حاول مرة أخرى.";
    }


    /* =========================================================
       FORMAT RESPONSE
    ========================================================= */

    function formatAIResponse(
        text
    ) {

        if (!text) {
            return "";
        }


        let result =
            escapeHTML(text);


        result =
            result.replace(
                /\*\*(.*?)\*\*/g,
                "<strong>$1</strong>"
            );


        result =
            result.replace(
                /^### (.*)$/gm,
                "<h4>$1</h4>"
            );


        result =
            result.replace(
                /^## (.*)$/gm,
                "<h3>$1</h3>"
            );


        result =
            result.replace(
                /^# (.*)$/gm,
                "<h2>$1</h2>"
            );


        result =
            result.replace(
                /\n/g,
                "<br>"
            );


        return result;
    }


    /* =========================================================
       ESCAPE HTML
    ========================================================= */

    function escapeHTML(
        text
    ) {

        const div =
            document.createElement(
                "div"
            );


        div.textContent =
            text;


        return div.innerHTML;
    }


    /* =========================================================
       CHAT SCROLL
    ========================================================= */

    function scrollMessagesToBottom(
        container
    ) {

        if (!container) {
            return;
        }


        requestAnimationFrame(
            () => {

                container.scrollTop =
                    container.scrollHeight;

            }
        );
    }


    /* =========================================================
       IMPORTANT:
       STUDY ASSISTANT BUTTON
    ========================================================= */

    const studyButton =
        document.getElementById(
            "studyAssistantButton"
        );


    if (studyButton) {

        studyButton.addEventListener(
            "click",
            (event) => {

                event.preventDefault();
                event.stopPropagation();

                openChat();

            }
        );

    }


    /* =========================================================
       CTA BUTTON
    ========================================================= */

    const ctaButton =
        document.getElementById(
            "ctaStartButton"
        );


    if (ctaButton) {

        ctaButton.addEventListener(
            "click",
            (event) => {

                event.preventDefault();
                event.stopPropagation();

                openChat();

            }
        );

    }


    /* =========================================================
       OTHER BUTTONS
    ========================================================= */

    [
        "freePlanButton",
        "studentPlanButton",
        "proPlanButton"
    ].forEach(
        (id) => {

            const button =
                document.getElementById(id);


            button?.addEventListener(
                "click",
                (event) => {

                    event.preventDefault();

                    openChat();

                }
            );

        }
    );


    /* =========================================================
       PLACEHOLDER BUTTONS
    ========================================================= */

    document
        .querySelectorAll(
            ".feature-placeholder, .footer-placeholder"
        )
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    (event) => {

                        event.preventDefault();

                    }
                );

            }
        );


    /* =========================================================
       GLOBAL OPEN CHAT
    ========================================================= */

    window.openChat =
        openChat;


    window.closeUniMindChat =
        closeChat;


    /* =========================================================
       THEME
    ========================================================= */

    const themeToggle =
        document.getElementById(
            "themeToggle"
        );


    themeToggle?.addEventListener(
        "click",
        () => {

            document.body.classList.toggle(
                "dark-mode"
            );

        }
    );


    /* =========================================================
       LANGUAGE
    ========================================================= */

    const languageToggle =
        document.getElementById(
            "languageToggle"
        );


    languageToggle?.addEventListener(
        "click",
        () => {

            alert(
                "نسخة اللغة الإنجليزية ستكون متاحة قريبًا."
            );

        }
    );


    /* =========================================================
       LOGIN
    ========================================================= */

    const loginButton =
        document.getElementById(
            "loginButton"
        );


    loginButton?.addEventListener(
        "click",
        () => {

            alert(
                "نظام تسجيل الدخول سيكون متاحًا قريبًا."
            );

        }
    );

});

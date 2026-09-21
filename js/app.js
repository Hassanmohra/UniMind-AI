document.addEventListener("DOMContentLoaded", () => {

    /* =========================================================
       UniMind AI
       Main Application
    ========================================================= */

    const API_URL =
        "https://yzsfublvnwknjnayfosm.supabase.co/functions/v1/unimind-chat";

    let savedScrollY = 0;


    /* =========================================================
       PAGE SCROLL LOCK
    ========================================================= */

    function lockPageScroll() {

        savedScrollY =
            window.scrollY ||
            window.pageYOffset ||
            0;

        document.body.dataset.unimindScrollY =
            String(savedScrollY);

        document.body.style.position = "fixed";
        document.body.style.top =
            `-${savedScrollY}px`;

        document.body.style.left = "0";
        document.body.style.right = "0";
        document.body.style.width = "100%";

        document.documentElement.classList.add(
            "unimind-modal-open"
        );

        document.body.classList.add(
            "unimind-chat-open"
        );
    }


    function unlockPageScroll() {

        const stored =
            Number(
                document.body.dataset.unimindScrollY || 0
            );

        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.width = "";

        delete document.body.dataset.unimindScrollY;

        document.documentElement.classList.remove(
            "unimind-modal-open"
        );

        document.body.classList.remove(
            "unimind-chat-open"
        );

        window.scrollTo(
            0,
            stored
        );
    }


    /* =========================================================
       CREATE CHAT MODAL
    ========================================================= */

    function createChatModal() {

        const modal =
            document.createElement("div");

        modal.id =
            "unimind-chat-modal";

        modal.className =
            "unimind-chat-modal";


        modal.innerHTML = `

            <div
                class="unimind-chat-overlay"
                id="unimind-chat-overlay"
            ></div>

            <div
                class="unimind-chat-window"
                role="dialog"
                aria-modal="true"
                aria-labelledby="unimind-chat-title"
            >

                <div class="unimind-chat-header">

                    <div class="unimind-chat-brand">

                        <div class="unimind-chat-logo">
                            ✦
                        </div>

                        <div>

                            <strong id="unimind-chat-title">
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
    ========================================================= */

    function openChat() {

        let modal =
            document.getElementById(
                "unimind-chat-modal"
            );


        if (!modal) {

            modal =
                createChatModal();

            document.body.appendChild(
                modal
            );

            initializeChat(modal);
        }


        /* مهم جدًا:
           ثبّت النافذة على الشاشة */
        modal.style.position = "fixed";
        modal.style.top = "0";
        modal.style.left = "0";
        modal.style.right = "0";
        modal.style.bottom = "0";
        modal.style.width = "100vw";
        modal.style.height = "100vh";
        modal.style.zIndex = "999999";


        lockPageScroll();


        /* افتح النافذة */
        modal.classList.add("active");


        const input =
            modal.querySelector(
                "#unimind-chat-input"
            );


        /* التركيز بدون تحريك الصفحة */
        setTimeout(() => {

            try {

                input?.focus({
                    preventScroll: true
                });

            } catch {

                input?.focus();

            }

        }, 150);
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


        modal.classList.remove(
            "active"
        );


        unlockPageScroll();
    }


    /* =========================================================
       INITIALIZE CHAT
    ========================================================= */

    function initializeChat(modal) {

        const closeButton =
            modal.querySelector(
                "#unimind-chat-close"
            );

        const newButton =
            modal.querySelector(
                "#unimind-chat-new"
            );

        const overlay =
            modal.querySelector(
                "#unimind-chat-overlay"
            );

        const sendButton =
            modal.querySelector(
                "#unimind-chat-send"
            );

        const input =
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


        overlay?.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

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

                initializeSuggestions(
                    modal
                );
            }
        );


        /* SEND */

        sendButton?.addEventListener(
            "click",
            () => {

                sendMessage(modal);

            }
        );


        /* ENTER */

        input?.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.key === "Enter" &&
                    !event.shiftKey
                ) {

                    event.preventDefault();

                    sendMessage(modal);
                }
            }
        );


        /* AUTO RESIZE */

        input?.addEventListener(
            "input",
            () => {

                input.style.height = "auto";

                input.style.height =
                    Math.min(
                        input.scrollHeight,
                        140
                    ) + "px";
            }
        );


        initializeSuggestions(
            modal
        );
    }


    /* =========================================================
       SUGGESTIONS
    ========================================================= */

    function initializeSuggestions(modal) {

        modal
            .querySelectorAll(
                "[data-suggestion]"
            )
            .forEach((button) => {

                button.onclick = () => {

                    const input =
                        modal.querySelector(
                            "#unimind-chat-input"
                        );

                    if (!input) {
                        return;
                    }

                    input.value =
                        button.dataset.suggestion || "";

                    input.dispatchEvent(
                        new Event(
                            "input"
                        )
                    );

                    input.focus();

                };

            });
    }


    /* =========================================================
       SEND MESSAGE
    ========================================================= */

    async function sendMessage(modal) {

        const input =
            modal.querySelector(
                "#unimind-chat-input"
            );

        const messages =
            modal.querySelector(
                "#unimind-chat-messages"
            );


        if (!input || !messages) {
            return;
        }


        const message =
            input.value.trim();


        if (!message) {
            return;
        }


        addUserMessage(
            messages,
            message
        );


        input.value = "";
        input.style.height = "auto";


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
       CALL GEMINI THROUGH SUPABASE
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
            await response.json()
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
       FORMAT AI RESPONSE
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
       SCROLL CHAT MESSAGES
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
       CONNECT BUTTONS
    ========================================================= */

    const studyAssistantButton =
        document.getElementById(
            "studyAssistantButton"
        );


    const ctaStartButton =
        document.getElementById(
            "ctaStartButton"
        );


    const freePlanButton =
        document.getElementById(
            "freePlanButton"
        );


    const studentPlanButton =
        document.getElementById(
            "studentPlanButton"
        );


    const proPlanButton =
        document.getElementById(
            "proPlanButton"
        );


    /* مساعد الدراسة */

    studyAssistantButton?.addEventListener(
        "click",
        (event) => {

            event.preventDefault();
            event.stopPropagation();

            openChat();

        }
    );


    /* CTA */

    ctaStartButton?.addEventListener(
        "click",
        (event) => {

            event.preventDefault();
            event.stopPropagation();

            openChat();

        }
    );


    /* الخطط */

    freePlanButton?.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

            openChat();

        }
    );


    studentPlanButton?.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

            openChat();

        }
    );


    proPlanButton?.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

            openChat();

        }
    );


    /* =========================================================
       PREVENT PLACEHOLDER BUTTONS FROM DOING ANYTHING
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
       LOGO
    ========================================================= */

    document
        .getElementById("logoLink")
        ?.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }
        );


    document
        .getElementById("footerLogoButton")
        ?.addEventListener(
            "click",
            () => {

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }
        );


    /* =========================================================
       EXPOSE OPEN CHAT
       للاستخدام الخارجي إذا احتجناه
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
       LANGUAGE BUTTON
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
       LOGIN BUTTON
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

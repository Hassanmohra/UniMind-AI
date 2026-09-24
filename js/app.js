```javascript
document.addEventListener("DOMContentLoaded", () => {

    /* =========================================================
       UNIMIND AI
       Main Application JavaScript
    ========================================================= */

    const API_URL =
        "https://yzsfublvnwknjnayfosm.supabase.co/functions/v1/unimind-chat";

    let savedScrollY = 0;
    let selectedLectureFile = null;


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
                            <strong>UniMind AI</strong>
                            <span>AI Assistant Online</span>
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

            modal = createChatModal();

            document.body.appendChild(modal);

            initializeChat();
        }

        savedScrollY =
            window.scrollY ||
            window.pageYOffset ||
            0;

        modal.classList.add("active");

        document.body.classList.add(
            "unimind-chat-open"
        );

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
       SEND CHAT MESSAGE
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
       AI API
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
       LECTURE SUMMARIZER
       نظام رفع المحاضرات
    ========================================================= */

    function createLectureModal() {

        const existing =
            document.getElementById(
                "unimind-lecture-modal"
            );

        if (existing) {
            return existing;
        }

        const modal =
            document.createElement(
                "div"
            );

        modal.id =
            "unimind-lecture-modal";

        modal.className =
            "unimind-lecture-modal";


        modal.innerHTML = `

            <div class="unimind-lecture-overlay"></div>

            <div class="unimind-lecture-window">

                <div class="unimind-lecture-header">

                    <div>

                        <div class="unimind-lecture-title">
                            📄 تلخيص المحاضرات
                        </div>

                        <div class="unimind-lecture-subtitle">
                            ارفع محاضرتك ودع UniMind يساعدك على فهمها
                        </div>

                    </div>

                    <button
                        type="button"
                        id="unimind-lecture-close"
                        class="unimind-lecture-close"
                        aria-label="إغلاق"
                    >
                        ×
                    </button>

                </div>


                <div class="unimind-lecture-body">

                    <div
                        class="unimind-upload-area"
                        id="unimind-upload-area"
                    >

                        <input
                            type="file"
                            id="unimind-lecture-file"
                            accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                            hidden
                        >

                        <div class="unimind-upload-icon">
                            📤
                        </div>

                        <h3>
                            ارفع ملف المحاضرة
                        </h3>

                        <p>
                            اسحب الملف هنا أو اضغط لاختياره من جهازك
                        </p>

                        <small>
                            PDF • DOC • DOCX • TXT
                        </small>

                        <button
                            type="button"
                            id="unimind-choose-file"
                            class="unimind-upload-button"
                        >
                            اختيار ملف
                        </button>

                    </div>


                    <div
                        id="unimind-selected-file"
                        class="unimind-selected-file"
                        hidden
                    >

                        <div class="unimind-file-icon">
                            📄
                        </div>

                        <div class="unimind-file-info">

                            <strong
                                id="unimind-file-name"
                            >
                                اسم الملف
                            </strong>

                            <span
                                id="unimind-file-size"
                            >
                                0 KB
                            </span>

                        </div>

                        <button
                            type="button"
                            id="unimind-remove-file"
                            class="unimind-remove-file"
                            aria-label="حذف الملف"
                        >
                            ×
                        </button>

                    </div>


                    <div
                        id="unimind-file-status"
                        class="unimind-file-status"
                    >
                        لم يتم اختيار ملف بعد.
                    </div>


                    <div
                        id="unimind-text-preview"
                        class="unimind-text-preview"
                        hidden
                    >

                        <label>
                            محتوى الملف النصي
                        </label>

                        <textarea
                            id="unimind-text-content"
                            readonly
                        ></textarea>

                    </div>


                    <button
                        type="button"
                        id="unimind-summarize-button"
                        class="unimind-summarize-button"
                        disabled
                    >
                        ✨ تلخيص المحاضرة
                    </button>


                    <div
                        id="unimind-summary-result"
                        class="unimind-summary-result"
                        hidden
                    >

                        <div class="unimind-summary-header">

                            <strong>
                                ✨ ملخص المحاضرة
                            </strong>

                            <button
                                type="button"
                                id="unimind-copy-summary"
                            >
                                نسخ الملخص
                            </button>

                        </div>

                        <div
                            id="unimind-summary-content"
                            class="unimind-summary-content"
                        ></div>

                    </div>

                </div>

            </div>
        `;

        document.body.appendChild(
            modal
        );

        initializeLectureModal();

        return modal;
    }


    /* =========================================================
       INITIALIZE LECTURE MODAL
    ========================================================= */

    function initializeLectureModal() {

        const modal =
            document.getElementById(
                "unimind-lecture-modal"
            );

        if (!modal) {
            return;
        }


        const overlay =
            modal.querySelector(
                ".unimind-lecture-overlay"
            );

        const closeButton =
            modal.querySelector(
                "#unimind-lecture-close"
            );

        const chooseButton =
            modal.querySelector(
                "#unimind-choose-file"
            );

        const fileInput =
            modal.querySelector(
                "#unimind-lecture-file"
            );

        const uploadArea =
            modal.querySelector(
                "#unimind-upload-area"
            );

        const removeButton =
            modal.querySelector(
                "#unimind-remove-file"
            );

        const summarizeButton =
            modal.querySelector(
                "#unimind-summarize-button"
            );

        const copyButton =
            modal.querySelector(
                "#unimind-copy-summary"
            );


        /* CLOSE */

        closeButton?.addEventListener(
            "click",
            closeLectureModal
        );


        overlay?.addEventListener(
            "click",
            closeLectureModal
        );


        /* OPEN FILE SELECTOR */

        chooseButton?.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                fileInput?.click();

            }
        );


        uploadArea?.addEventListener(
            "click",
            (event) => {

                if (
                    event.target.closest(
                        "#unimind-choose-file"
                    )
                ) {
                    return;
                }

                fileInput?.click();

            }
        );


        /* FILE SELECTED */

        fileInput?.addEventListener(
            "change",
            () => {

                const file =
                    fileInput.files?.[0];

                if (file) {

                    handleLectureFile(
                        file
                    );

                }

            }
        );


        /* DRAG OVER */

        uploadArea?.addEventListener(
            "dragover",
            (event) => {

                event.preventDefault();

                uploadArea.classList.add(
                    "dragging"
                );

            }
        );


        /* DRAG LEAVE */

        uploadArea?.addEventListener(
            "dragleave",
            () => {

                uploadArea.classList.remove(
                    "dragging"
                );

            }
        );


        /* DROP */

        uploadArea?.addEventListener(
            "drop",
            (event) => {

                event.preventDefault();

                uploadArea.classList.remove(
                    "dragging"
                );

                const file =
                    event.dataTransfer?.files?.[0];

                if (file) {

                    handleLectureFile(
                        file
                    );

                }

            }
        );


        /* REMOVE FILE */

        removeButton?.addEventListener(
            "click",
            () => {

                selectedLectureFile = null;

                if (fileInput) {
                    fileInput.value = "";
                }

                resetLectureFileUI();

            }
        );


        /* SUMMARIZE */

        summarizeButton?.addEventListener(
            "click",
            () => {

                summarizeLecture();

            }
        );


        /* COPY */

        copyButton?.addEventListener(
            "click",
            async () => {

                const content =
                    document.getElementById(
                        "unimind-summary-content"
                    );

                if (!content) {
                    return;
                }

                const text =
                    content.innerText.trim();

                if (!text) {
                    return;
                }

                try {

                    await navigator.clipboard.writeText(
                        text
                    );

                    copyButton.textContent =
                        "تم النسخ ✓";

                    setTimeout(() => {

                        copyButton.textContent =
                            "نسخ الملخص";

                    }, 2000);

                } catch {

                    alert(
                        "لم يتمكن المتصفح من نسخ الملخص."
                    );

                }

            }
        );
    }


    /* =========================================================
       OPEN LECTURE MODAL
    ========================================================= */

    function openLectureModal() {

        const modal =
            createLectureModal();

        savedScrollY =
            window.scrollY ||
            window.pageYOffset ||
            0;

        modal.classList.add(
            "active"
        );

        document.body.classList.add(
            "unimind-lecture-open"
        );

    }


    /* =========================================================
       CLOSE LECTURE MODAL
    ========================================================= */

    function closeLectureModal() {

        const modal =
            document.getElementById(
                "unimind-lecture-modal"
            );

        if (!modal) {
            return;
        }

        modal.classList.remove(
            "active"
        );

        document.body.classList.remove(
            "unimind-lecture-open"
        );

        requestAnimationFrame(() => {

            window.scrollTo(
                0,
                savedScrollY
            );

        });

    }


    /* =========================================================
       HANDLE LECTURE FILE
    ========================================================= */

    function handleLectureFile(
        file
    ) {

        const status =
            document.getElementById(
                "unimind-file-status"
            );

        const selectedBox =
            document.getElementById(
                "unimind-selected-file"
            );

        const fileName =
            document.getElementById(
                "unimind-file-name"
            );

        const fileSize =
            document.getElementById(
                "unimind-file-size"
            );

        const summarizeButton =
            document.getElementById(
                "unimind-summarize-button"
            );

        const preview =
            document.getElementById(
                "unimind-text-preview"
            );

        const textContent =
            document.getElementById(
                "unimind-text-content"
            );


        if (!file) {
            return;
        }


        const allowedExtensions = [
            "pdf",
            "doc",
            "docx",
            "txt"
        ];


        const extension =
            file.name
                .split(".")
                .pop()
                .toLowerCase();


        if (
            !allowedExtensions.includes(
                extension
            )
        ) {

            alert(
                "نوع الملف غير مدعوم. اختر PDF أو DOC أو DOCX أو TXT."
            );

            return;
        }


        const maxSize =
            25 * 1024 * 1024;


        if (file.size > maxSize) {

            alert(
                "حجم الملف كبير جدًا. الحد الأقصى حاليًا 25MB."
            );

            return;
        }


        selectedLectureFile =
            file;


        if (fileName) {

            fileName.textContent =
                file.name;

        }


        if (fileSize) {

            fileSize.textContent =
                formatFileSize(
                    file.size
                );

        }


        if (selectedBox) {

            selectedBox.hidden =
                false;

        }


        if (status) {

            status.textContent =
                "تم اختيار الملف بنجاح ✓";

            status.classList.add(
                "success"
            );

        }


        if (summarizeButton) {

            summarizeButton.disabled =
                false;

        }


        /*
         * قراءة TXT مباشرة
         */

        if (
            extension === "txt"
        ) {

            const reader =
                new FileReader();

            reader.onload =
                (event) => {

                    if (preview) {
                        preview.hidden =
                            false;
                    }

                    if (textContent) {

                        textContent.value =
                            event.target.result || "";

                    }

                };

            reader.readAsText(
                file,
                "UTF-8"
            );

        } else {

            if (preview) {
                preview.hidden =
                    true;
            }

        }

    }


    /* =========================================================
       FORMAT FILE SIZE
    ========================================================= */

    function formatFileSize(
        bytes
    ) {

        if (!bytes) {
            return "0 KB";
        }

        const units = [
            "Bytes",
            "KB",
            "MB",
            "GB"
        ];

        const index =
            Math.floor(
                Math.log(bytes) /
                Math.log(1024)
            );

        const size =
            bytes /
            Math.pow(
                1024,
                index
            );

        return (
            Math.round(
                size * 100
            ) / 100
        ) +
        " " +
        units[index];
    }


    /* =========================================================
       RESET FILE UI
    ========================================================= */

    function resetLectureFileUI() {

        const selectedBox =
            document.getElementById(
                "unimind-selected-file"
            );

        const status =
            document.getElementById(
                "unimind-file-status"
            );

        const summarizeButton =
            document.getElementById(
                "unimind-summarize-button"
            );

        const preview =
            document.getElementById(
                "unimind-text-preview"
            );

        const textContent =
            document.getElementById(
                "unimind-text-content"
            );

        const summaryResult =
            document.getElementById(
                "unimind-summary-result"
            );


        if (selectedBox) {
            selectedBox.hidden =
                true;
        }


        if (status) {

            status.textContent =
                "لم يتم اختيار ملف بعد.";

            status.classList.remove(
                "success"
            );

        }


        if (summarizeButton) {

            summarizeButton.disabled =
                true;

        }


        if (preview) {
            preview.hidden =
                true;
        }


        if (textContent) {
            textContent.value =
                "";
        }


        if (summaryResult) {
            summaryResult.hidden =
                true;
        }

    }


    /* =========================================================
       SUMMARIZE LECTURE
    ========================================================= */

    async function summarizeLecture() {

        const file =
            selectedLectureFile;

        const button =
            document.getElementById(
                "unimind-summarize-button"
            );

        const result =
            document.getElementById(
                "unimind-summary-result"
            );

        const content =
            document.getElementById(
                "unimind-summary-content"
            );

        const status =
            document.getElementById(
                "unimind-file-status"
            );


        if (!file) {

            alert(
                "اختر ملف المحاضرة أولًا."
            );

            return;
        }


        /*
         * المرحلة الحالية:
         * تجهيز الملف والتحقق منه.
         */

        if (button) {

            button.disabled =
                true;

            button.innerHTML =
                "⏳ جاري تجهيز المحاضرة...";

        }


        if (status) {

            status.textContent =
                "جاري تجهيز الملف للتحليل...";

            status.classList.remove(
                "success"
            );

        }


        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    1200
                )
        );


        if (result) {

            result.hidden =
                false;

        }


        if (content) {

            if (
                file.name
                    .toLowerCase()
                    .endsWith(".txt")
            ) {

                const text =
                    document.getElementById(
                        "unimind-text-content"
                    )?.value || "";

                if (text.trim()) {

                    content.innerHTML =
                        `
                            <h3>تم تجهيز المحاضرة ✓</h3>

                            <p>
                                تم رفع الملف بنجاح وقراءة محتواه.
                                الخطوة التالية هي إرسال المحتوى إلى
                                محرك الذكاء الاصطناعي لإنشاء الملخص.
                            </p>

                            <div class="unimind-summary-placeholder">

                                <strong>
                                    الملف:
                                </strong>

                                ${escapeHTML(file.name)}

                                <br><br>

                                <strong>
                                    عدد الأحرف:
                                </strong>

                                ${text.length.toLocaleString("ar")}

                            </div>
                        `;

                } else {

                    content.innerHTML =
                        `
                            <h3>تم رفع الملف ✓</h3>

                            <p>
                                الملف النصي فارغ أو لا يحتوي على نص قابل للقراءة.
                            </p>
                        `;

                }

            } else {

                content.innerHTML =
                    `
                        <h3>تم رفع الملف بنجاح ✓</h3>

                        <p>
                            أصبح الملف جاهزًا للمرحلة التالية من المعالجة.
                        </p>

                        <div class="unimind-summary-placeholder">

                            <strong>
                                الملف:
                            </strong>

                            ${escapeHTML(file.name)}

                            <br><br>

                            <strong>
                                الحجم:
                            </strong>

                            ${formatFileSize(file.size)}

                            <br><br>

                            <span>
                                سيتم في المرحلة التالية ربط PDF وDOCX
                                بمحرك قراءة المحتوى ثم إرسال النص إلى
                                UniMind AI لإنشاء ملخص حقيقي.
                            </span>

                        </div>
                    `;

            }

        }


        if (status) {

            status.textContent =
                "تم تجهيز الملف ✓";

            status.classList.add(
                "success"
            );

        }


        if (button) {

            button.disabled =
                false;

            button.innerHTML =
                "✨ تلخيص المحاضرة";

        }

    }


    /* =========================================================
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
       LECTURE SUMMARIZER BUTTON
    ========================================================= */

    const lectureButton =
        document.getElementById(
            "lectureSummarizerButton"
        );

    if (lectureButton) {

        lectureButton.addEventListener(
            "click",
            (event) => {

                event.preventDefault();
                event.stopPropagation();

                openLectureModal();

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
       PLAN BUTTONS
    ========================================================= */

    [
        "freePlanButton",
        "studentPlanButton",
        "proPlanButton"
    ].forEach(
        (id) => {

            const button =
                document.getElementById(
                    id
                );

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
       OTHER PLACEHOLDERS
       لا نضع lectureSummarizerButton هنا
       لأنه أصبح يعمل فعليًا.
    ========================================================= */

    document
        .querySelectorAll(
            ".feature-placeholder:not(#lectureSummarizerButton), .footer-placeholder"
        )
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    (event) => {

                        event.preventDefault();

                        alert(
                            "هذه الميزة سيتم تفعيلها في المرحلة القادمة من UniMind AI."
                        );

                    }
                );

            }
        );


    /* =========================================================
       GLOBAL FUNCTIONS
    ========================================================= */

    window.openChat =
        openChat;

    window.closeUniMindChat =
        closeChat;

    window.openLectureSummarizer =
        openLectureModal;

    window.closeLectureSummarizer =
        closeLectureModal;


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


    /* =========================================================
       ESC KEY
    ========================================================= */

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key !== "Escape"
            ) {
                return;
            }

            closeChat();

            closeLectureModal();

        }
    );


});
```

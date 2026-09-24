/* =========================================================
   UniMind AI - Main JavaScript
   ========================================================= */

(function () {
    "use strict";

    const API_URL =
        "https://yzsfublvnwknjnayfosm.supabase.co/functions/v1/unimind-chat";

    let savedScrollY = 0;
    let selectedLectureFile = null;

    /* =========================================================
       START APP
       يعمل سواء تم تحميل الملف قبل أو بعد DOMContentLoaded
       ========================================================= */

    function startUniMind() {
        if (window.__UNIMIND_STARTED__) return;
        window.__UNIMIND_STARTED__ = true;

        console.log("UniMind AI JavaScript loaded successfully");

        setupButtons();
        setupTheme();
        setupLanguage();
        setupLogin();
        setupKeyboard();

        /* جعل الوظائف متاحة للـ HTML */
        window.openChat = openChat;
        window.closeUniMindChat = closeChat;
        window.openLectureSummarizer = openLectureModal;
        window.closeLectureSummarizer = closeLectureModal;

        console.log("UniMind buttons initialized");
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", startUniMind);
    } else {
        startUniMind();
    }


    /* =========================================================
       BUTTONS
       ========================================================= */

    function setupButtons() {

        /* مساعد الدراسة */
        connectButton(
            "studyAssistantButton",
            function (event) {
                event.preventDefault();
                event.stopPropagation();
                openChat();
            }
        );


        /* تلخيص المحاضرات */
        connectButton(
            "lectureSummarizerButton",
            function (event) {
                event.preventDefault();
                event.stopPropagation();
                openLectureModal();
            }
        );


        /* زر CTA */
        connectButton(
            "ctaStartButton",
            function (event) {
                event.preventDefault();
                event.stopPropagation();
                openChat();
            }
        );


        /* الخطط */
        [
            "freePlanButton",
            "studentPlanButton",
            "proPlanButton"
        ].forEach(function (id) {

            connectButton(id, function (event) {
                event.preventDefault();
                event.stopPropagation();

                alert(
                    "سيتم فتح مساعد UniMind AI لإكمال الخطوات."
                );

                openChat();
            });

        });


        /*
         * أزرار الهيرو الجديدة
         * ندعم أكثر من ID حتى لا تعتمد الصفحة
         * على اسم واحد فقط.
         */

        [
            "heroDemoButton",
            "heroChatButton",
            "ctaBottomButton"
        ].forEach(function (id) {

            connectButton(id, function (event) {
                event.preventDefault();
                event.stopPropagation();
                openChat();
            });

        });


        /*
         * البحث عن الأزرار بالـ data-action
         * إذا كانت موجودة في HTML.
         */

        document.querySelectorAll("[data-action]").forEach(function (button) {

            const action = button.dataset.action;

            if (action === "chat") {
                button.addEventListener("click", function (event) {
                    event.preventDefault();
                    openChat();
                });
            }

            if (action === "lecture") {
                button.addEventListener("click", function (event) {
                    event.preventDefault();
                    openLectureModal();
                });
            }

        });


        /*
         * أزرار المميزات
         */

        document.querySelectorAll(".feature-placeholder").forEach(function (button) {

            if (button.id === "studyAssistantButton") return;
            if (button.id === "lectureSummarizerButton") return;

            button.addEventListener("click", function (event) {

                event.preventDefault();

                alert(
                    "هذه الميزة ستكون متاحة قريبًا في UniMind AI."
                );

            });

        });


        /*
         * أزرار footer
         */

        document.querySelectorAll(".footer-placeholder").forEach(function (button) {

            button.addEventListener("click", function (event) {

                event.preventDefault();

                alert(
                    "هذه الصفحة ستكون متاحة قريبًا."
                );

            });

        });
    }


    function connectButton(id, callback) {

        const button = document.getElementById(id);

        if (!button) {
            console.warn(
                "UniMind: button not found -> " + id
            );
            return;
        }

        button.addEventListener("click", callback);

        console.log(
            "UniMind: connected -> " + id
        );
    }


    /* =========================================================
       CHAT
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
                        >
                            ＋
                        </button>

                        <button
                            type="button"
                            id="unimind-chat-close"
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


    function openChat() {

        let modal =
            document.getElementById("unimind-chat-modal");

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
            modal.querySelector("#unimind-chat-input");

        setTimeout(function () {

            if (textarea) {
                textarea.focus();
            }

        }, 250);
    }


    function closeChat() {

        const modal =
            document.getElementById("unimind-chat-modal");

        if (!modal) return;

        modal.classList.remove("active");

        document.body.classList.remove(
            "unimind-chat-open"
        );

        window.scrollTo(
            0,
            savedScrollY
        );
    }


    function initializeChat() {

        const modal =
            document.getElementById("unimind-chat-modal");

        if (!modal) return;


        const closeButton =
            modal.querySelector("#unimind-chat-close");

        const overlay =
            modal.querySelector(".unimind-chat-overlay");

        const newButton =
            modal.querySelector("#unimind-chat-new");

        const sendButton =
            modal.querySelector("#unimind-chat-send");

        const textarea =
            modal.querySelector("#unimind-chat-input");


        closeButton?.addEventListener(
            "click",
            closeChat
        );


        overlay?.addEventListener(
            "click",
            closeChat
        );


        newButton?.addEventListener(
            "click",
            function () {

                const messages =
                    modal.querySelector(
                        "#unimind-chat-messages"
                    );

                if (!messages) return;

                messages.innerHTML = `
                    <div class="unimind-welcome-message">

                        <div class="unimind-welcome-icon">
                            ✦
                        </div>

                        <h2>
                            كيف يمكنني مساعدتك اليوم؟
                        </h2>

                        <p>
                            ابدأ محادثة جديدة مع UniMind AI.
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

                    </div>
                `;

                initializeSuggestions();
            }
        );


        sendButton?.addEventListener(
            "click",
            sendMessage
        );


        textarea?.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Enter" &&
                    !event.shiftKey
                ) {

                    event.preventDefault();

                    sendMessage();
                }

            }
        );


        textarea?.addEventListener(
            "input",
            function () {

                textarea.style.height = "auto";

                textarea.style.height =
                    Math.min(
                        textarea.scrollHeight,
                        140
                    ) + "px";
            }
        );


        initializeSuggestions();
    }


    function initializeSuggestions() {

        document
            .querySelectorAll(
                "#unimind-chat-modal [data-suggestion]"
            )
            .forEach(function (button) {

                button.onclick = function () {

                    const modal =
                        document.getElementById(
                            "unimind-chat-modal"
                        );

                    const textarea =
                        modal?.querySelector(
                            "#unimind-chat-input"
                        );

                    if (!textarea) return;

                    textarea.value =
                        button.dataset.suggestion || "";

                    textarea.focus();
                };

            });
    }


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

        if (!textarea || !messages) return;

        const message =
            textarea.value.trim();

        if (!message) return;


        addUserMessage(
            messages,
            message
        );

        textarea.value = "";
        textarea.style.height = "auto";


        const loading =
            addLoadingMessage(messages);


        try {

            const reply =
                await callUniMindAI(message);

            loading.remove();

            addAIMessage(
                messages,
                reply
            );

        } catch (error) {

            loading.remove();

            addAIMessage(
                messages,
                getReadableError(error)
            );

        }


        scrollMessagesToBottom(messages);
    }


    function addUserMessage(container, text) {

        const element =
            document.createElement("div");

        element.className =
            "unimind-message unimind-user-message";

        element.innerHTML = `
            <div class="unimind-message-content">
                ${escapeHTML(text)}
            </div>
        `;

        container.appendChild(element);
    }


    function addLoadingMessage(container) {

        const element =
            document.createElement("div");

        element.className =
            "unimind-message unimind-ai-message unimind-loading";

        element.innerHTML = `
            <div class="unimind-message-header">
                <span>✦</span>
                UniMind AI
            </div>

            <div class="unimind-loading-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;

        container.appendChild(element);

        scrollMessagesToBottom(container);

        return element;
    }


    function addAIMessage(container, text) {

        const element =
            document.createElement("div");

        element.className =
            "unimind-message unimind-ai-message";

        element.innerHTML = `
            <div class="unimind-message-header">
                <span>✦</span>
                UniMind AI
            </div>

            <div class="unimind-message-content">
                ${formatAIResponse(text)}
            </div>
        `;

        container.appendChild(element);
    }


    async function callUniMindAI(message) {

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
                .catch(function () {
                    return {};
                });


        if (!response.ok) {

            const error =
                new Error(
                    data?.details ||
                    data?.error ||
                    "HTTP_" + response.status
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


    function getReadableError(error) {

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
            message.includes("high demand")
        ) {
            return "خدمة Gemini مشغولة حاليًا. حاول مرة أخرى بعد قليل.";
        }


        if (
            message.includes("GEMINI_API_KEY")
        ) {
            return "مفتاح Gemini غير مضبوط في الخادم.";
        }


        if (
            message.includes("INVALID_RESPONSE")
        ) {
            return "تم الاتصال بالخدمة ولكن لم تصل إجابة صحيحة.";
        }


        return "حدث خطأ أثناء الاتصال بمساعد UniMind AI.";
    }


    function formatAIResponse(text) {

        if (!text) return "";

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


    function escapeHTML(text) {

        const div =
            document.createElement("div");

        div.textContent = text;

        return div.innerHTML;
    }


    function scrollMessagesToBottom(container) {

        if (!container) return;

        requestAnimationFrame(function () {
            container.scrollTop =
                container.scrollHeight;
        });
    }


    /* =========================================================
       LECTURE SUMMARIZER
       ========================================================= */

    function createLectureModal() {

        let existing =
            document.getElementById(
                "unimind-lecture-modal"
            );

        if (existing) return existing;


        const modal =
            document.createElement("div");

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
                            accept=".pdf,.doc,.docx,.txt"
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

                            <strong id="unimind-file-name">
                                اسم الملف
                            </strong>

                            <span id="unimind-file-size">
                                0 KB
                            </span>

                        </div>

                        <button
                            type="button"
                            id="unimind-remove-file"
                            class="unimind-remove-file"
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


        document.body.appendChild(modal);

        initializeLectureModal();

        return modal;
    }


    function initializeLectureModal() {

        const modal =
            document.getElementById(
                "unimind-lecture-modal"
            );

        if (!modal) return;


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


        closeButton?.addEventListener(
            "click",
            closeLectureModal
        );


        overlay?.addEventListener(
            "click",
            closeLectureModal
        );


        chooseButton?.addEventListener(
            "click",
            function (event) {

                event.preventDefault();
                event.stopPropagation();

                fileInput?.click();
            }
        );


        uploadArea?.addEventListener(
            "click",
            function (event) {

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


        fileInput?.addEventListener(
            "change",
            function () {

                const file =
                    fileInput.files?.[0];

                if (file) {
                    handleLectureFile(file);
                }
            }
        );


        uploadArea?.addEventListener(
            "dragover",
            function (event) {

                event.preventDefault();

                uploadArea.classList.add(
                    "dragging"
                );
            }
        );


        uploadArea?.addEventListener(
            "dragleave",
            function () {

                uploadArea.classList.remove(
                    "dragging"
                );
            }
        );


        uploadArea?.addEventListener(
            "drop",
            function (event) {

                event.preventDefault();

                uploadArea.classList.remove(
                    "dragging"
                );

                const file =
                    event.dataTransfer?.files?.[0];

                if (file) {
                    handleLectureFile(file);
                }
            }
        );


        removeButton?.addEventListener(
            "click",
            function () {

                selectedLectureFile = null;

                if (fileInput) {
                    fileInput.value = "";
                }

                resetLectureFileUI();
            }
        );


        summarizeButton?.addEventListener(
            "click",
            summarizeLecture
        );


        copyButton?.addEventListener(
            "click",
            async function () {

                const content =
                    document.getElementById(
                        "unimind-summary-content"
                    );

                if (!content) return;

                const text =
                    content.innerText.trim();

                if (!text) return;


                try {

                    await navigator.clipboard.writeText(
                        text
                    );

                    copyButton.textContent =
                        "تم النسخ ✓";

                    setTimeout(function () {
                        copyButton.textContent =
                            "نسخ الملخص";
                    }, 2000);

                } catch {

                    alert(
                        "تعذر نسخ الملخص."
                    );
                }
            }
        );
    }


    function openLectureModal() {

        const modal =
            createLectureModal();

        savedScrollY =
            window.scrollY ||
            window.pageYOffset ||
            0;

        modal.classList.add("active");

        document.body.classList.add(
            "unimind-lecture-open"
        );
    }


    function closeLectureModal() {

        const modal =
            document.getElementById(
                "unimind-lecture-modal"
            );

        if (!modal) return;

        modal.classList.remove("active");

        document.body.classList.remove(
            "unimind-lecture-open"
        );

        window.scrollTo(
            0,
            savedScrollY
        );
    }


    function handleLectureFile(file) {

        if (!file) return;


        const extension =
            file.name
                .split(".")
                .pop()
                .toLowerCase();


        const allowed = [
            "pdf",
            "doc",
            "docx",
            "txt"
        ];


        if (!allowed.includes(extension)) {

            alert(
                "اختر ملف PDF أو DOC أو DOCX أو TXT."
            );

            return;
        }


        if (
            file.size >
            25 * 1024 * 1024
        ) {

            alert(
                "الحد الأقصى لحجم الملف هو 25MB."
            );

            return;
        }


        selectedLectureFile = file;


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

        const status =
            document.getElementById(
                "unimind-file-status"
            );

        const summarizeButton =
            document.getElementById(
                "unimind-summarize-button"
            );


        if (fileName) {
            fileName.textContent =
                file.name;
        }


        if (fileSize) {
            fileSize.textContent =
                formatFileSize(file.size);
        }


        if (selectedBox) {
            selectedBox.hidden = false;
        }


        if (status) {

            status.textContent =
                "تم اختيار الملف بنجاح ✓";

            status.classList.add("success");
        }


        if (summarizeButton) {
            summarizeButton.disabled = false;
        }


        if (extension === "txt") {

            const reader =
                new FileReader();

            reader.onload =
                function (event) {

                    const preview =
                        document.getElementById(
                            "unimind-text-preview"
                        );

                    const content =
                        document.getElementById(
                            "unimind-text-content"
                        );

                    if (preview) {
                        preview.hidden = false;
                    }

                    if (content) {
                        content.value =
                            event.target.result || "";
                    }
                };

            reader.readAsText(
                file,
                "UTF-8"
            );
        }
    }


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

        const result =
            document.getElementById(
                "unimind-summary-result"
            );


        if (selectedBox) {
            selectedBox.hidden = true;
        }

        if (status) {

            status.textContent =
                "لم يتم اختيار ملف بعد.";

            status.classList.remove(
                "success"
            );
        }

        if (summarizeButton) {
            summarizeButton.disabled = true;
        }

        if (preview) {
            preview.hidden = true;
        }

        if (textContent) {
            textContent.value = "";
        }

        if (result) {
            result.hidden = true;
        }
    }


    function formatFileSize(bytes) {

        if (!bytes) return "0 KB";

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


    async function summarizeLecture() {

        const file =
            selectedLectureFile;

        if (!file) {

            alert(
                "اختر ملف المحاضرة أولًا."
            );

            return;
        }


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


        if (button) {

            button.disabled = true;

            button.innerHTML =
                "⏳ جاري تجهيز المحاضرة...";
        }


        if (status) {
            status.textContent =
                "جاري تجهيز الملف...";
        }


        await new Promise(function (resolve) {
            setTimeout(resolve, 1000);
        });


        if (result) {
            result.hidden = false;
        }


        if (content) {

            content.innerHTML = `
                <h3>
                    تم رفع المحاضرة بنجاح ✓
                </h3>

                <p>
                    تم التعرف على الملف وتجهيزه.
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
                        تم تجهيز الملف بنجاح.
                        سيتم ربط قراءة محتوى PDF وDOCX
                        بمحرك الذكاء الاصطناعي في المرحلة التالية.
                    </span>

                </div>
            `;
        }


        if (status) {

            status.textContent =
                "تم تجهيز الملف ✓";

            status.classList.add(
                "success"
            );
        }


        if (button) {

            button.disabled = false;

            button.innerHTML =
                "✨ تلخيص المحاضرة";
        }
    }


    /* =========================================================
       THEME
       ========================================================= */

    function setupTheme() {

        const button =
            document.getElementById(
                "themeToggle"
            );

        if (!button) return;


        button.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                document.body.classList.toggle(
                    "dark-mode"
                );

            }
        );
    }


    /* =========================================================
       LANGUAGE
       ========================================================= */

    function setupLanguage() {

        const button =
            document.getElementById(
                "languageToggle"
            );

        if (!button) return;


        button.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                alert(
                    "نسخة اللغة الإنجليزية ستكون متاحة قريبًا."
                );

            }
        );
    }


    /* =========================================================
       LOGIN
       ========================================================= */

    function setupLogin() {

        const button =
            document.getElementById(
                "loginButton"
            );

        if (!button) return;


        button.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                alert(
                    "نظام تسجيل الدخول سيكون متاحًا قريبًا."
                );

            }
        );
    }


    /* =========================================================
       ESC
       ========================================================= */

    function setupKeyboard() {

        document.addEventListener(
            "keydown",
            function (event) {

                if (event.key !== "Escape") {
                    return;
                }

                closeChat();
                closeLectureModal();
            }
        );
    }

})();

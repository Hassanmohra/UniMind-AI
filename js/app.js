```javascript
(function () {
    "use strict";

    // =========================================================
    // UniMind AI
    // Main JavaScript
    // =========================================================

    const API_URL =
        "https://yzsfublvnwknjnayfosm.supabase.co/functions/v1/unimind-chat";

    let savedScrollY = 0;
    let selectedLectureFile = null;


    // =========================================================
    // IMPORTANT GLOBAL FUNCTIONS
    // =========================================================
    // تم نقل تعريف الدوال العامة إلى هنا حتى تكون متاحة
    // حتى لو حدث خطأ أثناء تهيئة أحد أجزاء الموقع.

    window.openChat = openChat;
    window.closeUniMindChat = closeChat;

    window.openLectureSummarizer =
        openLectureModal;

    window.closeLectureSummarizer =
        closeLectureModal;


    // =========================================================
    // START
    // =========================================================

    function startUniMind() {

        if (window.__UNIMIND_STARTED__) {
            return;
        }

        window.__UNIMIND_STARTED__ = true;

        console.log(
            "UniMind AI JavaScript loaded successfully"
        );

        try {
            setupButtons();
        } catch (error) {
            console.error(
                "UniMind setupButtons error:",
                error
            );
        }

        try {
            setupTheme();
        } catch (error) {
            console.error(
                "UniMind setupTheme error:",
                error
            );
        }

        try {
            setupLanguage();
        } catch (error) {
            console.error(
                "UniMind setupLanguage error:",
                error
            );
        }

        try {
            setupLogin();
        } catch (error) {
            console.error(
                "UniMind setupLogin error:",
                error
            );
        }

        try {
            setupKeyboard();
        } catch (error) {
            console.error(
                "UniMind setupKeyboard error:",
                error
            );
        }

        console.log(
            "UniMind buttons initialized"
        );
    }


    // =========================================================
    // START APPLICATION
    // =========================================================

    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            startUniMind,
            { once: true }
        );

    } else {

        startUniMind();

    }


    // =========================================================
    // BUTTONS
    // =========================================================

    function setupButtons() {

        // -----------------------------------------------------
        // مساعد الدراسة الذكي
        // -----------------------------------------------------

        setupStudyAssistantButton();


        // -----------------------------------------------------
        // تلخيص المحاضرات
        // -----------------------------------------------------

        setupLectureButton();


        // -----------------------------------------------------
        // CTA
        // -----------------------------------------------------

        connectButton(
            "ctaBottomButton",
            function (event) {

                event.preventDefault();

                openChat();

            }
        );


        // -----------------------------------------------------
        // Hero Demo
        // -----------------------------------------------------

        connectButton(
            "heroDemoButton",
            function (event) {

                event.preventDefault();

                openChat();

            }
        );


        // -----------------------------------------------------
        // Hero Chat
        // -----------------------------------------------------

        connectButton(
            "heroChatButton",
            function (event) {

                event.preventDefault();

                openChat();

            }
        );


        // -----------------------------------------------------
        // Buttons with data-action
        // -----------------------------------------------------

        document
            .querySelectorAll("[data-action]")
            .forEach(function (button) {

                if (
                    button.dataset.unimindActionBound
                ) {
                    return;
                }

                button.dataset.unimindActionBound =
                    "true";


                button.addEventListener(
                    "click",
                    function (event) {

                        const action =
                            button.dataset.action;


                        if (!action) {
                            return;
                        }


                        if (
                            action === "chat"
                        ) {

                            event.preventDefault();

                            openChat();

                            return;
                        }


                        if (
                            action === "lecture"
                        ) {

                            event.preventDefault();

                            openLectureModal();

                            return;
                        }

                    }
                );

            });


        // -----------------------------------------------------
        // Feature placeholders
        // -----------------------------------------------------

        document
            .querySelectorAll(
                ".feature-placeholder"
            )
            .forEach(function (button) {

                if (
                    button.dataset
                        .unimindPlaceholderBound
                ) {
                    return;
                }

                button.dataset
                    .unimindPlaceholderBound =
                    "true";


                button.addEventListener(
                    "click",
                    function (event) {

                        event.preventDefault();


                        const card =
                            button.closest(
                                ".feature-card"
                            );


                        if (!card) {
                            return;
                        }


                        const text =
                            card.textContent ||
                            "";


                        if (
                            text.includes(
                                "تلخيص المحاضرات"
                            ) ||
                            text.includes(
                                "تلخيص المحاضرة"
                            )
                        ) {

                            openLectureModal();

                            return;
                        }


                        alert(
                            "هذه الميزة ستكون متاحة قريبًا في UniMind AI."
                        );

                    }
                );

            });


        // -----------------------------------------------------
        // Pricing
        // -----------------------------------------------------

        document
            .querySelectorAll(
                ".pricing-card button"
            )
            .forEach(function (button) {

                if (
                    button.dataset
                        .unimindPricingBound
                ) {
                    return;
                }

                button.dataset
                    .unimindPricingBound =
                    "true";


                button.addEventListener(
                    "click",
                    function (event) {

                        event.preventDefault();

                        alert(
                            "اختيار الخطة سيتم تفعيله قريبًا."
                        );

                    }
                );

            });


        // -----------------------------------------------------
        // Footer links
        // -----------------------------------------------------

        document
            .querySelectorAll(
                ".footer-links a"
            )
            .forEach(function (link) {

                if (
                    link.dataset
                        .unimindFooterBound
                ) {
                    return;
                }

                link.dataset
                    .unimindFooterBound =
                    "true";


                link.addEventListener(
                    "click",
                    function (event) {

                        const href =
                            link.getAttribute(
                                "href"
                            );


                        if (
                            !href ||
                            href === "#"
                        ) {

                            event.preventDefault();

                        }

                    }
                );

            });

    }


    // =========================================================
    // STUDY ASSISTANT BUTTON
    // =========================================================

    function setupStudyAssistantButton() {

        const button =
            document.getElementById(
                "studyAssistantButton"
            );


        if (!button) {

            console.warn(
                "UniMind: studyAssistantButton not found"
            );

            return;
        }


        if (
            button.dataset
                .unimindStudyBound === "true"
        ) {

            return;
        }


        button.dataset
            .unimindStudyBound =
            "true";


        button.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                event.stopPropagation();


                console.log(
                    "UniMind: Study Assistant clicked"
                );


                openChat();

            },
            false
        );


        console.log(
            "UniMind: Study Assistant connected successfully"
        );

    }


    // =========================================================
    // LECTURE BUTTON
    // =========================================================

    function setupLectureButton() {

        const button =
            document.getElementById(
                "lectureSummarizerButton"
            );


        if (!button) {

            console.warn(
                "UniMind: lectureSummarizerButton not found"
            );

            return;
        }


        if (
            button.dataset
                .unimindLectureBound === "true"
        ) {

            return;
        }


        button.dataset
            .unimindLectureBound =
            "true";


        button.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                event.stopPropagation();


                console.log(
                    "UniMind: Lecture Summarizer clicked"
                );


                openLectureModal();

            },
            false
        );


        console.log(
            "UniMind: Lecture Summarizer connected successfully"
        );

    }


    // =========================================================
    // CONNECT BUTTON
    // =========================================================

    function connectButton(
        id,
        callback
    ) {

        const button =
            document.getElementById(id);


        if (!button) {

            console.warn(
                "UniMind: button not found -> " +
                id
            );

            return;
        }


        const flag =
            "unimindBound";


        if (
            button.dataset[flag]
        ) {

            return;
        }


        button.dataset[flag] =
            "true";


        button.addEventListener(
            "click",
            callback,
            false
        );


        console.log(
            "UniMind: connected -> " +
            id
        );

    }


    // =========================================================
    // CHAT
    // =========================================================

    function createChatModal() {

        const existing =
            document.getElementById(
                "unimind-chat-modal"
            );


        if (existing) {

            if (
                !existing.querySelector(
                    ".unimind-chat-window"
                )
            ) {

                buildChatModal(existing);

            }

            return;
        }


        const modal =
            document.createElement(
                "div"
            );


        modal.id =
            "unimind-chat-modal";


        buildChatModal(modal);


        document.body.appendChild(
            modal
        );

    }


    // =========================================================
    // BUILD CHAT
    // =========================================================

    function buildChatModal(modal) {

        if (
            modal.querySelector(
                ".unimind-chat-window"
            )
        ) {

            return;
        }


        modal.innerHTML = `

            <div class="unimind-chat-overlay"></div>

            <div class="unimind-chat-window">

                <div class="unimind-chat-header">

                    <div class="unimind-chat-brand">

                        <div class="unimind-chat-logo">
                            ✨
                        </div>

                        <div>

                            <strong>
                                UniMind AI
                            </strong>

                            <small>
                                مساعدك الجامعي الذكي
                            </small>

                        </div>

                    </div>


                    <div class="unimind-chat-actions">

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

                        <div class="unimind-ai-mini-icon">
                            ✨
                        </div>

                        <div>

                            <strong>
                                مرحبًا بك في UniMind AI 👋
                            </strong>

                            <p>
                                أنا مساعدك الدراسي الذكي.
                                اسألني عن المحاضرات أو البرمجة
                                أو أي موضوع جامعي.
                            </p>

                        </div>

                    </div>


                    <div class="unimind-suggestions">

                        <button type="button">
                            اشرح لي هذا الموضوع
                        </button>

                        <button type="button">
                            لخص لي هذا الدرس
                        </button>

                        <button type="button">
                            ساعدني في المذاكرة
                        </button>

                    </div>

                </div>


                <div class="unimind-chat-input-area">

                    <input
                        type="text"
                        id="unimind-chat-input"
                        placeholder="اكتب سؤالك هنا..."
                        autocomplete="off"
                    />


                    <button
                        type="button"
                        id="unimind-chat-send"
                    >
                        إرسال
                    </button>

                </div>


                <div class="unimind-chat-footer">

                    UniMind AI · مساعد جامعي ذكي

                </div>

            </div>
        `;


        initializeChat();

    }


    // =========================================================
    // OPEN CHAT
    // =========================================================

    function openChat() {

        console.log(
            "UniMind: openChat()"
        );


        createChatModal();


        const modal =
            document.getElementById(
                "unimind-chat-modal"
            );


        if (!modal) {

            console.error(
                "UniMind: Chat modal was not created"
            );

            return;
        }


        savedScrollY =
            window.scrollY;


        modal.classList.add(
            "active"
        );


        document.body.classList.add(
            "unimind-chat-open"
        );


        document.body.style.top =
            `-${savedScrollY}px`;


        const input =
            document.getElementById(
                "unimind-chat-input"
            );


        if (input) {

            setTimeout(
                function () {

                    input.focus();

                },
                150
            );

        }

    }


    // =========================================================
    // CLOSE CHAT
    // =========================================================

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


        document.body.classList.remove(
            "unimind-chat-open"
        );


        document.body.style.top =
            "";


        window.scrollTo(
            0,
            savedScrollY
        );

    }


    // =========================================================
    // INITIALIZE CHAT
    // =========================================================

    function initializeChat() {

        const closeButton =
            document.getElementById(
                "unimind-chat-close"
            );


        const overlay =
            document.querySelector(
                "#unimind-chat-modal .unimind-chat-overlay"
            );


        const sendButton =
            document.getElementById(
                "unimind-chat-send"
            );


        const input =
            document.getElementById(
                "unimind-chat-input"
            );


        if (closeButton) {

            closeButton.addEventListener(
                "click",
                closeChat
            );

        }


        if (overlay) {

            overlay.addEventListener(
                "click",
                closeChat
            );

        }


        if (sendButton) {

            sendButton.addEventListener(
                "click",
                sendMessage
            );

        }


        if (input) {

            input.addEventListener(
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

        }


        initializeSuggestions();

    }


    // =========================================================
    // CHAT SUGGESTIONS
    // =========================================================

    function initializeSuggestions() {

        document
            .querySelectorAll(
                "#unimind-chat-modal .unimind-suggestions button"
            )
            .forEach(function (button) {

                if (
                    button.dataset
                        .unimindSuggestionBound
                ) {

                    return;
                }


                button.dataset
                    .unimindSuggestionBound =
                    "true";


                button.addEventListener(
                    "click",
                    function () {

                        const input =
                            document.getElementById(
                                "unimind-chat-input"
                            );


                        if (!input) {
                            return;
                        }


                        input.value =
                            button.textContent
                                .trim();


                        input.focus();

                    }
                );

            });

    }


    // =========================================================
    // SEND MESSAGE
    // =========================================================

    async function sendMessage() {

        const input =
            document.getElementById(
                "unimind-chat-input"
            );


        const messages =
            document.getElementById(
                "unimind-chat-messages"
            );


        if (
            !input ||
            !messages
        ) {

            return;
        }


        const message =
            input.value.trim();


        if (!message) {
            return;
        }


        addChatMessage(
            message,
            "user"
        );


        input.value =
            "";


        const loading =
            addLoadingMessage();


        try {

            const response =
                await fetch(
                    API_URL,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                message:
                                    message
                            })
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "HTTP " +
                    response.status
                );

            }


            const data =
                await response.json();


            removeLoadingMessage(
                loading
            );


            const reply =
                data.reply ||
                data.message ||
                data.response ||
                "لم أتمكن من الحصول على إجابة.";


            addChatMessage(
                reply,
                "ai"
            );


        } catch (error) {

            console.error(
                "UniMind Chat Error:",
                error
            );


            removeLoadingMessage(
                loading
            );


            addChatMessage(
                "حدث خطأ أثناء الاتصال بالمساعد الذكي. حاول مرة أخرى.",
                "ai"
            );

        }

    }


    // =========================================================
    // ADD CHAT MESSAGE
    // =========================================================

    function addChatMessage(
        text,
        type
    ) {

        const messages =
            document.getElementById(
                "unimind-chat-messages"
            );


        if (!messages) {
            return;
        }


        const wrapper =
            document.createElement(
                "div"
            );


        wrapper.className =
            "unimind-message " +
            (
                type === "user"
                    ? "unimind-user-message"
                    : "unimind-ai-message"
            );


        if (
            type === "ai"
        ) {

            const header =
                document.createElement(
                    "div"
                );


            header.className =
                "unimind-message-header";


            const icon =
                document.createElement(
                    "span"
                );


            icon.className =
                "unimind-ai-mini-icon";


            icon.textContent =
                "✨";


            const name =
                document.createElement(
                    "strong"
                );


            name.textContent =
                "UniMind AI";


            header.appendChild(
                icon
            );


            header.appendChild(
                name
            );


            const content =
                document.createElement(
                    "div"
                );


            content.className =
                "unimind-message-content";


            content.innerHTML =
                formatMessage(
                    text
                );


            wrapper.appendChild(
                header
            );


            wrapper.appendChild(
                content
            );


        } else {

            const content =
                document.createElement(
                    "div"
                );


            content.className =
                "unimind-message-content";


            content.textContent =
                text;


            wrapper.appendChild(
                content
            );

        }


        messages.appendChild(
            wrapper
        );


        scrollChatToBottom();

    }


    // =========================================================
    // LOADING
    // =========================================================

    function addLoadingMessage() {

        const messages =
            document.getElementById(
                "unimind-chat-messages"
            );


        if (!messages) {
            return null;
        }


        const loading =
            document.createElement(
                "div"
            );


        loading.className =
            "unimind-message unimind-ai-message";


        loading.innerHTML = `

            <div class="unimind-message-header">

                <span class="unimind-ai-mini-icon">
                    ✨
                </span>

                <strong>
                    UniMind AI
                </strong>

            </div>


            <div class="unimind-loading-dots">

                <span></span>
                <span></span>
                <span></span>

            </div>
        `;


        messages.appendChild(
            loading
        );


        scrollChatToBottom();


        return loading;

    }


    function removeLoadingMessage(
        loading
    ) {

        if (
            loading &&
            loading.parentNode
        ) {

            loading.parentNode.removeChild(
                loading
            );

        }

    }


    // =========================================================
    // SCROLL CHAT
    // =========================================================

    function scrollChatToBottom() {

        const messages =
            document.getElementById(
                "unimind-chat-messages"
            );


        if (!messages) {
            return;
        }


        messages.scrollTop =
            messages.scrollHeight;

    }


    // =========================================================
    // FORMAT MESSAGE
    // =========================================================

    function formatMessage(
        text
    ) {

        let result =
            escapeHTML(
                String(text)
            );


        result =
            result.replace(
                /\*\*(.*?)\*\*/g,
                "<strong>$1</strong>"
            );


        result =
            result.replace(
                /\n/g,
                "<br>"
            );


        return result;

    }


    // =========================================================
    // ESCAPE HTML
    // =========================================================

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


    // =========================================================
    // LECTURE SUMMARIZER
    // =========================================================

    function createLectureModal() {

        if (
            document.getElementById(
                "unimind-lecture-modal"
            )
        ) {

            return;
        }


        const modal =
            document.createElement(
                "div"
            );


        modal.id =
            "unimind-lecture-modal";


        modal.innerHTML = `

            <div class="unimind-lecture-overlay"></div>


            <div class="unimind-lecture-window">

                <div class="unimind-lecture-header">

                    <div>

                        <strong>
                            📄 تلخيص المحاضرات
                        </strong>

                        <small>
                            ارفع محاضرتك للحصول على ملخص
                        </small>

                    </div>


                    <button
                        type="button"
                        id="unimind-lecture-close"
                    >
                        ×
                    </button>

                </div>


                <div class="unimind-lecture-body">

                    <div
                        class="unimind-upload-area"
                        id="unimind-upload-area"
                    >

                        <div class="unimind-upload-icon">
                            📄
                        </div>


                        <h3>
                            ارفع ملف المحاضرة
                        </h3>


                        <p>
                            PDF أو Word أو TXT
                        </p>


                        <button
                            type="button"
                            id="unimind-choose-file"
                        >
                            اختيار ملف
                        </button>


                        <input
                            type="file"
                            id="unimind-lecture-file"
                            accept=".pdf,.doc,.docx,.txt"
                            hidden
                        />

                    </div>


                    <div
                        id="unimind-selected-file"
                        style="display:none;"
                    >

                        <div>

                            <strong
                                id="unimind-file-name"
                            ></strong>

                            <small
                                id="unimind-file-size"
                            ></small>

                        </div>


                        <button
                            type="button"
                            id="unimind-remove-file"
                        >
                            حذف
                        </button>

                    </div>


                    <div
                        id="unimind-file-status"
                    ></div>


                    <div
                        id="unimind-text-preview"
                        style="display:none;"
                    >

                        <h4>
                            معاينة النص
                        </h4>


                        <div
                            id="unimind-text-content"
                        ></div>

                    </div>


                    <button
                        type="button"
                        id="unimind-summarize-button"
                        disabled
                    >
                        ✨ تلخيص المحاضرة
                    </button>


                    <div
                        id="unimind-summary-result"
                        style="display:none;"
                    >

                        <h3>
                            📝 ملخص المحاضرة
                        </h3>


                        <div
                            id="unimind-summary-content"
                        ></div>


                        <button
                            type="button"
                            id="unimind-copy-summary"
                        >
                            نسخ الملخص
                        </button>

                    </div>

                </div>

            </div>
        `;


        document.body.appendChild(
            modal
        );


        initializeLectureModal();

    }


    // =========================================================
    // OPEN LECTURE
    // =========================================================

    function openLectureModal() {

        console.log(
            "UniMind: openLectureModal()"
        );


        createLectureModal();


        const modal =
            document.getElementById(
                "unimind-lecture-modal"
            );


        if (!modal) {

            console.error(
                "UniMind: Lecture modal was not created"
            );

            return;
        }


        savedScrollY =
            window.scrollY;


        modal.classList.add(
            "active"
        );


        document.body.classList.add(
            "unimind-lecture-open"
        );


        document.body.style.top =
            `-${savedScrollY}px`;

    }


    // =========================================================
    // CLOSE LECTURE
    // =========================================================

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


        document.body.style.top =
            "";


        window.scrollTo(
            0,
            savedScrollY
        );

    }


    // =========================================================
    // INITIALIZE LECTURE
    // =========================================================

    function initializeLectureModal() {

        const modal =
            document.getElementById(
                "unimind-lecture-modal"
            );


        if (!modal) {
            return;
        }


        const closeButton =
            modal.querySelector(
                "#unimind-lecture-close"
            );


        const overlay =
            modal.querySelector(
                ".unimind-lecture-overlay"
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


        if (closeButton) {

            closeButton.addEventListener(
                "click",
                closeLectureModal
            );

        }


        if (overlay) {

            overlay.addEventListener(
                "click",
                closeLectureModal
            );

        }


        if (
            chooseButton &&
            fileInput
        ) {

            chooseButton.addEventListener(
                "click",
                function () {

                    fileInput.click();

                }
            );

        }


        if (fileInput) {

            fileInput.addEventListener(
                "change",
                function (event) {

                    const file =
                        event.target.files[0];


                    if (file) {

                        handleLectureFile(
                            file
                        );

                    }

                }
            );

        }


        if (uploadArea) {

            uploadArea.addEventListener(
                "dragover",
                function (event) {

                    event.preventDefault();

                    uploadArea.classList.add(
                        "dragging"
                    );

                }
            );


            uploadArea.addEventListener(
                "dragleave",
                function () {

                    uploadArea.classList.remove(
                        "dragging"
                    );

                }
            );


            uploadArea.addEventListener(
                "drop",
                function (event) {

                    event.preventDefault();


                    uploadArea.classList.remove(
                        "dragging"
                    );


                    const file =
                        event.dataTransfer.files[0];


                    if (file) {

                        handleLectureFile(
                            file
                        );

                    }

                }
            );

        }


        if (removeButton) {

            removeButton.addEventListener(
                "click",
                resetLectureFile
            );

        }


        if (summarizeButton) {

            summarizeButton.addEventListener(
                "click",
                summarizeLecture
            );

        }


        if (copyButton) {

            copyButton.addEventListener(
                "click",
                copySummary
            );

        }

    }


    // =========================================================
    // HANDLE LECTURE FILE
    // =========================================================

    function handleLectureFile(
        file
    ) {

        const extension =
            file.name
                .split(".")
                .pop()
                .toLowerCase();


        const allowedExtensions = [
            "pdf",
            "doc",
            "docx",
            "txt"
        ];


        if (
            !allowedExtensions.includes(
                extension
            )
        ) {

            showLectureStatus(
                "نوع الملف غير مدعوم. استخدم PDF أو Word أو TXT.",
                "error"
            );

            return;
        }


        if (
            file.size >
            25 * 1024 * 1024
        ) {

            showLectureStatus(
                "حجم الملف أكبر من 25MB.",
                "error"
            );

            return;
        }


        selectedLectureFile =
            file;


        const selected =
            document.getElementById(
                "unimind-selected-file"
            );


        const name =
            document.getElementById(
                "unimind-file-name"
            );


        const size =
            document.getElementById(
                "unimind-file-size"
            );


        const summarize =
            document.getElementById(
                "unimind-summarize-button"
            );


        if (selected) {

            selected.style.display =
                "flex";

        }


        if (name) {

            name.textContent =
                file.name;

        }


        if (size) {

            size.textContent =
                formatFileSize(
                    file.size
                );

        }


        if (summarize) {

            summarize.disabled =
                false;

        }


        showLectureStatus(
            "تم اختيار الملف بنجاح ✓",
            "success"
        );


        if (
            extension === "txt"
        ) {

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

                        preview.style.display =
                            "block";

                    }


                    if (content) {

                        content.textContent =
                            event.target.result;

                    }

                };


            reader.readAsText(
                file
            );

        } else {

            const preview =
                document.getElementById(
                    "unimind-text-preview"
                );


            if (preview) {

                preview.style.display =
                    "none";

            }

        }

    }


    // =========================================================
    // RESET LECTURE FILE
    // =========================================================

    function resetLectureFile() {

        selectedLectureFile =
            null;


        const fileInput =
            document.getElementById(
                "unimind-lecture-file"
            );


        const selected =
            document.getElementById(
                "unimind-selected-file"
            );


        const summarize =
            document.getElementById(
                "unimind-summarize-button"
            );


        const preview =
            document.getElementById(
                "unimind-text-preview"
            );


        const content =
            document.getElementById(
                "unimind-text-content"
            );


        if (fileInput) {

            fileInput.value =
                "";

        }


        if (selected) {

            selected.style.display =
                "none";

        }


        if (summarize) {

            summarize.disabled =
                true;

        }


        if (preview) {

            preview.style.display =
                "none";

        }


        if (content) {

            content.textContent =
                "";

        }


        showLectureStatus(
            "",
            ""
        );

    }


    // =========================================================
    // LECTURE STATUS
    // =========================================================

    function showLectureStatus(
        message,
        type
    ) {

        const status =
            document.getElementById(
                "unimind-file-status"
            );


        if (!status) {
            return;
        }


        status.textContent =
            message;


        status.className =
            type
                ? "lecture-status " + type
                : "";

    }


    // =========================================================
    // FILE SIZE
    // =========================================================

    function formatFileSize(
        bytes
    ) {

        if (
            bytes === 0
        ) {

            return "0 Bytes";

        }


        const sizes = [
            "Bytes",
            "KB",
            "MB",
            "GB"
        ];


        const i =
            Math.floor(
                Math.log(bytes) /
                Math.log(1024)
            );


        return (
            parseFloat(
                (
                    bytes /
                    Math.pow(
                        1024,
                        i
                    )
                ).toFixed(2)
            ) +
            " " +
            sizes[i]
        );

    }


    // =========================================================
    // SUMMARIZE LECTURE
    // =========================================================

    async function summarizeLecture() {

        if (
            !selectedLectureFile
        ) {

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


        if (button) {

            button.disabled =
                true;


            button.textContent =
                "⏳ جاري تجهيز المحاضرة...";

        }


        if (result) {

            result.style.display =
                "block";

        }


        if (content) {

            content.innerHTML = `

                <div>
                    ⏳ تم رفع المحاضرة بنجاح.
                </div>

                <br>

                <div>
                    📄 الملف:
                    <strong>
                        ${escapeHTML(
                            selectedLectureFile.name
                        )}
                    </strong>
                </div>

                <br>

                <div>
                    ⚠️ محرك استخراج النص وتلخيص
                    ملفات PDF وWord يحتاج إلى ربط
                    خدمة المعالجة الخلفية.
                </div>

                <br>

                <div>
                    يمكنك حاليًا تجربة رفع ملف TXT
                    ومعاينته داخل UniMind AI.
                </div>

            `;

        }


        if (button) {

            button.disabled =
                false;


            button.textContent =
                "✨ تلخيص المحاضرة";

        }

    }


    // =========================================================
    // COPY SUMMARY
    // =========================================================

    async function copySummary() {

        const content =
            document.getElementById(
                "unimind-summary-content"
            );


        if (!content) {
            return;
        }


        const text =
            content.innerText ||
            content.textContent ||
            "";


        try {

            await navigator.clipboard.writeText(
                text
            );


            alert(
                "تم نسخ الملخص بنجاح ✓"
            );


        } catch (error) {

            console.error(
                error
            );


            alert(
                "تعذر نسخ الملخص."
            );

        }

    }


    // =========================================================
    // THEME
    // =========================================================

    function setupTheme() {

        const button =
            document.querySelector(
                ".theme-btn"
            );


        if (!button) {
            return;
        }


        if (
            button.dataset
                .unimindThemeBound
        ) {

            return;
        }


        button.dataset
            .unimindThemeBound =
            "true";


        button.addEventListener(
            "click",
            function () {

                document.body.classList.toggle(
                    "dark-mode"
                );


                const isDark =
                    document.body.classList.contains(
                        "dark-mode"
                    );


                localStorage.setItem(
                    "unimind-theme",
                    isDark
                        ? "dark"
                        : "light"
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

        const button =
            document.querySelector(
                ".language-btn"
            );


        if (!button) {
            return;
        }


        if (
            button.dataset
                .unimindLanguageBound
        ) {

            return;
        }


        button.dataset
            .unimindLanguageBound =
            "true";


        button.addEventListener(
            "click",
            function () {

                alert(
                    "اللغة العربية هي اللغة الأساسية حاليًا في UniMind AI."
                );

            }
        );

    }


    // =========================================================
    // LOGIN
    // =========================================================

    function setupLogin() {

        const button =
            document.querySelector(
                ".login-btn"
            );


        if (!button) {
            return;
        }


        if (
            button.dataset
                .unimindLoginBound
        ) {

            return;
        }


        button.dataset
            .unimindLoginBound =
            "true";


        button.addEventListener(
            "click",
            function (event) {

                event.preventDefault();


                alert(
                    "نظام تسجيل الدخول سيتم تفعيله قريبًا."
                );

            }
        );

    }


    // =========================================================
    // KEYBOARD
    // =========================================================

    function setupKeyboard() {

        if (
            window.__UNIMIND_KEYBOARD_READY__
        ) {

            return;
        }


        window.__UNIMIND_KEYBOARD_READY__ =
            true;


        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key !== "Escape"
                ) {

                    return;

                }


                const chatModal =
                    document.getElementById(
                        "unimind-chat-modal"
                    );


                const lectureModal =
                    document.getElementById(
                        "unimind-lecture-modal"
                    );


                if (
                    chatModal &&
                    chatModal.classList.contains(
                        "active"
                    )
                ) {

                    closeChat();

                    return;

                }


                if (
                    lectureModal &&
                    lectureModal.classList.contains(
                        "active"
                    )
                ) {

                    closeLectureModal();

                }

            }
        );

    }

})();
```

(function () {

    "use strict";

    // =========================================================
    // UniMind AI
    // Main JavaScript v33
    // Smart Quiz Fixed Edition
    // =========================================================

    const API_URL =
        "https://yzsfublvnwknjnayfosm.supabase.co/functions/v1/unimind-chat";

    let savedScrollY = 0;
    let selectedLectureFile = null;

    // Quiz state
    let quizQuestions = [];
    let currentQuizIndex = 0;
    let quizScore = 0;
    let quizAnswered = false;
    let quizSourceText = "";

    // =========================================================
    // EXTERNAL LIBRARIES
    // =========================================================

    let pdfLibraryPromise = null;
    let mammothLibraryPromise = null;

    function loadScript(src) {

        return new Promise(function (resolve, reject) {

            const existing =
                document.querySelector(
                    'script[src="' + src + '"]'
                );

            if (existing) {

                if (
                    existing.dataset.loaded === "true"
                ) {
                    resolve();
                    return;
                }

                existing.addEventListener(
                    "load",
                    resolve,
                    { once: true }
                );

                existing.addEventListener(
                    "error",
                    reject,
                    { once: true }
                );

                return;
            }

            const script =
                document.createElement("script");

            script.src = src;
            script.async = true;

            script.onload =
                function () {

                    script.dataset.loaded =
                        "true";

                    resolve();
                };

            script.onerror =
                function () {

                    reject(
                        new Error(
                            "تعذر تحميل مكتبة معالجة الملفات."
                        )
                    );
                };

            document.head.appendChild(script);
        });
    }


    function loadPDFLibrary() {

        if (pdfLibraryPromise) {
            return pdfLibraryPromise;
        }

        pdfLibraryPromise =
            loadScript(
                "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
            ).then(function () {

                if (!window.pdfjsLib) {

                    throw new Error(
                        "مكتبة PDF.js غير متاحة."
                    );
                }

                window.pdfjsLib.GlobalWorkerOptions.workerSrc =
                    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

                return window.pdfjsLib;
            });

        return pdfLibraryPromise;
    }


    function loadMammothLibrary() {

        if (mammothLibraryPromise) {
            return mammothLibraryPromise;
        }

        mammothLibraryPromise =
            loadScript(
                "https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.8.0/mammoth.browser.min.js"
            ).then(function () {

                if (!window.mammoth) {

                    throw new Error(
                        "مكتبة Word غير متاحة."
                    );
                }

                return window.mammoth;
            });

        return mammothLibraryPromise;
    }


    // =========================================================
    // UTILITIES
    // =========================================================

    function escapeHTML(value) {

        const div =
            document.createElement("div");

        div.textContent =
            String(value ?? "");

        return div.innerHTML;
    }


    function formatMessage(text) {

        let result =
            escapeHTML(text);

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


    function formatFileSize(bytes) {

        if (!bytes) {
            return "0 Bytes";
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

        return (
            parseFloat(
                (
                    bytes /
                    Math.pow(
                        1024,
                        index
                    )
                ).toFixed(2)
            ) +
            " " +
            units[index]
        );
    }


    function setLectureButtonLoading(
        loading
    ) {

        const button =
            document.getElementById(
                "unimind-summarize-button"
            );

        if (!button) {
            return;
        }

        button.disabled =
            loading;

        button.textContent =
            loading
                ? "⏳ جاري استخراج النص وتلخيص المحاضرة..."
                : "✨ تلخيص المحاضرة";
    }


    function getFileExtension(file) {

        return file.name
            .split(".")
            .pop()
            .toLowerCase();
    }


    // =========================================================
    // CHAT MODAL
    // =========================================================

    function createChatModal() {

        let modal =
            document.getElementById(
                "unimind-chat-modal"
            );

        if (!modal) {

            modal =
                document.createElement("div");

            modal.id =
                "unimind-chat-modal";

            document.body.appendChild(
                modal
            );
        }

        if (
            !modal.querySelector(
                ".unimind-chat-window"
            )
        ) {

            buildChatModal(modal);
        }

        return modal;
    }


    function buildChatModal(modal) {

        modal.innerHTML = `

            <div class="unimind-chat-overlay"></div>

            <div
                class="unimind-chat-window"
                role="dialog"
                aria-modal="true"
                aria-label="مساعد الدراسة الذكي"
            >

                <div class="unimind-chat-header">

                    <div class="unimind-chat-brand">

                        <div class="unimind-chat-logo">
                            🧠
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

                    <button
                        type="button"
                        id="unimind-chat-close"
                        aria-label="إغلاق"
                    >
                        ×
                    </button>

                </div>

                <div
                    class="unimind-chat-messages"
                    id="unimind-chat-messages"
                >

                    <div class="unimind-welcome-message">

                        <div class="unimind-ai-mini-icon">
                            🧠
                        </div>

                        <div>

                            <strong>
                                مرحبًا بك في UniMind AI 👋
                            </strong>

                            <p>
                                أنا مساعدك الدراسي الذكي.
                                اسألني عن البرمجة أو المحاضرات
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
                    >

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


    function openChat() {

        console.log(
            "UniMind: opening study assistant..."
        );

        const modal =
            createChatModal();

        if (!modal) {

            alert(
                "تعذر فتح مساعد الدراسة."
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

        console.log(
            "UniMind: study assistant opened"
        );
    }


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
            closeButton.onclick =
                closeChat;
        }

        if (overlay) {
            overlay.onclick =
                closeChat;
        }

        if (sendButton) {
            sendButton.onclick =
                sendMessage;
        }

        if (input) {

            input.onkeydown =
                function (event) {

                    if (
                        event.key === "Enter"
                    ) {

                        event.preventDefault();

                        sendMessage();
                    }
                };
        }

        initializeSuggestions();
    }


    function initializeSuggestions() {

        document
            .querySelectorAll(
                "#unimind-chat-modal .unimind-suggestions button"
            )
            .forEach(
                function (button) {

                    button.onclick =
                        function () {

                            const input =
                                document.getElementById(
                                    "unimind-chat-input"
                                );

                            if (!input) {
                                return;
                            }

                            input.value =
                                button.textContent.trim();

                            input.focus();
                        };
                }
            );
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

        const sendButton =
            document.getElementById(
                "unimind-chat-send"
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

        input.value = "";

        if (sendButton) {

            sendButton.disabled =
                true;

            sendButton.textContent =
                "جاري...";
        }

        const loading =
            addLoadingMessage();

        try {

            console.log(
                "UniMind: sending request to Supabase..."
            );

            const response =
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

                        body:
                            JSON.stringify({
                                message:
                                    message
                            })
                    }
                );

            const rawText =
                await response.text();

            console.log(
                "UniMind API status:",
                response.status
            );

            console.log(
                "UniMind API response:",
                rawText
            );

            let data = {};

            try {

                data =
                    rawText
                        ? JSON.parse(rawText)
                        : {};

            } catch (jsonError) {

                console.error(
                    "UniMind JSON error:",
                    jsonError
                );

                throw new Error(
                    "استجابة غير صالحة من الخادم."
                );
            }

            if (!response.ok) {

                const serverMessage =
                    data.error ||
                    data.message ||
                    data.error_description ||
                    rawText ||
                    "فشل الاتصال بالخادم.";

                throw new Error(
                    serverMessage
                );
            }

            removeLoadingMessage(
                loading
            );

            const reply =
                data.reply ||
                data.message ||
                data.response ||
                data.answer ||
                data.content ||
                "";

            if (!reply) {

                addChatMessage(
                    "وصلت الاستجابة من الخادم، لكن لم يتم العثور على نص الإجابة.",
                    "ai"
                );

            } else {

                addChatMessage(
                    reply,
                    "ai"
                );
            }

        } catch (error) {

            console.error(
                "UniMind Chat Error:",
                error
            );

            removeLoadingMessage(
                loading
            );

            let errorMessage =
                "حدث خطأ أثناء الاتصال بالمساعد الذكي.";

            if (
                error &&
                error.message
            ) {

                errorMessage +=
                    "\n\nالتفاصيل: " +
                    error.message;
            }

            addChatMessage(
                errorMessage,
                "ai"
            );

        } finally {

            if (sendButton) {

                sendButton.disabled =
                    false;

                sendButton.textContent =
                    "إرسال";
            }

            input.focus();
        }
    }


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
            document.createElement("div");

        wrapper.className =
            "unimind-message " +
            (
                type === "user"
                    ? "unimind-user-message"
                    : "unimind-ai-message"
            );

        if (type === "ai") {

            const header =
                document.createElement("div");

            header.className =
                "unimind-message-header";

            const icon =
                document.createElement("span");

            icon.className =
                "unimind-ai-mini-icon";

            icon.textContent =
                "🧠";

            const name =
                document.createElement("strong");

            name.textContent =
                "UniMind AI";

            header.appendChild(
                icon
            );

            header.appendChild(
                name
            );

            const content =
                document.createElement("div");

            content.className =
                "unimind-message-content";

            content.innerHTML =
                formatMessage(text);

            wrapper.appendChild(
                header
            );

            wrapper.appendChild(
                content
            );

        } else {

            const content =
                document.createElement("div");

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


    function addLoadingMessage() {

        const messages =
            document.getElementById(
                "unimind-chat-messages"
            );

        if (!messages) {
            return null;
        }

        const loading =
            document.createElement("div");

        loading.className =
            "unimind-message unimind-ai-message";

        loading.innerHTML = `

            <div class="unimind-message-header">

                <span class="unimind-ai-mini-icon">
                    🧠
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
    // LECTURE SUMMARIZER
    // =========================================================

    function openLectureModal() {

        const modal =
            document.getElementById(
                "unimind-lecture-modal"
            );

        if (!modal) {

            console.error(
                "UniMind: lecture modal not found"
            );

            return;
        }

        savedScrollY =
            window.scrollY;

        modal.classList.add(
            "active"
        );

        modal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.style.top =
            `-${savedScrollY}px`;

        console.log(
            "UniMind: lecture modal opened"
        );
    }


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

        modal.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.style.top =
            "";

        window.scrollTo(
            0,
            savedScrollY
        );
    }


    function setupLectureFeature() {

        const button =
            document.getElementById(
                "lectureSummarizerButton"
            );

        if (button) {

            button.onclick =
                function (event) {

                    event.preventDefault();

                    openLectureModal();
                };
        }

        const closeButton =
            document.getElementById(
                "unimind-lecture-close"
            );

        const overlay =
            document.getElementById(
                "unimind-lecture-overlay"
            );

        if (closeButton) {

            closeButton.onclick =
                closeLectureModal;
        }

        if (overlay) {

            overlay.onclick =
                closeLectureModal;
        }

        setupLectureFileUpload();
    }


    function setupLectureFileUpload() {

        const fileInput =
            document.getElementById(
                "unimind-lecture-file"
            );

        const chooseButton =
            document.getElementById(
                "unimind-choose-file"
            );

        const uploadArea =
            document.getElementById(
                "unimind-upload-area"
            );

        const removeButton =
            document.getElementById(
                "unimind-remove-file"
            );

        const summarizeButton =
            document.getElementById(
                "unimind-summarize-button"
            );

        const copyButton =
            document.getElementById(
                "unimind-copy-summary"
            );

        if (
            chooseButton &&
            fileInput
        ) {

            chooseButton.onclick =
                function () {

                    fileInput.click();
                };
        }

        if (fileInput) {

            fileInput.onchange =
                function () {

                    const file =
                        fileInput.files &&
                        fileInput.files[0];

                    if (file) {

                        handleLectureFile(
                            file
                        );
                    }
                };
        }

        if (uploadArea) {

            uploadArea.ondragover =
                function (event) {

                    event.preventDefault();

                    uploadArea.classList.add(
                        "dragover"
                    );
                };

            uploadArea.ondragleave =
                function () {

                    uploadArea.classList.remove(
                        "dragover"
                    );
                };

            uploadArea.ondrop =
                function (event) {

                    event.preventDefault();

                    uploadArea.classList.remove(
                        "dragover"
                    );

                    const file =
                        event.dataTransfer.files &&
                        event.dataTransfer.files[0];

                    if (file) {

                        handleLectureFile(
                            file
                        );
                    }
                };
        }

        if (removeButton) {

            removeButton.onclick =
                resetLectureFile;
        }

        if (summarizeButton) {

            summarizeButton.onclick =
                summarizeLecture;
        }

        if (copyButton) {

            copyButton.onclick =
                copySummary;
        }
    }


    function handleLectureFile(file) {

        const extension =
            getFileExtension(file);

        const allowed =
            [
                "pdf",
                "doc",
                "docx",
                "txt"
            ];

        if (
            !allowed.includes(
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

        const status =
            document.getElementById(
                "unimind-file-status"
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

        const result =
            document.getElementById(
                "unimind-summary-result"
            );

        if (selected) {
            selected.style.display =
                "block";
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

        if (status) {

            status.textContent =
                "تم اختيار الملف بنجاح ✓";

            status.className =
                "lecture-status";
        }

        if (result) {
            result.style.display =
                "none";
        }

        if (
            extension === "txt" &&
            preview &&
            content
        ) {

            preview.style.display =
                "block";

            const reader =
                new FileReader();

            reader.onload =
                function (event) {

                    content.value =
                        event.target.result ||
                        "";
                };

            reader.readAsText(
                file
            );

        } else if (preview) {

            preview.style.display =
                "none";
        }
    }


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

        const result =
            document.getElementById(
                "unimind-summary-result"
            );

        const summaryContent =
            document.getElementById(
                "unimind-summary-content"
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

            summarize.textContent =
                "✨ تلخيص المحاضرة";
        }

        if (preview) {
            preview.style.display =
                "none";
        }

        if (content) {
            content.value =
                "";
        }

        if (result) {
            result.style.display =
                "none";
        }

        if (summaryContent) {
            summaryContent.textContent =
                "";
        }

        showLectureStatus(
            "لم يتم اختيار ملف بعد.",
            ""
        );
    }


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
                : "lecture-status";
    }


    // =========================================================
    // PDF TEXT EXTRACTION
    // =========================================================

    async function extractTextFromPDF(file) {

        console.log(
            "UniMind: loading PDF.js..."
        );

        const pdfjsLib =
            await loadPDFLibrary();

        const arrayBuffer =
            await file.arrayBuffer();

        const pdf =
            await pdfjsLib.getDocument({
                data: arrayBuffer
            }).promise;

        console.log(
            "UniMind: PDF pages:",
            pdf.numPages
        );

        let pagesText = [];

        for (
            let pageNumber = 1;
            pageNumber <= pdf.numPages;
            pageNumber++
        ) {

            const page =
                await pdf.getPage(
                    pageNumber
                );

            const textContent =
                await page.getTextContent();

            const pageText =
                textContent.items
                    .map(function (item) {

                        return item.str || "";

                    })
                    .join(" ")
                    .replace(
                        /\s+/g,
                        " "
                    )
                    .trim();

            if (pageText) {

                pagesText.push(
                    "صفحة " +
                    pageNumber +
                    ":\n" +
                    pageText
                );
            }
        }

        return pagesText.join(
            "\n\n"
        ).trim();
    }


    // =========================================================
    // WORD TEXT EXTRACTION
    // =========================================================

    async function extractTextFromWord(file) {

        console.log(
            "UniMind: loading Word processor..."
        );

        const mammoth =
            await loadMammothLibrary();

        const arrayBuffer =
            await file.arrayBuffer();

        const result =
            await mammoth.extractRawText({
                arrayBuffer:
                    arrayBuffer
            });

        return String(
            result.value || ""
        )
            .replace(
                /\s+/g,
                " "
            )
            .trim();
    }


    // =========================================================
    // TEXT EXTRACTION
    // =========================================================

    async function extractLectureText(file) {

        const extension =
            getFileExtension(file);

        if (extension === "txt") {

            return new Promise(
                function (resolve, reject) {

                    const reader =
                        new FileReader();

                    reader.onload =
                        function (event) {

                            resolve(
                                String(
                                    event.target.result ||
                                    ""
                                ).trim()
                            );
                        };

                    reader.onerror =
                        function () {

                            reject(
                                new Error(
                                    "تعذر قراءة الملف النصي."
                                )
                            );
                        };

                    reader.readAsText(
                        file
                    );
                }
            );
        }


        if (extension === "pdf") {

            return extractTextFromPDF(
                file
            );
        }


        if (
            extension === "doc" ||
            extension === "docx"
        ) {

            if (extension === "doc") {

                throw new Error(
                    "ملفات Word القديمة بصيغة DOC غير مدعومة مباشرة في المتصفح. استخدم DOCX أو PDF."
                );
            }

            return extractTextFromWord(
                file
            );
        }


        throw new Error(
            "نوع الملف غير مدعوم."
        );
    }


    // =========================================================
    // LIMIT TEXT
    // =========================================================

    function prepareTextForAI(text) {

        const cleanText =
            String(text || "")
                .replace(
                    /\r/g,
                    ""
                )
                .replace(
                    /[ \t]+/g,
                    " "
                )
                .replace(
                    /\n{3,}/g,
                    "\n\n"
                )
                .trim();

        const MAX_CHARS =
            60000;

        if (
            cleanText.length <=
            MAX_CHARS
        ) {

            return {
                text: cleanText,
                truncated: false
            };
        }

        return {
            text:
                cleanText.slice(
                    0,
                    MAX_CHARS
                ),

            truncated:
                true
        };
    }


    // =========================================================
    // ASK AI FOR SUMMARY
    // =========================================================

    async function requestLectureSummary(
        lectureText,
        fileName
    ) {

        const prepared =
            prepareTextForAI(
                lectureText
            );

        const prompt = `

أنت مساعد أكاديمي متخصص في تلخيص المحاضرات والمواد الجامعية.

أريد منك تلخيص الملف الجامعي التالي باللغة العربية بطريقة واضحة ومنظمة.

اسم الملف:
${fileName}

المطلوب:

1. اكتب عنوانًا مناسبًا للمحاضرة.
2. استخرج أهم الأفكار والمفاهيم.
3. رتب المعلومات في نقاط واضحة.
4. اشرح المصطلحات المهمة باختصار.
5. اذكر التعريفات والقواعد أو الخطوات المهمة إن وجدت.
6. استخرج أهم النقاط التي يمكن أن تأتي في الامتحان.
7. في النهاية اكتب قسمًا بعنوان "الخلاصة السريعة".
8. لا تقل إنك لا تستطيع قراءة الملف.
9. لا تخترع معلومات غير موجودة في النص.
10. اجعل الملخص مناسبًا لطالب جامعي ويركز على المعلومات المهمة.

نص المحاضرة:

${prepared.text}

${prepared.truncated
    ? "\nملاحظة: الملف طويل جدًا، وتم إرسال أول جزء من النص فقط لتجنب تجاوز الحد المسموح."
    : ""
}

أعد لي الملخص مباشرة باللغة العربية.
`;

        console.log(
            "UniMind: sending lecture text to AI...",
            {
                characters:
                    prepared.text.length,
                file:
                    fileName
            }
        );

        const response =
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

                    body:
                        JSON.stringify({
                            message:
                                prompt
                        })
                }
            );

        const rawText =
            await response.text();

        console.log(
            "UniMind lecture API status:",
            response.status
        );

        console.log(
            "UniMind lecture API response:",
            rawText
        );

        let data = {};

        try {

            data =
                rawText
                    ? JSON.parse(rawText)
                    : {};

        } catch (error) {

            throw new Error(
                "الخادم أعاد استجابة غير صالحة."
            );
        }

        if (!response.ok) {

            throw new Error(
                data.error ||
                data.message ||
                data.error_description ||
                rawText ||
                "فشل الاتصال بخدمة الذكاء الاصطناعي."
            );
        }

        const reply =
            data.reply ||
            data.message ||
            data.response ||
            data.answer ||
            data.content ||
            "";

        if (!String(reply).trim()) {

            throw new Error(
                "تمت معالجة الملف، لكن لم يتم إنشاء ملخص."
            );
        }

        return String(
            reply
        ).trim();
    }


    // =========================================================
    // SHOW SUMMARY
    // =========================================================

    function showSummary(
        summary
    ) {

        const result =
            document.getElementById(
                "unimind-summary-result"
            );

        const content =
            document.getElementById(
                "unimind-summary-content"
            );

        if (!content) {
            return;
        }

        content.innerHTML =
            formatMessage(
                summary
            );

        if (result) {

            result.style.display =
                "block";

            result.scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            });
        }
    }


    // =========================================================
    // SUMMARIZE LECTURE
    // =========================================================

    async function summarizeLecture() {

        if (!selectedLectureFile) {

            alert(
                "اختر ملف المحاضرة أولًا."
            );

            return;
        }

        const result =
            document.getElementById(
                "unimind-summary-result"
            );

        const content =
            document.getElementById(
                "unimind-summary-content"
            );

        setLectureButtonLoading(
            true
        );

        if (result) {

            result.style.display =
                "block";
        }

        if (content) {

            content.innerHTML = `

                <div class="lecture-processing">

                    <strong>
                        🔍 جاري قراءة الملف...
                    </strong>

                    <br><br>

                    يتم استخراج النص من المحاضرة
                    وتجهيزه للذكاء الاصطناعي.

                </div>
            `;
        }

        try {

            showLectureStatus(
                "جاري استخراج النص من الملف...",
                ""
            );

            console.log(
                "UniMind: extracting lecture text..."
            );

            const extractedText =
                await extractLectureText(
                    selectedLectureFile
                );

            console.log(
                "UniMind: extracted characters:",
                extractedText.length
            );

            if (
                !extractedText ||
                !extractedText.trim()
            ) {

                throw new Error(
                    "لم يتم العثور على نص داخل الملف. إذا كان PDF عبارة عن صور ممسوحة ضوئيًا، فسيحتاج إلى OCR."
                );
            }

            showLectureStatus(
                "تم استخراج النص ✓ جاري إنشاء الملخص بالذكاء الاصطناعي...",
                ""
            );

            if (content) {

                content.innerHTML = `

                    <div class="lecture-processing">

                        <strong>
                            🤖 جاري إنشاء الملخص...
                        </strong>

                        <br><br>

                        تم استخراج النص بنجاح.
                        الآن يقوم UniMind AI بتحليل
                        محتوى المحاضرة وترتيب أهم النقاط.

                    </div>
                `;
            }

            const summary =
                await requestLectureSummary(
                    extractedText,
                    selectedLectureFile.name
                );

            showSummary(
                summary
            );

            showLectureStatus(
                "تم تلخيص المحاضرة بنجاح ✓",
                "success"
            );

        } catch (error) {

            console.error(
                "UniMind Lecture Summary Error:",
                error
            );

            const message =
                error &&
                error.message
                    ? error.message
                    : "حدث خطأ أثناء معالجة الملف.";

            if (content) {

                content.innerHTML = `

                    <div class="lecture-error">

                        <strong>
                            ❌ تعذر تلخيص المحاضرة
                        </strong>

                        <br><br>

                        ${escapeHTML(
                            message
                        )}

                    </div>
                `;
            }

            showLectureStatus(
                "حدث خطأ أثناء معالجة الملف.",
                "error"
            );

        } finally {

            setLectureButtonLoading(
                false
            );
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

        if (!text.trim()) {

            alert(
                "لا يوجد ملخص لنسخه بعد."
            );

            return;
        }

        try {

            if (
                navigator.clipboard &&
                navigator.clipboard.writeText
            ) {

                await navigator.clipboard.writeText(
                    text.trim()
                );

            } else {

                const textarea =
                    document.createElement(
                        "textarea"
                    );

                textarea.value =
                    text.trim();

                textarea.style.position =
                    "fixed";

                textarea.style.opacity =
                    "0";

                document.body.appendChild(
                    textarea
                );

                textarea.select();

                document.execCommand(
                    "copy"
                );

                textarea.remove();
            }

            const button =
                document.getElementById(
                    "unimind-copy-summary"
                );

            if (button) {

                const oldText =
                    button.textContent;

                button.textContent =
                    "تم النسخ ✓";

                setTimeout(
                    function () {

                        button.textContent =
                            oldText;

                    },
                    1500
                );
            }

        } catch (error) {

            console.error(
                "Copy error:",
                error
            );

            alert(
                "تعذر نسخ الملخص."
            );
        }
    }


    // =========================================================
    // SMART QUIZ
    // =========================================================

    function createQuizModal() {

        let modal =
            document.getElementById(
                "unimind-quiz-modal"
            );

        if (modal) {
            return modal;
        }

        modal =
            document.createElement("div");

        modal.id =
            "unimind-quiz-modal";

        modal.innerHTML = `

            <div class="unimind-quiz-overlay"></div>

            <div
                class="unimind-quiz-window"
                role="dialog"
                aria-modal="true"
                aria-label="الاختبارات الذكية"
            >

                <div class="unimind-quiz-header">

                    <div>

                        <div class="unimind-quiz-title">
                            🧠 الاختبارات الذكية
                        </div>

                        <div class="unimind-quiz-subtitle">
                            اختبر معلوماتك باستخدام UniMind AI
                        </div>

                    </div>

                    <button
                        type="button"
                        id="unimind-quiz-close"
                        class="unimind-quiz-close"
                    >
                        ×
                    </button>

                </div>

                <div
                    id="unimind-quiz-content"
                    class="unimind-quiz-content"
                >

                    <div class="unimind-quiz-start">

                        <div class="unimind-quiz-icon">
                            🧠
                        </div>

                        <h2>
                            أنشئ اختبارك الذكي
                        </h2>

                        <p>
                            اكتب موضوعًا دراسيًا أو الصق
                            جزءًا من محاضرتك، وسيقوم UniMind AI
                            بإنشاء اختبار لك.
                        </p>

                        <label
                            for="unimind-quiz-topic"
                            class="unimind-quiz-label"
                        >
                            موضوع الاختبار أو محتوى المحاضرة
                        </label>

                        <textarea
                            id="unimind-quiz-topic"
                            class="unimind-quiz-textarea"
                            rows="7"
                            placeholder="مثال: اشرح لي أساسيات أمن المعلومات، أو الصق هنا نص المحاضرة..."
                        ></textarea>

                        <div class="unimind-quiz-options">

                            <label
                                for="unimind-quiz-count"
                                class="unimind-quiz-label"
                            >
                                عدد الأسئلة
                            </label>

                            <select
                                id="unimind-quiz-count"
                                class="unimind-quiz-select"
                            >

                                <option value="5">
                                    5 أسئلة
                                </option>

                                <option value="10">
                                    10 أسئلة
                                </option>

                                <option value="15">
                                    15 سؤالًا
                                </option>

                            </select>

                        </div>

                        <button
                            type="button"
                            id="unimind-generate-quiz"
                            class="unimind-quiz-primary"
                        >
                            ✨ إنشاء الاختبار
                        </button>

                    </div>

                </div>

            </div>
        `;

        document.body.appendChild(
            modal
        );

        initializeQuizModal();

        return modal;
    }


    function initializeQuizModal() {

        const modal =
            document.getElementById(
                "unimind-quiz-modal"
            );

        if (!modal) {
            return;
        }

        const close =
            document.getElementById(
                "unimind-quiz-close"
            );

        const overlay =
            modal.querySelector(
                ".unimind-quiz-overlay"
            );

        const generate =
            document.getElementById(
                "unimind-generate-quiz"
            );

        if (close) {
            close.onclick =
                closeQuizModal;
        }

        if (overlay) {
            overlay.onclick =
                closeQuizModal;
        }

        if (generate) {
            generate.onclick =
                generateQuiz;
        }
    }


    function openQuizModal() {

        const modal =
            createQuizModal();

        if (!modal) {
            return;
        }

        savedScrollY =
            window.scrollY;

        modal.classList.add(
            "active"
        );

        document.body.style.top =
            `-${savedScrollY}px`;

        const topic =
            document.getElementById(
                "unimind-quiz-topic"
            );

        if (topic) {

            setTimeout(
                function () {
                    topic.focus();
                },
                150
            );
        }

        console.log(
            "UniMind: Smart Quiz modal opened"
        );
    }


    function closeQuizModal() {

        const modal =
            document.getElementById(
                "unimind-quiz-modal"
            );

        if (!modal) {
            return;
        }

        modal.classList.remove(
            "active"
        );

        document.body.style.top =
            "";

        window.scrollTo(
            0,
            savedScrollY
        );
    }


    function cleanAIJSON(text) {

        let cleaned =
            String(text || "")
                .trim();

        cleaned =
            cleaned.replace(
                /^```json\s*/i,
                ""
            );

        cleaned =
            cleaned.replace(
                /^```\s*/i,
                ""
            );

        cleaned =
            cleaned.replace(
                /\s*```$/i,
                ""
            );

        const firstBrace =
            cleaned.indexOf("{");

        const lastBrace =
            cleaned.lastIndexOf("}");

        if (
            firstBrace !== -1 &&
            lastBrace !== -1 &&
            lastBrace > firstBrace
        ) {

            cleaned =
                cleaned.slice(
                    firstBrace,
                    lastBrace + 1
                );
        }

        return cleaned.trim();
    }


    // =========================================================
    // FIXED QUIZ NORMALIZATION
    // =========================================================

    function normalizeQuizData(data) {

        let questions = [];

        if (
            data &&
            Array.isArray(
                data.questions
            )
        ) {

            questions =
                data.questions;
        }

        if (!questions.length) {
            return [];
        }

        return questions
            .map(function (question) {

                const options =
                    Array.isArray(
                        question.options
                    )
                        ? question.options
                        : [];

                let correct =
                    question.correct;

                if (
                    typeof correct ===
                    "string"
                ) {

                    const letter =
                        correct
                            .trim()
                            .toUpperCase();

                    const letters = [
                        "A",
                        "B",
                        "C",
                        "D"
                    ];

                    if (
                        letters.includes(
                            letter
                        )
                    ) {

                        correct =
                            letters.indexOf(
                                letter
                            );

                    } else {

                        const number =
                            parseInt(
                                correct,
                                10
                            );

                        if (
                            !Number.isNaN(
                                number
                            )
                        ) {

                            correct =
                                number > 0
                                    ? number - 1
                                    : number;
                        }
                    }
                }

                correct =
                    Number(correct);

                return {

                    question:
                        String(
                            question.question ||
                            question.text ||
                            ""
                        ).trim(),

                    options:
                        options
                            .map(function (option) {

                                return String(
                                    option
                                ).trim();

                            })
                            .filter(Boolean),

                    correct:
                        correct,

                    explanation:
                        String(
                            question.explanation ||
                            ""
                        ).trim()
                };

            })
            .filter(function (question) {

                return (
                    question.question &&
                    question.options.length >= 2 &&
                    Number.isInteger(
                        question.correct
                    ) &&
                    question.correct >= 0 &&
                    question.correct <
                        question.options.length
                );
            });
    }


    async function requestQuizFromAI(
        topic,
        count
    ) {

        const prepared =
            prepareTextForAI(
                topic
            );

        const prompt = `

أنت مساعد أكاديمي متخصص في إعداد الاختبارات الجامعية.

أنشئ اختبارًا باللغة العربية اعتمادًا فقط على المحتوى الذي سأرسله لك.

عدد الأسئلة المطلوب:
${count}

قواعد مهمة جدًا:

1. جميع الأسئلة يجب أن تكون اختيارًا من متعدد.
2. كل سؤال يحتوي على 4 خيارات إن أمكن.
3. يجب أن يكون هناك جواب صحيح واحد فقط.
4. لا تخترع معلومات غير موجودة في المحتوى.
5. اجعل مستوى الأسئلة مناسبًا لطالب جامعي.
6. نوّع الأسئلة بين التعريف والفهم والتطبيق والمفاهيم.
7. أعد النتيجة بصيغة JSON فقط.
8. لا تضع أي كلام قبل JSON أو بعده.
9. استخدم هذا الشكل بالضبط:

{
  "questions": [
    {
      "question": "نص السؤال",
      "options": [
        "الخيار الأول",
        "الخيار الثاني",
        "الخيار الثالث",
        "الخيار الرابع"
      ],
      "correct": 0,
      "explanation": "شرح مختصر للإجابة الصحيحة"
    }
  ]
}

مهم:
correct يبدأ من 0.
إذا كانت الإجابة الصحيحة هي الخيار الأول استخدم 0.
الثاني 1.
الثالث 2.
الرابع 3.

المحتوى الدراسي:

${prepared.text}

أعد JSON فقط.
`;

        console.log(
            "UniMind: generating smart quiz...",
            {
                characters:
                    prepared.text.length,
                questions:
                    count
            }
        );

        const response =
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

                    body:
                        JSON.stringify({
                            message:
                                prompt
                        })
                }
            );

        const rawText =
            await response.text();

        console.log(
            "UniMind quiz API status:",
            response.status
        );

        console.log(
            "UniMind quiz API response:",
            rawText
        );

        let data = {};

        try {

            data =
                rawText
                    ? JSON.parse(rawText)
                    : {};

        } catch (error) {

            throw new Error(
                "الخادم أعاد استجابة غير صالحة."
            );
        }

        if (!response.ok) {

            throw new Error(
                data.error ||
                data.message ||
                data.error_description ||
                rawText ||
                "فشل إنشاء الاختبار."
            );
        }

        const reply =
            data.reply ||
            data.message ||
            data.response ||
            data.answer ||
            data.content ||
            "";

        if (!String(reply).trim()) {

            throw new Error(
                "لم يتم إنشاء أسئلة الاختبار."
            );
        }

        const cleaned =
            cleanAIJSON(
                reply
            );

        let quizData;

        try {

            quizData =
                JSON.parse(
                    cleaned
                );

        } catch (error) {

            console.error(
                "Quiz JSON parsing error:",
                error
            );

            throw new Error(
                "تم إنشاء الاختبار لكن تنسيق الأسئلة غير صالح. حاول مرة أخرى."
            );
        }

        const questions =
            normalizeQuizData(
                quizData
            );

        if (!questions.length) {

            throw new Error(
                "لم يتم العثور على أسئلة صالحة في الاستجابة."
            );
        }

        return questions;
    }


    async function generateQuiz() {

        const topic =
            document.getElementById(
                "unimind-quiz-topic"
            );

        const countSelect =
            document.getElementById(
                "unimind-quiz-count"
            );

        const generateButton =
            document.getElementById(
                "unimind-generate-quiz"
            );

        if (
            !topic ||
            !countSelect
        ) {
            return;
        }

        const text =
            topic.value.trim();

        if (!text) {

            alert(
                "اكتب موضوعًا أو الصق محتوى المحاضرة أولًا."
            );

            topic.focus();

            return;
        }

        const count =
            parseInt(
                countSelect.value,
                10
            ) || 5;

        if (generateButton) {

            generateButton.disabled =
                true;

            generateButton.textContent =
                "⏳ جاري إنشاء الاختبار...";
        }

        const content =
            document.getElementById(
                "unimind-quiz-content"
            );

        if (content) {

            content.innerHTML = `

                <div class="unimind-quiz-loading">

                    <div class="unimind-quiz-icon">
                        🧠
                    </div>

                    <h2>
                        جاري إنشاء الاختبار...
                    </h2>

                    <p>
                        UniMind AI يقوم بتحليل المحتوى
                        وإنشاء أسئلة مناسبة لك.
                    </p>

                    <div class="unimind-quiz-loading-bar">
                        <span></span>
                    </div>

                </div>
            `;
        }

        try {

            quizSourceText =
                text;

            quizQuestions =
                await requestQuizFromAI(
                    text,
                    count
                );

            currentQuizIndex =
                0;

            quizScore =
                0;

            quizAnswered =
                false;

            renderQuizQuestion();

        } catch (error) {

            console.error(
                "UniMind Smart Quiz Error:",
                error
            );

            if (content) {

                content.innerHTML = `

                    <div class="unimind-quiz-error">

                        <div class="unimind-quiz-icon">
                            ⚠️
                        </div>

                        <h2>
                            تعذر إنشاء الاختبار
                        </h2>

                        <p>
                            ${escapeHTML(
                                error.message ||
                                "حدث خطأ غير متوقع."
                            )}
                        </p>

                        <button
                            type="button"
                            class="unimind-quiz-primary"
                            id="unimind-quiz-retry"
                        >
                            🔄 المحاولة مرة أخرى
                        </button>

                    </div>
                `;

                const retry =
                    document.getElementById(
                        "unimind-quiz-retry"
                    );

                if (retry) {

                    retry.onclick =
                        function () {

                            renderQuizStart();
                        };
                }
            }
        }
    }


    function renderQuizStart() {

        const content =
            document.getElementById(
                "unimind-quiz-content"
            );

        if (!content) {
            return;
        }

        content.innerHTML = `

            <div class="unimind-quiz-start">

                <div class="unimind-quiz-icon">
                    🧠
                </div>

                <h2>
                    أنشئ اختبارك الذكي
                </h2>

                <p>
                    اكتب موضوعًا دراسيًا أو الصق
                    جزءًا من محاضرتك، وسيقوم UniMind AI
                    بإنشاء اختبار لك.
                </p>

                <label
                    for="unimind-quiz-topic"
                    class="unimind-quiz-label"
                >
                    موضوع الاختبار أو محتوى المحاضرة
                </label>

                <textarea
                    id="unimind-quiz-topic"
                    class="unimind-quiz-textarea"
                    rows="7"
                    placeholder="مثال: اشرح لي أساسيات أمن المعلومات، أو الصق هنا نص المحاضرة..."
                >${escapeHTML(
                    quizSourceText
                )}</textarea>

                <div class="unimind-quiz-options">

                    <label
                        for="unimind-quiz-count"
                        class="unimind-quiz-label"
                    >
                        عدد الأسئلة
                    </label>

                    <select
                        id="unimind-quiz-count"
                        class="unimind-quiz-select"
                    >

                        <option value="5">
                            5 أسئلة
                        </option>

                        <option value="10">
                            10 أسئلة
                        </option>

                        <option value="15">
                            15 سؤالًا
                        </option>

                    </select>

                </div>

                <button
                    type="button"
                    id="unimind-generate-quiz"
                    class="unimind-quiz-primary"
                >
                    ✨ إنشاء الاختبار
                </button>

            </div>
        `;

        const generate =
            document.getElementById(
                "unimind-generate-quiz"
            );

        if (generate) {

            generate.onclick =
                generateQuiz;
        }
    }


    function renderQuizQuestion() {

        const content =
            document.getElementById(
                "unimind-quiz-content"
            );

        if (!content) {
            return;
        }

        const question =
            quizQuestions[
                currentQuizIndex
            ];

        if (!question) {

            renderQuizResult();

            return;
        }

        quizAnswered =
            false;

        const total =
            quizQuestions.length;

        const questionNumber =
            currentQuizIndex + 1;

        const progress =
            Math.round(
                (
                    questionNumber /
                    total
                ) *
                100
            );

        const optionsHTML =
            question.options
                .map(
                    function (
                        option,
                        index
                    ) {

                        return `

                            <button
                                type="button"
                                class="unimind-quiz-option"
                                data-index="${index}"
                            >

                                <span
                                    class="unimind-quiz-option-letter"
                                >
                                    ${String.fromCharCode(
                                        65 + index
                                    )}
                                </span>

                                <span>
                                    ${escapeHTML(
                                        option
                                    )}
                                </span>

                            </button>
                        `;
                    }
                )
                .join("");

        content.innerHTML = `

            <div class="unimind-quiz-progress">

                <div class="unimind-quiz-progress-top">

                    <span>
                        السؤال ${questionNumber}
                        من ${total}
                    </span>

                    <span>
                        ${progress}%
                    </span>

                </div>

                <div class="unimind-quiz-progress-track">

                    <div
                        class="unimind-quiz-progress-value"
                        style="width:${progress}%"
                    ></div>

                </div>

            </div>

            <div class="unimind-quiz-question-card">

                <div class="unimind-quiz-question-number">
                    سؤال ${questionNumber}
                </div>

                <h2>
                    ${escapeHTML(
                        question.question
                    )}
                </h2>

                <div
                    class="unimind-quiz-options-list"
                    id="unimind-quiz-options-list"
                >
                    ${optionsHTML}
                </div>

                <div
                    id="unimind-quiz-feedback"
                    class="unimind-quiz-feedback"
                    style="display:none;"
                ></div>

                <button
                    type="button"
                    id="unimind-quiz-next"
                    class="unimind-quiz-primary"
                    style="display:none;"
                >
                    ${questionNumber === total
                        ? "عرض النتيجة 🏆"
                        : "السؤال التالي →"}
                </button>

            </div>
        `;

        document
            .querySelectorAll(
                "#unimind-quiz-options-list .unimind-quiz-option"
            )
            .forEach(
                function (button) {

                    button.onclick =
                        function () {

                            const index =
                                parseInt(
                                    button.dataset.index,
                                    10
                                );

                            answerQuiz(
                                index
                            );
                        };
                }
            );

        const next =
            document.getElementById(
                "unimind-quiz-next"
            );

        if (next) {

            next.onclick =
                function () {

                    currentQuizIndex++;

                    if (
                        currentQuizIndex >=
                        quizQuestions.length
                    ) {

                        renderQuizResult();

                    } else {

                        renderQuizQuestion();
                    }
                };
        }
    }


    function answerQuiz(
        selectedIndex
    ) {

        if (quizAnswered) {
            return;
        }

        quizAnswered =
            true;

        const question =
            quizQuestions[
                currentQuizIndex
            ];

        if (!question) {
            return;
        }

        const buttons =
            document.querySelectorAll(
                "#unimind-quiz-options-list .unimind-quiz-option"
            );

        buttons.forEach(
            function (button) {

                button.disabled =
                    true;

                const index =
                    parseInt(
                        button.dataset.index,
                        10
                    );

                if (
                    index ===
                    question.correct
                ) {

                    button.classList.add(
                        "correct"
                    );
                }

                if (
                    index ===
                    selectedIndex &&
                    selectedIndex !==
                    question.correct
                ) {

                    button.classList.add(
                        "wrong"
                    );
                }
            }
        );

        const feedback =
            document.getElementById(
                "unimind-quiz-feedback"
            );

        const isCorrect =
            selectedIndex ===
            question.correct;

        if (isCorrect) {

            quizScore++;

            if (feedback) {

                feedback.className =
                    "unimind-quiz-feedback correct";

                feedback.innerHTML = `
                    <strong>
                        ✅ إجابة صحيحة!
                    </strong>
                    ${
                        question.explanation
                            ? "<br>" +
                              escapeHTML(
                                  question.explanation
                              )
                            : ""
                    }
                `;

                feedback.style.display =
                    "block";
            }

        } else {

            if (feedback) {

                feedback.className =
                    "unimind-quiz-feedback wrong";

                feedback.innerHTML = `
                    <strong>
                        ❌ إجابة غير صحيحة
                    </strong>

                    <br>

                    الإجابة الصحيحة:
                    ${escapeHTML(
                        question.options[
                            question.correct
                        ]
                    )}

                    ${
                        question.explanation
                            ? "<br><br>" +
                              escapeHTML(
                                  question.explanation
                              )
                            : ""
                    }
                `;

                feedback.style.display =
                    "block";
            }
        }

        const next =
            document.getElementById(
                "unimind-quiz-next"
            );

        if (next) {

            next.style.display =
                "block";
        }
    }


    function renderQuizResult() {

        const content =
            document.getElementById(
                "unimind-quiz-content"
            );

        if (!content) {
            return;
        }

        const total =
            quizQuestions.length;

        const percentage =
            total
                ? Math.round(
                    (
                        quizScore /
                        total
                    ) *
                    100
                )
                : 0;

        let message =
            "يمكنك المحاولة مرة أخرى لتحسين نتيجتك.";

        if (percentage >= 90) {

            message =
                "ممتاز جدًا! لديك فهم قوي للمحتوى. 🌟";

        } else if (
            percentage >= 75
        ) {

            message =
                "أداء رائع! استمر في المراجعة. 👏";

        } else if (
            percentage >= 50
        ) {

            message =
                "نتيجة جيدة، لكن هناك بعض النقاط التي تحتاج إلى مراجعة. 📚";

        }

        content.innerHTML = `

            <div class="unimind-quiz-result">

                <div class="unimind-quiz-result-icon">
                    🏆
                </div>

                <h2>
                    انتهى الاختبار!
                </h2>

                <div class="unimind-quiz-score">
                    ${quizScore}
                    <span>
                        /
                        ${total}
                    </span>
                </div>

                <div class="unimind-quiz-percentage">
                    ${percentage}%
                </div>

                <p>
                    ${message}
                </p>

                <div class="unimind-quiz-result-actions">

                    <button
                        type="button"
                        id="unimind-quiz-retry"
                        class="unimind-quiz-primary"
                    >
                        🔄 إعادة الاختبار
                    </button>

                    <button
                        type="button"
                        id="unimind-quiz-new"
                        class="unimind-quiz-secondary"
                    >
                        🧠 اختبار جديد
                    </button>

                </div>

            </div>
        `;

        const retry =
            document.getElementById(
                "unimind-quiz-retry"
            );

        const newQuiz =
            document.getElementById(
                "unimind-quiz-new"
            );

        if (retry) {

            retry.onclick =
                function () {

                    currentQuizIndex =
                        0;

                    quizScore =
                        0;

                    quizAnswered =
                        false;

                    renderQuizQuestion();
                };
        }

        if (newQuiz) {

            newQuiz.onclick =
                renderQuizStart;
        }
    }


    // =========================================================
    // BUTTONS
    // =========================================================

    function setupButtons() {

        const studyButton =
            document.getElementById(
                "studyAssistantButton"
            );

        if (studyButton) {

            studyButton.onclick =
                function (event) {

                    event.preventDefault();

                    console.log(
                        "UniMind: Study Assistant clicked"
                    );

                    openChat();
                };
        }

        const lectureButton =
            document.getElementById(
                "lectureSummarizerButton"
            );

        if (lectureButton) {

            lectureButton.onclick =
                function (event) {

                    event.preventDefault();

                    openLectureModal();
                };
        }

        const startButton =
            document.getElementById(
                "ctaStartButton"
            );

        if (startButton) {

            startButton.onclick =
                function () {

                    openChat();
                };
        }

        const bottomButton =
            document.getElementById(
                "ctaBottomButton"
            );

        if (bottomButton) {

            bottomButton.onclick =
                function () {

                    openChat();
                };
        }

        const demoButton =
            document.getElementById(
                "heroDemoButton"
            );

        if (demoButton) {

            demoButton.onclick =
                function () {

                    openChat();
                };
        }

        const heroChatButton =
            document.getElementById(
                "heroChatButton"
            );

        if (heroChatButton) {

            heroChatButton.onclick =
                function () {

                    openChat();
                };
        }


        // =====================================================
        // SMART QUIZ
        // =====================================================

        const quizButton =
            document.getElementById(
                "quizButton"
            );

        if (quizButton) {

            quizButton.onclick =
                function (event) {

                    event.preventDefault();

                    console.log(
                        "UniMind: Smart Quiz clicked"
                    );

                    openQuizModal();
                };
        }


        // =====================================================
        // FUTURE FEATURES
        // =====================================================

        const flashcardsButton =
            document.getElementById(
                "flashcardsButton"
            );

        if (flashcardsButton) {

            flashcardsButton.onclick =
                function () {

                    alert(
                        "ميزة البطاقات التعليمية ستكون متاحة قريبًا."
                    );
                };
        }

        const plannerButton =
            document.getElementById(
                "plannerButton"
            );

        if (plannerButton) {

            plannerButton.onclick =
                function () {

                    alert(
                        "ميزة مخطط الدراسة ستكون متاحة قريبًا."
                    );
                };
        }

        const cvButton =
            document.getElementById(
                "cvButton"
            );

        if (cvButton) {

            cvButton.onclick =
                function () {

                    alert(
                        "ميزة مساعد السيرة الذاتية ستكون متاحة قريبًا."
                    );
                };
        }


        document
            .querySelectorAll(
                ".pricing-card button"
            )
            .forEach(
                function (button) {

                    button.onclick =
                        function () {

                            alert(
                                "اختيار الخطة سيتم تفعيله قريبًا."
                            );
                        };
                }
            );
    }


    // =========================================================
    // THEME
    // =========================================================

    function setupTheme() {

        const button =
            document.getElementById(
                "themeToggle"
            );

        if (!button) {
            return;
        }

        const saved =
            localStorage.getItem(
                "unimind-theme"
            );

        if (
            saved === "dark"
        ) {

            document.body.classList.add(
                "dark-mode"
            );

            button.textContent =
                "☀️";
        }

        button.onclick =
            function () {

                document.body.classList.toggle(
                    "dark-mode"
                );

                const dark =
                    document.body.classList.contains(
                        "dark-mode"
                    );

                localStorage.setItem(
                    "unimind-theme",
                    dark
                        ? "dark"
                        : "light"
                );

                button.textContent =
                    dark
                        ? "☀️"
                        : "🌙";
            };
    }


    // =========================================================
    // LANGUAGE
    // =========================================================

    function setupLanguage() {

        const button =
            document.getElementById(
                "languageToggle"
            );

        if (!button) {
            return;
        }

        button.onclick =
            function () {

                alert(
                    "اللغة العربية هي اللغة الأساسية حاليًا في UniMind AI."
                );
            };
    }


    // =========================================================
    // LOGIN
    // =========================================================

    function setupLogin() {

        const button =
            document.getElementById(
                "loginButton"
            );

        if (!button) {
            return;
        }

        button.onclick =
            function () {

                alert(
                    "نظام تسجيل الدخول سيتم تفعيله قريبًا."
                );
            };
    }


    // =========================================================
    // ESCAPE KEY
    // =========================================================

    function setupKeyboard() {

        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key !== "Escape"
                ) {
                    return;
                }

                const chat =
                    document.getElementById(
                        "unimind-chat-modal"
                    );

                const lecture =
                    document.getElementById(
                        "unimind-lecture-modal"
                    );

                const quiz =
                    document.getElementById(
                        "unimind-quiz-modal"
                    );

                if (
                    chat &&
                    chat.classList.contains(
                        "active"
                    )
                ) {

                    closeChat();

                    return;
                }

                if (
                    lecture &&
                    lecture.classList.contains(
                        "active"
                    )
                ) {

                    closeLectureModal();

                    return;
                }

                if (
                    quiz &&
                    quiz.classList.contains(
                        "active"
                    )
                ) {

                    closeQuizModal();
                }
            }
        );
    }


    // =========================================================
    // GLOBAL FUNCTIONS
    // =========================================================

    window.openChat =
        openChat;

    window.closeUniMindChat =
        closeChat;

    window.openLectureSummarizer =
        openLectureModal;

    window.closeLectureSummarizer =
        closeLectureModal;

    window.openUniMindQuiz =
        openQuizModal;


    // =========================================================
    // START
    // =========================================================

    function startUniMind() {

        console.log(
            "UniMind AI v33 loading..."
        );

        setupButtons();

        setupLectureFeature();

        setupTheme();

        setupLanguage();

        setupLogin();

        setupKeyboard();

        console.log(
            "UniMind AI v33 initialized successfully."
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

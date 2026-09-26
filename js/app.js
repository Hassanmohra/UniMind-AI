(function () {
    "use strict";

    /* =========================================================
       UniMind AI
       Main JavaScript
       Complete Smart Tools Edition
       ========================================================= */

    const API_URL =
        "https://yzsfublvnwknjnayfosm.supabase.co/functions/v1/unimind-chat";

    /* =========================================================
       STATE
       ========================================================= */

    let selectedLectureFile = null;

    let quizQuestions = [];
    let currentQuizIndex = 0;
    let quizScore = 0;
    let quizAnswered = false;
    let quizSourceText = "";

    let flashcards = [];
    let currentFlashcardIndex = 0;
    let flashcardSourceText = "";

    let studyPlan = null;

    let modalScrollPosition = 0;

    /* =========================================================
       HELPERS
       ========================================================= */

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
        return new Promise(function (resolve) {
            setTimeout(resolve, ms);
        });
    }

    function getElement(id) {
        return document.getElementById(id);
    }

    function showElement(element) {
        if (!element) return;
        element.style.display = "";
    }

    function hideElement(element) {
        if (!element) return;
        element.style.display = "none";
    }

    function lockBody() {
        modalScrollPosition = window.scrollY || 0;

        document.body.style.position = "fixed";
        document.body.style.top =
            "-" + modalScrollPosition + "px";
        document.body.style.left = "0";
        document.body.style.right = "0";
        document.body.style.width = "100%";
        document.body.style.overflow = "hidden";
    }

    function unlockBody() {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.width = "";
        document.body.style.overflow = "";

        window.scrollTo(
            0,
            modalScrollPosition
        );
    }

    /* =========================================================
       API
       ========================================================= */

    async function askAI(message) {
        try {
            const response = await fetch(
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

            if (!response.ok) {
                throw new Error(
                    "API Error: " +
                    response.status
                );
            }

            const data =
                await response.json();

            let answer =
                data.answer ||
                data.message ||
                data.response ||
                data.content ||
                data.result ||
                "";

            if (
                typeof answer !==
                "string"
            ) {
                answer =
                    JSON.stringify(answer);
            }

            return answer;

        } catch (error) {

            console.error(
                "UniMind AI Error:",
                error
            );

            throw error;
        }
    }

    /* =========================================================
       GLOBAL STYLE
       ========================================================= */

    function injectStyles() {

        if (
            getElement(
                "unimind-tools-runtime-style"
            )
        ) {
            return;
        }

        const style =
            document.createElement("style");

        style.id =
            "unimind-tools-runtime-style";

        style.textContent = `

        .unimind-runtime-modal {
            position: fixed !important;
            inset: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            z-index: 2147483647 !important;
            display: none !important;
            align-items: center !important;
            justify-content: center !important;
            padding: 20px !important;
            box-sizing: border-box !important;
        }

        .unimind-runtime-modal.active {
            display: flex !important;
        }

        .unimind-runtime-overlay {
            position: absolute !important;
            inset: 0 !important;
            background:
                rgba(15, 23, 42, .70) !important;
            backdrop-filter:
                blur(4px);
        }

        .unimind-runtime-window {
            position: relative !important;
            z-index: 2 !important;
            width: min(780px, 95vw) !important;
            max-height: 90vh !important;
            overflow-y: auto !important;
            background: #ffffff !important;
            color: #172033 !important;
            border-radius: 24px !important;
            box-shadow:
                0 30px 90px
                rgba(0,0,0,.30) !important;
            animation:
                unimindModalIn
                .22s ease-out;
        }

        @keyframes unimindModalIn {
            from {
                opacity: 0;
                transform:
                    translateY(20px)
                    scale(.97);
            }

            to {
                opacity: 1;
                transform:
                    translateY(0)
                    scale(1);
            }
        }

        .unimind-runtime-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
            padding: 22px 25px;
            border-bottom:
                1px solid #e8edf4;
        }

        .unimind-runtime-title {
            margin: 0;
            font-size: 21px;
            font-weight: 800;
        }

        .unimind-runtime-close {
            width: 40px;
            height: 40px;
            border: 0;
            border-radius: 50%;
            background: #f1f5f9;
            color: #334155;
            font-size: 22px;
            cursor: pointer;
        }

        .unimind-runtime-close:hover {
            background: #e2e8f0;
        }

        .unimind-runtime-body {
            padding: 25px;
        }

        .unimind-field {
            margin-bottom: 18px;
        }

        .unimind-field label {
            display: block;
            margin-bottom: 8px;
            font-weight: 700;
        }

        .unimind-field input,
        .unimind-field textarea,
        .unimind-field select {
            width: 100%;
            box-sizing: border-box;
            border: 1px solid #dbe2ea;
            border-radius: 14px;
            padding: 13px 15px;
            font-family: inherit;
            font-size: 15px;
            outline: none;
            background: #fff;
        }

        .unimind-field textarea {
            min-height: 130px;
            resize: vertical;
        }

        .unimind-field input:focus,
        .unimind-field textarea:focus,
        .unimind-field select:focus {
            border-color: #6366f1;
            box-shadow:
                0 0 0 3px
                rgba(99,102,241,.10);
        }

        .unimind-actions {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            margin-top: 20px;
        }

        .unimind-btn {
            border: 0;
            border-radius: 13px;
            padding: 12px 20px;
            cursor: pointer;
            font-family: inherit;
            font-weight: 700;
            font-size: 15px;
        }

        .unimind-btn-primary {
            background: #4f46e5;
            color: white;
        }

        .unimind-btn-secondary {
            background: #eef2f7;
            color: #334155;
        }

        .unimind-btn:disabled {
            opacity: .55;
            cursor: not-allowed;
        }

        .unimind-loading {
            text-align: center;
            padding: 35px 15px;
        }

        .unimind-spinner {
            width: 42px;
            height: 42px;
            border-radius: 50%;
            border: 4px solid #e5e7eb;
            border-top-color: #4f46e5;
            animation:
                unimindSpin .8s linear infinite;
            margin: 0 auto 15px;
        }

        @keyframes unimindSpin {
            to {
                transform: rotate(360deg);
            }
        }

        .unimind-error {
            padding: 15px;
            border-radius: 13px;
            background: #fef2f2;
            color: #991b1b;
            line-height: 1.7;
        }

        /* Quiz */

        #unimind-quiz-modal {
            position: fixed !important;
            inset: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            display: none !important;
            align-items: center !important;
            justify-content: center !important;
            z-index: 2147483647 !important;
        }

        #unimind-quiz-modal.active {
            display: flex !important;
        }

        .unimind-quiz-window {
            width: min(760px, 95vw);
            max-height: 90vh;
            overflow-y: auto;
            background: white;
            border-radius: 24px;
            position: relative;
            z-index: 2;
            box-shadow:
                0 30px 90px
                rgba(0,0,0,.3);
        }

        .quiz-option {
            width: 100%;
            display: block;
            text-align: right;
            border: 1px solid #dce3ec;
            background: white;
            padding: 15px;
            border-radius: 14px;
            margin-bottom: 10px;
            cursor: pointer;
            font-family: inherit;
            font-size: 15px;
            transition: .15s;
        }

        .quiz-option:hover {
            border-color: #6366f1;
            background: #f8f7ff;
        }

        .quiz-option.correct {
            background: #ecfdf5;
            border-color: #10b981;
            color: #047857;
        }

        .quiz-option.wrong {
            background: #fef2f2;
            border-color: #ef4444;
            color: #b91c1c;
        }

        .quiz-progress {
            height: 8px;
            background: #e5e7eb;
            border-radius: 99px;
            overflow: hidden;
            margin: 15px 0 25px;
        }

        .quiz-progress-bar {
            height: 100%;
            background: #4f46e5;
            transition: width .25s;
        }

        /* Flashcards */

        .unimind-flashcard {
            min-height: 280px;
            border-radius: 22px;
            background:
                linear-gradient(
                    135deg,
                    #eef2ff,
                    #f8fafc
                );
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 35px;
            text-align: center;
            cursor: pointer;
            user-select: none;
        }

        .unimind-flashcard-text {
            font-size: 22px;
            font-weight: 800;
            line-height: 1.8;
        }

        .unimind-flashcard-hint {
            margin-top: 12px;
            color: #64748b;
            font-size: 13px;
        }

        .unimind-plan-item {
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            padding: 17px;
            margin-bottom: 12px;
            background: #fff;
        }

        .unimind-plan-day {
            font-weight: 800;
            margin-bottom: 7px;
        }

        .unimind-plan-subject {
            color: #4f46e5;
            font-weight: 700;
        }

        .unimind-plan-task {
            margin-top: 7px;
            line-height: 1.7;
        }

        .unimind-cv-result {
            white-space: pre-wrap;
            line-height: 1.9;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 20px;
            border-radius: 16px;
            max-height: 55vh;
            overflow-y: auto;
        }

        @media (max-width: 600px) {

            .unimind-runtime-modal {
                padding: 10px !important;
            }

            .unimind-runtime-window {
                width: 100% !important;
                max-height: 94vh !important;
                border-radius: 18px !important;
            }

            .unimind-runtime-body {
                padding: 18px;
            }

            .unimind-runtime-header {
                padding: 17px;
            }

            .unimind-flashcard {
                min-height: 230px;
                padding: 22px;
            }

            .unimind-flashcard-text {
                font-size: 18px;
            }
        }

        `;

        document.head.appendChild(style);
    }

    /* =========================================================
       GENERIC MODAL
       ========================================================= */

    function createModal(
        id,
        title
    ) {

        let existing =
            getElement(id);

        if (existing) {
            return existing;
        }

        const modal =
            document.createElement(
                "div"
            );

        modal.id = id;

        modal.className =
            "unimind-runtime-modal";

        modal.innerHTML = `

            <div
                class="unimind-runtime-overlay"
                data-close-modal
            ></div>

            <div
                class="unimind-runtime-window"
                role="dialog"
                aria-modal="true"
            >

                <div
                    class="unimind-runtime-header"
                >

                    <h2
                        class="unimind-runtime-title"
                    >
                        ${escapeHTML(title)}
                    </h2>

                    <button
                        type="button"
                        class="unimind-runtime-close"
                        data-close-modal
                        aria-label="إغلاق"
                    >
                        ×
                    </button>

                </div>

                <div
                    class="unimind-runtime-body"
                    data-modal-body
                ></div>

            </div>
        `;

        document.body.appendChild(
            modal
        );

        modal
            .querySelectorAll(
                "[data-close-modal]"
            )
            .forEach(function (button) {

                button.addEventListener(
                    "click",
                    function () {
                        closeModal(id);
                    }
                );

            });

        return modal;
    }

    function openModal(id) {

        const modal =
            getElement(id);

        if (!modal) return;

        modal.classList.add(
            "active"
        );

        lockBody();
    }

    function closeModal(id) {

        const modal =
            getElement(id);

        if (!modal) return;

        modal.classList.remove(
            "active"
        );

        unlockBody();
    }

    /* =========================================================
       CHAT ASSISTANT
       ========================================================= */

    function createChatModal() {

        const modal =
            createModal(
                "unimind-chat-modal",
                "مساعد الدراسة الذكي"
            );

        const body =
            modal.querySelector(
                "[data-modal-body]"
            );

        if (
            !getElement(
                "unimind-chat-messages"
            )
        ) {

            body.innerHTML = `

                <div
                    id="unimind-chat-messages"
                    style="
                        height:420px;
                        overflow-y:auto;
                        padding:5px;
                        margin-bottom:15px;
                    "
                >

                    <div
                        style="
                            background:#f1f5f9;
                            padding:14px;
                            border-radius:15px;
                            margin-bottom:12px;
                            line-height:1.8;
                        "
                    >
                        👋 مرحبًا! أنا مساعدك
                        الدراسي الذكي.
                        كيف يمكنني مساعدتك؟
                    </div>

                </div>

                <form
                    id="unimind-chat-form"
                >

                    <div
                        style="
                            display:flex;
                            gap:8px;
                        "
                    >

                        <input
                            id="unimind-chat-input"
                            type="text"
                            placeholder="اكتب سؤالك هنا..."
                            autocomplete="off"
                            style="
                                flex:1;
                                border:1px solid #dbe2ea;
                                border-radius:14px;
                                padding:13px;
                                font-family:inherit;
                            "
                        >

                        <button
                            class="unimind-btn unimind-btn-primary"
                            type="submit"
                        >
                            إرسال
                        </button>

                    </div>

                </form>
            `;

            const form =
                getElement(
                    "unimind-chat-form"
                );

            form.addEventListener(
                "submit",
                sendChatMessage
            );
        }

        return modal;
    }

    function openChat() {

        createChatModal();

        openModal(
            "unimind-chat-modal"
        );

        setTimeout(function () {

            const input =
                getElement(
                    "unimind-chat-input"
                );

            if (input) {
                input.focus();
            }

        }, 100);
    }

    async function sendChatMessage(
        event
    ) {

        event.preventDefault();

        const input =
            getElement(
                "unimind-chat-input"
            );

        const messages =
            getElement(
                "unimind-chat-messages"
            );

        if (!input || !messages) {
            return;
        }

        const text =
            input.value.trim();

        if (!text) return;

        addChatMessage(
            text,
            true
        );

        input.value = "";

        const loading =
            document.createElement(
                "div"
            );

        loading.id =
            "unimind-chat-loading";

        loading.style.cssText = `
            padding:13px;
            color:#64748b;
        `;

        loading.textContent =
            "🤖 جاري التفكير...";

        messages.appendChild(
            loading
        );

        messages.scrollTop =
            messages.scrollHeight;

        try {

            const answer =
                await askAI(
                    `
أنت مساعد دراسي ذكي اسمه UniMind AI.

أجب باللغة العربية بشكل واضح ومنظم.
إذا كان السؤال متعلقًا بالدراسة فقدم شرحًا
مفيدًا وبسيطًا مع أمثلة عند الحاجة.

سؤال الطالب:
${text}
                    `
                );

            if (loading) {
                loading.remove();
            }

            addChatMessage(
                answer,
                false
            );

        } catch (error) {

            if (loading) {
                loading.remove();
            }

            addChatMessage(
                "حدث خطأ أثناء الاتصال بالذكاء الاصطناعي. حاول مرة أخرى.",
                false
            );
        }
    }

    function addChatMessage(
        text,
        user
    ) {

        const messages =
            getElement(
                "unimind-chat-messages"
            );

        if (!messages) return;

        const message =
            document.createElement(
                "div"
            );

        message.style.cssText = `
            max-width:85%;
            margin-bottom:12px;
            padding:13px 15px;
            border-radius:15px;
            line-height:1.8;
            white-space:pre-wrap;
            ${
                user
                    ? `
                        margin-right:auto;
                        background:#4f46e5;
                        color:white;
                    `
                    : `
                        margin-left:auto;
                        background:#f1f5f9;
                        color:#172033;
                    `
            }
        `;

        message.textContent =
            text;

        messages.appendChild(
            message
        );

        messages.scrollTop =
            messages.scrollHeight;
    }

    /* =========================================================
       QUIZ
       ========================================================= */

    function createQuizModal() {

        let modal =
            getElement(
                "unimind-quiz-modal"
            );

        if (modal) {
            return modal;
        }

        modal =
            document.createElement(
                "div"
            );

        modal.id =
            "unimind-quiz-modal";

        modal.innerHTML = `

            <div
                class="unimind-runtime-overlay"
                data-quiz-close
            ></div>

            <div
                class="unimind-quiz-window"
            >

                <div
                    class="unimind-runtime-header"
                >

                    <h2
                        class="unimind-runtime-title"
                    >
                        🎯 الاختبارات الذكية
                    </h2>

                    <button
                        type="button"
                        class="unimind-runtime-close"
                        data-quiz-close
                    >
                        ×
                    </button>

                </div>

                <div
                    id="unimind-quiz-content"
                    class="unimind-runtime-body"
                ></div>

            </div>
        `;

        document.body.appendChild(
            modal
        );

        modal
            .querySelectorAll(
                "[data-quiz-close]"
            )
            .forEach(function (button) {

                button.addEventListener(
                    "click",
                    closeQuizModal
                );

            });

        return modal;
    }

    function openQuizModal() {

        createQuizModal();

        renderQuizStart();

        const modal =
            getElement(
                "unimind-quiz-modal"
            );

        modal.classList.add(
            "active"
        );

        lockBody();
    }

    function closeQuizModal() {

        const modal =
            getElement(
                "unimind-quiz-modal"
            );

        if (!modal) return;

        modal.classList.remove(
            "active"
        );

        unlockBody();
    }

    function renderQuizStart() {

        const content =
            getElement(
                "unimind-quiz-content"
            );

        if (!content) return;

        content.innerHTML = `

            <p
                style="
                    line-height:1.9;
                    color:#64748b;
                "
            >
                أنشئ اختبارًا ذكيًا من أي موضوع
                دراسي، وحدد عدد الأسئلة ثم ابدأ.
            </p>

            <div
                class="unimind-field"
            >

                <label>
                    الموضوع أو المادة
                </label>

                <textarea
                    id="quiz-topic"
                    placeholder="مثال: شبكات الحاسوب، أمن المعلومات، البرمجة..."
                ></textarea>

            </div>

            <div
                class="unimind-field"
            >

                <label>
                    عدد الأسئلة
                </label>

                <select
                    id="quiz-count"
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

            <div
                class="unimind-actions"
            >

                <button
                    type="button"
                    id="generate-quiz-button"
                    class="
                        unimind-btn
                        unimind-btn-primary
                    "
                >
                    🧠 إنشاء الاختبار
                </button>

            </div>
        `;

        getElement(
            "generate-quiz-button"
        ).addEventListener(
            "click",
            generateQuiz
        );
    }

    async function generateQuiz() {

        const topic =
            getElement(
                "quiz-topic"
            ).value.trim();

        const count =
            Number(
                getElement(
                    "quiz-count"
                ).value
            );

        if (!topic) {

            alert(
                "اكتب موضوع الاختبار أولًا."
            );

            return;
        }

        quizSourceText =
            topic;

        const content =
            getElement(
                "unimind-quiz-content"
            );

        content.innerHTML = `

            <div
                class="unimind-loading"
            >

                <div
                    class="unimind-spinner"
                ></div>

                <strong>
                    جاري إنشاء الاختبار...
                </strong>

                <p>
                    يقوم الذكاء الاصطناعي
                    بإعداد الأسئلة.
                </p>

            </div>
        `;

        try {

            const prompt = `

أنت خبير في إعداد الاختبارات الجامعية.

أنشئ اختبار اختيار من متعدد باللغة العربية
حول الموضوع التالي:

${topic}

عدد الأسئلة:
${count}

يجب أن تكون الأسئلة متنوعة ومناسبة لطالب جامعي.

أعد النتيجة فقط بصيغة JSON صحيحة تمامًا:

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
      "explanation": "شرح مختصر"
    }
  ]
}

correct يجب أن يكون رقمًا من 0 إلى 3.

لا تضف Markdown.
لا تضف أي نص خارج JSON.
            `;

            const raw =
                await askAI(prompt);

            const data =
                parseAIJSON(raw);

            quizQuestions =
                normalizeQuizData(
                    data
                );

            if (
                quizQuestions.length === 0
            ) {
                throw new Error(
                    "لم يتم إنشاء أسئلة صحيحة."
                );
            }

            currentQuizIndex = 0;
            quizScore = 0;
            quizAnswered = false;

            renderQuizQuestion();

        } catch (error) {

            console.error(
                error
            );

            content.innerHTML = `

                <div
                    class="unimind-error"
                >
                    ❌ لم نتمكن من إنشاء
                    الاختبار.

                    <br><br>

                    تأكد من اتصال
                    Supabase ثم حاول مرة أخرى.
                </div>

                <div
                    class="unimind-actions"
                >

                    <button
                        class="
                            unimind-btn
                            unimind-btn-secondary
                        "
                        onclick="window.openUniMindQuiz()"
                    >
                        العودة
                    </button>

                </div>
            `;
        }
    }

    function parseAIJSON(
        text
    ) {

        let cleaned =
            String(text || "")
                .trim();

        cleaned =
            cleaned
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

        const first =
            cleaned.indexOf("{");

        const last =
            cleaned.lastIndexOf("}");

        if (
            first !== -1 &&
            last !== -1
        ) {
            cleaned =
                cleaned.slice(
                    first,
                    last + 1
                );
        }

        return JSON.parse(
            cleaned
        );
    }

    function normalizeQuizData(
        data
    ) {

        const questions =
            Array.isArray(
                data
                    ? data.questions
                    : null
            )
                ? data.questions
                : [];

        return questions
            .map(function (item) {

                if (!item) {
                    return null;
                }

                const options =
                    Array.isArray(
                        item.options
                    )
                        ? item.options
                        : [];

                if (
                    !item.question ||
                    options.length < 2
                ) {
                    return null;
                }

                let correct =
                    item.correct;

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

                if (
                    Number.isNaN(
                        correct
                    ) ||
                    correct < 0 ||
                    correct >= options.length
                ) {
                    correct = 0;
                }

                return {
                    question:
                        String(
                            item.question
                        ),

                    options:
                        options.map(
                            function (option) {
                                return String(
                                    option
                                );
                            }
                        ),

                    correct:
                        correct,

                    explanation:
                        String(
                            item.explanation ||
                            ""
                        )
                };

            })
            .filter(Boolean);
    }

    function renderQuizQuestion() {

        const content =
            getElement(
                "unimind-quiz-content"
            );

        if (!content) return;

        const question =
            quizQuestions[
                currentQuizIndex
            ];

        if (!question) {

            renderQuizResult();

            return;
        }

        const progress =
            Math.round(
                (
                    currentQuizIndex /
                    quizQuestions.length
                ) * 100
            );

        content.innerHTML = `

            <div
                style="
                    display:flex;
                    justify-content:space-between;
                    gap:10px;
                    font-weight:700;
                "
            >

                <span>
                    السؤال
                    ${currentQuizIndex + 1}
                    من
                    ${quizQuestions.length}
                </span>

                <span>
                    النتيجة:
                    ${quizScore}
                </span>

            </div>

            <div
                class="quiz-progress"
            >

                <div
                    class="quiz-progress-bar"
                    style="
                        width:${progress}%;
                    "
                ></div>

            </div>

            <h3
                style="
                    line-height:1.8;
                    margin-bottom:20px;
                "
            >
                ${escapeHTML(
                    question.question
                )}
            </h3>

            <div
                id="quiz-options"
            >

                ${question.options
                    .map(
                        function (
                            option,
                            index
                        ) {

                            return `
                                <button
                                    type="button"
                                    class="quiz-option"
                                    data-option="${index}"
                                >
                                    <strong>
                                        ${
                                            String.fromCharCode(
                                                65 + index
                                            )
                                        }.
                                    </strong>

                                    ${escapeHTML(
                                        option
                                    )}
                                </button>
                            `;
                        }
                    )
                    .join("")}

            </div>

            <div
                id="quiz-explanation"
                style="
                    display:none;
                    margin-top:18px;
                    padding:15px;
                    border-radius:14px;
                    background:#f8fafc;
                    line-height:1.8;
                "
            ></div>

            <div
                class="unimind-actions"
                id="quiz-next-area"
            ></div>
        `;

        content
            .querySelectorAll(
                ".quiz-option"
            )
            .forEach(function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        answerQuiz(
                            Number(
                                button.dataset
                                    .option
                            )
                        );

                    }
                );

            });
    }

    function answerQuiz(
        selected
    ) {

        if (quizAnswered) {
            return;
        }

        quizAnswered = true;

        const question =
            quizQuestions[
                currentQuizIndex
            ];

        const buttons =
            document.querySelectorAll(
                "#quiz-options .quiz-option"
            );

        buttons.forEach(
            function (
                button,
                index
            ) {

                button.disabled =
                    true;

                if (
                    index ===
                    question.correct
                ) {

                    button.classList.add(
                        "correct"
                    );
                }

                if (
                    index === selected &&
                    selected !==
                    question.correct
                ) {

                    button.classList.add(
                        "wrong"
                    );
                }

            }
        );

        if (
            selected ===
            question.correct
        ) {

            quizScore++;
        }

        const explanation =
            getElement(
                "quiz-explanation"
            );

        if (explanation) {

            explanation.style.display =
                "block";

            explanation.innerHTML = `
                <strong>
                    ${
                        selected ===
                        question.correct
                            ? "✅ إجابة صحيحة"
                            : "❌ إجابة غير صحيحة"
                    }
                </strong>

                ${
                    question.explanation
                        ? `
                            <br><br>
                            ${escapeHTML(
                                question.explanation
                            )}
                        `
                        : ""
                }
            `;
        }

        const nextArea =
            getElement(
                "quiz-next-area"
            );

        if (nextArea) {

            nextArea.innerHTML = `

                <button
                    type="button"
                    class="
                        unimind-btn
                        unimind-btn-primary
                    "
                    id="quiz-next-button"
                >
                    ${
                        currentQuizIndex <
                        quizQuestions.length - 1
                            ? "السؤال التالي →"
                            : "عرض النتيجة"
                    }
                </button>
            `;

            getElement(
                "quiz-next-button"
            ).addEventListener(
                "click",
                function () {

                    if (
                        currentQuizIndex <
                        quizQuestions.length - 1
                    ) {

                        currentQuizIndex++;
                        quizAnswered = false;

                        renderQuizQuestion();

                    } else {

                        renderQuizResult();

                    }

                }
            );
        }
    }

    function renderQuizResult() {

        const content =
            getElement(
                "unimind-quiz-content"
            );

        if (!content) return;

        const total =
            quizQuestions.length;

        const percentage =
            total
                ? Math.round(
                    (
                        quizScore /
                        total
                    ) * 100
                )
                : 0;

        content.innerHTML = `

            <div
                style="
                    text-align:center;
                    padding:20px 0;
                "
            >

                <div
                    style="
                        font-size:58px;
                        margin-bottom:15px;
                    "
                >
                    🎉
                </div>

                <h2>
                    انتهى الاختبار!
                </h2>

                <p
                    style="
                        font-size:20px;
                        font-weight:800;
                    "
                >
                    ${quizScore}
                    /
                    ${total}
                </p>

                <p
                    style="
                        color:#64748b;
                    "
                >
                    النسبة:
                    ${percentage}%
                </p>

                <div
                    class="unimind-actions"
                    style="
                        justify-content:center;
                    "
                >

                    <button
                        type="button"
                        class="
                            unimind-btn
                            unimind-btn-primary
                        "
                        id="quiz-retry"
                    >
                        🔄 إعادة الاختبار
                    </button>

                    <button
                        type="button"
                        class="
                            unimind-btn
                            unimind-btn-secondary
                        "
                        id="quiz-new"
                    >
                        اختبار جديد
                    </button>

                </div>

            </div>
        `;

        getElement(
            "quiz-retry"
        ).addEventListener(
            "click",
            function () {

                currentQuizIndex = 0;
                quizScore = 0;
                quizAnswered = false;

                renderQuizQuestion();

            }
        );

        getElement(
            "quiz-new"
        ).addEventListener(
            "click",
            function () {

                renderQuizStart();

            }
        );
    }

    /* =========================================================
       FLASHCARDS
       ========================================================= */

    function openFlashcards() {

        const modal =
            createModal(
                "unimind-flashcards-modal",
                "🃏 البطاقات التعليمية"
            );

        const body =
            modal.querySelector(
                "[data-modal-body]"
            );

        body.innerHTML = `

            <p
                style="
                    color:#64748b;
                    line-height:1.8;
                "
            >
                أنشئ بطاقات تعليمية
                تساعدك على المراجعة والحفظ.
            </p>

            <div
                class="unimind-field"
            >

                <label>
                    المادة أو الموضوع
                </label>

                <textarea
                    id="flashcards-topic"
                    placeholder="مثال: أساسيات أمن المعلومات..."
                ></textarea>

            </div>

            <div
                class="unimind-field"
            >

                <label>
                    عدد البطاقات
                </label>

                <select
                    id="flashcards-count"
                >
                    <option value="5">
                        5 بطاقات
                    </option>

                    <option value="10">
                        10 بطاقات
                    </option>

                    <option value="15">
                        15 بطاقة
                    </option>
                </select>

            </div>

            <div
                class="unimind-actions"
            >

                <button
                    type="button"
                    class="
                        unimind-btn
                        unimind-btn-primary
                    "
                    id="create-flashcards"
                >
                    🧠 إنشاء البطاقات
                </button>

            </div>
        `;

        getElement(
            "create-flashcards"
        ).addEventListener(
            "click",
            generateFlashcards
        );

        openModal(
            "unimind-flashcards-modal"
        );
    }

    async function generateFlashcards() {

        const topic =
            getElement(
                "flashcards-topic"
            ).value.trim();

        const count =
            Number(
                getElement(
                    "flashcards-count"
                ).value
            );

        if (!topic) {

            alert(
                "اكتب المادة أو الموضوع أولًا."
            );

            return;
        }

        flashcardSourceText =
            topic;

        const body =
            getElement(
                "unimind-flashcards-modal"
            )
                .querySelector(
                    "[data-modal-body]"
                );

        body.innerHTML = `

            <div
                class="unimind-loading"
            >

                <div
                    class="unimind-spinner"
                ></div>

                <strong>
                    جاري إنشاء البطاقات...
                </strong>

            </div>
        `;

        try {

            const raw =
                await askAI(`

أنشئ ${count} بطاقات تعليمية
باللغة العربية حول:

${topic}

أعد JSON فقط:

{
  "cards": [
    {
      "front": "السؤال أو المصطلح",
      "back": "الإجابة أو الشرح"
    }
  ]
}

لا تضف Markdown.
لا تضف نصًا خارج JSON.

                `);

            const data =
                parseAIJSON(raw);

            flashcards =
                Array.isArray(
                    data.cards
                )
                    ? data.cards
                        .filter(function(card) {
                            return (
                                card &&
                                card.front &&
                                card.back
                            );
                        })
                        .map(function(card) {
                            return {
                                front:
                                    String(
                                        card.front
                                    ),
                                back:
                                    String(
                                        card.back
                                    )
                            };
                        })
                    : [];

            if (
                flashcards.length === 0
            ) {
                throw new Error(
                    "لم يتم إنشاء بطاقات."
                );
            }

            currentFlashcardIndex =
                0;

            renderFlashcard();

        } catch (error) {

            body.innerHTML = `

                <div
                    class="unimind-error"
                >
                    ❌ حدث خطأ أثناء
                    إنشاء البطاقات.
                    حاول مرة أخرى.
                </div>

                <div
                    class="unimind-actions"
                >

                    <button
                        class="
                            unimind-btn
                            unimind-btn-secondary
                        "
                        id="flashcards-back"
                    >
                        العودة
                    </button>

                </div>
            `;

            getElement(
                "flashcards-back"
            ).addEventListener(
                "click",
                openFlashcards
            );
        }
    }

    function renderFlashcard() {

        const modal =
            getElement(
                "unimind-flashcards-modal"
            );

        const body =
            modal.querySelector(
                "[data-modal-body]"
            );

        const card =
            flashcards[
                currentFlashcardIndex
            ];

        if (!card) return;

        body.innerHTML = `

            <div
                style="
                    text-align:center;
                    margin-bottom:15px;
                    color:#64748b;
                "
            >
                البطاقة
                ${currentFlashcardIndex + 1}
                من
                ${flashcards.length}
            </div>

            <div
                class="unimind-flashcard"
                id="active-flashcard"
            >

                <div>

                    <div
                        class="
                            unimind-flashcard-text
                        "
                        id="flashcard-text"
                    >
                        ${escapeHTML(
                            card.front
                        )}
                    </div>

                    <div
                        class="
                            unimind-flashcard-hint
                        "
                        id="flashcard-hint"
                    >
                        اضغط على البطاقة
                        لإظهار الإجابة
                    </div>

                </div>

            </div>

            <div
                class="unimind-actions"
                style="
                    justify-content:center;
                "
            >

                <button
                    type="button"
                    class="
                        unimind-btn
                        unimind-btn-secondary
                    "
                    id="flashcard-prev"
                >
                    ← السابقة
                </button>

                <button
                    type="button"
                    class="
                        unimind-btn
                        unimind-btn-primary
                    "
                    id="flashcard-next"
                >
                    التالية →
                </button>

            </div>
        `;

        let showingAnswer =
            false;

        getElement(
            "active-flashcard"
        ).addEventListener(
            "click",
            function () {

                showingAnswer =
                    !showingAnswer;

                getElement(
                    "flashcard-text"
                ).textContent =
                    showingAnswer
                        ? card.back
                        : card.front;

                getElement(
                    "flashcard-hint"
                ).textContent =
                    showingAnswer
                        ? "اضغط للعودة للسؤال"
                        : "اضغط على البطاقة لإظهار الإجابة";
            }
        );

        getElement(
            "flashcard-prev"
        ).addEventListener(
            "click",
            function () {

                if (
                    currentFlashcardIndex >
                    0
                ) {

                    currentFlashcardIndex--;

                    renderFlashcard();
                }
            }
        );

        getElement(
            "flashcard-next"
        ).addEventListener(
            "click",
            function () {

                if (
                    currentFlashcardIndex <
                    flashcards.length - 1
                ) {

                    currentFlashcardIndex++;

                    renderFlashcard();

                } else {

                    currentFlashcardIndex =
                        0;

                    renderFlashcard();

                }

            }
        );
    }

    /* =========================================================
       STUDY PLANNER
       ========================================================= */

    function openStudyPlanner() {

        const modal =
            createModal(
                "unimind-planner-modal",
                "📅 مخطط الدراسة الذكي"
            );

        const body =
            modal.querySelector(
                "[data-modal-body]"
            );

        body.innerHTML = `

            <p
                style="
                    color:#64748b;
                    line-height:1.8;
                "
            >
                أدخل موادك وموعد الامتحانات،
                وسينشئ لك الذكاء الاصطناعي
                خطة دراسة منظمة.
            </p>

            <div
                class="unimind-field"
            >

                <label>
                    المواد الدراسية
                </label>

                <textarea
                    id="planner-subjects"
                    placeholder="
مثال:
برمجة
شبكات
أمن معلومات
قواعد بيانات
                    "
                ></textarea>

            </div>

            <div
                class="unimind-field"
            >

                <label>
                    موعد الامتحان أو الفترة المتاحة
                </label>

                <input
                    id="planner-date"
                    type="text"
                    placeholder="مثال: بعد أسبوعين"
                >

            </div>

            <div
                class="unimind-field"
            >

                <label>
                    عدد ساعات الدراسة يوميًا
                </label>

                <select
                    id="planner-hours"
                >

                    <option value="2">
                        ساعتان
                    </option>

                    <option value="3">
                        3 ساعات
                    </option>

                    <option value="4">
                        4 ساعات
                    </option>

                    <option value="5">
                        5 ساعات
                    </option>

                    <option value="6">
                        6 ساعات
                    </option>

                </select>

            </div>

            <div
                class="unimind-actions"
            >

                <button
                    type="button"
                    class="
                        unimind-btn
                        unimind-btn-primary
                    "
                    id="create-study-plan"
                >
                    📅 إنشاء الخطة
                </button>

            </div>
        `;

        getElement(
            "create-study-plan"
        ).addEventListener(
            "click",
            generateStudyPlan
        );

        openModal(
            "unimind-planner-modal"
        );
    }

    async function generateStudyPlan() {

        const subjects =
            getElement(
                "planner-subjects"
            )
                .value
                .trim();

        const date =
            getElement(
                "planner-date"
            )
                .value
                .trim();

        const hours =
            getElement(
                "planner-hours"
            ).value;

        if (!subjects) {

            alert(
                "اكتب المواد الدراسية أولًا."
            );

            return;
        }

        const modal =
            getElement(
                "unimind-planner-modal"
            );

        const body =
            modal.querySelector(
                "[data-modal-body]"
            );

        body.innerHTML = `

            <div
                class="unimind-loading"
            >

                <div
                    class="unimind-spinner"
                ></div>

                <strong>
                    جاري إعداد خطة الدراسة...
                </strong>

            </div>
        `;

        try {

            const raw =
                await askAI(`

أنت مساعد جامعي متخصص
في تنظيم خطط الدراسة.

أنشئ خطة دراسة عملية للطالب.

المواد:
${subjects}

الفترة:
${date || "غير محددة"}

ساعات الدراسة اليومية:
${hours}

أعد النتيجة فقط بصيغة JSON:

{
  "plan": [
    {
      "day": "اليوم الأول",
      "subject": "اسم المادة",
      "tasks": "المهام التي يجب إنجازها",
      "duration": "ساعتان"
    }
  ]
}

استخدم اللغة العربية.
لا تضف Markdown.
لا تضف أي نص خارج JSON.

                `);

            const data =
                parseAIJSON(raw);

            studyPlan =
                Array.isArray(
                    data.plan
                )
                    ? data.plan
                    : [];

            if (
                studyPlan.length === 0
            ) {
                throw new Error(
                    "الخطة فارغة."
                );
            }

            renderStudyPlan();

        } catch (error) {

            body.innerHTML = `

                <div
                    class="unimind-error"
                >
                    ❌ تعذر إنشاء خطة الدراسة.
                    حاول مرة أخرى.
                </div>
            `;
        }
    }

    function renderStudyPlan() {

        const modal =
            getElement(
                "unimind-planner-modal"
            );

        const body =
            modal.querySelector(
                "[data-modal-body]"
            );

        body.innerHTML = `

            <div
                style="
                    margin-bottom:20px;
                    line-height:1.8;
                "
            >
                <strong>
                    خطتك الدراسية جاهزة 📚
                </strong>

                <br>

                اتبع الخطة وعدّلها حسب تقدمك.
            </div>

            ${studyPlan
                .map(function(item) {

                    return `

                        <div
                            class="
                                unimind-plan-item
                            "
                        >

                            <div
                                class="
                                    unimind-plan-day
                                "
                            >
                                ${escapeHTML(
                                    item.day ||
                                    ""
                                )}
                            </div>

                            <div
                                class="
                                    unimind-plan-subject
                                "
                            >
                                ${escapeHTML(
                                    item.subject ||
                                    ""
                                )}
                            </div>

                            <div
                                class="
                                    unimind-plan-task
                                "
                            >
                                ${escapeHTML(
                                    item.tasks ||
                                    ""
                                )}
                            </div>

                            ${
                                item.duration
                                    ? `
                                        <div
                                            style="
                                                margin-top:8px;
                                                color:#64748b;
                                            "
                                        >
                                            ⏱️
                                            ${escapeHTML(
                                                item.duration
                                            )}
                                        </div>
                                    `
                                    : ""
                            }

                        </div>
                    `;
                })
                .join("")}

            <div
                class="unimind-actions"
            >

                <button
                    type="button"
                    class="
                        unimind-btn
                        unimind-btn-secondary
                    "
                    id="planner-new"
                >
                    إنشاء خطة جديدة
                </button>

            </div>
        `;

        getElement(
            "planner-new"
        ).addEventListener(
            "click",
            openStudyPlanner
        );
    }

    /* =========================================================
       CV ASSISTANT
       ========================================================= */

    function openCVAssistant() {

        const modal =
            createModal(
                "unimind-cv-modal",
                "💼 مساعد السيرة الذاتية"
            );

        const body =
            modal.querySelector(
                "[data-modal-body]"
            );

        body.innerHTML = `

            <p
                style="
                    color:#64748b;
                    line-height:1.8;
                "
            >
                أدخل معلوماتك وسأساعدك في
                إنشاء سيرة ذاتية احترافية
                ومنظمة.
            </p>

            <div
                class="unimind-field"
            >

                <label>
                    الاسم
                </label>

                <input
                    id="cv-name"
                    type="text"
                    placeholder="الاسم الكامل"
                >

            </div>

            <div
                class="unimind-field"
            >

                <label>
                    التخصص / الوظيفة المستهدفة
                </label>

                <input
                    id="cv-role"
                    type="text"
                    placeholder="مثال: مطور ويب"
                >

            </div>

            <div
                class="unimind-field"
            >

                <label>
                    التعليم والخبرات والمهارات
                </label>

                <textarea
                    id="cv-info"
                    placeholder="
اكتب هنا:
التعليم
الخبرات
المشاريع
الدورات
المهارات
اللغات
                    "
                ></textarea>

            </div>

            <div
                class="unimind-actions"
            >

                <button
                    type="button"
                    class="
                        unimind-btn
                        unimind-btn-primary
                    "
                    id="generate-cv"
                >
                    ✨ إنشاء السيرة الذاتية
                </button>

            </div>
        `;

        getElement(
            "generate-cv"
        ).addEventListener(
            "click",
            generateCV
        );

        openModal(
            "unimind-cv-modal"
        );
    }

    async function generateCV() {

        const name =
            getElement(
                "cv-name"
            )
                .value
                .trim();

        const role =
            getElement(
                "cv-role"
            )
                .value
                .trim();

        const info =
            getElement(
                "cv-info"
            )
                .value
                .trim();

        if (
            !name ||
            !role ||
            !info
        ) {

            alert(
                "يرجى تعبئة جميع المعلومات."
            );

            return;
        }

        const modal =
            getElement(
                "unimind-cv-modal"
            );

        const body =
            modal.querySelector(
                "[data-modal-body]"
            );

        body.innerHTML = `

            <div
                class="unimind-loading"
            >

                <div
                    class="unimind-spinner"
                ></div>

                <strong>
                    جاري إعداد السيرة الذاتية...
                </strong>

            </div>
        `;

        try {

            const result =
                await askAI(`

أنت خبير في كتابة السير الذاتية.

أنشئ سيرة ذاتية احترافية باللغة العربية
لشخص يريد التقديم على:

${role}

الاسم:
${name}

معلوماته:
${info}

نظم السيرة الذاتية بهذا الترتيب:

الاسم
الملخص المهني
التعليم
الخبرات
المشاريع
المهارات
الدورات والشهادات
اللغات

استخدم المعلومات التي أعطيتك فقط.
لا تخترع خبرات أو شهادات غير موجودة.

اجعل النص احترافيًا وقابلًا للنسخ
والاستخدام في CV.

                `);

            body.innerHTML = `

                <div
                    class="unimind-cv-result"
                    id="cv-result"
                ></div>

                <div
                    class="unimind-actions"
                >

                    <button
                        type="button"
                        class="
                            unimind-btn
                            unimind-btn-primary
                        "
                        id="copy-cv"
                    >
                        📋 نسخ السيرة الذاتية
                    </button>

                    <button
                        type="button"
                        class="
                            unimind-btn
                            unimind-btn-secondary
                        "
                        id="new-cv"
                    >
                        سيرة جديدة
                    </button>

                </div>
            `;

            getElement(
                "cv-result"
            ).textContent =
                result;

            getElement(
                "copy-cv"
            ).addEventListener(
                "click",
                async function () {

                    try {

                        await navigator
                            .clipboard
                            .writeText(
                                result
                            );

                        this.textContent =
                            "✅ تم النسخ";

                        setTimeout(
                            () => {
                                this.textContent =
                                    "📋 نسخ السيرة الذاتية";
                            },
                            1800
                        );

                    } catch (error) {

                        alert(
                            "تعذر النسخ تلقائيًا."
                        );
                    }

                }
            );

            getElement(
                "new-cv"
            ).addEventListener(
                "click",
                openCVAssistant
            );

        } catch (error) {

            body.innerHTML = `

                <div
                    class="unimind-error"
                >
                    ❌ حدث خطأ أثناء إنشاء
                    السيرة الذاتية.
                </div>
            `;
        }
    }

    /* =========================================================
       LECTURE SUMMARIZER
       ========================================================= */

    function openLectureModal() {

        const modal =
            createModal(
                "unimind-lecture-modal",
                "📄 تلخيص المحاضرات"
            );

        const body =
            modal.querySelector(
                "[data-modal-body]"
            );

        body.innerHTML = `

            <p
                style="
                    line-height:1.8;
                    color:#64748b;
                "
            >
                ارفع ملف المحاضرة أو الصق
                النص وسأقوم بتلخيصه.
            </p>

            <div
                class="unimind-field"
            >

                <label>
                    ملف المحاضرة
                </label>

                <input
                    id="lecture-file"
                    type="file"
                    accept=".txt,.md,.pdf,.doc,.docx"
                >

            </div>

            <div
                class="unimind-field"
            >

                <label>
                    أو الصق النص مباشرة
                </label>

                <textarea
                    id="lecture-text"
                    placeholder="الصق محتوى المحاضرة هنا..."
                ></textarea>

            </div>

            <div
                class="unimind-actions"
            >

                <button
                    type="button"
                    class="
                        unimind-btn
                        unimind-btn-primary
                    "
                    id="summarize-lecture"
                >
                    ✨ تلخيص المحاضرة
                </button>

            </div>

            <div
                id="lecture-result"
                style="
                    margin-top:20px;
                "
            ></div>
        `;

        getElement(
            "lecture-file"
        ).addEventListener(
            "change",
            handleLectureFile
        );

        getElement(
            "summarize-lecture"
        ).addEventListener(
            "click",
            summarizeLecture
        );

        openModal(
            "unimind-lecture-modal"
        );
    }

    async function handleLectureFile(
        event
    ) {

        const file =
            event.target.files &&
            event.target.files[0];

        if (!file) {
            return;
        }

        selectedLectureFile =
            file;

        const result =
            getElement(
                "lecture-result"
            );

        result.innerHTML = `
            <p>
                📎 تم اختيار:
                <strong>
                    ${escapeHTML(
                        file.name
                    )}
                </strong>
            </p>
        `;
    }

    async function extractLectureText() {

        const text =
            getElement(
                "lecture-text"
            ).value.trim();

        if (text) {
            return text;
        }

        if (
            !selectedLectureFile
        ) {
            return "";
        }

        const file =
            selectedLectureFile;

        if (
            file.type ===
            "text/plain" ||
            file.name
                .toLowerCase()
                .endsWith(".txt") ||
            file.name
                .toLowerCase()
                .endsWith(".md")
        ) {

            return await file.text();
        }

        if (
            file.name
                .toLowerCase()
                .endsWith(".pdf")
        ) {

            if (
                !window.pdfjsLib
            ) {

                throw new Error(
                    "PDF.js غير متاح."
                );
            }

            const buffer =
                await file.arrayBuffer();

            const pdf =
                await window.pdfjsLib
                    .getDocument({
                        data: buffer
                    })
                    .promise;

            let output = "";

            for (
                let pageNumber = 1;
                pageNumber <= pdf.numPages;
                pageNumber++
            ) {

                const page =
                    await pdf.getPage(
                        pageNumber
                    );

                const content =
                    await page
                        .getTextContent();

                output +=
                    content.items
                        .map(
                            function(item) {
                                return item.str;
                            }
                        )
                        .join(" ") +
                    "\n";
            }

            return output;
        }

        throw new Error(
            "نوع الملف غير مدعوم حاليًا."
        );
    }

    async function summarizeLecture() {

        const result =
            getElement(
                "lecture-result"
            );

        result.innerHTML = `

            <div
                class="unimind-loading"
            >

                <div
                    class="unimind-spinner"
                ></div>

                <strong>
                    جاري قراءة المحاضرة...
                </strong>

            </div>
        `;

        try {

            const text =
                await extractLectureText();

            if (!text.trim()) {

                throw new Error(
                    "لم يتم العثور على نص."
                );
            }

            result.innerHTML = `

                <div
                    class="unimind-loading"
                >

                    <div
                        class="unimind-spinner"
                    ></div>

                    <strong>
                        جاري إنشاء الملخص...
                    </strong>

                </div>
            `;

            const summary =
                await askAI(`

لخص المحاضرة التالية باللغة العربية
لطالب جامعي.

المطلوب:

1. ملخص واضح.
2. أهم النقاط.
3. المصطلحات المهمة.
4. النقاط التي يجب حفظها.
5. أسئلة مراجعة في النهاية.

لا تحذف المعلومات الأساسية.

نص المحاضرة:

${text.slice(0, 50000)}

                `);

            result.innerHTML = `

                <div
                    class="unimind-cv-result"
                    id="lecture-summary"
                ></div>

                <div
                    class="unimind-actions"
                >

                    <button
                        type="button"
                        class="
                            unimind-btn
                            unimind-btn-primary
                        "
                        id="copy-summary"
                    >
                        📋 نسخ الملخص
                    </button>

                </div>
            `;

            getElement(
                "lecture-summary"
            ).textContent =
                summary;

            getElement(
                "copy-summary"
            ).addEventListener(
                "click",
                async function () {

                    await navigator
                        .clipboard
                        .writeText(
                            summary
                        );

                    this.textContent =
                        "✅ تم النسخ";

                }
            );

        } catch (error) {

            console.error(
                error
            );

            result.innerHTML = `

                <div
                    class="unimind-error"
                >
                    ❌
                    ${
                        error.message ||
                        "حدث خطأ أثناء التلخيص."
                    }
                </div>
            `;
        }
    }

    /* =========================================================
       BUTTONS
       ========================================================= */

    function setupButtons() {

        const map = {

            studyAssistantButton:
                openChat,

            lectureSummarizerButton:
                openLectureModal,

            quizButton:
                openQuizModal,

            flashcardsButton:
                openFlashcards,

            plannerButton:
                openStudyPlanner,

            cvButton:
                openCVAssistant,

            ctaStartButton:
                openChat,

            ctaBottomButton:
                openChat,

            heroDemoButton:
                openChat,

            heroChatButton:
                openChat

        };

        Object.keys(map)
            .forEach(function(id) {

                const element =
                    getElement(id);

                if (!element) {
                    return;
                }

                element.addEventListener(
                    "click",
                    function(event) {

                        event.preventDefault();

                        map[id]();

                    }
                );

            });
    }

    /* =========================================================
       THEME
       ========================================================= */

    function setupTheme() {

        const buttons =
            document.querySelectorAll(
                "[data-theme-toggle], #themeToggle, #theme-toggle"
            );

        buttons.forEach(
            function(button) {

                button.addEventListener(
                    "click",
                    function() {

                        document.body
                            .classList
                            .toggle(
                                "dark-mode"
                            );

                    }
                );

            }
        );
    }

    /* =========================================================
       LANGUAGE
       ========================================================= */

    function setupLanguage() {

        document.documentElement
            .setAttribute(
                "dir",
                "rtl"
            );

        document.documentElement
            .setAttribute(
                "lang",
                "ar"
            );
    }

    /* =========================================================
       KEYBOARD
       ========================================================= */

    function setupKeyboard() {

        document.addEventListener(
            "keydown",
            function(event) {

                if (
                    event.key !==
                    "Escape"
                ) {
                    return;
                }

                const quiz =
                    getElement(
                        "unimind-quiz-modal"
                    );

                if (
                    quiz &&
                    quiz.classList.contains(
                        "active"
                    )
                ) {

                    closeQuizModal();

                    return;
                }

                document
                    .querySelectorAll(
                        ".unimind-runtime-modal.active"
                    )
                    .forEach(
                        function(modal) {

                            closeModal(
                                modal.id
                            );

                        }
                    );

            }
        );
    }

    /* =========================================================
       LOGIN
       ========================================================= */

    function setupLogin() {

        const loginButtons =
            document.querySelectorAll(
                "#loginButton, #studentLoginButton, [data-login]"
            );

        loginButtons.forEach(
            function(button) {

                button.addEventListener(
                    "click",
                    function(event) {

                        event.preventDefault();

                        alert(
                            "نظام تسجيل الطالب سيتم ربطه لاحقًا بقاعدة بيانات المستخدمين."
                        );

                    }
                );

            }
        );
    }

    /* =========================================================
       GLOBAL FUNCTIONS
       ========================================================= */

    window.openChat =
        openChat;

    window.closeUniMindChat =
        function() {

            closeModal(
                "unimind-chat-modal"
            );

        };

    window.openLectureSummarizer =
        openLectureModal;

    window.closeLectureSummarizer =
        function() {

            closeModal(
                "unimind-lecture-modal"
            );

        };

    window.openUniMindQuiz =
        openQuizModal;

    window.closeUniMindQuiz =
        closeQuizModal;

    window.openFlashcards =
        openFlashcards;

    window.openStudyPlanner =
        openStudyPlanner;

    window.openCVAssistant =
        openCVAssistant;

    /* =========================================================
       START
       ========================================================= */

    function startUniMind() {

        injectStyles();

        setupButtons();

        setupTheme();

        setupLanguage();

        setupLogin();

        setupKeyboard();

        console.log(
            "UniMind AI initialized successfully."
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

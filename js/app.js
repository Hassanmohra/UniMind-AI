document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       THEME
    ===================================================== */

    const themeToggle =
        document.getElementById("themeToggle");

    if (themeToggle) {

        const savedTheme =
            localStorage.getItem("unimind-theme");

        if (savedTheme === "dark") {

            document.body.classList.add("dark-mode");
            themeToggle.textContent = "🌙";

        } else {

            themeToggle.textContent = "☀️";

        }

        themeToggle.addEventListener("click", function () {

            document.body.classList.toggle("dark-mode");

            const isDark =
                document.body.classList.contains("dark-mode");

            localStorage.setItem(
                "unimind-theme",
                isDark ? "dark" : "light"
            );

            themeToggle.textContent =
                isDark ? "🌙" : "☀️";

        });

    }


    /* =====================================================
       FEATURE LINKS
    ===================================================== */

    const featureLinks =
        document.querySelectorAll(".feature-card a");


    featureLinks.forEach(function (link) {

        link.addEventListener("click", function (event) {

            event.preventDefault();

            const card =
                link.closest(".feature-card");

            if (!card) return;

            const title =
                card.querySelector("h3")?.textContent || "";


            if (title.includes("مساعد الدراسة")) {

                openStudyAssistant();

            }

        });

    });


    /* =====================================================
       STUDY ASSISTANT
    ===================================================== */

    function openStudyAssistant() {

        const oldModal =
            document.querySelector(".unimind-chat-overlay");

        if (oldModal) {
            oldModal.remove();
        }


        const overlay =
            document.createElement("div");

        overlay.className =
            "unimind-chat-overlay";


        overlay.style.cssText = `
            position:fixed;
            inset:0;
            z-index:99999;
            background:rgba(8,12,30,.75);
            backdrop-filter:blur(10px);
            display:flex;
            align-items:center;
            justify-content:center;
            padding:18px;
            direction:rtl;
        `;


        overlay.innerHTML = `

        <div style="
            width:100%;
            max-width:880px;
            height:min(780px,92vh);
            background:#fff;
            border-radius:28px;
            overflow:hidden;
            display:flex;
            flex-direction:column;
            box-shadow:0 30px 100px rgba(0,0,0,.35);
        ">

            <!-- HEADER -->

            <div style="
                padding:17px 20px;
                border-bottom:1px solid #ececf3;
                display:flex;
                align-items:center;
                justify-content:space-between;
                background:#fff;
            ">

                <div style="
                    display:flex;
                    align-items:center;
                    gap:12px;
                ">

                    <div style="
                        width:46px;
                        height:46px;
                        border-radius:15px;
                        background:linear-gradient(135deg,#6c4cff,#8b76ff);
                        color:white;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        font-size:22px;
                        box-shadow:0 8px 25px rgba(108,76,255,.25);
                    ">
                        ✦
                    </div>


                    <div>

                        <strong style="
                            display:block;
                            font-size:17px;
                        ">
                            UniMind AI
                        </strong>

                        <div style="
                            display:flex;
                            align-items:center;
                            gap:6px;
                            margin-top:3px;
                        ">

                            <span style="
                                width:7px;
                                height:7px;
                                border-radius:50%;
                                background:#22c55e;
                            "></span>

                            <span style="
                                color:#777;
                                font-size:12px;
                            ">
                                مساعد الدراسة الذكي
                            </span>

                        </div>

                    </div>

                </div>


                <div style="
                    display:flex;
                    align-items:center;
                    gap:8px;
                ">

                    <button
                        id="newUniMindChat"
                        title="محادثة جديدة"
                        style="
                            width:40px;
                            height:40px;
                            border:0;
                            border-radius:12px;
                            background:#f3f3f7;
                            color:#555;
                            cursor:pointer;
                            font-size:18px;
                        "
                    >
                        ↻
                    </button>


                    <button
                        id="clearUniMindChat"
                        title="مسح المحادثة"
                        style="
                            width:40px;
                            height:40px;
                            border:0;
                            border-radius:12px;
                            background:#f3f3f7;
                            color:#555;
                            cursor:pointer;
                            font-size:17px;
                        "
                    >
                        🗑
                    </button>


                    <button
                        id="closeUniMindChat"
                        style="
                            width:40px;
                            height:40px;
                            border:0;
                            border-radius:12px;
                            background:#f3f3f7;
                            color:#555;
                            font-size:24px;
                            cursor:pointer;
                        "
                    >
                        ×
                    </button>

                </div>

            </div>


            <!-- CHAT -->

            <div
                id="unimindChatMessages"
                style="
                    flex:1;
                    overflow-y:auto;
                    padding:28px;
                    background:#fafaff;
                "
            >

                <div
                    id="unimindWelcome"
                    style="
                        max-width:650px;
                        margin:30px auto;
                        text-align:center;
                    "
                >

                    <div style="
                        width:76px;
                        height:76px;
                        margin:0 auto 18px;
                        border-radius:24px;
                        background:linear-gradient(135deg,#6c4cff,#8b76ff);
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        color:white;
                        font-size:34px;
                        box-shadow:0 15px 35px rgba(108,76,255,.22);
                    ">
                        ✦
                    </div>


                    <h2 style="
                        margin:0 0 10px;
                        font-size:27px;
                    ">
                        كيف يمكنني مساعدتك؟
                    </h2>


                    <p style="
                        margin:0 auto;
                        color:#777;
                        line-height:1.9;
                        font-size:14px;
                        max-width:550px;
                    ">
                        اسأل UniMind AI عن أي موضوع جامعي،
                        أو اطلب شرحًا، أو مثالًا، أو مساعدة في فهم محاضرتك.
                    </p>


                    <div style="
                        display:grid;
                        grid-template-columns:repeat(2,1fr);
                        gap:12px;
                        margin-top:28px;
                    ">

                        <button class="unimind-suggestion">
                            📚 اشرح لي موضوعًا بطريقة بسيطة
                        </button>

                        <button class="unimind-suggestion">
                            📝 اختبرني في مادة دراسية
                        </button>

                        <button class="unimind-suggestion">
                            💡 أعطني مثالًا عمليًا
                        </button>

                        <button class="unimind-suggestion">
                            🧠 ساعدني في فهم المحاضرة
                        </button>

                    </div>

                </div>

            </div>


            <!-- INPUT -->

            <div style="
                padding:18px 20px 20px;
                background:#fff;
                border-top:1px solid #ececf3;
            ">

                <div style="
                    display:flex;
                    align-items:flex-end;
                    gap:10px;
                    padding:8px;
                    background:#f6f6fa;
                    border:1px solid #e5e5ed;
                    border-radius:18px;
                ">

                    <textarea
                        id="unimindChatInput"
                        rows="1"
                        placeholder="اكتب سؤالك هنا..."
                        style="
                            flex:1;
                            resize:none;
                            border:0;
                            outline:0;
                            background:transparent;
                            padding:12px;
                            font-family:inherit;
                            font-size:15px;
                            line-height:1.6;
                            direction:rtl;
                            max-height:120px;
                        "
                    ></textarea>


                    <button
                        id="unimindSendButton"
                        title="إرسال"
                        style="
                            width:48px;
                            height:48px;
                            flex-shrink:0;
                            border:0;
                            border-radius:14px;
                            background:linear-gradient(135deg,#6c4cff,#8b76ff);
                            color:white;
                            font-size:20px;
                            cursor:pointer;
                        "
                    >
                        ↑
                    </button>

                </div>


                <div style="
                    text-align:center;
                    margin-top:8px;
                    color:#999;
                    font-size:11px;
                ">
                    UniMind AI • مساعد الدراسة الذكي
                </div>

            </div>

        </div>
        `;


        document.body.appendChild(overlay);


        /* =================================================
           ELEMENTS
        ================================================= */

        const messages =
            document.getElementById("unimindChatMessages");

        const input =
            document.getElementById("unimindChatInput");

        const sendButton =
            document.getElementById("unimindSendButton");


        /* =================================================
           CLOSE
        ================================================= */

        document
            .getElementById("closeUniMindChat")
            .addEventListener("click", function () {

                overlay.remove();

            });


        overlay.addEventListener("click", function (event) {

            if (event.target === overlay) {
                overlay.remove();
            }

        });


        /* =================================================
           NEW CHAT
        ================================================= */

        document
            .getElementById("newUniMindChat")
            .addEventListener("click", function () {

                resetChat();

            });


        /* =================================================
           CLEAR CHAT
        ================================================= */

        document
            .getElementById("clearUniMindChat")
            .addEventListener("click", function () {

                if (
                    confirm(
                        "هل تريد مسح المحادثة الحالية؟"
                    )
                ) {

                    resetChat();

                }

            });


        /* =================================================
           RESET CHAT
        ================================================= */

        function resetChat() {

            messages.innerHTML = `

                <div
                    id="unimindWelcome"
                    style="
                        max-width:650px;
                        margin:30px auto;
                        text-align:center;
                    "
                >

                    <div style="
                        width:76px;
                        height:76px;
                        margin:0 auto 18px;
                        border-radius:24px;
                        background:linear-gradient(135deg,#6c4cff,#8b76ff);
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        color:white;
                        font-size:34px;
                    ">
                        ✦
                    </div>

                    <h2 style="
                        margin:0 0 10px;
                        font-size:27px;
                    ">
                        كيف يمكنني مساعدتك؟
                    </h2>

                    <p style="
                        margin:0 auto;
                        color:#777;
                        line-height:1.9;
                        font-size:14px;
                    ">
                        ابدأ محادثة جديدة مع UniMind AI.
                    </p>

                </div>

            `;

            input.value = "";

            input.style.height = "auto";

            input.focus();

        }


        /* =================================================
           SUGGESTIONS
        ================================================= */

        const suggestions =
            overlay.querySelectorAll(".unimind-suggestion");


        suggestions.forEach(function (button) {

            button.style.cssText += `
                border:1px solid #e6e6ef;
                background:#fff;
                border-radius:15px;
                padding:15px;
                cursor:pointer;
                font-family:inherit;
                font-size:13px;
                color:#444;
                text-align:right;
                transition:.2s;
            `;


            button.addEventListener(
                "mouseenter",
                function () {

                    button.style.transform =
                        "translateY(-2px)";

                    button.style.borderColor =
                        "#6c4cff";

                }
            );


            button.addEventListener(
                "mouseleave",
                function () {

                    button.style.transform =
                        "translateY(0)";

                    button.style.borderColor =
                        "#e6e6ef";

                }
            );


            button.addEventListener(
                "click",
                function () {

                    input.value =
                        button.textContent.trim();

                    input.focus();

                }
            );

        });


        /* =================================================
           AUTO RESIZE
        ================================================= */

        input.addEventListener(
            "input",
            function () {

                input.style.height = "auto";

                input.style.height =
                    Math.min(
                        input.scrollHeight,
                        120
                    ) + "px";

            }
        );


        /* =================================================
           SEND MESSAGE
        ================================================= */

        function sendMessage() {

            const question =
                input.value.trim();

            if (!question) {

                input.focus();

                return;

            }


            const welcome =
                document.getElementById("unimindWelcome");

            if (welcome) {
                welcome.remove();
            }


            /* USER */

            const userMessage =
                document.createElement("div");


            userMessage.style.cssText = `
                display:flex;
                justify-content:flex-start;
                margin:16px 0;
            `;


            userMessage.innerHTML = `

                <div style="
                    max-width:76%;
                    background:linear-gradient(135deg,#6c4cff,#8068ff);
                    color:white;
                    padding:13px 17px;
                    border-radius:18px 18px 4px 18px;
                    line-height:1.8;
                    font-size:14px;
                    box-shadow:0 8px 20px rgba(108,76,255,.12);
                ">
                    ${escapeHTML(question)}
                </div>

            `;


            messages.appendChild(userMessage);


            input.value = "";

            input.style.height = "auto";

            scrollChat();


            /* THINKING */

            const thinking =
                document.createElement("div");


            thinking.style.cssText = `
                display:flex;
                justify-content:flex-end;
                margin:16px 0;
            `;


            thinking.innerHTML = `

                <div style="
                    max-width:76%;
                    background:#fff;
                    border:1px solid #e8e8ef;
                    color:#777;
                    padding:13px 17px;
                    border-radius:18px 18px 18px 4px;
                    font-size:14px;
                ">
                    <span>✦</span>
                    UniMind يفكر...
                </div>

            `;


            messages.appendChild(thinking);

            scrollChat();


            /* DEMO RESPONSE */

            setTimeout(function () {

                thinking.remove();


                createAssistantMessage(
                    "فهمت سؤالك 👌\n\nهذه نسخة تجريبية من واجهة UniMind AI. سنقوم لاحقًا بربطها بنموذج ذكاء اصطناعي حقيقي حتى تحصل على إجابات مخصصة لسؤالك."
                );


            }, 900);

        }


        /* =================================================
           CREATE AI MESSAGE
        ================================================= */

        function createAssistantMessage(text) {

            const wrapper =
                document.createElement("div");


            wrapper.style.cssText = `
                display:flex;
                justify-content:flex-end;
                margin:16px 0;
            `;


            const message =
                document.createElement("div");


            message.style.cssText = `
                max-width:82%;
                background:#fff;
                border:1px solid #e8e8ef;
                color:#333;
                padding:16px 18px;
                border-radius:18px 18px 18px 4px;
                line-height:1.9;
                font-size:14px;
                box-shadow:0 5px 20px rgba(0,0,0,.03);
            `;


            const safeText =
                escapeHTML(text)
                    .replace(/\n/g, "<br>");


            message.innerHTML = `

                <div style="
                    font-weight:700;
                    margin-bottom:10px;
                    color:#6c4cff;
                ">
                    ✦ UniMind AI
                </div>

                <div>
                    ${safeText}
                </div>


                <div style="
                    display:flex;
                    gap:7px;
                    margin-top:14px;
                    padding-top:12px;
                    border-top:1px solid #f0f0f4;
                ">

                    <button
                        class="ai-action copy-answer"
                        title="نسخ الإجابة"
                    >
                        📋
                    </button>

                    <button
                        class="ai-action like-answer"
                        title="إجابة مفيدة"
                    >
                        👍
                    </button>

                    <button
                        class="ai-action dislike-answer"
                        title="الإجابة غير مفيدة"
                    >
                        👎
                    </button>

                    <button
                        class="ai-action regenerate-answer"
                        title="إعادة التوليد"
                    >
                        🔄
                    </button>

                </div>

            `;


            wrapper.appendChild(message);

            messages.appendChild(wrapper);


            /* ACTION BUTTONS */

            const actionButtons =
                message.querySelectorAll(".ai-action");


            actionButtons.forEach(function (button) {

                button.style.cssText += `
                    border:0;
                    background:#f5f5f8;
                    border-radius:9px;
                    padding:7px 10px;
                    cursor:pointer;
                    font-size:13px;
                `;

            });


            /* COPY */

            message
                .querySelector(".copy-answer")
                .addEventListener(
                    "click",
                    function () {

                        navigator.clipboard
                            .writeText(text)
                            .then(function () {

                                this.textContent = "✓";

                                setTimeout(
                                    () => {
                                        this.textContent = "📋";
                                    },
                                    1200
                                );

                            }.bind(this));

                    }
                );


            /* LIKE */

            message
                .querySelector(".like-answer")
                .addEventListener(
                    "click",
                    function () {

                        this.textContent = "💜";

                    }
                );


            /* DISLIKE */

            message
                .querySelector(".dislike-answer")
                .addEventListener(
                    "click",
                    function () {

                        this.textContent = "✓";

                    }
                );


            /* REGENERATE */

            message
                .querySelector(".regenerate-answer")
                .addEventListener(
                    "click",
                    function () {

                        const old =
                            this.textContent;

                        this.textContent =
                            "⏳";

                        setTimeout(
                            function () {

                                this.textContent =
                                    old;

                            }.bind(this),
                            1000
                        );

                    }
                );


            scrollChat();

        }


        /* =================================================
           ENTER
        ================================================= */

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


        /* =================================================
           SEND BUTTON
        ================================================= */

        sendButton.addEventListener(
            "click",
            sendMessage
        );


        /* =================================================
           SCROLL
        ================================================= */

        function scrollChat() {

            setTimeout(
                function () {

                    messages.scrollTo({
                        top:messages.scrollHeight,
                        behavior:"smooth"
                    });

                },
                50
            );

        }


        /* =================================================
           FOCUS
        ================================================= */

        input.focus();

    }


    /* =====================================================
       SECURITY
    ===================================================== */

    function escapeHTML(text) {

        const div =
            document.createElement("div");

        div.textContent =
            text;

        return div.innerHTML;

    }

});

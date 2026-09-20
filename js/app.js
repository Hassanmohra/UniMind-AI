document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       THEME
    ===================================================== */

    const themeToggle = document.getElementById("themeToggle");

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

            const dark =
                document.body.classList.contains("dark-mode");

            localStorage.setItem(
                "unimind-theme",
                dark ? "dark" : "light"
            );

            themeToggle.textContent =
                dark ? "🌙" : "☀️";

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

            const title =
                card.querySelector("h3").textContent;

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
            background:rgba(8,12,30,.72);
            backdrop-filter:blur(10px);
            display:flex;
            align-items:center;
            justify-content:center;
            padding:18px;
            direction:rtl;
        `;


        overlay.innerHTML = `

        <div class="unimind-chat-window" style="
            width:100%;
            max-width:850px;
            height:min(760px,92vh);
            background:#fff;
            border-radius:28px;
            overflow:hidden;
            display:flex;
            flex-direction:column;
            box-shadow:0 30px 100px rgba(0,0,0,.35);
        ">

            <!-- HEADER -->

            <div style="
                padding:18px 22px;
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
                        color:#fff;
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


            <!-- CHAT BODY -->

            <div
                id="unimindChatMessages"
                style="
                    flex:1;
                    overflow-y:auto;
                    padding:28px;
                    background:#fafaff;
                "
            >

                <!-- WELCOME -->

                <div
                    id="unimindWelcome"
                    style="
                        max-width:620px;
                        margin:30px auto;
                        text-align:center;
                    "
                >

                    <div style="
                        width:72px;
                        height:72px;
                        margin:0 auto 18px;
                        border-radius:22px;
                        background:linear-gradient(135deg,#6c4cff,#8b76ff);
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        color:white;
                        font-size:32px;
                        box-shadow:0 15px 35px rgba(108,76,255,.2);
                    ">
                        ✦
                    </div>

                    <h2 style="
                        margin:0 0 10px;
                        font-size:26px;
                    ">
                        كيف يمكنني مساعدتك؟
                    </h2>

                    <p style="
                        margin:0 auto;
                        color:#777;
                        line-height:1.8;
                        font-size:14px;
                    ">
                        اسألني عن أي موضوع جامعي، أو اطلب شرحًا،
                        أو تلخيصًا، أو أمثلة تساعدك على الفهم.
                    </p>


                    <!-- QUICK ACTIONS -->

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


            <!-- INPUT AREA -->

            <div style="
                padding:18px 22px 20px;
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
                    UniMind AI يمكنه مساعدتك في الدراسة والتعلم
                </div>

            </div>

        </div>
        `;


        document.body.appendChild(overlay);


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


            button.addEventListener("mouseenter", function () {

                button.style.transform =
                    "translateY(-2px)";

                button.style.borderColor =
                    "#6c4cff";

            });


            button.addEventListener("mouseleave", function () {

                button.style.transform =
                    "translateY(0)";

                button.style.borderColor =
                    "#e6e6ef";

            });


            button.addEventListener("click", function () {

                input.value =
                    button.textContent.trim();

                input.focus();

            });

        });


        /* =================================================
           INPUT
        ================================================= */

        const input =
            document.getElementById("unimindChatInput");

        const sendButton =
            document.getElementById("unimindSendButton");

        const messages =
            document.getElementById("unimindChatMessages");


        /* Auto resize */

        input.addEventListener("input", function () {

            input.style.height = "auto";

            input.style.height =
                Math.min(input.scrollHeight, 120) + "px";

        });


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


            /* USER MESSAGE */

            const userBubble =
                document.createElement("div");

            userBubble.style.cssText = `
                display:flex;
                justify-content:flex-start;
                margin:16px 0;
            `;


            userBubble.innerHTML = `

                <div style="
                    max-width:75%;
                    background:linear-gradient(135deg,#6c4cff,#8068ff);
                    color:#fff;
                    padding:13px 17px;
                    border-radius:18px 18px 4px 18px;
                    line-height:1.8;
                    font-size:14px;
                    box-shadow:0 8px 20px rgba(108,76,255,.12);
                ">
                    ${escapeHTML(question)}
                </div>

            `;


            messages.appendChild(userBubble);


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
                    max-width:75%;
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


                const response =
                    document.createElement("div");


                response.style.cssText = `
                    display:flex;
                    justify-content:flex-end;
                    margin:16px 0;
                `;


                response.innerHTML = `

                    <div style="
                        max-width:82%;
                        background:#fff;
                        border:1px solid #e8e8ef;
                        color:#333;
                        padding:16px 18px;
                        border-radius:18px 18px 18px 4px;
                        line-height:1.9;
                        font-size:14px;
                        box-shadow:0 5px 20px rgba(0,0,0,.03);
                    ">

                        <div style="
                            font-weight:700;
                            margin-bottom:9px;
                            color:#6c4cff;
                        ">
                            ✦ UniMind AI
                        </div>

                        <div>
                            فهمت سؤالك 👌
                        </div>

                        <div style="
                            margin-top:8px;
                            color:#666;
                        ">
                            هذه نسخة الواجهة التجريبية من مساعد
                            UniMind AI. في المرحلة التالية سنربط
                            المحادثة بنموذج ذكاء اصطناعي حقيقي
                            للحصول على إجابات مخصصة لمحتوى الطالب.
                        </div>

                    </div>

                `;


                messages.appendChild(response);

                scrollChat();

            }, 900);

        }


        /* =================================================
           SEND BUTTON
        ================================================= */

        sendButton.addEventListener(
            "click",
            sendMessage
        );


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


        input.focus();

    }


    /* =====================================================
       SCROLL
    ===================================================== */

    function scrollChat() {

        const chat =
            document.getElementById("unimindChatMessages");

        if (chat) {

            setTimeout(function () {

                chat.scrollTo({
                    top:chat.scrollHeight,
                    behavior:"smooth"
                });

            }, 50);

        }

    }


    /* =====================================================
       SECURITY
    ===================================================== */

    function escapeHTML(text) {

        const div =
            document.createElement("div");

        div.textContent = text;

        return div.innerHTML;

    }

});

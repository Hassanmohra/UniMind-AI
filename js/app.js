document.addEventListener("DOMContentLoaded", function () {

    /* =========================
       FEATURE LINKS
    ========================= */

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


    /* =========================
       STUDY ASSISTANT
    ========================= */

    function openStudyAssistant() {

        const oldModal =
            document.querySelector(".unimind-study-modal");

        if (oldModal) {
            oldModal.remove();
        }


        const overlay =
            document.createElement("div");

        overlay.className =
            "unimind-study-modal";


        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            z-index: 99999;
            background: rgba(8, 12, 30, 0.72);
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            direction: rtl;
        `;


        overlay.innerHTML = `

            <div style="
                width: 100%;
                max-width: 720px;
                height: min(720px, 90vh);
                background: #ffffff;
                border-radius: 26px;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                box-shadow: 0 30px 100px rgba(0,0,0,.35);
            ">

                <!-- HEADER -->

                <div style="
                    padding: 20px 24px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-bottom: 1px solid #eee;
                ">

                    <div style="
                        display:flex;
                        align-items:center;
                        gap:12px;
                    ">

                        <div style="
                            width:46px;
                            height:46px;
                            border-radius:14px;
                            display:flex;
                            align-items:center;
                            justify-content:center;
                            background:linear-gradient(135deg,#6c4cff,#8f7aff);
                            color:white;
                            font-size:22px;
                        ">
                            ✦
                        </div>

                        <div>

                            <strong style="
                                display:block;
                                font-size:18px;
                            ">
                                مساعد UniMind
                            </strong>

                            <span style="
                                font-size:13px;
                                color:#20a464;
                            ">
                                ● متصل الآن
                            </span>

                        </div>

                    </div>


                    <button
                        id="closeStudyAssistant"
                        style="
                            width:40px;
                            height:40px;
                            border:0;
                            border-radius:12px;
                            background:#f3f3f7;
                            cursor:pointer;
                            font-size:24px;
                            color:#555;
                        "
                    >
                        ×
                    </button>

                </div>


                <!-- CHAT -->

                <div
                    id="studyChat"
                    style="
                        flex:1;
                        overflow-y:auto;
                        padding:25px;
                        background:#fafaff;
                    "
                >

                    <div style="
                        text-align:center;
                        margin-bottom:25px;
                    ">

                        <div style="
                            font-size:38px;
                            margin-bottom:10px;
                        ">
                            🎓
                        </div>

                        <h3 style="
                            margin:0 0 8px;
                        ">
                            كيف يمكنني مساعدتك؟
                        </h3>

                        <p style="
                            margin:0;
                            color:#777;
                            font-size:14px;
                        ">
                            اسألني عن أي موضوع جامعي وسأحاول شرحه لك بطريقة بسيطة.
                        </p>

                    </div>


                    <div
                        id="quickQuestions"
                        style="
                            display:grid;
                            grid-template-columns:repeat(2,1fr);
                            gap:10px;
                            margin-bottom:25px;
                        "
                    >

                        <button class="quick-question">
                            📚 اشرح لي هذا الموضوع ببساطة
                        </button>

                        <button class="quick-question">
                            🧠 ما أهم النقاط التي يجب أن أحفظها؟
                        </button>

                        <button class="quick-question">
                            📝 اختبرني في هذا الموضوع
                        </button>

                        <button class="quick-question">
                            💡 أعطني مثالًا عمليًا
                        </button>

                    </div>

                </div>


                <!-- INPUT -->

                <div style="
                    padding:18px;
                    border-top:1px solid #eee;
                    background:white;
                ">

                    <div style="
                        display:flex;
                        gap:10px;
                        align-items:center;
                        background:#f5f5fa;
                        border:1px solid #e6e6ee;
                        border-radius:16px;
                        padding:8px 10px 8px 8px;
                    ">

                        <input
                            id="studyInput"
                            type="text"
                            placeholder="اكتب سؤالك هنا..."
                            style="
                                flex:1;
                                border:0;
                                outline:0;
                                background:transparent;
                                padding:12px;
                                font-size:15px;
                                direction:rtl;
                            "
                        >

                        <button
                            id="sendStudyQuestion"
                            style="
                                width:46px;
                                height:46px;
                                border:0;
                                border-radius:13px;
                                background:linear-gradient(135deg,#6c4cff,#8f7aff);
                                color:white;
                                cursor:pointer;
                                font-size:20px;
                            "
                        >
                            ↑
                        </button>

                    </div>

                    <div style="
                        text-align:center;
                        font-size:11px;
                        color:#999;
                        margin-top:8px;
                    ">
                        UniMind AI • مساعد الدراسة الذكي
                    </div>

                </div>

            </div>
        `;


        document.body.appendChild(overlay);


        /* =========================
           CLOSE
        ========================= */

        document
            .getElementById("closeStudyAssistant")
            .addEventListener("click", function () {

                overlay.remove();

            });


        overlay.addEventListener("click", function (event) {

            if (event.target === overlay) {
                overlay.remove();
            }

        });


        /* =========================
           QUICK QUESTIONS
        ========================= */

        const quickQuestions =
            overlay.querySelectorAll(".quick-question");


        quickQuestions.forEach(function (button) {

            button.style.cssText = `
                border:1px solid #e5e5ef;
                background:white;
                border-radius:13px;
                padding:13px;
                cursor:pointer;
                text-align:right;
                font-size:13px;
                color:#444;
            `;


            button.addEventListener("click", function () {

                const input =
                    document.getElementById("studyInput");

                input.value =
                    button.textContent.trim();

                input.focus();

            });

        });


        /* =========================
           SEND QUESTION
        ========================= */

        const input =
            document.getElementById("studyInput");

        const sendButton =
            document.getElementById("sendStudyQuestion");

        const chat =
            document.getElementById("studyChat");


        function sendQuestion() {

            const question =
                input.value.trim();

            if (!question) {
                input.focus();
                return;
            }


            /* USER MESSAGE */

            const userMessage =
                document.createElement("div");

            userMessage.style.cssText = `
                background:#6c4cff;
                color:white;
                padding:13px 16px;
                border-radius:18px 18px 4px 18px;
                max-width:80%;
                margin:12px 0 12px auto;
                line-height:1.7;
                font-size:14px;
            `;

            userMessage.textContent =
                question;

            chat.appendChild(userMessage);


            input.value = "";

            chat.scrollTop =
                chat.scrollHeight;


            /* AI TYPING */

            const typing =
                document.createElement("div");

            typing.style.cssText = `
                background:white;
                border:1px solid #eee;
                color:#777;
                padding:13px 16px;
                border-radius:18px 18px 18px 4px;
                max-width:80%;
                margin:12px auto 12px 0;
                font-size:14px;
            `;

            typing.textContent =
                "✦ UniMind يفكر...";

            chat.appendChild(typing);


            chat.scrollTop =
                chat.scrollHeight;


            /* DEMO AI RESPONSE */

            setTimeout(function () {

                typing.remove();


                const aiMessage =
                    document.createElement("div");

                aiMessage.style.cssText = `
                    background:white;
                    border:1px solid #eee;
                    color:#333;
                    padding:16px;
                    border-radius:18px 18px 18px 4px;
                    max-width:85%;
                    margin:12px auto 12px 0;
                    line-height:1.8;
                    font-size:14px;
                `;


                aiMessage.innerHTML = `
                    <strong style="
                        display:block;
                        margin-bottom:8px;
                    ">
                        ✦ UniMind AI
                    </strong>

                    <div>
                        سؤال ممتاز! 👏
                    </div>

                    <div style="
                        margin-top:8px;
                        color:#666;
                    ">
                        هذه نسخة تجريبية من المساعد.
                        في المرحلة القادمة سنربط UniMind
                        بنموذج ذكاء اصطناعي حقيقي ليحلل
                        سؤالك ويقدم لك إجابة مخصصة.
                    </div>
                `;


                chat.appendChild(aiMessage);


                chat.scrollTop =
                    chat.scrollHeight;

            }, 1000);

        }


        sendButton.addEventListener(
            "click",
            sendQuestion
        );


        input.addEventListener(
            "keydown",
            function (event) {

                if (event.key === "Enter") {
                    sendQuestion();
                }

            }
        );


        input.focus();

    }

});

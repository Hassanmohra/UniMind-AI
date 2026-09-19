document.addEventListener("DOMContentLoaded", function () {

    const featureLinks = document.querySelectorAll(".feature-card a");

    featureLinks.forEach(function (link) {

        link.addEventListener("click", function (event) {

            event.preventDefault();

            const card = link.closest(".feature-card");
            const title = card.querySelector("h3").textContent;

            const overlay = document.createElement("div");

            overlay.style.position = "fixed";
            overlay.style.inset = "0";
            overlay.style.background = "rgba(0,0,0,0.65)";
            overlay.style.display = "flex";
            overlay.style.alignItems = "center";
            overlay.style.justifyContent = "center";
            overlay.style.zIndex = "99999";

            overlay.innerHTML = `
                <div style="
                    width:90%;
                    max-width:520px;
                    background:white;
                    padding:35px;
                    border-radius:24px;
                    text-align:center;
                    direction:rtl;
                    box-shadow:0 25px 80px rgba(0,0,0,.3);
                ">

                    <div style="
                        font-size:45px;
                        margin-bottom:15px;
                    ">
                        ✦
                    </div>

                    <h2 style="
                        margin-bottom:15px;
                        font-size:28px;
                    ">
                        ${title}
                    </h2>

                    <p style="
                        color:#666;
                        line-height:1.8;
                        font-size:16px;
                    ">
                        مرحبًا بك في مساعد الدراسة الذكي من UniMind AI.
                        يمكنك استخدام الذكاء الاصطناعي لفهم المحاضرات
                        وشرح المواضيع الجامعية بطريقة سهلة.
                    </p>

                    <button id="closeUniMindModal" style="
                        margin-top:25px;
                        padding:13px 30px;
                        border:none;
                        border-radius:12px;
                        background:#6c4cff;
                        color:white;
                        font-size:16px;
                        cursor:pointer;
                    ">
                        إغلاق
                    </button>

                </div>
            `;

            document.body.appendChild(overlay);

            document
                .getElementById("closeUniMindModal")
                .addEventListener("click", function () {
                    overlay.remove();
                });

        });

    });

});

document.addEventListener("DOMContentLoaded", function () {

    /* =========================
       THEME
    ========================= */

    const themeToggle = document.getElementById("themeToggle");

    if (themeToggle) {
        const savedTheme = localStorage.getItem("unimind-theme");

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


    /* =========================
       ALL LINKS
    ========================= */

    const links = document.querySelectorAll("a");

    links.forEach(function (link) {

        link.addEventListener("click", function (event) {

            const text = link.textContent.trim();
            const href = link.getAttribute("href");

            /* Ignore normal section links */
            if (
                href &&
                href.startsWith("#") &&
                href !== "#"
            ) {
                const target =
                    document.querySelector(href);

                if (target) {
                    event.preventDefault();

                    target.scrollIntoView({
                        behavior: "smooth"
                    });

                    return;
                }
            }


            /* =========================
               FEATURE BUTTONS
            ========================= */

            if (
                text.includes("اكتشف المزيد") ||
                text.includes("مساعد الدراسة")
            ) {
                event.preventDefault();
                openModal(
                    "✦ مساعد الدراسة الذكي",
                    "اكتب سؤالك وسيساعدك UniMind AI على فهم أي موضوع جامعي بطريقة بسيطة."
                );
                return;
            }


            if (
                text.includes("تلخيص") ||
                text.includes("جرّب الآن")
            ) {
                event.preventDefault();
                openModal(
                    "📄 تلخيص المحاضرات",
                    "ارفع ملف المحاضرة لتحويله إلى ملخص منظم وسهل المراجعة."
                );
                return;
            }


            if (
                text.includes("إنشاء اختبار")
            ) {
                event.preventDefault();
                openModal(
                    "🧠 الاختبارات الذكية",
                    "اختر المحاضرة وسيقوم UniMind بإنشاء أسئلة ذكية لاختبار فهمك."
                );
                return;
            }


            if (
                text.includes("إنشاء بطاقات")
            ) {
                event.preventDefault();
                openModal(
                    "🗂️ البطاقات التعليمية",
                    "حوّل محاضراتك وملاحظاتك إلى بطاقات تعليمية للمراجعة السريعة."
                );
                return;
            }


            if (
                text.includes("خطط دراستك")
            ) {
                event.preventDefault();
                openModal(
                    "📅 مخطط الدراسة",
                    "أنشئ جدولًا دراسيًا منظمًا للمحاضرات والاختبارات والمهام."
                );
                return;
            }


            if (
                text.includes("أنشئ CV")
            ) {
                event.preventDefault();
                openModal(
                    "💼 مساعد السيرة الذاتية",
                    "أنشئ سيرة ذاتية احترافية مناسبة للتدريب والعمل."
                );
                return;
            }


            /* =========================
               LOGIN
            ========================= */

            if (text.includes("تسجيل الدخول")) {
                event.preventDefault();

                openModal(
                    "👤 تسجيل الدخول",
                    "أدخل بريدك الإلكتروني وكلمة المرور للدخول إلى حساب UniMind."
                );

                return;
            }


            /* =========================
               PRICING
            ========================= */

            if (
                text.includes("ابدأ مجانًا") ||
                text.includes("ابدأ الآن") ||
                text.includes("اختر Pro")
            ) {
                event.preventDefault();

                openModal(
                    "🚀 ابدأ مع UniMind AI",
                    "اختر خطتك وابدأ رحلتك الجامعية الذكية."
                );

                return;
            }


            /* =========================
               CTA
            ========================= */

            if (
                text.includes("ابدأ مجانًا")
            ) {
                event.preventDefault();

                openModal(
                    "🎓 مرحبًا بك في UniMind AI",
                    "سنساعدك على إنشاء حسابك والبدء في استخدام أدوات UniMind."
                );

                return;
            }

        });

    });


    /* =========================
       MODAL FUNCTION
    ========================= */

    function openModal(title, description) {

        const oldModal =
            document.querySelector(".unimind-modal");

        if (oldModal) {
            oldModal.remove();
        }


        const overlay =
            document.createElement("div");

        overlay.className = "unimind-modal";


        overlay.innerHTML = `
            <div class="unimind-modal-box">

                <button class="unimind-close">
                    ×
                </button>

                <div class="unimind-modal-icon">
                    ✦
                </div>

                <h2>${title}</h2>

                <p>${description}</p>

                <div class="unimind-modal-actions">

                    <button class="unimind-primary">
                        متابعة
                    </button>

                    <button class="unimind-secondary">
                        إغلاق
                    </button>

                </div>

            </div>
        `;


        document.body.appendChild(overlay);


        const closeButton =
            overlay.querySelector(".unimind-close");

        const secondaryButton =
            overlay.querySelector(".unimind-secondary");


        closeButton.addEventListener(
            "click",
            function () {
                overlay.remove();
            }
        );


        secondaryButton.addEventListener(
            "click",
            function () {
                overlay.remove();
            }
        );


        overlay.addEventListener(
            "click",
            function (event) {

                if (event.target === overlay) {
                    overlay.remove();
                }

            }
        );


        const primaryButton =
            overlay.querySelector(".unimind-primary");

        primaryButton.addEventListener(
            "click",
            function () {

                alert(
                    "سيتم ربط هذه الخدمة بالذكاء الاصطناعي وقاعدة البيانات في المرحلة التالية 🚀"
                );

            }
        );

    }

});

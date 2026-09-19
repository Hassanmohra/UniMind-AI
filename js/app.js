/* =========================================================
   UniMind AI
   Main JavaScript
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       THEME TOGGLE
       ===================================================== */

    const themeToggle = document.getElementById("themeToggle");

    if (themeToggle) {

        const savedTheme = localStorage.getItem("unimind-theme");

        if (savedTheme === "dark") {
            document.body.classList.add("dark-mode");
            themeToggle.textContent = "🌙";
        } else {
            themeToggle.textContent = "☀️";
        }

        themeToggle.addEventListener("click", () => {

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
       LANGUAGE BUTTON
       ===================================================== */

    const languageToggle =
        document.getElementById("languageToggle");

    if (languageToggle) {

        languageToggle.addEventListener("click", () => {

            alert(
                "نسخة اللغة الإنجليزية ستكون متاحة قريبًا.\n\nحالياً UniMind AI يعمل بالواجهة العربية."
            );

        });

    }


    /* =====================================================
       SMOOTH SCROLL
       ===================================================== */

    const internalLinks =
        document.querySelectorAll('a[href^="#"]');

    internalLinks.forEach(link => {

        link.addEventListener("click", event => {

            const targetId =
                link.getAttribute("href");

            if (!targetId || targetId === "#") {

                event.preventDefault();

                alert(
                    "هذه الميزة ستكون متاحة قريبًا في لوحة UniMind AI."
                );

                return;
            }

            const target =
                document.querySelector(targetId);

            if (target) {

                event.preventDefault();

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        });

    });


    /* =====================================================
       FEATURE BUTTONS
       ===================================================== */

    const featureLinks =
        document.querySelectorAll(".feature-card a");

    featureLinks.forEach(link => {

        link.addEventListener("click", event => {

            event.preventDefault();

            const featureCard =
                link.closest(".feature-card");

            const featureTitle =
                featureCard?.querySelector("h3")?.textContent ||
                "هذه الميزة";

            alert(
                `${featureTitle}\n\nسيتم تفعيل هذه الأداة ضمن لوحة الطالب في المرحلة القادمة.`
            );

        });

    });


    /* =====================================================
       PRICING BUTTONS
       ===================================================== */

    const pricingButtons =
        document.querySelectorAll(".pricing-card a");

    pricingButtons.forEach(button => {

        button.addEventListener("click", event => {

            event.preventDefault();

            const card =
                button.closest(".pricing-card");

            const plan =
                card?.querySelector(".plan-name")?.textContent ||
                "الخطة";

            if (plan.includes("مجاني")) {

                alert(
                    "ممتاز! يمكنك البدء بالخطة المجانية.\n\nسيتم إنشاء نظام التسجيل في الخطوة القادمة."
                );

            } else {

                alert(
                    `اخترت خطة ${plan}.\n\nسيتم ربط الاشتراكات والدفع الإلكتروني لاحقًا.`
                );

            }

        });

    });


    /* =====================================================
       LOGIN BUTTON
       ===================================================== */

    const loginButton =
        document.querySelector(".login-btn");

    if (loginButton) {

        loginButton.addEventListener("click", event => {

            event.preventDefault();

            alert(
                "صفحة تسجيل الدخول سيتم بناؤها قريبًا."
            );

        });

    }


    /* =====================================================
       CTA BUTTONS
       ===================================================== */

    const ctaButtons =
        document.querySelectorAll(".cta-section a");

    ctaButtons.forEach(button => {

        button.addEventListener("click", event => {

            event.preventDefault();

            alert(
                "مرحبًا بك في UniMind AI 🎓\n\nسيتم إنشاء حساب الطالب في المرحلة القادمة."
            );

        });

    });


    /* =====================================================
       AI CHAT DEMO
       ===================================================== */

    const chatInput =
        document.querySelector(".chat-input");

    const chatButton =
        document.querySelector(".chat-input button");

    if (chatButton) {

        chatButton.addEventListener("click", () => {

            alert(
                "مساعد UniMind AI جاهز 🚀\n\nسيتم ربط نموذج الذكاء الاصطناعي الحقيقي في المرحلة القادمة."
            );

        });

    }

    if (chatInput) {

        chatInput.addEventListener("click", () => {

            alert(
                "سيتم فتح مساعد UniMind AI هنا."
            );

        });

    }


    /* =====================================================
       START MESSAGE
       ===================================================== */

    console.log(
        "UniMind AI initialized successfully."
    );

});

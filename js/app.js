/* =========================================================
   UniMind AI
   Interactive Frontend
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    console.log("UniMind AI initialized successfully 🚀");


    /* =====================================================
       THEME
       ===================================================== */

    const themeToggle = document.getElementById("themeToggle");

    if (themeToggle) {

        const savedTheme =
            localStorage.getItem("unimind-theme");

        if (savedTheme === "dark") {
            document.body.classList.add("dark-mode");
            themeToggle.textContent = "☀️";
        } else {
            themeToggle.textContent = "🌙";
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
                isDark ? "☀️" : "🌙";

        });

    }


    /* =====================================================
       LANGUAGE
       ===================================================== */

    const languageToggle =
        document.getElementById("languageToggle");

    if (languageToggle) {

        languageToggle.addEventListener("click", () => {

            const isEnglish =
                document.documentElement.lang === "en";

            if (isEnglish) {

                document.documentElement.lang = "ar";
                document.documentElement.dir = "rtl";

                languageToggle.textContent = "EN";

                location.reload();

            } else {

                document.documentElement.lang = "en";
                document.documentElement.dir = "ltr";

                languageToggle.textContent = "AR";

                translatePageToEnglish();

            }

        });

    }


    /* =====================================================
       ENGLISH TRANSLATION
       ===================================================== */

    function translatePageToEnglish() {

        const translations = {

            "المميزات": "Features",
            "كيف يعمل؟": "How It Works",
            "الأسعار": "Pricing",
            "تسجيل الدخول": "Login",
            "ابدأ الآن": "Get Started",

            "الذكاء الاصطناعي للطلاب":
                "AI for Students",

            "ادرس بذكاء.": "Study Smarter.",
            "أنجز أكثر.": "Achieve More.",

            "ابدأ التعلم": "Start Learning",
            "اكتشف UniMind": "Discover UniMind",

            "مصمم للطلاب":
                "Designed for Students",

            "لتجربة جامعية أكثر ذكاءً":
                "For a Smarter University Experience",

            "مساعد UniMind":
                "UniMind Assistant",

            "متصل الآن":
                "Online Now",

            "كل ما تحتاجه":
                "Everything You Need",

            "في مكان واحد":
                "In One Place",

            "أدوات ذكية للطلاب":
                "Smart Tools for Students",

            "مساعد الدراسة الذكي":
                "Smart Study Assistant",

            "تلخيص المحاضرات":
                "Lecture Summarizer",

            "الاختبارات الذكية":
                "AI Quizzes",

            "البطاقات التعليمية":
                "Flashcards",

            "مخطط الدراسة":
                "Study Planner",

            "مساعد السيرة الذاتية":
                "CV Assistant",

            "جرّب الآن":
                "Try Now",

            "إنشاء اختبار":
                "Create Quiz",

            "إنشاء بطاقات":
                "Create Flashcards",

            "خطط دراستك":
                "Plan Your Study",

            "أنشئ CV":
                "Create CV",

            "بسيط وسريع":
                "Simple & Fast",

            "ابدأ خلال":
                "Start in",

            "دقائق":
                "Minutes",

            "أنشئ حسابك":
                "Create Your Account",

            "أضف محتواك":
                "Add Your Content",

            "دع الذكاء الاصطناعي يعمل":
                "Let AI Work",

            "تعلّم وأنجز":
                "Learn & Achieve",

            "خطط بسيطة":
                "Simple Plans",

            "اختر الخطة":
                "Choose Your Plan",

            "المناسبة لك":
                "That Fits You",

            "مجاني":
                "Free",

            "الطالب":
                "Student",

            "الأكثر استخدامًا":
                "Most Popular",

            "ابدأ مجانًا":
                "Start Free",

            "اختر Pro":
                "Choose Pro",

            "مستقبلك يبدأ الآن":
                "Your Future Starts Now",

            "اجعل الذكاء الاصطناعي":
                "Make AI",

            "جزءًا من رحلتك الجامعية.":
                "Part of Your University Journey."

        };


        document
            .querySelectorAll("body *")
            .forEach(element => {

                if (element.children.length === 0) {

                    const text =
                        element.textContent.trim();

                    if (translations[text]) {
                        element.textContent =
                            translations[text];
                    }

                }

            });

    }


    /* =====================================================
       ALL INTERNAL LINKS
       ===================================================== */

    document
        .querySelectorAll('a[href^="#"]')
        .forEach(link => {

            link.addEventListener("click", event => {

                const href =
                    link.getAttribute("href");

                if (!href || href === "#") {

                    event.preventDefault();

                    handleEmptyLink(link);

                    return;
                }

                const target =
                    document.querySelector(href);

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
       EMPTY LINK HANDLER
       ===================================================== */

    function handleEmptyLink(link) {

        const text =
            link.textContent.trim();

        if (
            text.includes("مساعد الدراسة") ||
            text.includes("اكتشف المزيد")
        ) {

            openChat();
            return;

        }

        if (
            text.includes("تلخيص") ||
            text.includes("جرّب الآن")
        ) {

            openSummarizer();
            return;

        }

        if (
            text.includes("اختبار") ||
            text.includes("إنشاء اختبار")
        ) {

            openQuiz();
            return;

        }

        if (
            text.includes("بطاقات") ||
            text.includes("إنشاء بطاقات")
        ) {

            openFlashcards();
            return;

        }

        if (
            text.includes("مخطط") ||
            text.includes("خطط دراستك")
        ) {

            openPlanner();
            return;

        }

        if (
            text.includes("CV") ||
            text.includes("السيرة")
        ) {

            openCV();
            return;

        }

        if (
            text.includes("تسجيل الدخول")
        ) {

            openLogin();
            return;

        }

        if (
            text.includes("ابدأ مجانًا") ||
            text.includes("ابدأ الآن")
        ) {

            scrollToPricing();
            return;

        }

        if (
            text.includes("الخصوصية")
        ) {

            showNotification(
                "صفحة الخصوصية سيتم إضافتها في المرحلة التالية."
            );

            return;

        }

        if (
            text.includes("الشروط")
        ) {

            showNotification(
                "صفحة الشروط سيتم إضافتها في المرحلة التالية."
            );

            return;

        }

        openChat();

    }


    /* =====================================================
       HERO BUTTONS
       ===================================================== */

    const heroButtons =
        document.querySelectorAll(".hero-buttons a");

    heroButtons.forEach(button => {

        button.addEventListener("click", event => {

            const href =
                button.getAttribute("href");

            if (href === "#features") {

                event.preventDefault();

                document
                    .getElementById("features")
                    ?.scrollIntoView({
                        behavior: "smooth"
                    });

            }

            if (href === "#how-it-works") {

                event.preventDefault();

                document
                    .getElementById("how-it-works")
                    ?.scrollIntoView({
                        behavior: "smooth"
                    });

            }

        });

    });


    /* =====================================================
       CHAT
       ===================================================== */

    function openChat() {

        createModal(`

            <div class="unimind-modal">

                <div class="modal-header">

                    <div>
                        <span class="modal-icon">✦</span>

                        <div>
                            <h2>مساعد UniMind AI</h2>
                            <p>
                                اسألني عن أي موضوع جامعي
                            </p>
                        </div>
                    </div>

                    <button class="close-modal">
                        ×
                    </button>

                </div>

                <div class="modal-chat">

                    <div class="ai-bubble">
                        👋 مرحبًا!
                        أنا مساعد UniMind AI.
                        كيف يمكنني مساعدتك؟
                    </div>

                </div>

                <div class="modal-chat-input">

                    <input
                        id="uniChatInput"
                        type="text"
                        placeholder="اكتب سؤالك هنا..."
                    >

                    <button id="uniChatSend">
                        ↑
                    </button>

                </div>

            </div>

        `);

        const input =
            document.getElementById("uniChatInput");

        const send =
            document.getElementById("uniChatSend");

        send.addEventListener("click", sendMessage);

        input.addEventListener("keydown", event => {

            if (event.key === "Enter") {
                sendMessage();
            }

        });


        function sendMessage() {

            const value =
                input.value.trim();

            if (!value) return;

            const chat =
                document.querySelector(".modal-chat");

            chat.innerHTML += `

                <div class="user-bubble">
                    ${escapeHTML(value)}
                </div>

                <div class="ai-bubble">
                    🧠 تم استلام سؤالك بنجاح.
                    سيتم ربط نموذج الذكاء الاصطناعي
                    الحقيقي بالمحادثة في المرحلة القادمة.
                </div>

            `;

            input.value = "";

            chat.scrollTop =
                chat.scrollHeight;

        }

    }


    /* =====================================================
       SUMMARIZER
       ===================================================== */

    function openSummarizer() {

        createModal(`

            <div class="unimind-modal">

                <div class="modal-header">

                    <div>
                        <span class="modal-icon">📄</span>

                        <div>
                            <h2>تلخيص المحاضرات</h2>
                            <p>
                                ارفع محاضرتك للبدء
                            </p>
                        </div>
                    </div>

                    <button class="close-modal">
                        ×
                    </button>

                </div>

                <div class="upload-box">

                    <div class="big-icon">
                        📚
                    </div>

                    <h3>
                        ارفع ملف المحاضرة
                    </h3>

                    <p>
                        PDF أو Word أو TXT
                    </p>

                    <input
                        id="lectureFile"
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        hidden
                    >

                    <button
                        id="chooseLecture"
                        class="modal-primary"
                    >
                        اختيار الملف
                    </button>

                    <div id="fileName"></div>

                </div>

            </div>

        `);

        const input =
            document.getElementById("lectureFile");

        const button =
            document.getElementById("chooseLecture");

        const name =
            document.getElementById("fileName");

        button.addEventListener(
            "click",
            () => input.click()
        );

        input.addEventListener(
            "change",
            () => {

                if (!input.files.length) return;

                name.textContent =
                    `✓ ${input.files[0].name}`;

                button.textContent =
                    "بدء التحليل";

                button.onclick = () => {

                    showNotification(
                        "تم تجهيز الملف للتحليل الذكي 📚"
                    );

                };

            }
        );

    }


    /* =====================================================
       QUIZ
       ===================================================== */

    function openQuiz() {

        createModal(`

            <div class="unimind-modal">

                <div class="modal-header">

                    <div>
                        <span class="modal-icon">🧠</span>

                        <div>
                            <h2>الاختبارات الذكية</h2>
                            <p>
                                اختر مستوى الاختبار
                            </p>
                        </div>
                    </div>

                    <button class="close-modal">
                        ×
                    </button>

                </div>

                <div class="quiz-levels">

                    <button data-level="سهل">
                        🟢 سهل
                    </button>

                    <button data-level="متوسط">
                        🟡 متوسط
                    </button>

                    <button data-level="متقدم">
                        🔴 متقدم
                    </button>

                </div>

            </div>

        `);

        document
            .querySelectorAll(".quiz-levels button")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        showNotification(
                            `تم اختيار اختبار مستوى ${button.dataset.level} 🧠`
                        );

                    }
                );

            });

    }


    /* =====================================================
       FLASHCARDS
       ===================================================== */

    function openFlashcards() {

        createModal(`

            <div class="unimind-modal">

                <div class="modal-header">

                    <div>
                        <span class="modal-icon">🗂️</span>

                        <div>
                            <h2>البطاقات التعليمية</h2>
                            <p>
                                راجع معلوماتك بسرعة
                            </p>
                        </div>
                    </div>

                    <button class="close-modal">
                        ×
                    </button>

                </div>

                <div class="flashcard-demo">

                    <div class="flash-question">
                        ما هو الذكاء الاصطناعي؟
                    </div>

                    <button
                        id="showAnswer"
                        class="modal-primary"
                    >
                        إظهار الإجابة
                    </button>

                    <div
                        id="flashAnswer"
                        class="flash-answer"
                    >
                        الذكاء الاصطناعي هو مجال من علوم
                        الحاسوب يهدف إلى بناء أنظمة قادرة
                        على تنفيذ مهام تتطلب عادةً الذكاء البشري.
                    </div>

                </div>

            </div>

        `);

        document
            .getElementById("showAnswer")
            .addEventListener("click", () => {

                const answer =
                    document.getElementById("flashAnswer");

                answer.classList.add("visible");

            });

    }


    /* =====================================================
       STUDY PLANNER
       ===================================================== */

    function openPlanner() {

        createModal(`

            <div class="unimind-modal">

                <div class="modal-header">

                    <div>
                        <span class="modal-icon">📅</span>

                        <div>
                            <h2>مخطط الدراسة</h2>
                            <p>
                                نظم جدولك الدراسي
                            </p>
                        </div>
                    </div>

                    <button class="close-modal">
                        ×
                    </button>

                </div>

                <div class="planner-form">

                    <input
                        id="studySubject"
                        type="text"
                        placeholder="اسم المادة"
                    >

                    <input
                        id="studyDate"
                        type="date"
                    >

                    <button
                        id="addStudy"
                        class="modal-primary"
                    >
                        إضافة إلى الخطة
                    </button>

                    <div id="studyResult"></div>

                </div>

            </div>

        `);

        document
            .getElementById("addStudy")
            .addEventListener("click", () => {

                const subject =
                    document
                        .getElementById("studySubject")
                        .value
                        .trim();

                const date =
                    document
                        .getElementById("studyDate")
                        .value;

                if (!subject || !date) {

                    showNotification(
                        "يرجى إدخال المادة والتاريخ"
                    );

                    return;

                }

                document
                    .getElementById("studyResult")
                    .innerHTML = `

                        <div class="success-message">

                            ✓ تمت إضافة
                            <strong>
                                ${escapeHTML(subject)}
                            </strong>

                            إلى خطة الدراسة.

                        </div>

                    `;

            });

    }


    /* =====================================================
       CV
       ===================================================== */

    function openCV() {

        createModal(`

            <div class="unimind-modal">

                <div class="modal-header">

                    <div>
                        <span class="modal-icon">💼</span>

                        <div>
                            <h2>مساعد السيرة الذاتية</h2>
                            <p>
                                أنشئ مسودة CV احترافية
                            </p>
                        </div>
                    </div>

                    <button class="close-modal">
                        ×
                    </button>

                </div>

                <div class="cv-form">

                    <input
                        id="cvName"
                        type="text"
                        placeholder="الاسم الكامل"
                    >

                    <input
                        id="cvMajor"
                        type="text"
                        placeholder="التخصص"
                    >

                    <textarea
                        id="cvSkills"
                        placeholder="المهارات والخبرات"
                    ></textarea>

                    <button
                        id="generateCV"
                        class="modal-primary"
                    >
                        إنشاء السيرة الذاتية
                    </button>

                    <div id="cvResult"></div>

                </div>

            </div>

        `);

        document
            .getElementById("generateCV")
            .addEventListener("click", () => {

                const name =
                    document
                        .getElementById("cvName")
                        .value
                        .trim();

                const major =
                    document
                        .getElementById("cvMajor")
                        .value
                        .trim();

                if (!name || !major) {

                    showNotification(
                        "يرجى إدخال الاسم والتخصص"
                    );

                    return;

                }

                document
                    .getElementById("cvResult")
                    .innerHTML = `

                        <div class="success-message">

                            ✓ تم إنشاء مسودة السيرة الذاتية

                            <br><br>

                            <strong>
                                ${escapeHTML(name)}
                            </strong>

                            <br>

                            ${escapeHTML(major)}

                        </div>

                    `;

            });

    }


    /* =====================================================
       LOGIN
       ===================================================== */

    const loginButton =
        document.querySelector(".login-btn");

    if (loginButton) {

        loginButton.addEventListener(
            "click",
            event => {

                event.preventDefault();

                openLogin();

            }
        );

    }


    function openLogin() {

        createModal(`

            <div class="unimind-modal">

                <div class="modal-header">

                    <div>
                        <span class="modal-icon">🎓</span>

                        <div>
                            <h2>تسجيل الدخول</h2>
                            <p>
                                ادخل إلى حسابك
                            </p>
                        </div>
                    </div>

                    <button class="close-modal">
                        ×
                    </button>

                </div>

                <div class="login-form">

                    <input
                        type="email"
                        placeholder="البريد الإلكتروني"
                    >

                    <input
                        type="password"
                        placeholder="كلمة المرور"
                    >

                    <button
                        id="loginSubmit"
                        class="modal-primary"
                    >
                        تسجيل الدخول
                    </button>

                </div>

            </div>

        `);

        document
            .getElementById("loginSubmit")
            .addEventListener("click", () => {

                showNotification(
                    "تم إرسال طلب تسجيل الدخول 🚀"
                );

            });

    }


    /* =====================================================
       PRICING
       ===================================================== */

    document
        .querySelectorAll(".pricing-card a")
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    const card =
                        button.closest(".pricing-card");

                    const plan =
                        card
                            ?.querySelector(".plan-name")
                            ?.textContent
                            .trim();

                    if (plan === "مجاني") {

                        showNotification(
                            "🎓 تم اختيار الخطة المجانية"
                        );

                    } else {

                        showNotification(
                            `⭐ تم اختيار خطة ${plan}`
                        );

                    }

                }
            );

        });


    /* =====================================================
       CTA
       ===================================================== */

    document
        .querySelectorAll(".cta-section a")
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    scrollToPricing();

                }
            );

        });


    /* =====================================================
       CHAT PREVIEW
       ===================================================== */

    const previewChat =
        document.querySelector(".chat-input");

    if (previewChat) {

        previewChat.addEventListener(
            "click",
            event => {

                if (
                    event.target.tagName !== "BUTTON"
                ) {

                    openChat();

                }

            }
        );

    }

    const previewButton =
        document.querySelector(".chat-input button");

    if (previewButton) {

        previewButton.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                openChat();

            }
        );

    }


    /* =====================================================
       FOOTER
       ===================================================== */

    document
        .querySelectorAll(".footer-links a")
        .forEach(link => {

            link.addEventListener(
                "click",
                event => {

                    const href =
                        link.getAttribute("href");

                    if (href === "#") {

                        event.preventDefault();

                        showNotification(
                            "هذه الصفحة سيتم إضافتها قريبًا."
                        );

                    }

                }
            );

        });


    /* =====================================================
       SCROLL TO PRICING
       ===================================================== */

    function scrollToPricing() {

        const pricing =
            document.getElementById("pricing");

        if (pricing) {

            pricing.scrollIntoView({
                behavior: "smooth"
            });

        }

    }


    /* =====================================================
       MODAL
       ===================================================== */

    function createModal(content) {

        closeModal();

        const overlay =
            document.createElement("div");

        overlay.className =
            "unimind-modal-overlay";

        overlay.innerHTML =
            content;

        document.body.appendChild(
            overlay
        );

        document.body.style.overflow =
            "hidden";

        const close =
            overlay.querySelector(".close-modal");

        if (close) {

            close.addEventListener(
                "click",
                closeModal
            );

        }

        overlay.addEventListener(
            "click",
            event => {

                if (
                    event.target === overlay
                ) {

                    closeModal();

                }

            }
        );

    }


    function closeModal() {

        const modal =
            document.querySelector(
                ".unimind-modal-overlay"
            );

        if (modal) {

            modal.remove();

            document.body.style.overflow =
                "";

        }

    }


    /* =====================================================
       NOTIFICATION
       ===================================================== */

    function showNotification(message) {

        const old =
            document.querySelector(
                ".unimind-notification"
            );

        if (old) old.remove();

        const notification =
            document.createElement("div");

        notification.className =
            "unimind-notification";

        notification.textContent =
            message;

        document.body.appendChild(
            notification
        );

        requestAnimationFrame(() => {

            notification.classList.add(
                "show"
            );

        });

        setTimeout(() => {

            notification.classList.remove(
                "show"
            );

            setTimeout(() => {

                notification.remove();

            }, 300);

        }, 3000);

    }


    /* =====================================================
       ESCAPE HTML
       ===================================================== */

    function escapeHTML(value) {

        return value
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }

});

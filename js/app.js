/* =========================================================
   UniMind AI
   Main JavaScript
   Interactive Frontend
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
       LANGUAGE TOGGLE
       ===================================================== */

    const languageToggle =
        document.getElementById("languageToggle");

    if (languageToggle) {

        languageToggle.addEventListener("click", () => {

            const currentLang =
                document.documentElement.lang || "ar";

            if (currentLang === "ar") {

                document.documentElement.lang = "en";
                document.documentElement.dir = "ltr";

                languageToggle.textContent = "العربية";

                translateToEnglish();

            } else {

                document.documentElement.lang = "ar";
                document.documentElement.dir = "rtl";

                languageToggle.textContent = "English";

                location.reload();
            }

        });
    }


    /* =====================================================
       SIMPLE ENGLISH MODE
       ===================================================== */

    function translateToEnglish() {

        const translations = {

            "ادرس بذكاء.": "Study Smarter.",
            "أنجز أكثر.": "Achieve More.",
            "UniMind AI هو مساعدك الجامعي الذكي":
                "UniMind AI is your intelligent university assistant",

            "مساعد UniMind": "UniMind Assistant",
            "تلخيص المحاضرات": "Lecture Summarizer",
            "الاختبارات الذكية": "AI Quizzes",
            "البطاقات التعليمية": "Flashcards",
            "مخطط الدراسة": "Study Planner",
            "مساعد السيرة الذاتية": "CV Assistant",
            "الأسعار": "Pricing",
            "تسجيل الدخول": "Login",
            "ابدأ التعلم": "Start Learning",
            "جرب الآن": "Try Now"

        };

        document.querySelectorAll("*").forEach(element => {

            if (
                element.children.length === 0 &&
                element.textContent.trim()
            ) {

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
                "UniMind AI";

            openFeature(featureTitle);

        });

    });


    /* =====================================================
       FEATURE SYSTEM
       ===================================================== */

    function openFeature(title) {

        const feature = title.trim();

        if (
            feature.includes("مساعد UniMind") ||
            feature.includes("UniMind Assistant")
        ) {

            openChat();

            return;
        }

        if (
            feature.includes("تلخيص") ||
            feature.includes("Summarizer")
        ) {

            openSummarizer();

            return;
        }

        if (
            feature.includes("اختبار") ||
            feature.includes("Quiz")
        ) {

            openQuiz();

            return;
        }

        if (
            feature.includes("بطاقات") ||
            feature.includes("Flashcards")
        ) {

            openFlashcards();

            return;
        }

        if (
            feature.includes("مخطط") ||
            feature.includes("Planner")
        ) {

            openPlanner();

            return;
        }

        if (
            feature.includes("السيرة") ||
            feature.includes("CV")
        ) {

            openCV();

            return;
        }

        showNotification(
            "تم اختيار " + feature
        );
    }


    /* =====================================================
       CHAT
       ===================================================== */

    function openChat() {

        showModal(`
            <div class="unimind-modal">

                <div class="modal-header">

                    <div>
                        <span class="modal-icon">🤖</span>
                        <h2>مساعد UniMind AI</h2>
                        <p>اسألني عن أي موضوع جامعي</p>
                    </div>

                    <button class="close-modal">×</button>

                </div>

                <div class="chat-area">

                    <div class="ai-message">
                        👋 مرحبًا! أنا مساعد UniMind AI.
                        كيف يمكنني مساعدتك اليوم؟
                    </div>

                </div>

                <div class="chat-form">

                    <input
                        type="text"
                        id="modalChatInput"
                        placeholder="اكتب سؤالك هنا..."
                    />

                    <button id="sendChat">
                        إرسال
                    </button>

                </div>

            </div>
        `);

        const input =
            document.getElementById("modalChatInput");

        const send =
            document.getElementById("sendChat");

        send.addEventListener("click", sendMessage);

        input.addEventListener("keydown", event => {

            if (event.key === "Enter") {
                sendMessage();
            }

        });

        function sendMessage() {

            const text =
                input.value.trim();

            if (!text) return;

            const chat =
                document.querySelector(".chat-area");

            chat.innerHTML += `
                <div class="user-message">
                    ${escapeHTML(text)}
                </div>

                <div class="ai-message">
                    🧠 فهمت سؤالك.
                    سيتم ربط نموذج الذكاء الاصطناعي الحقيقي
                    بهذه المحادثة في المرحلة القادمة.
                </div>
            `;

            input.value = "";

            chat.scrollTop = chat.scrollHeight;
        }

    }


    /* =====================================================
       LECTURE SUMMARIZER
       ===================================================== */

    function openSummarizer() {

        showModal(`

            <div class="unimind-modal">

                <div class="modal-header">

                    <div>
                        <span class="modal-icon">📄</span>
                        <h2>تلخيص المحاضرات</h2>
                        <p>ارفع ملف المحاضرة للحصول على ملخص</p>
                    </div>

                    <button class="close-modal">×</button>

                </div>

                <div class="upload-area">

                    <div class="upload-icon">
                        📚
                    </div>

                    <h3>
                        ارفع ملف المحاضرة
                    </h3>

                    <p>
                        PDF, DOCX, TXT
                    </p>

                    <input
                        type="file"
                        id="lectureFile"
                        accept=".pdf,.doc,.docx,.txt"
                        hidden
                    />

                    <button
                        class="primary-action"
                        id="chooseLecture"
                    >
                        اختيار الملف
                    </button>

                    <p id="selectedLecture"></p>

                </div>

            </div>

        `);

        const fileInput =
            document.getElementById("lectureFile");

        const chooseButton =
            document.getElementById("chooseLecture");

        const selected =
            document.getElementById("selectedLecture");

        chooseButton.addEventListener(
            "click",
            () => fileInput.click()
        );

        fileInput.addEventListener(
            "change",
            () => {

                if (fileInput.files.length) {

                    const file =
                        fileInput.files[0];

                    selected.textContent =
                        `✓ تم اختيار: ${file.name}`;

                    chooseButton.textContent =
                        "بدء التلخيص";

                    chooseButton.onclick =
                        () => {

                            showNotification(
                                "تم تجهيز الملف للتلخيص الذكي 📚"
                            );

                        };

                }

            }
        );

    }


    /* =====================================================
       QUIZ
       ===================================================== */

    function openQuiz() {

        showModal(`

            <div class="unimind-modal">

                <div class="modal-header">

                    <div>
                        <span class="modal-icon">🧠</span>
                        <h2>الاختبارات الذكية</h2>
                        <p>اختبر معلوماتك بطريقة ذكية</p>
                    </div>

                    <button class="close-modal">×</button>

                </div>

                <div class="quiz-options">

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
            .querySelectorAll(".quiz-options button")
            .forEach(button => {

                button.addEventListener("click", () => {

                    const level =
                        button.dataset.level;

                    showNotification(
                        `تم اختيار اختبار مستوى ${level} 🧠`
                    );

                });

            });

    }


    /* =====================================================
       FLASHCARDS
       ===================================================== */

    function openFlashcards() {

        showModal(`

            <div class="unimind-modal">

                <div class="modal-header">

                    <div>
                        <span class="modal-icon">🗂️</span>
                        <h2>البطاقات التعليمية</h2>
                        <p>راجع دروسك بطريقة أسرع</p>
                    </div>

                    <button class="close-modal">×</button>

                </div>

                <div class="flashcard">

                    <div class="flashcard-question">
                        ما هو الذكاء الاصطناعي؟
                    </div>

                    <button
                        id="showAnswer"
                        class="primary-action"
                    >
                        إظهار الإجابة
                    </button>

                    <div
                        id="flashAnswer"
                        class="flashcard-answer"
                        style="display:none;"
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

                answer.style.display = "block";

            });

    }


    /* =====================================================
       STUDY PLANNER
       ===================================================== */

    function openPlanner() {

        showModal(`

            <div class="unimind-modal">

                <div class="modal-header">

                    <div>
                        <span class="modal-icon">📅</span>
                        <h2>مخطط الدراسة</h2>
                        <p>نظم جدولك الدراسي</p>
                    </div>

                    <button class="close-modal">×</button>

                </div>

                <div class="planner">

                    <label>
                        المادة
                    </label>

                    <input
                        id="studySubject"
                        type="text"
                        placeholder="مثال: هندسة البرمجيات"
                    />

                    <label>
                        تاريخ الدراسة
                    </label>

                    <input
                        id="studyDate"
                        type="date"
                    />

                    <button
                        id="addStudy"
                        class="primary-action"
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
                        <div class="success-box">
                            ✓ تمت إضافة
                            <strong>${escapeHTML(subject)}</strong>
                            إلى جدول الدراسة.
                        </div>
                    `;

            });

    }


    /* =====================================================
       CV ASSISTANT
       ===================================================== */

    function openCV() {

        showModal(`

            <div class="unimind-modal">

                <div class="modal-header">

                    <div>
                        <span class="modal-icon">📄</span>
                        <h2>مساعد السيرة الذاتية</h2>
                        <p>أنشئ سيرتك الذاتية بطريقة احترافية</p>
                    </div>

                    <button class="close-modal">×</button>

                </div>

                <div class="cv-form">

                    <input
                        id="cvName"
                        type="text"
                        placeholder="الاسم الكامل"
                    />

                    <input
                        id="cvMajor"
                        type="text"
                        placeholder="التخصص"
                    />

                    <textarea
                        id="cvSkills"
                        placeholder="المهارات والخبرات"
                    ></textarea>

                    <button
                        id="generateCV"
                        class="primary-action"
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

                        <div class="success-box">

                            ✓ تم إنشاء مسودة السيرة الذاتية

                            <br><br>

                            <strong>${escapeHTML(name)}</strong>

                            <br>

                            ${escapeHTML(major)}

                            <br><br>

                            يمكنك تطويرها لاحقًا باستخدام
                            مولد السيرة الذاتية الذكي.

                        </div>

                    `;

            });

    }


    /* =====================================================
       PRICING
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

                showNotification(
                    "🎓 تم اختيار الخطة المجانية. يمكنك البدء الآن!"
                );

                scrollToFeatures();

            } else {

                showNotification(
                    `⭐ تم اختيار ${plan}. نظام الاشتراك والدفع سيتم ربطه لاحقًا.`
                );

            }

        });

    });


    /* =====================================================
       LOGIN
       ===================================================== */

    const loginButton =
        document.querySelector(".login-btn");

    if (loginButton) {

        loginButton.addEventListener("click", event => {

            event.preventDefault();

            showLogin();

        });

    }


    function showLogin() {

        showModal(`

            <div class="unimind-modal">

                <div class="modal-header">

                    <div>
                        <span class="modal-icon">🎓</span>
                        <h2>تسجيل الدخول</h2>
                        <p>ادخل إلى حساب UniMind AI</p>
                    </div>

                    <button class="close-modal">×</button>

                </div>

                <div class="login-form">

                    <input
                        type="email"
                        placeholder="البريد الإلكتروني"
                    />

                    <input
                        type="password"
                        placeholder="كلمة المرور"
                    />

                    <button
                        class="primary-action"
                        id="loginSubmit"
                    >
                        تسجيل الدخول
                    </button>

                    <p class="form-note">
                        التسجيل الحقيقي سيتم ربطه بقاعدة البيانات لاحقًا.
                    </p>

                </div>

            </div>

        `);

        document
            .getElementById("loginSubmit")
            .addEventListener("click", () => {

                showNotification(
                    "تم إرسال طلب تسجيل الدخول بنجاح 🚀"
                );

            });

    }


    /* =====================================================
       CTA
       ===================================================== */

    const ctaButtons =
        document.querySelectorAll(".cta-section a");

    ctaButtons.forEach(button => {

        button.addEventListener("click", event => {

            event.preventDefault();

            scrollToFeatures();

        });

    });


    function scrollToFeatures() {

        const target =
            document.querySelector("#features") ||
            document.querySelector(".features-section");

        if (target) {

            target.scrollIntoView({
                behavior: "smooth"
            });

        }

    }


    /* =====================================================
       HERO BUTTONS
       ===================================================== */

    document
        .querySelectorAll(".hero a, .hero button")
        .forEach(button => {

            button.addEventListener("click", event => {

                const href =
                    button.getAttribute("href");

                if (
                    href &&
                    href.startsWith("#")
                ) {

                    const target =
                        document.querySelector(href);

                    if (target) {

                        event.preventDefault();

                        target.scrollIntoView({
                            behavior: "smooth"
                        });

                    }

                }

            });

        });


    /* =====================================================
       DEMO CHAT
       ===================================================== */

    const chatButton =
        document.querySelector(".chat-input button");

    if (chatButton) {

        chatButton.addEventListener("click", event => {

            event.preventDefault();

            openChat();

        });

    }


    /* =====================================================
       MODAL SYSTEM
       ===================================================== */

    function showModal(content) {

        closeModal();

        const overlay =
            document.createElement("div");

        overlay.className =
            "unimind-modal-overlay";

        overlay.innerHTML =
            content;

        document.body.appendChild(overlay);

        document.body.style.overflow =
            "hidden";

        const closeButton =
            overlay.querySelector(".close-modal");

        if (closeButton) {

            closeButton.addEventListener(
                "click",
                closeModal
            );

        }

        overlay.addEventListener("click", event => {

            if (
                event.target === overlay
            ) {

                closeModal();

            }

        });

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

        setTimeout(() => {

            notification.classList.add(
                "show"
            );

        }, 20);

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


    /* =====================================================
       INITIALIZATION
       ===================================================== */

    console.log(
        "UniMind AI initialized successfully 🚀"
    );

});

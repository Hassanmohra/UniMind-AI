(function () {
    "use strict";

    // =========================================================
    // UniMind AI - Subjects Manager
    // =========================================================

    const STORAGE_KEY = "unimind_subjects";

    let currentSubjectId = null;

    // =========================================================
    // Subjects Storage
    // =========================================================

    function getSubjects() {
        try {
            return JSON.parse(
                localStorage.getItem(STORAGE_KEY) || "[]"
            );
        } catch (error) {
            console.warn(
                "UniMind subjects load error:",
                error
            );

            return [];
        }
    }

    function saveSubjects(subjects) {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(subjects)
        );
    }

    // =========================================================
    // Security
    // =========================================================

    function escapeHTML(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // =========================================================
    // Create Subject
    // =========================================================

    function createSubject(data) {

        const subjects =
            getSubjects();

        const subject = {

            id:
                Date.now().toString(),

            name:
                String(
                    data.name || ""
                ).trim(),

            professor:
                String(
                    data.professor || ""
                ).trim(),

            description:
                String(
                    data.description || ""
                ).trim(),

            createdAt:
                new Date().toISOString()
        };

        subjects.push(subject);

        saveSubjects(subjects);

        return subject;
    }

    // =========================================================
    // Delete Subject
    // =========================================================

    function deleteSubject(id) {

        const subjects =
            getSubjects().filter(
                subject =>
                    subject.id !== id
            );

        saveSubjects(subjects);

        renderSubjects();
    }

    // =========================================================
    // Open Subject Details
    // =========================================================

    function openSubjectDetails(id) {

        const subjects =
            getSubjects();

        const subject =
            subjects.find(
                item =>
                    item.id === id
            );

        if (!subject) {
            console.warn(
                "UniMind: subject not found:",
                id
            );

            return;
        }

        const modal =
            document.getElementById(
                "unimind-subject-details-modal"
            );

        if (!modal) {
            console.warn(
                "UniMind: subject details modal not found."
            );

            return;
        }

        const name =
            document.getElementById(
                "unimind-details-name"
            );

        const professor =
            document.getElementById(
                "unimind-details-professor"
            );

        const description =
            document.getElementById(
                "unimind-details-description"
            );

        if (name) {
            name.textContent =
                subject.name;
        }

        if (professor) {
            professor.textContent =
                subject.professor ||
                "لم يتم تحديد الدكتور";
        }

        if (description) {
            description.textContent =
                subject.description ||
                "لا يوجد وصف لهذه المادة.";
        }

        // حفظ المادة الحالية
        currentSubjectId =
            id;

        // فتح النافذة
        modal.classList.add(
            "active"
        );

        // السماح لـ lectures.js
        // بعرض المحاضرات
        setTimeout(
            function () {

                if (
                    window.UniMindLectures &&
                    typeof
                        window.UniMindLectures.render ===
                        "function"
                ) {

                    window.UniMindLectures.render(
                        id
                    );
                }

            },
            50
        );
    }

    // =========================================================
    // Close Subject Details
    // =========================================================

    function closeSubjectDetails() {

        const modal =
            document.getElementById(
                "unimind-subject-details-modal"
            );

        if (modal) {

            modal.classList.remove(
                "active"
            );
        }

        currentSubjectId =
            null;
    }

    // =========================================================
    // Render Subjects
    // =========================================================

    function renderSubjects() {

        const container =
            document.getElementById(
                "unimind-subjects-list"
            );

        if (!container) {
            return;
        }

        const subjects =
            getSubjects();

        // No subjects
        if (subjects.length === 0) {

            container.innerHTML = `
                <div class="unimind-empty-subjects">

                    <div class="empty-icon">
                        📚
                    </div>

                    <h3>
                        لا توجد مواد دراسية بعد
                    </h3>

                    <p>
                        أضف أول مادة دراسية لتبدأ بتنظيم
                        محاضراتك ودراستك.
                    </p>

                </div>
            `;

            return;
        }

        // Subjects cards
        container.innerHTML =
            subjects
                .map(
                    subject => `

                    <div
                        class="unimind-subject-card"
                    >

                        <div
                            class="subject-card-icon"
                        >
                            📘
                        </div>

                        <div
                            class="subject-card-content"
                        >

                            <h3>
                                ${escapeHTML(
                                    subject.name
                                )}
                            </h3>

                            ${
                                subject.professor
                                    ? `
                                        <p>
                                            👨‍🏫
                                            ${escapeHTML(
                                                subject.professor
                                            )}
                                        </p>
                                      `
                                    : ""
                            }

                            ${
                                subject.description
                                    ? `
                                        <p
                                            class="subject-description"
                                        >
                                            ${escapeHTML(
                                                subject.description
                                            )}
                                        </p>
                                      `
                                    : ""
                            }

                            <button
                                type="button"
                                class="subject-open-button"
                                data-subject-id="${escapeHTML(
                                    subject.id
                                )}"
                            >
                                فتح المادة ←
                            </button>

                        </div>

                        <button
                            type="button"
                            class="subject-delete-button"
                            data-subject-id="${escapeHTML(
                                subject.id
                            )}"
                            aria-label="حذف المادة"
                        >
                            🗑️
                        </button>

                    </div>
                `
                )
                .join("");

        // =====================================================
        // Delete Buttons
        // =====================================================

        container
            .querySelectorAll(
                ".subject-delete-button"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        function (event) {

                            event.preventDefault();
                            event.stopPropagation();

                            const id =
                                this.getAttribute(
                                    "data-subject-id"
                                );

                            if (!id) {
                                return;
                            }

                            if (
                                confirm(
                                    "هل تريد حذف هذه المادة؟"
                                )
                            ) {

                                deleteSubject(
                                    id
                                );
                            }
                        }
                    );
                }
            );

        // =====================================================
        // Open Buttons
        // =====================================================

        container
            .querySelectorAll(
                ".subject-open-button"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        function (event) {

                            event.preventDefault();
                            event.stopPropagation();

                            const id =
                                this.getAttribute(
                                    "data-subject-id"
                                );

                            if (!id) {

                                console.error(
                                    "UniMind: subject ID missing."
                                );

                                return;
                            }

                            openSubjectDetails(
                                id
                            );
                        }
                    );
                }
            );
    }

    // =========================================================
    // Subjects Modal
    // =========================================================

    function openSubjectsModal() {

        const modal =
            document.getElementById(
                "unimind-subjects-modal"
            );

        if (!modal) {
            return;
        }

        modal.classList.add(
            "active"
        );

        document.body.classList.add(
            "unimind-modal-open"
        );

        renderSubjects();
    }

    function closeSubjectsModal() {

        const modal =
            document.getElementById(
                "unimind-subjects-modal"
            );

        if (!modal) {
            return;
        }

        modal.classList.remove(
            "active"
        );

        document.body.classList.remove(
            "unimind-modal-open"
        );
    }

    // =========================================================
    // Add Subject Modal
    // =========================================================

    function openAddSubjectModal() {

        const modal =
            document.getElementById(
                "unimind-add-subject-modal"
            );

        if (!modal) {
            return;
        }

        const form =
            document.getElementById(
                "unimind-subject-form"
            );

        if (form) {
            form.reset();
        }

        modal.classList.add(
            "active"
        );
    }

    function closeAddSubjectModal() {

        const modal =
            document.getElementById(
                "unimind-add-subject-modal"
            );

        if (!modal) {
            return;
        }

        modal.classList.remove(
            "active"
        );
    }

    // =========================================================
    // Subject Form
    // =========================================================

    function handleFormSubmit(
        event
    ) {

        event.preventDefault();

        const name =
            document.getElementById(
                "unimind-subject-name"
            );

        const professor =
            document.getElementById(
                "unimind-subject-professor"
            );

        const description =
            document.getElementById(
                "unimind-subject-description"
            );

        if (
            !name ||
            !name.value.trim()
        ) {

            alert(
                "يرجى كتابة اسم المادة."
            );

            return;
        }

        createSubject({

            name:
                name.value,

            professor:
                professor
                    ? professor.value
                    : "",

            description:
                description
                    ? description.value
                    : ""
        });

        closeAddSubjectModal();

        renderSubjects();
    }

    // =========================================================
    // Initialization
    // =========================================================

    function init() {

        // Subjects button

        const subjectsButton =
            document.getElementById(
                "subjectsButton"
            );

        if (subjectsButton) {

            subjectsButton.addEventListener(
                "click",
                openSubjectsModal
            );
        }

        // Close subjects

        const closeButton =
            document.getElementById(
                "unimind-subjects-close"
            );

        if (closeButton) {

            closeButton.addEventListener(
                "click",
                closeSubjectsModal
            );
        }

        // Add subject

        const addButton =
            document.getElementById(
                "unimind-add-subject-button"
            );

        if (addButton) {

            addButton.addEventListener(
                "click",
                openAddSubjectModal
            );
        }

        // Close add subject

        const addCloseButton =
            document.getElementById(
                "unimind-add-subject-close"
            );

        if (addCloseButton) {

            addCloseButton.addEventListener(
                "click",
                closeAddSubjectModal
            );
        }

        // Cancel add subject

        const cancelButton =
            document.getElementById(
                "unimind-add-subject-cancel"
            );

        if (cancelButton) {

            cancelButton.addEventListener(
                "click",
                closeAddSubjectModal
            );
        }

        // Close subject details

        const detailsCloseButton =
            document.getElementById(
                "unimind-subject-details-close"
            );

        if (detailsCloseButton) {

            detailsCloseButton.addEventListener(
                "click",
                closeSubjectDetails
            );
        }

        // Subject form

        const form =
            document.getElementById(
                "unimind-subject-form"
            );

        if (form) {

            form.addEventListener(
                "submit",
                handleFormSubmit
            );
        }

        // Initial render

        renderSubjects();
    }

    // =========================================================
    // Public API
    // =========================================================

    window.UniMindSubjects = {

        get:
            getSubjects,

        add:
            createSubject,

        delete:
            deleteSubject,

        render:
            renderSubjects,

        open:
            openSubjectsModal,

        close:
            closeSubjectsModal,

        openDetails:
            openSubjectDetails,

        closeDetails:
            closeSubjectDetails,

        getCurrentSubjectId:
            function () {
                return currentSubjectId;
            }
    };

    // =========================================================
    // Start
    // =========================================================

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            init
        );

    } else {

        init();
    }

})();

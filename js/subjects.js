(function () {
    "use strict";

    // =========================================================
    // UniMind AI - Subjects Manager
    // =========================================================

    const STORAGE_KEY = "unimind_subjects";

    function getSubjects() {
        try {
            return JSON.parse(
                localStorage.getItem(STORAGE_KEY) || "[]"
            );
        } catch (error) {
            console.warn("UniMind: failed to load subjects", error);
            return [];
        }
    }

    function saveSubjects(subjects) {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(subjects)
        );
    }

    function createSubject(data) {
        const subjects = getSubjects();

        const subject = {
            id: Date.now().toString(),
            name: data.name.trim(),
            professor: data.professor.trim(),
            description: data.description.trim(),
            createdAt: new Date().toISOString()
        };

        subjects.push(subject);
        saveSubjects(subjects);

        return subject;
    }

    function deleteSubject(id) {
        const subjects = getSubjects().filter(
            subject => subject.id !== id
        );

        saveSubjects(subjects);
        renderSubjects();
    }

    function escapeHTML(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function renderSubjects() {
        const container =
            document.getElementById("unimind-subjects-list");

        if (!container) {
            return;
        }

        const subjects = getSubjects();

        if (subjects.length === 0) {
            container.innerHTML = `
                <div class="unimind-empty-subjects">
                    <div class="empty-icon">📚</div>
                    <h3>لا توجد مواد دراسية بعد</h3>
                    <p>
                        أضف أول مادة دراسية لتبدأ بتنظيم
                        محاضراتك ودراستك.
                    </p>
                </div>
            `;

            return;
        }

        container.innerHTML = subjects
            .map(subject => `
                <div class="unimind-subject-card">

                    <div class="subject-card-icon">
                        📘
                    </div>

                    <div class="subject-card-content">

                        <h3>
                            ${escapeHTML(subject.name)}
                        </h3>

                        ${
                            subject.professor
                                ? `
                                    <p>
                                        👨‍🏫
                                        ${escapeHTML(subject.professor)}
                                    </p>
                                  `
                                : ""
                        }

                        ${
                            subject.description
                                ? `
                                    <p class="subject-description">
                                        ${escapeHTML(
                                            subject.description
                                        )}
                                    </p>
                                  `
                                : ""
                        }

                    </div>

                    <button
                        type="button"
                        class="subject-delete-button"
                        data-subject-id="${subject.id}"
                    >
                        🗑️
                    </button>

                </div>
            `)
            .join("");

        container
            .querySelectorAll(".subject-delete-button")
            .forEach(button => {
                button.addEventListener("click", function () {
                    const id =
                        this.getAttribute("data-subject-id");

                    if (
                        confirm(
                            "هل تريد حذف هذه المادة؟"
                        )
                    ) {
                        deleteSubject(id);
                    }
                });
            });
    }

    function openSubjectsModal() {
        const modal =
            document.getElementById(
                "unimind-subjects-modal"
            );

        if (!modal) {
            return;
        }

        modal.classList.add("active");
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

        modal.classList.remove("active");
        document.body.classList.remove(
            "unimind-modal-open"
        );
    }

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

        modal.classList.add("active");
    }

    function closeAddSubjectModal() {
        const modal =
            document.getElementById(
                "unimind-add-subject-modal"
            );

        if (!modal) {
            return;
        }

        modal.classList.remove("active");
    }

    function handleFormSubmit(event) {
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

        if (!name || !name.value.trim()) {
            alert("يرجى كتابة اسم المادة.");
            return;
        }

        createSubject({
            name: name.value,
            professor: professor
                ? professor.value
                : "",
            description: description
                ? description.value
                : ""
        });

        closeAddSubjectModal();
        renderSubjects();
    }

    function init() {
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

        const addCloseButton =
            document.getElementById(
                "unimind-add-subject-close"
            );
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

        if (addCloseButton) {
            addCloseButton.addEventListener(
                "click",
                closeAddSubjectModal
            );
        }

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

        renderSubjects();
    }

    window.UniMindSubjects = {
        get: getSubjects,
        add: createSubject,
        delete: deleteSubject,
        render: renderSubjects,
        open: openSubjectsModal,
        close: closeSubjectsModal
    };

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            init
        );
    } else {
        init();
    }

})();

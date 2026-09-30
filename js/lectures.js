(function () {
    "use strict";

    // =========================================================
    // UniMind AI - Lecture Manager
    // =========================================================

    const DB_NAME = "UniMindAI";
    const DB_VERSION = 1;
    const STORE_NAME = "lectures";

    let currentSubjectId = null;
    let selectedFile = null;

    let currentViewerUrl = null;

    // =========================================================
    // IndexedDB
    // =========================================================

    function openDatabase() {

        return new Promise((resolve, reject) => {

            const request = indexedDB.open(
                DB_NAME,
                DB_VERSION
            );

            request.onupgradeneeded = function (event) {

                const db = event.target.result;

                if (
                    !db.objectStoreNames.contains(
                        STORE_NAME
                    )
                ) {

                    const store =
                        db.createObjectStore(
                            STORE_NAME,
                            {
                                keyPath: "id"
                            }
                        );

                    store.createIndex(
                        "subjectId",
                        "subjectId",
                        {
                            unique: false
                        }
                    );
                }
            };

            request.onsuccess = function () {

                resolve(
                    request.result
                );
            };

            request.onerror = function () {

                reject(
                    request.error
                );
            };
        });
    }

    // =========================================================
    // Save Lecture
    // =========================================================

    async function saveLecture(lecture) {

        const db =
            await openDatabase();

        return new Promise(
            (resolve, reject) => {

                const transaction =
                    db.transaction(
                        STORE_NAME,
                        "readwrite"
                    );

                const store =
                    transaction.objectStore(
                        STORE_NAME
                    );

                const request =
                    store.put(lecture);

                request.onsuccess =
                    function () {

                        resolve();
                    };

                request.onerror =
                    function () {

                        reject(
                            request.error
                        );
                    };
            }
        );
    }

    // =========================================================
    // Get Lectures
    // =========================================================

    async function getLectures(
        subjectId
    ) {

        const db =
            await openDatabase();

        return new Promise(
            (resolve, reject) => {

                const transaction =
                    db.transaction(
                        STORE_NAME,
                        "readonly"
                    );

                const store =
                    transaction.objectStore(
                        STORE_NAME
                    );

                const index =
                    store.index(
                        "subjectId"
                    );

                const request =
                    index.getAll(
                        subjectId
                    );

                request.onsuccess =
                    function () {

                        resolve(
                            request.result || []
                        );
                    };

                request.onerror =
                    function () {

                        reject(
                            request.error
                        );
                    };
            }
        );
    }

    // =========================================================
    // Delete Lecture
    // =========================================================

    async function deleteLecture(
        lectureId
    ) {

        const db =
            await openDatabase();

        return new Promise(
            (resolve, reject) => {

                const transaction =
                    db.transaction(
                        STORE_NAME,
                        "readwrite"
                    );

                const store =
                    transaction.objectStore(
                        STORE_NAME
                    );

                const request =
                    store.delete(
                        lectureId
                    );

                request.onsuccess =
                    function () {

                        resolve();
                    };

                request.onerror =
                    function () {

                        reject(
                            request.error
                        );
                    };
            }
        );
    }

    // =========================================================
    // Helpers
    // =========================================================

    function escapeHTML(value) {

        return String(
            value || ""
        )
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );
    }

    function formatFileSize(bytes) {

        if (!bytes) {
            return "0 KB";
        }

        const kb =
            bytes / 1024;

        if (kb < 1024) {

            return (
                Math.round(kb) +
                " KB"
            );
        }

        return (
            (kb / 1024).toFixed(1) +
            " MB"
        );
    }

    function getFileType(file) {

        const name =
            file.name.toLowerCase();

        if (
            name.endsWith(".pdf")
        ) {
            return "PDF";
        }

        if (
            name.endsWith(".docx")
        ) {
            return "Word DOCX";
        }

        if (
            name.endsWith(".doc")
        ) {
            return "Word DOC";
        }

        return "ملف";
    }

    // =========================================================
    // Add Lecture Modal
    // =========================================================

    function openAddLectureModal(
        subjectId
    ) {

        currentSubjectId =
            subjectId;

        selectedFile = null;

        const modal =
            document.getElementById(
                "unimind-add-lecture-modal"
            );

        if (!modal) {
            return;
        }

        const form =
            document.getElementById(
                "unimind-lecture-form"
            );

        if (form) {
            form.reset();
        }

        const fileInfo =
            document.getElementById(
                "unimind-lecture-file-info"
            );

        if (fileInfo) {

            fileInfo.style.display =
                "none";
        }

        modal.classList.add(
            "active"
        );
    }

    // =========================================================
    // Close Add Lecture Modal
    // =========================================================

    function closeAddLectureModal() {

        const modal =
            document.getElementById(
                "unimind-add-lecture-modal"
            );

        if (modal) {

            modal.classList.remove(
                "active"
            );
        }

        selectedFile = null;
    }

    // =========================================================
    // File Selection
    // =========================================================

    function handleFileSelection(
        event
    ) {

        const file =
            event.target.files[0];

        if (!file) {
            return;
        }

        const maxSize =
            20 * 1024 * 1024;

        if (
            file.size > maxSize
        ) {

            alert(
                "حجم الملف كبير جدًا.\n\nالحد الأقصى المسموح به هو 20 MB."
            );

            event.target.value = "";

            return;
        }

        const fileName =
            file.name.toLowerCase();

        const allowed =
            fileName.endsWith(".pdf") ||
            fileName.endsWith(".doc") ||
            fileName.endsWith(".docx");

        if (!allowed) {

            alert(
                "نوع الملف غير مدعوم.\n\nيرجى اختيار PDF أو Word."
            );

            event.target.value = "";

            return;
        }

        selectedFile =
            file;

        const info =
            document.getElementById(
                "unimind-lecture-file-info"
            );

        const name =
            document.getElementById(
                "unimind-lecture-file-name"
            );

        const size =
            document.getElementById(
                "unimind-lecture-file-size"
            );

        if (name) {

            name.textContent =
                "📎 " +
                file.name;
        }

        if (size) {

            size.textContent =
                formatFileSize(
                    file.size
                );
        }

        if (info) {

            info.style.display =
                "flex";
        }
    }

    // =========================================================
    // Save Lecture Form
    // =========================================================

    async function handleLectureSubmit(
        event
    ) {

        event.preventDefault();

        if (!currentSubjectId) {

            alert(
                "لم يتم تحديد المادة."
            );

            return;
        }

        const nameInput =
            document.getElementById(
                "unimind-lecture-name"
            );

        if (
            !nameInput ||
            !nameInput.value.trim()
        ) {

            alert(
                "يرجى كتابة اسم المحاضرة."
            );

            return;
        }

        if (!selectedFile) {

            alert(
                "يرجى اختيار ملف المحاضرة."
            );

            return;
        }

        const saveButton =
            document.querySelector(
                "#unimind-lecture-form button[type='submit']"
            );

        if (saveButton) {

            saveButton.disabled =
                true;

            saveButton.textContent =
                "⏳ جاري الحفظ...";
        }

        try {

            const lecture = {

                id:
                    "lecture_" +
                    Date.now() +
                    "_" +
                    Math.random()
                        .toString(36)
                        .slice(2, 8),

                subjectId:
                    currentSubjectId,

                name:
                    nameInput.value.trim(),

                fileName:
                    selectedFile.name,

                fileType:
                    getFileType(
                        selectedFile
                    ),

                fileSize:
                    selectedFile.size,

                file:
                    selectedFile,

                createdAt:
                    new Date().toISOString()
            };

            await saveLecture(
                lecture
            );

            const savedSubjectId =
                currentSubjectId;

            closeAddLectureModal();

            await renderLectureList(
                savedSubjectId
            );

            alert(
                "تم حفظ المحاضرة بنجاح ✅"
            );

        } catch (error) {

            console.error(
                "UniMind lecture save error:",
                error
            );

            alert(
                "حدث خطأ أثناء حفظ المحاضرة."
            );

        } finally {

            if (saveButton) {

                saveButton.disabled =
                    false;

                saveButton.textContent =
                    "💾 حفظ المحاضرة";
            }
        }
    }

    // =========================================================
    // Create Lecture Viewer
    // =========================================================

    function createLectureViewer() {

        let viewer =
            document.getElementById(
                "unimind-lecture-viewer"
            );

        if (viewer) {
            return viewer;
        }

        viewer =
            document.createElement(
                "div"
            );

        viewer.id =
            "unimind-lecture-viewer";

        viewer.innerHTML = `

            <div
                class="unimind-lecture-viewer-overlay"
            ></div>

            <div
                class="unimind-lecture-viewer-container"
            >

                <div
                    class="unimind-lecture-viewer-header"
                >

                    <div>

                        <span
                            id="unimind-viewer-icon"
                        >
                            📄
                        </span>

                        <div>

                            <h2
                                id="unimind-viewer-title"
                            >
                                عرض المحاضرة
                            </h2>

                            <p
                                id="unimind-viewer-file-name"
                            ></p>

                        </div>

                    </div>

                    <button
                        type="button"
                        id="unimind-lecture-viewer-close"
                        class="unimind-modal-close"
                    >
                        ×
                    </button>

                </div>

                <div
                    id="unimind-lecture-viewer-content"
                    class="unimind-lecture-viewer-content"
                >

                    <div
                        class="unimind-viewer-loading"
                    >
                        ⏳ جاري فتح المحاضرة...
                    </div>

                </div>

            </div>
        `;

        document.body.appendChild(
            viewer
        );

        // Close button

        const closeButton =
            viewer.querySelector(
                "#unimind-lecture-viewer-close"
            );

        if (closeButton) {

            closeButton.addEventListener(
                "click",
                closeLectureViewer
            );
        }

        // Overlay

        const overlay =
            viewer.querySelector(
                ".unimind-lecture-viewer-overlay"
            );

        if (overlay) {

            overlay.addEventListener(
                "click",
                closeLectureViewer
            );
        }

        return viewer;
    }

    // =========================================================
    // Close Lecture Viewer
    // =========================================================

    function closeLectureViewer() {

        const viewer =
            document.getElementById(
                "unimind-lecture-viewer"
            );

        if (viewer) {

            viewer.classList.remove(
                "active"
            );
        }

        if (currentViewerUrl) {

            try {

                URL.revokeObjectURL(
                    currentViewerUrl
                );

            } catch (error) {

                console.warn(
                    "UniMind viewer URL cleanup error:",
                    error
                );
            }

            currentViewerUrl =
                null;
        }

        document.body.classList.remove(
            "unimind-modal-open"
        );
    }

    // =========================================================
    // Read DOCX
    // =========================================================

    async function readDocxFile(
        file
    ) {

        if (
            typeof window.mammoth ===
            "undefined"
        ) {

            throw new Error(
                "Mammoth library is not available."
            );
        }

        const arrayBuffer =
            await file.arrayBuffer();

        const result =
            await window.mammoth.convertToHtml(
                {
                    arrayBuffer:
                        arrayBuffer
                }
            );

        return (
            result.value ||
            "<p>لم يتم العثور على محتوى داخل الملف.</p>"
        );
    }

    // =========================================================
    // Open Lecture
    // =========================================================

    async function openLecture(
        lectureId
    ) {

        try {

            const db =
                await openDatabase();

            const lecture =
                await new Promise(
                    (resolve, reject) => {

                        const transaction =
                            db.transaction(
                                STORE_NAME,
                                "readonly"
                            );

                        const store =
                            transaction.objectStore(
                                STORE_NAME
                            );

                        const request =
                            store.get(
                                lectureId
                            );

                        request.onsuccess =
                            function () {

                                resolve(
                                    request.result
                                );
                            };

                        request.onerror =
                            function () {

                                reject(
                                    request.error
                                );
                            };
                    }
                );

            if (!lecture) {

                alert(
                    "لم يتم العثور على المحاضرة."
                );

                return;
            }

            if (!lecture.file) {

                alert(
                    "ملف المحاضرة غير متوفر."
                );

                return;
            }

            const viewer =
                createLectureViewer();

            const title =
                document.getElementById(
                    "unimind-viewer-title"
                );

            const fileName =
                document.getElementById(
                    "unimind-viewer-file-name"
                );

            const content =
                document.getElementById(
                    "unimind-lecture-viewer-content"
                );

            if (title) {

                title.textContent =
                    lecture.name;
            }

            if (fileName) {

                fileName.textContent =
                    lecture.fileName;
            }

            if (content) {

                content.innerHTML = `
                    <div
                        class="unimind-viewer-loading"
                    >
                        ⏳ جاري فتح المحاضرة...
                    </div>
                `;
            }

            viewer.classList.add(
                "active"
            );

            document.body.classList.add(
                "unimind-modal-open"
            );

            // Clean previous URL

            if (currentViewerUrl) {

                try {

                    URL.revokeObjectURL(
                        currentViewerUrl
                    );

                } catch (error) {}

                currentViewerUrl =
                    null;
            }

            const file =
                lecture.file;

            const lowerName =
                lecture.fileName.toLowerCase();

            // =================================================
            // PDF
            // =================================================

            if (
                lowerName.endsWith(
                    ".pdf"
                )
            ) {

                currentViewerUrl =
                    URL.createObjectURL(
                        file
                    );

                content.innerHTML = `

                    <iframe
                        src="${currentViewerUrl}"
                        class="unimind-pdf-viewer"
                        title="${escapeHTML(
                            lecture.name
                        )}"
                    ></iframe>

                `;

                return;
            }

            // =================================================
            // DOCX
            // =================================================

            if (
                lowerName.endsWith(
                    ".docx"
                )
            ) {

                try {

                    const html =
                        await readDocxFile(
                            file
                        );

                    content.innerHTML = `

                        <div
                            class="unimind-docx-viewer"
                        >

                            <div
                                class="unimind-docx-toolbar"
                            >
                                📄 محتوى المحاضرة
                            </div>

                            <article
                                class="unimind-docx-content"
                            >
                                ${html}
                            </article>

                        </div>

                    `;

                } catch (error) {

                    console.error(
                        "UniMind DOCX viewer error:",
                        error
                    );

                    content.innerHTML = `

                        <div
                            class="unimind-viewer-error"
                        >

                            <div>
                                ⚠️
                            </div>

                            <h3>
                                تعذر قراءة ملف Word
                            </h3>

                            <p>
                                تأكد من تحميل مكتبة Mammoth
                                ثم حاول مرة أخرى.
                            </p>

                        </div>

                    `;
                }

                return;
            }

            // =================================================
            // DOC
            // =================================================

            if (
                lowerName.endsWith(
                    ".doc"
                )
            ) {

                currentViewerUrl =
                    URL.createObjectURL(
                        file
                    );

                content.innerHTML = `

                    <div
                        class="unimind-viewer-error"
                    >

                        <div>
                            📄
                        </div>

                        <h3>
                            ملف Word قديم
                        </h3>

                        <p>
                            صيغة DOC القديمة لا يمكن
                            عرض محتواها مباشرة داخل المتصفح.
                        </p>

                        <a
                            href="${currentViewerUrl}"
                            download="${escapeHTML(
                                lecture.fileName
                            )}"
                            class="unimind-primary-button"
                        >
                            ⬇️ فتح / تنزيل الملف
                        </a>

                    </div>

                `;

                return;
            }

            // =================================================
            // Unknown
            // =================================================

            content.innerHTML = `

                <div
                    class="unimind-viewer-error"
                >

                    <div>
                        ⚠️
                    </div>

                    <h3>
                        نوع الملف غير مدعوم
                    </h3>

                </div>

            `;

        } catch (error) {

            console.error(
                "UniMind open lecture error:",
                error
            );

            alert(
                "حدث خطأ أثناء فتح المحاضرة."
            );
        }
    }

    // =========================================================
    // Render Lecture List
    // =========================================================

    async function renderLectureList(
        subjectId
    ) {

        const container =
            document.getElementById(
                "unimind-lectures-list"
            );

        if (!container) {
            return;
        }

        try {

            const lectures =
                await getLectures(
                    subjectId
                );

            if (
                !lectures ||
                lectures.length === 0
            ) {

                container.innerHTML = `

                    <div
                        class="subject-empty-lectures"
                    >

                        <div>
                            📄
                        </div>

                        <h4>
                            لا توجد محاضرات بعد
                        </h4>

                        <p>
                            أضف أول محاضرة لهذه المادة للبدء.
                        </p>

                    </div>

                `;

                return;
            }

            container.innerHTML =
                lectures.map(
                    lecture => `

                    <div
                        class="unimind-lecture-card"
                    >

                        <div
                            class="lecture-card-icon"
                        >
                            📄
                        </div>

                        <div
                            class="lecture-card-content"
                        >

                            <h4>
                                ${escapeHTML(
                                    lecture.name
                                )}
                            </h4>

                            <p>
                                📎
                                ${escapeHTML(
                                    lecture.fileName
                                )}
                            </p>

                            <small>
                                ${escapeHTML(
                                    lecture.fileType
                                )}
                                •
                                ${formatFileSize(
                                    lecture.fileSize
                                )}
                            </small>

                        </div>

                        <div
                            class="lecture-card-actions"
                        >

                            <button
                                type="button"
                                class="lecture-open-button"
                                data-lecture-id="${escapeHTML(
                                    lecture.id
                                )}"
                            >
                                👁️ فتح
                            </button>

                            <button
                                type="button"
                                class="lecture-delete-button"
                                data-lecture-id="${escapeHTML(
                                    lecture.id
                                )}"
                            >
                                🗑️
                            </button>

                        </div>

                    </div>

                `
                ).join("");

            // =================================================
            // Open Buttons
            // =================================================

            container
                .querySelectorAll(
                    ".lecture-open-button"
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
                                        "data-lecture-id"
                                    );

                                if (!id) {
                                    return;
                                }

                                openLecture(
                                    id
                                );
                            }
                        );
                    }
                );

            // =================================================
            // Delete Buttons
            // =================================================

            container
                .querySelectorAll(
                    ".lecture-delete-button"
                )
                .forEach(
                    button => {

                        button.addEventListener(
                            "click",
                            async function (event) {

                                event.preventDefault();

                                event.stopPropagation();

                                const id =
                                    this.getAttribute(
                                        "data-lecture-id"
                                    );

                                if (
                                    !confirm(
                                        "هل تريد حذف هذه المحاضرة؟"
                                    )
                                ) {

                                    return;
                                }

                                try {

                                    await deleteLecture(
                                        id
                                    );

                                    await renderLectureList(
                                        subjectId
                                    );

                                } catch (error) {

                                    console.error(
                                        error
                                    );

                                    alert(
                                        "تعذر حذف المحاضرة."
                                    );
                                }
                            }
                        );
                    }
                );

        } catch (error) {

            console.error(
                "UniMind lecture render error:",
                error
            );

            container.innerHTML = `

                <div
                    class="subject-empty-lectures"
                >

                    <div>
                        ⚠️
                    </div>

                    <h4>
                        تعذر تحميل المحاضرات
                    </h4>

                    <p>
                        حاول تحديث الصفحة.
                    </p>

                </div>

            `;
        }
    }

    // =========================================================
    // Initialization
    // =========================================================

    function init() {

        // File input

        const fileInput =
            document.getElementById(
                "unimind-lecture-file-input"
            );

        if (fileInput) {

            fileInput.addEventListener(
                "change",
                handleFileSelection
            );
        }

        // Form

        const form =
            document.getElementById(
                "unimind-lecture-form"
            );

        if (form) {

            form.addEventListener(
                "submit",
                handleLectureSubmit
            );
        }

        // Close add lecture

        const closeButton =
            document.getElementById(
                "unimind-add-lecture-close"
            );

        if (closeButton) {

            closeButton.addEventListener(
                "click",
                closeAddLectureModal
            );
        }

        // Cancel add lecture

        const cancelButton =
            document.getElementById(
                "unimind-add-lecture-cancel"
            );

        if (cancelButton) {

            cancelButton.addEventListener(
                "click",
                closeAddLectureModal
            );
        }

        // =====================================================
        // Global Click Handling
        // =====================================================

        document.addEventListener(
            "click",
            function (event) {

                // Subject opened

                const subjectButton =
                    event.target.closest(
                        ".subject-open-button"
                    );

                if (subjectButton) {

                    const id =
                        subjectButton.getAttribute(
                            "data-subject-id"
                        );

                    currentSubjectId =
                        id;

                    setTimeout(
                        function () {

                            renderLectureList(
                                id
                            );

                        },
                        50
                    );

                    return;
                }

                // Add lecture

                const addButton =
                    event.target.closest(
                        "#unimind-add-lecture-button"
                    );

                if (
                    addButton &&
                    currentSubjectId
                ) {

                    openAddLectureModal(
                        currentSubjectId
                    );

                    return;
                }

                // Open lecture

                const openButton =
                    event.target.closest(
                        ".lecture-open-button"
                    );

                if (openButton) {

                    const id =
                        openButton.getAttribute(
                            "data-lecture-id"
                        );

                    if (id) {

                        openLecture(
                            id
                        );
                    }
                }
            }
        );
    }

    // =========================================================
    // Public API
    // =========================================================

    window.UniMindLectures = {

        open:
            openAddLectureModal,

        close:
            closeAddLectureModal,

        get:
            getLectures,

        render:
            renderLectureList,

        delete:
            deleteLecture,

        openLecture:
            openLecture,

        closeViewer:
            closeLectureViewer
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

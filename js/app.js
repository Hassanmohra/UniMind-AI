// ============================================================
// UniMind AI - Main Application
// Real AI Chat powered by Supabase Edge Functions + OpenAI
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  // ==========================================================
  // CONFIGURATION
  // ==========================================================

  const API_URL =
    "https://yzsfublvnwknjnayfosm.supabase.co/functions/v1/unimind-chat";

  // ==========================================================
  // DOM ELEMENTS
  // ==========================================================

  const featureCards = document.querySelectorAll(".feature-card");

  // ==========================================================
  // FEATURE CARD HANDLERS
  // ==========================================================

  featureCards.forEach((card) => {
    card.addEventListener("click", () => {
      const title =
        card.querySelector("h3")?.textContent?.trim() || "";

      const description =
        card.querySelector("p")?.textContent?.trim() || "";

      // Study Assistant → open real AI chat
      if (
        title.toLowerCase().includes("study") ||
        title.toLowerCase().includes("assistant") ||
        title.includes("المساعد")
      ) {
        openChat();
        return;
      }

      // Other features
      showFeatureMessage(title, description);
    });
  });

  // ==========================================================
  // SHOW FEATURE MESSAGE
  // ==========================================================

  function showFeatureMessage(title, description) {
    const existing = document.querySelector(".unimind-feature-toast");

    if (existing) {
      existing.remove();
    }

    const toast = document.createElement("div");

    toast.className = "unimind-feature-toast";

    toast.innerHTML = `
      <div class="unimind-toast-icon">✨</div>

      <div class="unimind-toast-content">
        <strong>${escapeHTML(title)}</strong>
        <span>
          ${escapeHTML(
            description ||
              "هذه الميزة ستكون متاحة قريبًا في UniMind AI."
          )}
        </span>
      </div>

      <button class="unimind-toast-close" aria-label="Close">
        ×
      </button>
    `;

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add("show");
    });

    const closeButton =
      toast.querySelector(".unimind-toast-close");

    closeButton?.addEventListener("click", () => {
      toast.classList.remove("show");

      setTimeout(() => {
        toast.remove();
      }, 300);
    });

    setTimeout(() => {
      if (document.body.contains(toast)) {
        toast.classList.remove("show");

        setTimeout(() => {
          toast.remove();
        }, 300);
      }
    }, 4500);
  }

  // ==========================================================
  // OPEN CHAT
  // ==========================================================

  function openChat() {
    let modal = document.getElementById("unimind-chat-modal");

    if (!modal) {
      modal = createChatModal();
      document.body.appendChild(modal);
    }

    modal.classList.add("active");
    document.body.classList.add("unimind-chat-open");

    const textarea =
      modal.querySelector("#unimind-chat-input");

    setTimeout(() => {
      textarea?.focus();
    }, 250);
  }

  // ==========================================================
  // CREATE CHAT MODAL
  // ==========================================================

  function createChatModal() {
    const modal = document.createElement("div");

    modal.id = "unimind-chat-modal";
    modal.className = "unimind-chat-modal";

    modal.innerHTML = `
      <div class="unimind-chat-overlay"></div>

      <div class="unimind-chat-window">

        <!-- HEADER -->
        <div class="unimind-chat-header">

          <div class="unimind-chat-brand">

            <div class="unimind-ai-avatar">
              <span>✦</span>
            </div>

            <div>
              <div class="unimind-ai-name">
                UniMind AI
              </div>

              <div class="unimind-ai-status">
                <span class="status-dot"></span>
                AI Assistant Online
              </div>
            </div>

          </div>

          <div class="unimind-chat-actions">

            <button
              class="chat-action-btn"
              id="unimind-new-chat"
              title="New chat"
              aria-label="New chat"
            >
              ＋
            </button>

            <button
              class="chat-action-btn"
              id="unimind-clear-chat"
              title="Clear chat"
              aria-label="Clear chat"
            >
              ⌫
            </button>

            <button
              class="chat-action-btn close"
              id="unimind-close-chat"
              title="Close"
              aria-label="Close"
            >
              ×
            </button>

          </div>

        </div>

        <!-- MESSAGES -->
        <div
          class="unimind-chat-messages"
          id="unimind-chat-messages"
        >

          <div
            class="unimind-welcome"
            id="unimind-welcome"
          >

            <div class="welcome-icon">
              ✦
            </div>

            <h2>
              How can I help you today?
            </h2>

            <p>
              Ask me about lectures, programming,
              university subjects, exams, research,
              or anything you're studying.
            </p>

            <div class="suggestion-grid">

              <button
                class="suggestion-btn"
                data-message="Explain this lecture to me in a simple way."
              >
                <span>📚</span>
                Explain a lecture
              </button>

              <button
                class="suggestion-btn"
                data-message="Create a study plan for my upcoming exams."
              >
                <span>📅</span>
                Create study plan
              </button>

              <button
                class="suggestion-btn"
                data-message="Give me a short quiz to test my knowledge."
              >
                <span>🧠</span>
                Test my knowledge
              </button>

              <button
                class="suggestion-btn"
                data-message="Explain a difficult programming concept with examples."
              >
                <span>💻</span>
                Explain programming
              </button>

            </div>

          </div>

        </div>

        <!-- INPUT -->
        <div class="unimind-chat-input-area">

          <div class="unimind-input-wrapper">

            <textarea
              id="unimind-chat-input"
              placeholder="Ask UniMind AI anything..."
              rows="1"
              maxlength="5000"
            ></textarea>

            <button
              id="unimind-send-btn"
              class="unimind-send-btn"
              aria-label="Send message"
              title="Send message"
            >
              ➤
            </button>

          </div>

          <div class="unimind-input-footer">
            <span>
              UniMind AI can make mistakes. Verify important information.
            </span>

            <span>
              Enter ↵ to send
            </span>
          </div>

        </div>

      </div>
    `;

    initializeChat(modal);

    return modal;
  }

  // ==========================================================
  // INITIALIZE CHAT
  // ==========================================================

  function initializeChat(modal) {
    const overlay =
      modal.querySelector(".unimind-chat-overlay");

    const closeButton =
      modal.querySelector("#unimind-close-chat");

    const newChatButton =
      modal.querySelector("#unimind-new-chat");

    const clearChatButton =
      modal.querySelector("#unimind-clear-chat");

    const sendButton =
      modal.querySelector("#unimind-send-btn");

    const textarea =
      modal.querySelector("#unimind-chat-input");

    const messages =
      modal.querySelector("#unimind-chat-messages");

    // Close modal
    overlay?.addEventListener("click", closeChat);

    closeButton?.addEventListener("click", closeChat);

    // New chat
    newChatButton?.addEventListener("click", () => {
      resetChat(messages);
      textarea?.focus();
    });

    // Clear chat
    clearChatButton?.addEventListener("click", () => {
      resetChat(messages);
      textarea?.focus();
    });

    // Send
    sendButton?.addEventListener("click", () => {
      sendMessage(modal);
    });

    // Enter to send
    textarea?.addEventListener("keydown", (event) => {
      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {
        event.preventDefault();
        sendMessage(modal);
      }
    });

    // Auto resize textarea
    textarea?.addEventListener("input", () => {
      textarea.style.height = "auto";

      textarea.style.height =
        Math.min(textarea.scrollHeight, 150) + "px";
    });

    // Suggestions
    modal
      .querySelectorAll(".suggestion-btn")
      .forEach((button) => {
        button.addEventListener("click", () => {
          const message =
            button.dataset.message || "";

          if (!message) return;

          textarea.value = message;

          textarea.dispatchEvent(
            new Event("input")
          );

          sendMessage(modal);
        });
      });
  }

  // ==========================================================
  // CLOSE CHAT
  // ==========================================================

  function closeChat() {
    const modal =
      document.getElementById("unimind-chat-modal");

    if (!modal) return;

    modal.classList.remove("active");

    document.body.classList.remove(
      "unimind-chat-open"
    );
  }

  // ==========================================================
  // RESET CHAT
  // ==========================================================

  function resetChat(messagesContainer) {
    if (!messagesContainer) return;

    messagesContainer.innerHTML = `
      <div
        class="unimind-welcome"
        id="unimind-welcome"
      >

        <div class="welcome-icon">
          ✦
        </div>

        <h2>
          How can I help you today?
        </h2>

        <p>
          Ask me about lectures, programming,
          university subjects, exams, research,
          or anything you're studying.
        </p>

        <div class="suggestion-grid">

          <button
            class="suggestion-btn"
            data-message="Explain this lecture to me in a simple way."
          >
            <span>📚</span>
            Explain a lecture
          </button>

          <button
            class="suggestion-btn"
            data-message="Create a study plan for my upcoming exams."
          >
            <span>📅</span>
            Create study plan
          </button>

          <button
            class="suggestion-btn"
            data-message="Give me a short quiz to test my knowledge."
          >
            <span>🧠</span>
            Test my knowledge
          </button>

          <button
            class="suggestion-btn"
            data-message="Explain a difficult programming concept with examples."
          >
            <span>💻</span>
            Explain programming
          </button>

        </div>

      </div>
    `;

    const modal =
      document.getElementById("unimind-chat-modal");

    if (modal) {
      modal
        .querySelectorAll(".suggestion-btn")
        .forEach((button) => {
          button.addEventListener("click", () => {
            const textarea =
              modal.querySelector(
                "#unimind-chat-input"
              );

            const message =
              button.dataset.message || "";

            if (!textarea || !message) return;

            textarea.value = message;

            textarea.dispatchEvent(
              new Event("input")
            );

            sendMessage(modal);
          });
        });
    }
  }

  // ==========================================================
  // SEND MESSAGE
  // ==========================================================

  async function sendMessage(modal) {
    const textarea =
      modal.querySelector("#unimind-chat-input");

    const sendButton =
      modal.querySelector("#unimind-send-btn");

    const messages =
      modal.querySelector("#unimind-chat-messages");

    if (!textarea || !messages) return;

    const message =
      textarea.value.trim();

    if (!message) return;

    // Disable input while processing
    textarea.disabled = true;

    if (sendButton) {
      sendButton.disabled = true;
      sendButton.innerHTML = "…";
    }

    // Remove welcome screen
    const welcome =
      messages.querySelector(
        "#unimind-welcome"
      );

    if (welcome) {
      welcome.remove();
    }

    // Add user message
    addUserMessage(
      messages,
      message
    );

    // Clear input
    textarea.value = "";
    textarea.style.height = "auto";

    // Show thinking indicator
    const thinking =
      addThinkingMessage(messages);

    scrollMessagesToBottom(messages);

    try {
      const reply =
        await callUniMindAI(message);

      // Remove thinking indicator
      thinking?.remove();

      // Add assistant response
      addAssistantMessage(
        messages,
        reply
      );

    } catch (error) {
      console.error(
        "UniMind AI Error:",
        error
      );

      thinking?.remove();

      addErrorMessage(
        messages,
        getReadableError(error)
      );

    } finally {
      textarea.disabled = false;

      if (sendButton) {
        sendButton.disabled = false;
        sendButton.innerHTML = "➤";
      }

      textarea.focus();

      scrollMessagesToBottom(messages);
    }
  }

  // ==========================================================
  // CALL SUPABASE EDGE FUNCTION
  // ==========================================================

  async function callUniMindAI(message) {
    const response =
      await fetch(API_URL, {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          message: message
        })
      });

    let data = null;

    try {
      data = await response.json();
    } catch {
      throw new Error(
        "تعذر قراءة استجابة الخادم."
      );
    }

    if (!response.ok) {
      throw new Error(
        data?.error ||
          `Server error: ${response.status}`
      );
    }

    if (
      !data ||
      typeof data.reply !== "string"
    ) {
      throw new Error(
        "لم تصل إجابة صحيحة من UniMind AI."
      );
    }

    return data.reply;
  }

  // ==========================================================
  // USER MESSAGE
  // ==========================================================

  function addUserMessage(
    container,
    message
  ) {
    const messageElement =
      document.createElement("div");

    messageElement.className =
      "unimind-message user-message";

    messageElement.innerHTML = `
      <div class="message-content">
        ${formatText(message)}
      </div>
    `;

    container.appendChild(
      messageElement
    );
  }

  // ==========================================================
  // THINKING MESSAGE
  // ==========================================================

  function addThinkingMessage(
    container
  ) {
    const messageElement =
      document.createElement("div");

    messageElement.className =
      "unimind-message assistant-message thinking-message";

    messageElement.innerHTML = `
      <div class="message-avatar">
        ✦
      </div>

      <div class="message-content thinking-content">
        <span class="thinking-label">
          UniMind AI is thinking
        </span>

        <div class="thinking-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;

    container.appendChild(
      messageElement
    );

    return messageElement;
  }

  // ==========================================================
  // ASSISTANT MESSAGE
  // ==========================================================

  function addAssistantMessage(
    container,
    message
  ) {
    const messageElement =
      document.createElement("div");

    messageElement.className =
      "unimind-message assistant-message";

    const messageId =
      "msg-" +
      Date.now() +
      "-" +
      Math.random()
        .toString(36)
        .substring(2, 8);

    messageElement.dataset.messageId =
      messageId;

    messageElement.innerHTML = `
      <div class="message-avatar">
        ✦
      </div>

      <div class="assistant-message-body">

        <div class="message-content">
          ${formatAIResponse(message)}
        </div>

        <div class="message-tools">

          <button
            class="message-tool copy-btn"
            title="Copy answer"
          >
            Copy
          </button>

          <button
            class="message-tool like-btn"
            title="Helpful"
          >
            👍
          </button>

          <button
            class="message-tool dislike-btn"
            title="Not helpful"
          >
            👎
          </button>

        </div>

      </div>
    `;

    container.appendChild(
      messageElement
    );

    // Copy
    const copyButton =
      messageElement.querySelector(
        ".copy-btn"
      );

    copyButton?.addEventListener(
      "click",
      async () => {
        try {
          await navigator.clipboard.writeText(
            message
          );

          copyButton.textContent =
            "Copied ✓";

          setTimeout(() => {
            copyButton.textContent =
              "Copy";
          }, 1800);

        } catch {
          copyButton.textContent =
            "Copy failed";
        }
      }
    );

    // Like
    const likeButton =
      messageElement.querySelector(
        ".like-btn"
      );

    likeButton?.addEventListener(
      "click",
      () => {
        likeButton.classList.toggle(
          "selected"
        );
      }
    );

    // Dislike
    const dislikeButton =
      messageElement.querySelector(
        ".dislike-btn"
      );

    dislikeButton?.addEventListener(
      "click",
      () => {
        dislikeButton.classList.toggle(
          "selected"
        );
      }
    );
  }

  // ==========================================================
  // ERROR MESSAGE
  // ==========================================================

  function addErrorMessage(
    container,
    message
  ) {
    const messageElement =
      document.createElement("div");

    messageElement.className =
      "unimind-message assistant-message error-message";

    messageElement.innerHTML = `
      <div class="message-avatar">
        !
      </div>

      <div class="message-content">
        <strong>حدث خطأ</strong>
        <br>
        ${escapeHTML(message)}
      </div>
    `;

    container.appendChild(
      messageElement
    );
  }

  // ==========================================================
  // READABLE ERROR
  // ==========================================================

  function getReadableError(error) {
    const message =
      error?.message || "";

    if (
      message.includes(
        "Failed to fetch"
      )
    ) {
      return "تعذر الاتصال بخدمة UniMind AI. تأكد من نشر Edge Function وأن الاتصال بالإنترنت يعمل.";
    }

    if (
      message.includes(
        "OPENAI_API_KEY"
      )
    ) {
      return "مفتاح OpenAI غير مضبوط بشكل صحيح في Supabase.";
    }

    if (
      message.includes(
        "401"
      )
    ) {
      return "تعذر المصادقة مع خدمة الذكاء الاصطناعي.";
    }

    if (
      message.includes(
        "429"
      )
    ) {
      return "تم الوصول إلى حد الاستخدام الحالي. حاول مرة أخرى لاحقًا.";
    }

    return message ||
      "حدث خطأ غير متوقع. حاول مرة أخرى.";
  }

  // ==========================================================
  // FORMAT AI RESPONSE
  // ==========================================================

  function formatAIResponse(text) {
    if (!text) return "";

    let safe =
      escapeHTML(text);

    // Bold
    safe = safe.replace(
      /\*\*(.*?)\*\*/g,
      "<strong>$1</strong>"
    );

    // Inline code
    safe = safe.replace(
      /`([^`]+)`/g,
      "<code>$1</code>"
    );

    // Headings
    safe = safe.replace(
      /^### (.*)$/gm,
      "<h4>$1</h4>"
    );

    safe = safe.replace(
      /^## (.*)$/gm,
      "<h3>$1</h3>"
    );

    // Unordered lists
    safe = safe.replace(
      /^\s*[-•]\s+(.*)$/gm,
      "<li>$1</li>"
    );

    safe = safe.replace(
      /(<li>.*<\/li>)/gs,
      "<ul>$1</ul>"
    );

    // Paragraphs / line breaks
    safe = safe.replace(
      /\n\n+/g,
      "</p><p>"
    );

    safe = safe.replace(
      /\n/g,
      "<br>"
    );

    return `<p>${safe}</p>`;
  }

  // ==========================================================
  // FORMAT USER TEXT
  // ==========================================================

  function formatText(text) {
    return escapeHTML(
      text
    ).replace(
      /\n/g,
      "<br>"
    );
  }

  // ==========================================================
  // ESCAPE HTML
  // ==========================================================

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // ==========================================================
  // SCROLL CHAT
  // ==========================================================

  function scrollMessagesToBottom(
    container
  ) {
    requestAnimationFrame(() => {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth"
      });
    });
  }

  // ==========================================================
  // ESC KEY
  // ==========================================================

  document.addEventListener(
    "keydown",
    (event) => {
      if (
        event.key === "Escape"
      ) {
        closeChat();
      }
    }
  );

  // ==========================================================
  // GLOBAL CHAT BUTTON SUPPORT
  // ==========================================================

  document
    .querySelectorAll(
      "[data-open-chat], .open-chat, #start-learning, #try-demo"
    )
    .forEach((button) => {
      button.addEventListener(
        "click",
        (event) => {
          event.preventDefault();
          openChat();
        }
      );
    });

});

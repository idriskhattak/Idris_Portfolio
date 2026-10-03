const menuButton = document.querySelector(".menu-btn");
const navigationLinks = document.querySelector(".nav-links");

function closeNavigation() {
  if (!menuButton || !navigationLinks) return;

  navigationLinks.classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open navigation");
}

if (menuButton && navigationLinks) {
  menuButton.addEventListener("click", () => {
    const isOpen = navigationLinks.classList.toggle("open");

    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  });

  navigationLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNavigation);
  });
}

const yearElement = document.getElementById("year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

/* Marginalia — the portfolio assistant */

const chatToggle = document.getElementById("chat-toggle");
const chatWindow = document.getElementById("chat-window");
const chatClose = document.getElementById("chat-close");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatMessages = document.getElementById("chat-messages");
const chatSend = document.querySelector(".chat-send");
const suggestionButtons = document.querySelectorAll(".suggestion-btn");
const openChatButtons = document.querySelectorAll("[data-open-chat]");

const CHAT_API_URL = "https://idris-portfolio-ai.vercel.app/chat";
let lastFocusedElement = null;
let inertTimer = null;

function createSessionId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `session-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getSessionId() {
  try {
    const storedSession = localStorage.getItem("idris_chat_session");

    if (storedSession) return storedSession;

    const newSession = createSessionId();
    localStorage.setItem("idris_chat_session", newSession);
    return newSession;
  } catch {
    return createSessionId();
  }
}

const sessionId = getSessionId();

function openChat(trigger) {
  if (!chatWindow || !chatToggle || !chatInput) return;

  window.clearTimeout(inertTimer);
  lastFocusedElement = trigger || document.activeElement;
  chatWindow.removeAttribute("inert");
  chatWindow.classList.add("active");
  chatToggle.setAttribute("aria-expanded", "true");
  chatToggle.setAttribute("aria-label", "Ask Marginalia — close the portfolio assistant");

  window.setTimeout(() => chatInput.focus(), 180);
}

function closeChat({ restoreFocus = true } = {}) {
  if (!chatWindow || !chatToggle) return;

  chatWindow.classList.remove("active");
  chatToggle.setAttribute("aria-expanded", "false");
  chatToggle.setAttribute("aria-label", "Ask Marginalia — open the portfolio assistant");

  inertTimer = window.setTimeout(() => chatWindow.setAttribute("inert", ""), 200);

  if (restoreFocus && lastFocusedElement instanceof HTMLElement) {
    lastFocusedElement.focus();
  }
}

if (chatToggle) {
  chatToggle.addEventListener("click", () => {
    if (chatWindow?.classList.contains("active")) {
      closeChat();
    } else {
      openChat(chatToggle);
    }
  });
}

if (chatClose) {
  chatClose.addEventListener("click", () => closeChat());
}

openChatButtons.forEach((button) => {
  button.addEventListener("click", () => openChat(button));
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;

  if (chatWindow?.classList.contains("active")) {
    closeChat();
    return;
  }

  if (navigationLinks?.classList.contains("open")) {
    closeNavigation();
    menuButton?.focus();
  }
});

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatBotMessage(text) {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\r?\n/g, "<br>");
}

function addMessage(text, sender) {
  if (!chatMessages) return null;

  const message = document.createElement("div");
  message.classList.add("message", sender === "user" ? "user-message" : "bot-message");

  if (sender === "user") {
    message.textContent = text;
  } else {
    message.innerHTML = formatBotMessage(text);
  }

  chatMessages.appendChild(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  return message;
}

function setChatBusy(isBusy) {
  if (chatInput) chatInput.disabled = isBusy;
  if (chatSend) chatSend.disabled = isBusy;
  if (chatMessages) chatMessages.setAttribute("aria-busy", String(isBusy));

  suggestionButtons.forEach((button) => {
    button.disabled = isBusy;
  });
}

/* One request to the guide. Rejects on transport failure, on an error status,
   and on a 2xx body that carries no answer — the API returns {"detail": "..."}
   when generation fails, which must not be shown as if it were a reply. */
async function requestAnswer(question, timeoutMs) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(CHAT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        question,
        session_id: sessionId
      }),
      signal: controller.signal
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.detail || `The guide returned ${response.status}`);
    }

    if (!data || typeof data.answer !== "string" || !data.answer.trim()) {
      throw new Error(data?.detail || "The guide returned no answer");
    }

    return data.answer;
  } finally {
    window.clearTimeout(timeout);
  }
}

async function sendQuestion(question) {
  const cleanQuestion = question.trim();

  if (!cleanQuestion || !chatInput) return;

  addMessage(cleanQuestion, "user");
  chatInput.value = "";
  setChatBusy(true);

  const loadingMessage = addMessage("Thinking…", "bot");
  loadingMessage?.classList.add("chat-loading");

  /* The backend sleeps when idle, and the first request after that regularly
     fails or runs long while the model loads. Tell the visitor what is
     happening, then retry once before reporting a problem. */
  const wakingNotice = window.setTimeout(() => {
    if (loadingMessage?.isConnected) loadingMessage.textContent = "Waking the model up…";
  }, 4000);

  try {
    let answer;

    try {
      answer = await requestAnswer(cleanQuestion, 30000);
    } catch (firstError) {
      console.warn("Marginalia: first attempt failed, retrying.", firstError);
      answer = await requestAnswer(cleanQuestion, 30000);
    }

    window.clearTimeout(wakingNotice);
    loadingMessage?.remove();
    addMessage(answer, "bot");
  } catch (error) {
    window.clearTimeout(wakingNotice);
    console.error("Marginalia error:", error);
    loadingMessage?.remove();

    const errorMessage = error.name === "AbortError"
      ? "That took longer than expected. Please try again."
      : "Marginalia is temporarily unavailable. You can still reach Idris through the contact section.";

    addMessage(errorMessage, "bot");
  } finally {
    setChatBusy(false);
    chatInput.focus();
  }
}

if (chatForm && chatInput) {
  chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    sendQuestion(chatInput.value);
  });
}

suggestionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    sendQuestion(button.textContent || "");
  });
});

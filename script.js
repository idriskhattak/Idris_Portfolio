const menuBtn = document.querySelector('.menu-btn');
const navLinks = document.querySelector('.nav-links');

const navigationEntry = performance.getEntriesByType('navigation')[0];
const navigationType = navigationEntry ? navigationEntry.type : 'navigate';

// Only force the top on a fresh visit.
// Refresh and back/forward navigation keep their normal scroll behavior.
if (navigationType === 'navigate' && !window.location.hash) {

  // Temporarily stop the browser restoring an old scroll position
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  // Force top immediately
  window.scrollTo(0, 0);

  // Force top again after the page has rendered
  window.addEventListener('load', () => {
    window.scrollTo(0, 0);

    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });

    setTimeout(() => {
      window.scrollTo(0, 0);

      // Return normal browser scroll restoration
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'auto';
      }
    }, 100);
  });

} else {

  // Refresh / back / forward should behave normally
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'auto';
  }
}


// Mobile navigation menu
if (menuBtn && navLinks) {

  menuBtn.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');

    menuBtn.setAttribute(
      'aria-expanded',
      open ? 'true' : 'false'
    );
  });


  // Close mobile menu after clicking a navigation link
  document.querySelectorAll('.nav-links a').forEach(link => {

    link.addEventListener('click', () => {
      navLinks.classList.remove('open');

      menuBtn.setAttribute(
        'aria-expanded',
        'false'
      );
    });

  });
}


// Automatically update footer year
const yearElement = document.getElementById('year');

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}
/* =========================
   AI CHATBOT
========================= */

const chatToggle = document.getElementById("chat-toggle");
const chatWindow = document.getElementById("chat-window");
const chatClose = document.getElementById("chat-close");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatMessages = document.getElementById("chat-messages");
const suggestionButtons = document.querySelectorAll(".suggestion-btn");

const CHAT_API_URL = "https://idris-portfolio-ai.vercel.app/chat";

// Create or reuse a browser session ID
let sessionId = localStorage.getItem("idris_chat_session");

if (!sessionId) {
  sessionId = crypto.randomUUID();
  localStorage.setItem("idris_chat_session", sessionId);
}

// Open chatbot
chatToggle.addEventListener("click", () => {
  chatWindow.classList.toggle("active");

  if (chatWindow.classList.contains("active")) {
    setTimeout(() => {
      chatInput.focus();
    }, 200);
  }
});

// Close chatbot
chatClose.addEventListener("click", () => {
  chatWindow.classList.remove("active");
});

// Add message to chat
function formatBotMessage(text) {
  return text
    // Escape HTML first
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

    // Bold Markdown: **text**
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")

    // Numbered list support
    .replace(/(^|\n)(\d+)\.\s+/g, "$1<br><strong>$2.</strong> ")

    // Bullet list support
    .replace(/(^|\n)[-*]\s+/g, "$1<br>• ")

    // New lines
    .replace(/\n/g, "<br>");
}

function addMessage(text, sender) {
  const message = document.createElement("div");

  message.classList.add("message");

  if (sender === "user") {
    message.classList.add("user-message");
    message.textContent = text;
  } else {
    message.classList.add("bot-message");
    message.innerHTML = formatBotMessage(text);
  }

  chatMessages.appendChild(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  return message;
}

// Loading message
function addLoadingMessage() {
  const loading = addMessage("Thinking...", "bot");
  loading.classList.add("chat-loading");
  return loading;
}

// Send question to backend
async function sendQuestion(question) {
  if (!question.trim()) return;

  addMessage(question, "user");

  chatInput.value = "";
  chatInput.disabled = true;

  const loadingMessage = addLoadingMessage();

  try {
    const response = await fetch(CHAT_API_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        question: question,
        session_id: sessionId
      })
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();

    loadingMessage.remove();

    addMessage(
      data.answer || "I couldn't generate a response.",
      "bot"
    );
  } catch (error) {
    console.error("Chatbot error:", error);

    loadingMessage.remove();

    addMessage(
      "Sorry, the AI assistant is temporarily unavailable. Please try again.",
      "bot"
    );
  } finally {
    chatInput.disabled = false;
    chatInput.focus();
  }
}

// Submit typed question
chatForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const question = chatInput.value.trim();

  if (question) {
    sendQuestion(question);
  }
});

// Suggested questions
suggestionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const question = button.textContent.trim();

    sendQuestion(question);
  });
});
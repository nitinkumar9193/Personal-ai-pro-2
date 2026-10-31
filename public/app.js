const $ = (s) => document.querySelector(s);

const messagesEl = $("#messages");
const promptEl = $("#prompt");
const welcome = $("#welcome");

let chats = [];
let current = [];
let busy = false;

function renderHistory() {
  const box = $("#history");
  box.innerHTML = "";

  if (!chats.length) {
    box.innerHTML = '<p class="muted">Your chats appear here.</p>';
    return;
  }

  chats.forEach((chat) => {
    const b = document.createElement("button");
    b.textContent = "▸ " + chat.title;
    b.onclick = () => {
      current = chat.messages.slice();
      renderMessages();
    };
    box.appendChild(b);
  });
}

function speak(text) {
  if (!("speechSynthesis" in window)) {
    alert("Voice playback is not supported in this browser.");
    return;
  }

  window.speechSynthesis.cancel();

  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = "hi-IN";
  speech.rate = 1;
  window.speechSynthesis.speak(speech);
}

function addMessage(role, content) {
  const row = document.createElement("div");
  row.className = "message " + role;

  const badge = document.createElement("div");
  badge.className = "badge";
  badge.textContent = role === "user" ? "Y" : "✦";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = content;

  row.append(badge, bubble);

  if (role === "assistant") {
    const speakBtn = document.createElement("button");
    speakBtn.textContent = "🔊";
    speakBtn.title = "Listen to answer";
    speakBtn.onclick = () => speak(content);
    row.appendChild(speakBtn);
  }

  messagesEl.appendChild(row);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function renderMessages() {
  messagesEl.innerHTML = "";
  welcome.classList.toggle("hidden", current.length > 0);

  current.forEach((m) => {
    addMessage(m.role === "assistant" ? "assistant" : "user", m.content);
  });
}

function saveChat() {
  if (!current.length) return;

  const title =
    current.find((m) => m.role === "user")?.content.slice(0, 34) ||
    "New chat";

  chats = [{
    title,
    messages: current.slice()
  }];

  renderHistory();
}

async function send(text) {
  text = (text || "").trim();
  if (!text || busy) return;

  current.push({ role: "user", content: text });
  renderMessages();
  saveChat();

  promptEl.value = "";
  busy = true;
  $("#sendBtn").disabled = true;

  addMessage("assistant", "सोच रहा हूँ…");
  const placeholder = messagesEl.lastElementChild;

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ messages: current })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Request failed");
    }

    const reply = data.reply || "No response received.";

    current.push({ role: "assistant", content: reply });
    placeholder.querySelector(".bubble").textContent = reply;

    const speakBtn = document.createElement("button");
    speakBtn.textContent = "🔊";
    speakBtn.title = "Listen to answer";
    speakBtn.onclick = () => speak(reply);
    placeholder.appendChild(speakBtn);

    saveChat();

  } catch (error) {
    placeholder.querySelector(".bubble").textContent =
      "Error: " + error.message;
  } finally {
    busy = false;
    $("#sendBtn").disabled = false;
    promptEl.focus();
  }
}

$("#chatForm").addEventListener("submit", (e) => {
  e.preventDefault();
  send(promptEl.value);
});

promptEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    send(promptEl.value);
  }
});

$("#newChat").onclick = () => {
  current = [];
  renderMessages();
  $("#sidebar").classList.remove("open");
  promptEl.focus();
};

$("#menuBtn").onclick = () => {
  $("#sidebar").classList.toggle("open");
};

document.querySelectorAll(".nav").forEach((button) => {
  button.onclick = () => {
    const view = button.dataset.view;

    $("#chatView").classList.toggle("hidden", view !== "chat");
    $("#photoView").classList.toggle("hidden", view !== "photo");
    $("#videoView").classList.toggle("hidden", view !== "video");

    document.querySelectorAll(".nav").forEach((item) => {
      item.classList.toggle("active", item === button);
    });

    $("#sidebar").classList.remove("open");
  };
});

$("#backToChat").onclick = () => {
  document.querySelector('[data-view="chat"]').click();
};

// Voice Assistant: speech to text
$("#voiceBtn").onclick = () => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Voice input is not supported. Try Chrome browser.");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "hi-IN";
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (event) => {
    const spokenText = event.results[0][0].transcript;
    promptEl.value = spokenText;
    send(spokenText);
  };

  recognition.onerror = () => {
    alert("Voice नहीं सुनाई दी। दोबारा कोशिश करें।");
  };

  recognition.start();
};

// Photo generation placeholder
$("#generatePhoto").onclick = () => {
  const prompt = $("#photoPrompt").value.trim();

  if (!prompt) {
    alert("पहले फोटो का विवरण लिखिए।");
    return;
  }

  $("#photoStatus").textContent =
    "आपका विवरण तैयार है। असली फोटो बनाने के लिए image service connect करनी होगी।";
};

renderMessages();
renderHistory();

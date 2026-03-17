(function () {
  const config = window.AgentComerce || {};

  const STORE_ID = config.store_id;
  const WEBHOOK_URL = config.webhook_url;
  const COLOR = config.accent_color || "#7C3AED";
  const NAME = config.agent_name || "Assistant";
  const WELCOME = config.welcome_message;

  const SESSION_ID = "sess_" + Date.now();

  // ===== STYLE =====
  const style = document.createElement("style");
  style.innerHTML = `
  #chat-btn {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: ${COLOR};
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: none;
    color: white;
    font-size: 22px;
    cursor: pointer;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  }

  #chat-box {
    position: fixed;
    bottom: 90px;
    right: 20px;
    width: 360px;
    height: 520px;
    background: white;
    border-radius: 20px;
    display: none;
    flex-direction: column;
    box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    overflow: hidden;
  }

  #chat-header {
    background: ${COLOR};
    color: white;
    padding: 18px;
    font-weight: bold;
  }

  #messages {
    flex: 1;
    padding: 18px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .msg {
    max-width: 80%;
    display: flex;
    flex-direction: column;
  }

  .user { align-self: flex-end; }
  .bot { align-self: flex-start; }

  .bubble {
    padding: 18px 22px;
    border-radius: 18px;
    font-size: 14.5px;
    line-height: 1.6;
  }

  .user .bubble {
    background: ${COLOR};
    color: white;
    border-bottom-right-radius: 6px;
  }

  .bot .bubble {
    background: #f1f5f9;
    border-bottom-left-radius: 6px;
  }

  #input-area {
    display: flex;
    padding: 12px;
    gap: 10px;
    border-top: 1px solid #eee;
  }

  #input {
    flex: 1;
    padding: 12px 14px;
    border-radius: 12px;
    border: 1px solid #ddd;
    outline: none;
  }

  #send {
    background: ${COLOR};
    color: white;
    border: none;
    border-radius: 10px;
    padding: 10px 14px;
    cursor: pointer;
  }
  `;
  document.head.appendChild(style);

  // ===== HTML =====
  const btn = document.createElement("button");
  btn.id = "chat-btn";
  btn.innerText = "💬";

  const box = document.createElement("div");
  box.id = "chat-box";
  box.innerHTML = `
    <div id="chat-header">${NAME}</div>
    <div id="messages"></div>
    <div id="input-area">
      <input id="input" placeholder="Type a message..." />
      <button id="send">Send</button>
    </div>
  `;

  document.body.appendChild(btn);
  document.body.appendChild(box);

  const messages = document.getElementById("messages");

  function addMessage(text, type) {
    const div = document.createElement("div");
    div.className = "msg " + type;

    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.innerText = text;

    div.appendChild(bubble);
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function sendMessage(text) {
    if (!text) return;

    addMessage(text, "user");

    fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        store_id: STORE_ID,
        session_id: SESSION_ID,
        message: text
      })
    })
    .then(res => res.json())
    .then(data => {
      addMessage(data.reply || "Error", "bot");
    });
  }

  btn.onclick = () => {
    box.style.display = box.style.display === "flex" ? "none" : "flex";
    box.style.display = "flex";

    if (messages.children.length === 0) {
      addMessage(WELCOME, "bot");
    }
  };

  document.getElementById("send").onclick = () => {
    const input = document.getElementById("input");
    sendMessage(input.value);
    input.value = "";
  };

})();
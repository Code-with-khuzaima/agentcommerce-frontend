(function () {
  "use strict";

  var config = window.AgentComerce || {};
  var storeId = config.store_id || "store_001";
  var webhook = config.webhook_url || "";
  var apiBase = config.api_base || "https://agentcommerce-backend-production-e1d9.up.railway.app/api";
  var agentName = config.agent_name || "AI Assistant";
  var accent = config.accent_color || "#7c3aed";
  var welcome = config.welcome_message || "Welcome! How can I help you today?";
  var storageKey = "ac_widget_lead_" + storeId;
  var sessionKey = "ac_widget_session_" + storeId;
  var msgKey = "ac_widget_msgs_" + storeId;

  var sessionId = "";
  try {
    sessionId = localStorage.getItem(sessionKey) || ("guest_" + Math.random().toString(36).slice(2, 10));
    localStorage.setItem(sessionKey, sessionId);
  } catch (e) {
    sessionId = "guest_" + Math.random().toString(36).slice(2, 10);
  }

  var lead = null;
  var messages = [];
  try {
    lead = JSON.parse(localStorage.getItem(storageKey) || "null");
    messages = JSON.parse(localStorage.getItem(msgKey) || "[]");
  } catch (e) {}

  var style = document.createElement("style");
  style.textContent = `
    #acw-root, #acw-root * { box-sizing: border-box; font-family: Inter, system-ui, sans-serif; }
    #acw-root { --acw-accent: ${accent}; }
    #acw-button { position: fixed; right: 20px; bottom: 20px; width: 60px; height: 60px; border-radius: 18px; border: none; background: var(--acw-accent); color: white; cursor: pointer; box-shadow: 0 12px 32px rgba(0,0,0,0.24); z-index: 99998; }
    #acw-panel { position: fixed; right: 20px; bottom: 92px; width: min(380px, calc(100vw - 24px)); height: min(640px, calc(100vh - 120px)); background: #0f172a; color: white; border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; overflow: hidden; box-shadow: 0 20px 48px rgba(0,0,0,0.35); display: none; flex-direction: column; z-index: 99999; }
    #acw-panel.open { display: flex; }
    #acw-head { padding: 18px 18px 14px; background: linear-gradient(135deg, #111827 0%, #1f2937 100%); border-bottom: 1px solid rgba(255,255,255,0.08); }
    #acw-title { font-size: 16px; font-weight: 700; }
    #acw-sub { font-size: 12px; color: rgba(255,255,255,0.68); margin-top: 4px; }
    #acw-body { flex: 1; min-height: 0; display: flex; flex-direction: column; background: #f8fafc; color: #111827; }
    #acw-lead, #acw-chat { flex: 1; padding: 16px; overflow: auto; }
    #acw-lead h3 { font-size: 18px; margin: 0 0 8px; color: #111827; }
    #acw-lead p { font-size: 13px; line-height: 1.6; color: #475569; margin: 0 0 14px; }
    #acw-lead label { display: block; font-size: 12px; font-weight: 600; color: #334155; margin: 0 0 6px; }
    #acw-lead input, #acw-lead select, #acw-input { width: 100%; border-radius: 12px; border: 1px solid #dbe2ea; background: white; padding: 12px 14px; font-size: 14px; outline: none; }
    #acw-lead .acw-field { margin-bottom: 12px; }
    #acw-note { border-radius: 14px; background: #eef2ff; color: #4338ca; padding: 12px; font-size: 12px; line-height: 1.6; margin-bottom: 14px; }
    #acw-msgs { display: flex; flex-direction: column; gap: 12px; }
    .acw-msg { max-width: 86%; padding: 12px 14px; border-radius: 16px; font-size: 14px; line-height: 1.5; box-shadow: 0 2px 8px rgba(15,23,42,0.08); }
    .acw-bot { align-self: flex-start; background: white; color: #111827; border-bottom-left-radius: 4px; }
    .acw-user { align-self: flex-end; background: var(--acw-accent); color: white; border-bottom-right-radius: 4px; }
    #acw-foot { padding: 12px; border-top: 1px solid #e2e8f0; background: white; display: flex; gap: 10px; }
    #acw-send, #acw-save-lead { border: none; border-radius: 14px; background: var(--acw-accent); color: white; font-weight: 700; cursor: pointer; }
    #acw-send { width: 52px; }
    #acw-save-lead { width: 100%; padding: 12px 14px; }
    #acw-products { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-top: 10px; }
    .acw-card { background: white; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; color: #111827; text-decoration: none; }
    .acw-card img { width: 100%; height: 120px; object-fit: cover; background: #e2e8f0; }
    .acw-card-body { padding: 10px; }
    .acw-card-name { font-size: 13px; font-weight: 600; line-height: 1.45; min-height: 36px; }
    .acw-card-price { font-size: 13px; color: var(--acw-accent); font-weight: 700; margin-top: 4px; }
    .acw-card-stock { font-size: 11px; color: #047857; margin-top: 4px; }
    .acw-error { color: #b91c1c; font-size: 12px; margin: 0 0 12px; }
    @media (max-width: 640px) {
      #acw-button { right: 14px; bottom: 14px; width: 56px; height: 56px; }
      #acw-panel { right: 12px; left: 12px; bottom: 82px; width: auto; height: min(72vh, 640px); }
    }
  `;
  document.head.appendChild(style);

  var root = document.createElement("div");
  root.id = "acw-root";
  root.innerHTML = `
    <button id="acw-button" aria-label="Open chat">💬</button>
    <div id="acw-panel">
      <div id="acw-head">
        <div id="acw-title">${agentName}</div>
        <div id="acw-sub">Shopping assistant</div>
      </div>
      <div id="acw-body">
        <div id="acw-lead" style="display:${lead ? "none" : "block"}">
          <h3>Before we start</h3>
          <div id="acw-note">
            We use this information to personalize responses, save your conversation, and optionally pass qualified leads to the store team. If you want leads, the store can follow up with interested shoppers.
          </div>
          <div class="acw-field">
            <label for="acw-name">Name</label>
            <input id="acw-name" type="text" placeholder="Your name" />
          </div>
          <div class="acw-field">
            <label for="acw-email">Email</label>
            <input id="acw-email" type="email" placeholder="you@example.com" />
          </div>
          <div class="acw-field">
            <label for="acw-leads">Do you want to receive leads?</label>
            <select id="acw-leads">
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          <p id="acw-lead-error" class="acw-error" style="display:none"></p>
          <button id="acw-save-lead">Continue to Chat</button>
        </div>
        <div id="acw-chat" style="display:${lead ? "block" : "none"}">
          <div id="acw-msgs"></div>
        </div>
      </div>
      <div id="acw-foot" style="display:${lead ? "flex" : "none"}">
        <input id="acw-input" placeholder="Ask me anything about this store..." />
        <button id="acw-send">➤</button>
      </div>
    </div>
  `;
  document.body.appendChild(root);

  var button = document.getElementById("acw-button");
  var panel = document.getElementById("acw-panel");
  var rootNode = document.getElementById("acw-root");
  var titleNode = document.getElementById("acw-title");
  var leadWrap = document.getElementById("acw-lead");
  var chatWrap = document.getElementById("acw-chat");
  var foot = document.getElementById("acw-foot");
  var msgs = document.getElementById("acw-msgs");
  var input = document.getElementById("acw-input");
  var send = document.getElementById("acw-send");
  var saveLead = document.getElementById("acw-save-lead");
  var leadError = document.getElementById("acw-lead-error");

  function persistMessages() {
    try { localStorage.setItem(msgKey, JSON.stringify(messages.slice(-30))); } catch (e) {}
  }

  function applyLiveConfig(next) {
    if (!next) return;
    agentName = next.agentName || agentName;
    accent = next.accentColor || accent;
    welcome = next.welcomeMessage || welcome;
    webhook = next.webhookUrl || webhook;
    if (rootNode) rootNode.style.setProperty("--acw-accent", accent);
    if (titleNode) titleNode.textContent = agentName;
  }

  async function loadLiveConfig() {
    if (!storeId || !apiBase) return;
    try {
      var res = await fetch(apiBase + "/widget-config/" + encodeURIComponent(storeId));
      if (!res.ok) return;
      var data = await res.json();
      if (data && data.config) applyLiveConfig(data.config);
    } catch (e) {}
  }

  async function trackUsage() {
    if (!storeId || !apiBase) return;
    try {
      await fetch(apiBase + "/widget-usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId: storeId, amount: 1 }),
      });
    } catch (e) {}
  }

  function renderProducts(products) {
    if (!Array.isArray(products) || !products.length) return "";
    return `<div id="acw-products">${products.slice(0, 3).map(function (p) {
      return '<a class="acw-card" href="' + (p.url || "#") + '" target="_blank" rel="noreferrer">' +
        '<img src="' + (p.image || "") + '" alt="' + (p.name || "Product") + '" />' +
        '<div class="acw-card-body">' +
        '<div class="acw-card-name">' + (p.name || "Product") + "</div>" +
        '<div class="acw-card-price">$' + (p.price || "") + "</div>" +
        '<div class="acw-card-stock">' + (p.stock || "") + "</div>" +
        "</div></a>";
    }).join("")}</div>`;
  }

  function addMessage(role, text, products) {
    messages.push({ role: role, text: text, products: products || [] });
    persistMessages();
    var item = document.createElement("div");
    item.className = "acw-msg " + (role === "user" ? "acw-user" : "acw-bot");
    item.innerHTML = String(text || "").replace(/\n/g, "<br>") + renderProducts(products);
    msgs.appendChild(item);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function hydrateChat() {
    msgs.innerHTML = "";
    if (!messages.length) {
      addMessage("bot", welcome);
      return;
    }
    messages.forEach(function (m) { addMessage(m.role, m.text, m.products); });
  }

  async function sendMessage() {
    var value = (input.value || "").trim();
    if (!value || !webhook) return;
    input.value = "";
    addMessage("user", value);
    try {
      var res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          store_id: storeId,
          user_id: sessionId,
          message: value,
          lead_name: lead && lead.name,
          lead_email: lead && lead.email,
          wants_leads: lead && lead.wantsLeads,
        }),
      });
      var data = await res.json();
      addMessage("bot", data.reply || "I could not generate a response.", data.products || []);
      trackUsage();
    } catch (e) {
      addMessage("bot", "The assistant is temporarily unavailable. Please try again.");
    }
  }

  button.addEventListener("click", function () {
    panel.classList.toggle("open");
    if (panel.classList.contains("open") && lead) hydrateChat();
  });

  saveLead.addEventListener("click", function () {
    var name = document.getElementById("acw-name").value.trim();
    var email = document.getElementById("acw-email").value.trim();
    var wantsLeads = document.getElementById("acw-leads").value;
    if (!name || !email) {
      leadError.style.display = "block";
      leadError.textContent = "Name and email are required before chat.";
      return;
    }
    lead = { name: name, email: email, wantsLeads: wantsLeads };
    try { localStorage.setItem(storageKey, JSON.stringify(lead)); } catch (e) {}
    leadWrap.style.display = "none";
    chatWrap.style.display = "block";
    foot.style.display = "flex";
    hydrateChat();
  });

  send.addEventListener("click", sendMessage);
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  loadLiveConfig();
})();

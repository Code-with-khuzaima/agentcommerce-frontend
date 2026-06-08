(function () {
  "use strict";

  if (window.__AgentComerceWidgetLoaded) return;
  window.__AgentComerceWidgetLoaded = true;

  var currentScript = document.currentScript || document.querySelector('script[data-agentcomerce-widget][src*="widget.js"]');
  var config = window.AgentComerce || {};
  var scriptApiBase = currentScript && currentScript.getAttribute("data-api-base");
  var scriptSrc = currentScript && currentScript.src;
  var assetBase = scriptSrc ? new URL(".", scriptSrc).href : window.location.origin + "/";
  var storeId = config.store_id || "store_001";
  var webhook = config.webhook_url || "";
  var apiBase = config.api_base || scriptApiBase || "";
  var agentName = config.agent_name || "AgentComerce Assistant";
  var accent = config.accent_color || "#0f766e";
  var secondary = config.secondary_color || "#111827";
  var logoUrl = config.logo_url || new URL("logo192.png", assetBase).href;
  var welcome = config.welcome_message || "Welcome! How can I help you today?";
  var sessionKey = "ac_widget_session_" + storeId;
  var msgKey = "ac_widget_msgs_" + storeId;

  var sessionId = "";
  try {
    sessionId = localStorage.getItem(sessionKey) || ("guest_" + Math.random().toString(36).slice(2, 10));
    localStorage.setItem(sessionKey, sessionId);
  } catch (e) {
    sessionId = "guest_" + Math.random().toString(36).slice(2, 10);
  }

  var messages = [];
  try {
    messages = JSON.parse(localStorage.getItem(msgKey) || "[]");
  } catch (e) {}

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  var style = document.createElement("style");
  style.id = "acw-style";
  style.textContent = `
    #acw-root, #acw-root * { box-sizing: border-box; font-family: Inter, system-ui, sans-serif; }
    #acw-root { --acw-accent: ${accent}; --acw-secondary: ${secondary}; }
    #acw-button { position: fixed; right: 20px; bottom: 20px; width: 62px; height: 62px; border-radius: 18px; border: 1px solid rgba(255,255,255,0.28); background: var(--acw-secondary); color: white; cursor: pointer; box-shadow: 0 16px 36px rgba(15,23,42,0.24); z-index: 99998; padding: 7px; }
    #acw-button img { width: 100%; height: 100%; display: block; border-radius: 14px; }
    #acw-panel { position: fixed; right: 20px; bottom: 94px; width: min(400px, calc(100vw - 24px)); height: min(660px, calc(100vh - 120px)); background: #ffffff; color: #101828; border: 1px solid rgba(15,23,42,0.12); border-radius: 22px; overflow: hidden; box-shadow: 0 24px 60px rgba(15,23,42,0.22); display: none; flex-direction: column; z-index: 99999; }
    #acw-panel.open { display: flex; }
    #acw-head { display: flex; align-items: center; gap: 12px; padding: 16px 18px; background: var(--acw-secondary); border-bottom: 1px solid rgba(255,255,255,0.08); }
    #acw-logo { width: 40px; height: 40px; border-radius: 12px; background: white; padding: 4px; flex: 0 0 auto; }
    #acw-logo img { width: 100%; height: 100%; display: block; border-radius: 9px; }
    #acw-title { font-size: 16px; font-weight: 700; }
    #acw-sub { font-size: 12px; color: rgba(255,255,255,0.68); margin-top: 4px; }
    #acw-body { flex: 1; min-height: 0; display: flex; flex-direction: column; background: #f3f6fa; color: #111827; }
    #acw-chat { flex: 1; padding: 16px; overflow: auto; }
    #acw-input { width: 100%; min-width: 0; border-radius: 14px; border: 1px solid #d6dde7; background: #ffffff; color: #111827; padding: 12px 14px; font-size: 14px; outline: none; }
    #acw-msgs { display: flex; flex-direction: column; gap: 12px; }
    .acw-msg { max-width: 88%; padding: 12px 14px; border-radius: 16px; font-size: 14px; line-height: 1.5; overflow-wrap: anywhere; box-shadow: 0 2px 8px rgba(15,23,42,0.08); }
    .acw-msg.acw-has-products { max-width: 100%; width: 100%; }
    .acw-bot { align-self: flex-start; background: #ffffff; color: #111827; border: 1px solid #e4eaf2; border-bottom-left-radius: 4px; }
    .acw-user { align-self: flex-end; background: var(--acw-accent); color: white; border-bottom-right-radius: 4px; }
    #acw-foot { padding: 12px; border-top: 1px solid #e2e8f0; background: #ffffff; display: flex; gap: 10px; }
    #acw-send { width: 48px; flex: 0 0 48px; border: none; border-radius: 14px; background: var(--acw-accent); color: white; font-weight: 800; cursor: pointer; }
    #acw-products { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-top: 12px; }
    .acw-card { background: #ffffff; border: 1px solid #dde5ef; border-radius: 14px; overflow: hidden; color: #111827; text-decoration: none; min-width: 0; }
    .acw-card a { color: inherit; text-decoration: none; display: block; min-width: 0; }
    .acw-card img { width: 100%; aspect-ratio: 4 / 3; height: auto; object-fit: cover; background: #e2e8f0; display: block; }
    .acw-card-body { padding: 10px; min-width: 0; }
    .acw-card-name { font-size: 13px; font-weight: 700; line-height: 1.35; min-height: 35px; overflow-wrap: anywhere; }
    .acw-card-price { font-size: 13px; color: var(--acw-accent); font-weight: 800; margin-top: 5px; }
    .acw-card-stock { font-size: 11px; color: #067647; margin-top: 4px; }
    .acw-card-detail { font-size: 11px; color: #64748b; margin-top: 4px; min-height: 16px; }
    .acw-card-actions { display: grid; grid-template-columns: 1fr; gap: 8px; margin-top: 10px; }
    .acw-card-btn { border: 1px solid #dbe2ea; border-radius: 10px; padding: 9px 8px; font-size: 11px; font-weight: 800; text-align: center; text-decoration: none; cursor: pointer; width: 100%; }
    .acw-card-view { background: white; color: #0f172a; }
    .acw-card-cart { background: var(--acw-accent); border-color: var(--acw-accent); color: white; }
    .acw-card-cart[disabled] { opacity: 0.55; cursor: not-allowed; }
    @media (max-width: 640px) {
      #acw-button { right: 14px; bottom: 14px; width: 56px; height: 56px; }
      #acw-panel { right: 10px; left: 10px; bottom: 80px; width: auto; height: min(78vh, 640px); border-radius: 18px; }
      #acw-head { padding: 14px; }
      #acw-chat { padding: 12px; }
      .acw-msg { max-width: 92%; }
      #acw-products { grid-template-columns: 1fr; }
    }
  `;
  document.head.appendChild(style);

  var root = document.createElement("div");
  root.id = "acw-root";
  root.innerHTML = `
    <button id="acw-button" aria-label="Open chat"><img id="acw-button-logo" src="${escapeHtml(logoUrl)}" alt="" /></button>
    <div id="acw-panel">
      <div id="acw-head">
        <div id="acw-logo"><img id="acw-head-logo" src="${escapeHtml(logoUrl)}" alt="" /></div>
        <div>
          <div id="acw-title"></div>
          <div id="acw-sub">Shopping assistant</div>
        </div>
      </div>
      <div id="acw-body">
        <div id="acw-chat">
          <div id="acw-msgs"></div>
        </div>
      </div>
      <div id="acw-foot">
        <input id="acw-input" placeholder="Ask me anything about this store..." />
        <button id="acw-send" aria-label="Send message">&#10148;</button>
      </div>
    </div>
  `;
  document.body.appendChild(root);

  var button = document.getElementById("acw-button");
  var panel = document.getElementById("acw-panel");
  var rootNode = document.getElementById("acw-root");
  var titleNode = document.getElementById("acw-title");
  var buttonLogo = document.getElementById("acw-button-logo");
  var headLogo = document.getElementById("acw-head-logo");
  var msgs = document.getElementById("acw-msgs");
  var input = document.getElementById("acw-input");
  var send = document.getElementById("acw-send");

  if (titleNode) titleNode.textContent = agentName;

  function persistMessages() {
    try { localStorage.setItem(msgKey, JSON.stringify(messages.slice(-30))); } catch (e) {}
  }

  function applyLiveConfig(next) {
    if (!next) return;
    agentName = next.agentName || agentName;
    accent = next.accentColor || accent;
    secondary = next.secondaryColor || secondary;
    logoUrl = next.logoUrl || logoUrl;
    welcome = next.welcomeMessage || welcome;
    webhook = next.webhookUrl || webhook;
    if (rootNode) rootNode.style.setProperty("--acw-accent", accent);
    if (rootNode) rootNode.style.setProperty("--acw-secondary", secondary);
    if (titleNode) titleNode.textContent = agentName;
    if (buttonLogo) buttonLogo.src = logoUrl;
    if (headLogo) headLogo.src = logoUrl;
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
      var img = escapeHtml(p.image || "");
      var name = escapeHtml(p.name || "Product");
      var price = escapeHtml(p.price || "");
      var stock = escapeHtml(p.stock || "");
      var detail = escapeHtml(p.detail || p.product_type || "");
      var url = escapeHtml(p.url || "#");
      var cartUrl = escapeHtml(p.add_to_cart_url || "");
      return '<div class="acw-card">' +
        '<a href="' + url + '" target="_blank" rel="noreferrer">' +
        '<img src="' + img + '" alt="' + name + '" />' +
        '<div class="acw-card-body">' +
        '<div class="acw-card-name">' + name + "</div>" +
        '<div class="acw-card-price">' + price + "</div>" +
        '<div class="acw-card-stock">' + stock + "</div>" +
        '<div class="acw-card-detail">' + detail + "</div>" +
        '</div>' +
        '</a>' +
        '<div class="acw-card-body">' +
        '<div class="acw-card-actions">' +
        '<a class="acw-card-btn acw-card-view" href="' + url + '" target="_blank" rel="noreferrer">View</a>' +
        '<button class="acw-card-btn acw-card-cart" type="button" ' + (cartUrl ? 'data-cart-url="' + cartUrl + '"' : "disabled") + ">" + (cartUrl ? "Add to Cart" : "Unavailable") + "</button>" +
        "</div>" +
        "</div></div>";
    }).join("")}</div>`;
  }

  function renderMessage(role, text, products) {
    var item = document.createElement("div");
    item.className = "acw-msg " + (role === "user" ? "acw-user" : "acw-bot");
    if (Array.isArray(products) && products.length) item.className += " acw-has-products";
    item.innerHTML = escapeHtml(String(text || "")).replace(/\n/g, "<br>") + renderProducts(products);
    msgs.appendChild(item);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function addMessage(role, text, products) {
    messages.push({ role: role, text: text, products: products || [] });
    persistMessages();
    renderMessage(role, text, products);
  }

  function hydrateChat() {
    msgs.innerHTML = "";
    if (!messages.length) {
      addMessage("bot", welcome);
      return;
    }
    messages.forEach(function (message) {
      renderMessage(message.role, message.text, message.products);
    });
  }

  async function sendMessage() {
    var value = (input.value || "").trim();
    if (!value) return;
    if (!webhook) {
      addMessage("bot", "The assistant is not configured yet. Please contact the store team.");
      return;
    }

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
    if (panel.classList.contains("open")) hydrateChat();
  });

  send.addEventListener("click", sendMessage);
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  msgs.addEventListener("click", async function (event) {
    var cartButton = event.target.closest(".acw-card-cart");
    if (!cartButton || cartButton.disabled) return;
    var cartUrl = cartButton.getAttribute("data-cart-url");
    if (!cartUrl) return;
    cartButton.disabled = true;
    var original = cartButton.textContent;
    cartButton.textContent = "Adding...";
    try {
      await fetch(cartUrl, {
        method: "GET",
        credentials: "include",
      });
      cartButton.textContent = "Added";
      addMessage("bot", "Product added to cart.");
    } catch (e) {
      cartButton.disabled = false;
      cartButton.textContent = original || "Add to Cart";
      addMessage("bot", "Could not add this product to cart automatically. Open the product page and add it there.");
    }
  });

  loadLiveConfig().then(hydrateChat).catch(hydrateChat);
})();

notepad C:\Users\PMLS\agentcommerce-frontend\public\widget.js(function () {
  'use strict';

  // ── Config injected by store owner's script tag ──
  var config = window.AgentComerce || {};
  var STORE_ID = config.store_id || 'store_001';
  var WEBHOOK_URL = config.webhook_url || 'https://aicontactsupport.app.n8n.cloud/webhook/starter-chat';
  var AGENT_NAME = config.agent_name || 'AI Assistant';
  var ACCENT_COLOR = config.accent_color || '#7C3AED';
  var WELCOME_MSG = config.welcome_message || 'Hi! 👋 How can I help you today?';

  // ── Generate unique session ID ──
  var SESSION_ID = 'sess_' + Math.random().toString(36).substr(2, 12) + '_' + Date.now();

  // ── State ──
  var isOpen = false;
  var isTyping = false;
  var messages = [];

  // ── Inject styles ──
  var style = document.createElement('style');
  style.textContent = [
    '#ac-widget * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 0; padding: 0; }',
    '#ac-btn { position: fixed; bottom: 24px; right: 24px; width: 60px; height: 60px; border-radius: 50%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 24px rgba(0,0,0,0.18); z-index: 999998; transition: transform 0.2s, box-shadow 0.2s; }',
    '#ac-btn:hover { transform: scale(1.08); box-shadow: 0 8px 32px rgba(0,0,0,0.22); }',
    '#ac-btn svg { transition: transform 0.3s; }',
    '#ac-btn.open svg.chat-icon { display: none; }',
    '#ac-btn.open svg.close-icon { display: block !important; }',
    '#ac-window { position: fixed; bottom: 96px; right: 24px; width: 360px; height: 520px; background: #fff; border-radius: 20px; box-shadow: 0 8px 48px rgba(0,0,0,0.15); display: flex; flex-direction: column; z-index: 999997; overflow: hidden; transform: scale(0.85) translateY(20px); opacity: 0; pointer-events: none; transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s; transform-origin: bottom right; }',
    '#ac-window.open { transform: scale(1) translateY(0); opacity: 1; pointer-events: all; }',
    '#ac-header { padding: 16px 20px; display: flex; align-items: center; gap: 12px; flex-shrink: 0; }',
    '#ac-header-avatar { width: 38px; height: 38px; border-radius: 50%; background: rgba(255,255,255,0.25); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }',
    '#ac-header-info { flex: 1; }',
    '#ac-header-name { font-size: 15px; font-weight: 700; color: #fff; line-height: 1.2; }',
    '#ac-header-status { font-size: 11px; color: rgba(255,255,255,0.85); display: flex; align-items: center; gap: 4px; margin-top: 2px; }',
    '#ac-header-status::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: #4ade80; display: inline-block; }',
    '#ac-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 10px; }',
    '#ac-messages::-webkit-scrollbar { width: 4px; }',
    '#ac-messages::-webkit-scrollbar-track { background: transparent; }',
    '#ac-messages::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 2px; }',
    '.ac-msg { max-width: 82%; display: flex; flex-direction: column; gap: 3px; animation: ac-msg-in 0.25s ease; }',
    '@keyframes ac-msg-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }',
    '.ac-msg.bot { align-self: flex-start; }',
    '.ac-msg.user { align-self: flex-end; }',
    '.ac-bubble { padding: 10px 14px; border-radius: 16px; font-size: 13.5px; line-height: 1.5; word-break: break-word; }',
    '.ac-msg.bot .ac-bubble { background: #f1f5f9; color: #1e293b; border-bottom-left-radius: 4px; }',
    '.ac-msg.user .ac-bubble { color: #fff; border-bottom-right-radius: 4px; }',
    '.ac-time { font-size: 10px; color: #94a3b8; padding: 0 4px; }',
    '.ac-msg.user .ac-time { text-align: right; }',
    '.ac-typing { display: flex; gap: 4px; align-items: center; padding: 12px 14px; background: #f1f5f9; border-radius: 16px; border-bottom-left-radius: 4px; width: fit-content; }',
    '.ac-typing span { width: 7px; height: 7px; border-radius: 50%; background: #94a3b8; animation: ac-bounce 1.2s infinite; }',
    '.ac-typing span:nth-child(2) { animation-delay: 0.2s; }',
    '.ac-typing span:nth-child(3) { animation-delay: 0.4s; }',
    '@keyframes ac-bounce { 0%,60%,100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }',
    '#ac-footer { padding: 12px 16px; border-top: 1px solid #f1f5f9; display: flex; gap: 8px; align-items: flex-end; flex-shrink: 0; background: #fff; }',
    '#ac-input { flex: 1; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 10px 14px; font-size: 13.5px; color: #1e293b; resize: none; outline: none; max-height: 100px; min-height: 42px; line-height: 1.4; transition: border-color 0.2s; background: #f8fafc; }',
    '#ac-input:focus { border-color: var(--ac-accent); background: #fff; }',
    '#ac-input::placeholder { color: #94a3b8; }',
    '#ac-send { width: 40px; height: 40px; border-radius: 10px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: opacity 0.2s, transform 0.15s; }',
    '#ac-send:hover { opacity: 0.88; transform: scale(1.05); }',
    '#ac-send:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }',
    '#ac-powered { text-align: center; padding: 6px; font-size: 10px; color: #cbd5e1; background: #fff; flex-shrink: 0; }',
    '#ac-powered a { color: #94a3b8; text-decoration: none; }',
    '@media (max-width: 480px) { #ac-window { width: calc(100vw - 16px); right: 8px; bottom: 88px; height: 70vh; } #ac-btn { bottom: 16px; right: 16px; } }'
  ].join('\n');
  document.head.appendChild(style);

  // ── Create widget HTML ──
  var widget = document.createElement('div');
  widget.id = 'ac-widget';
  widget.style.setProperty('--ac-accent', ACCENT_COLOR);
  widget.innerHTML = [
    '<button id="ac-btn" aria-label="Open chat">',
      '<svg class="chat-icon" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
        '<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>',
      '</svg>',
      '<svg class="close-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" style="display:none">',
        '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
      '</svg>',
    '</button>',
    '<div id="ac-window" role="dialog" aria-label="Chat with AI Assistant">',
      '<div id="ac-header">',
        '<div id="ac-header-avatar">',
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round">',
            '<path d="M12 2a2 2 0 012 2v1h4a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h4V4a2 2 0 012-2z"/>',
            '<circle cx="9" cy="11" r="1" fill="#fff"/><circle cx="15" cy="11" r="1" fill="#fff"/>',
          '</svg>',
        '</div>',
        '<div id="ac-header-info">',
          '<div id="ac-header-name">' + AGENT_NAME + '</div>',
          '<div id="ac-header-status">Online • Replies instantly</div>',
        '</div>',
      '</div>',
      '<div id="ac-messages"></div>',
      '<div id="ac-footer">',
        '<textarea id="ac-input" placeholder="Type your message..." rows="1" aria-label="Message input"></textarea>',
        '<button id="ac-send" aria-label="Send message">',
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">',
            '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
          '</svg>',
        '</button>',
      '</div>',
      '<div id="ac-powered">Powered by <a href="https://agentcomerce.com" target="_blank">AgentComerce</a></div>',
    '</div>'
  ].join('');

  document.body.appendChild(widget);

  // ── Apply accent color ──
  var btn = document.getElementById('ac-btn');
  var sendBtn = document.getElementById('ac-send');
  btn.style.background = ACCENT_COLOR;
  sendBtn.style.background = ACCENT_COLOR;
  document.getElementById('ac-header').style.background = ACCENT_COLOR;

  // ── Helper: get time ──
  function getTime() {
    var d = new Date();
    return d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
  }

  // ── Add message to chat ──
  function addMessage(text, role) {
    var messagesEl = document.getElementById('ac-messages');
    var msgEl = document.createElement('div');
    msgEl.className = 'ac-msg ' + role;

    var bubble = document.createElement('div');
    bubble.className = 'ac-bubble';
    if (role === 'user') bubble.style.background = ACCENT_COLOR;
    bubble.textContent = text;

    var time = document.createElement('div');
    time.className = 'ac-time';
    time.textContent = getTime();

    msgEl.appendChild(bubble);
    msgEl.appendChild(time);
    messagesEl.appendChild(msgEl);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    messages.push({ role: role, text: text });
    return msgEl;
  }

  // ── Show typing indicator ──
  function showTyping() {
    var messagesEl = document.getElementById('ac-messages');
    var typingEl = document.createElement('div');
    typingEl.id = 'ac-typing-indicator';
    typingEl.className = 'ac-msg bot';
    typingEl.innerHTML = '<div class="ac-typing"><span></span><span></span><span></span></div>';
    messagesEl.appendChild(typingEl);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  // ── Hide typing indicator ──
  function hideTyping() {
    var el = document.getElementById('ac-typing-indicator');
    if (el) el.remove();
  }

  // ── Send message to N8N webhook ──
  function sendMessage(text) {
    if (!text.trim() || isTyping) return;
    isTyping = true;

    var input = document.getElementById('ac-input');
    var send = document.getElementById('ac-send');
    input.value = '';
    input.style.height = 'auto';
    send.disabled = true;

    addMessage(text, 'user');
    showTyping();

    fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        store_id: STORE_ID,
        session_id: SESSION_ID,
        message: text
      })
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      hideTyping();
      var reply = data.reply || "I'm sorry, I couldn't process that. Please try again.";
      addMessage(reply, 'bot');

      // Show msg limit warning if close to limit
      if (data.msg_count && data.msg_limit) {
        var remaining = data.msg_limit - data.msg_count;
        if (remaining < 101 && remaining > 0) {
          addMessage('⚠️ Note: ' + remaining + ' messages remaining this month.', 'bot');
        }
      }
    })
    .catch(function() {
      hideTyping();
      addMessage("Sorry, I'm having trouble connecting. Please try again in a moment.", 'bot');
    })
    .finally(function() {
      isTyping = false;
      send.disabled = false;
      input.focus();
    });
  }

  // ── Toggle chat window ──
  function toggleChat() {
    isOpen = !isOpen;
    var win = document.getElementById('ac-window');
    var btnEl = document.getElementById('ac-btn');

    if (isOpen) {
      win.classList.add('open');
      btnEl.classList.add('open');
      document.getElementById('ac-input').focus();

      // Show welcome message on first open
      if (messages.length === 0) {
        setTimeout(function() {
          addMessage(WELCOME_MSG, 'bot');
        }, 300);
      }
    } else {
      win.classList.remove('open');
      btnEl.classList.remove('open');
    }
  }

  // ── Event listeners ──
  document.getElementById('ac-btn').addEventListener('click', toggleChat);

  document.getElementById('ac-send').addEventListener('click', function() {
    var input = document.getElementById('ac-input');
    sendMessage(input.value.trim());
  });

  document.getElementById('ac-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(this.value.trim());
    }
  });

  // Auto resize textarea
  document.getElementById('ac-input').addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 100) + 'px';
  });

  // Close on outside click
  document.addEventListener('click', function(e) {
    var win = document.getElementById('ac-window');
    var btnEl = document.getElementById('ac-btn');
    if (isOpen && !win.contains(e.target) && !btnEl.contains(e.target)) {
      toggleChat();
    }
  });

})();
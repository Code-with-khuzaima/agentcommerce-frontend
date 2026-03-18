(function () {
  'use strict';

  var config = window.AgentComerce || {};
  var STORE_ID = config.store_id || 'store_001';
  var WEBHOOK_URL = config.webhook_url || 'https://aicontactsupport.app.n8n.cloud/webhook/starter-chat';
  var AGENT_NAME = config.agent_name || 'AI Assistant';
  var ACCENT = config.accent_color || '#6C47FF';
  var WELCOME = config.welcome_message || 'Hi there! Ask me anything about our store.';
  var SESSION_ID = 'ac_' + Math.random().toString(36).substr(2, 9) + Date.now();

  var isOpen = false;
  var isTyping = false;
  var msgCount = 0;

  var css = document.createElement('style');
  css.textContent = '@import url(\'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap\');'
  + '#ac-root{--ac:' + ACCENT + ';--ac-soft:' + ACCENT + '18;--ac-mid:' + ACCENT + '35;font-family:\'DM Sans\',system-ui,sans-serif;}'
  + '#ac-root *{box-sizing:border-box;margin:0;padding:0;}'
  + '#ac-launcher{position:fixed;bottom:28px;right:28px;width:58px;height:58px;border-radius:18px;background:var(--ac);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:999998;box-shadow:0 4px 20px var(--ac-mid),0 1px 4px rgba(0,0,0,.12);transition:transform .25s cubic-bezier(.34,1.56,.64,1),box-shadow .2s;overflow:hidden;}'
  + '#ac-launcher::before{content:\'\';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.18) 0%,transparent 60%);border-radius:inherit;}'
  + '#ac-launcher:hover{transform:scale(1.08) translateY(-2px);box-shadow:0 8px 32px var(--ac-mid),0 2px 8px rgba(0,0,0,.15);}'
  + '#ac-launcher .ic-chat{transition:all .3s cubic-bezier(.34,1.56,.64,1);}'
  + '#ac-launcher .ic-close{position:absolute;transition:all .3s cubic-bezier(.34,1.56,.64,1);transform:rotate(-90deg) scale(0);opacity:0;}'
  + '#ac-launcher.open .ic-chat{transform:rotate(90deg) scale(0);opacity:0;}'
  + '#ac-launcher.open .ic-close{transform:rotate(0deg) scale(1);opacity:1;}'
  + '#ac-notif{position:absolute;top:-3px;right:-3px;width:14px;height:14px;background:#FF4757;border-radius:50%;border:2px solid white;animation:ac-pulse 2s infinite;display:none;}'
  + '#ac-notif.show{display:block;}'
  + '@keyframes ac-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.2)}}'
  + '#ac-window{position:fixed;bottom:100px;right:28px;width:370px;height:560px;background:#fff;border-radius:24px;box-shadow:0 24px 80px rgba(0,0,0,.12),0 4px 16px rgba(0,0,0,.06),0 0 0 1px rgba(0,0,0,.04);display:flex;flex-direction:column;z-index:999997;overflow:hidden;transform:scale(.9) translateY(16px);opacity:0;pointer-events:none;transition:all .35s cubic-bezier(.34,1.56,.64,1);transform-origin:bottom right;}'
  + '#ac-window.open{transform:scale(1) translateY(0);opacity:1;pointer-events:all;}'
  + '#ac-head{background:var(--ac);padding:18px 20px 16px;position:relative;overflow:hidden;flex-shrink:0;}'
  + '#ac-head::before{content:\'\';position:absolute;top:-40px;right:-40px;width:120px;height:120px;background:rgba(255,255,255,.08);border-radius:50%;}'
  + '#ac-head::after{content:\'\';position:absolute;bottom:-20px;left:20px;width:80px;height:80px;background:rgba(255,255,255,.05);border-radius:50%;}'
  + '#ac-head-inner{display:flex;align-items:center;gap:13px;position:relative;z-index:1;}'
  + '#ac-avatar{width:44px;height:44px;border-radius:14px;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;flex-shrink:0;border:1.5px solid rgba(255,255,255,.25);}'
  + '#ac-head-name{font-size:15px;font-weight:600;color:#fff;letter-spacing:-.2px;line-height:1.3;}'
  + '#ac-head-sub{font-size:11.5px;color:rgba(255,255,255,.8);margin-top:2px;display:flex;align-items:center;gap:5px;}'
  + '#ac-head-sub::before{content:\'\';width:6px;height:6px;border-radius:50%;background:#4ade80;box-shadow:0 0 6px #4ade80;flex-shrink:0;}'
  + '#ac-msgs{flex:1;overflow-y:auto;padding:20px 16px;display:flex;flex-direction:column;gap:12px;background:#fafafa;scroll-behavior:smooth;}'
  + '#ac-msgs::-webkit-scrollbar{width:3px;}'
  + '#ac-msgs::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:2px;}'
  + '.ac-row{display:flex;align-items:flex-end;gap:8px;animation:ac-in .3s cubic-bezier(.34,1.56,.64,1);}'
  + '@keyframes ac-in{from{opacity:0;transform:translateY(12px) scale(.96)}to{opacity:1;transform:translateY(0) scale(1)}}'
  + '.ac-row.bot{align-self:flex-start;max-width:88%;}'
  + '.ac-row.user{align-self:flex-end;max-width:88%;flex-direction:row-reverse;}'
  + '.ac-mini-avatar{width:28px;height:28px;border-radius:9px;background:var(--ac-soft);border:1.5px solid var(--ac-mid);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-bottom:2px;color:var(--ac);}'
  + '.ac-bubble-wrap{display:flex;flex-direction:column;gap:3px;}'
  + '.ac-row.user .ac-bubble-wrap{align-items:flex-end;}'
  + '.ac-bubble{padding:12px 16px;border-radius:18px;font-size:13.5px;line-height:1.55;word-break:break-word;}'
  + '.ac-row.bot .ac-bubble{background:#fff;color:#1a1a2e;border-bottom-left-radius:5px;box-shadow:0 1px 4px rgba(0,0,0,.06),0 0 0 1px rgba(0,0,0,.04);}'
  + '.ac-row.user .ac-bubble{background:var(--ac);color:#fff;border-bottom-right-radius:5px;box-shadow:0 2px 10px var(--ac-mid);}'
  + '.ac-time{font-size:10px;color:#adb5bd;padding:0 4px;}'
  + '.ac-row.user .ac-time{text-align:right;}'
  + '#ac-typing{display:flex;align-items:flex-end;gap:8px;animation:ac-in .3s ease;}'
  + '.ac-typing-bubble{background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.06),0 0 0 1px rgba(0,0,0,.04);border-radius:18px;border-bottom-left-radius:5px;padding:14px 18px;display:flex;gap:5px;align-items:center;}'
  + '.ac-dot{width:7px;height:7px;border-radius:50%;background:#cbd5e1;animation:ac-bounce 1.4s infinite;}'
  + '.ac-dot:nth-child(2){animation-delay:.18s;}'
  + '.ac-dot:nth-child(3){animation-delay:.36s;}'
  + '@keyframes ac-bounce{0%,60%,100%{transform:translateY(0);background:#cbd5e1}30%{transform:translateY(-6px);background:var(--ac)}}'
  + '#ac-quick{padding:0 16px 12px;display:flex;gap:7px;flex-wrap:wrap;background:#fafafa;}'
  + '.ac-quick-btn{padding:6px 12px;border-radius:20px;border:1.5px solid var(--ac-mid);background:var(--ac-soft);color:var(--ac);font-size:12px;font-weight:500;cursor:pointer;transition:all .15s;font-family:inherit;white-space:nowrap;}'
  + '.ac-quick-btn:hover{background:var(--ac);color:#fff;border-color:var(--ac);transform:translateY(-1px);}'
  + '#ac-foot{padding:12px 14px;border-top:1px solid #f0f0f5;display:flex;gap:8px;align-items:flex-end;background:#fff;flex-shrink:0;}'
  + '#ac-input{flex:1;background:#f4f4f8;border:1.5px solid transparent;border-radius:14px;padding:10px 14px;font-size:13.5px;font-family:inherit;color:#1a1a2e;resize:none;outline:none;min-height:42px;max-height:110px;line-height:1.45;transition:all .2s;}'
  + '#ac-input:focus{background:#fff;border-color:var(--ac-mid);box-shadow:0 0 0 3px var(--ac-soft);}'
  + '#ac-input::placeholder{color:#9ca3af;}'
  + '#ac-send{width:42px;height:42px;border-radius:13px;background:var(--ac);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .2s;box-shadow:0 2px 10px var(--ac-mid);}'
  + '#ac-send:hover{transform:scale(1.06);}'
  + '#ac-send:disabled{opacity:.45;cursor:not-allowed;transform:none;}'
  + '#ac-brand{text-align:center;padding:6px 0 8px;font-size:10.5px;color:#c4c9d4;background:#fff;flex-shrink:0;}'
  + '#ac-brand a{color:#a0a8b8;text-decoration:none;font-weight:500;}'
  + '#ac-brand a:hover{color:var(--ac);}'
  + '@media(max-width:480px){#ac-window{width:100vw;height:100dvh;bottom:0;right:0;border-radius:0;}#ac-launcher{bottom:20px;right:20px;}}';

  document.head.appendChild(css);

  var root = document.createElement('div');
  root.id = 'ac-root';
  root.innerHTML = ''
  + '<button id="ac-launcher" aria-label="Open chat">'
  + '<span id="ac-notif"></span>'
  + '<svg class="ic-chat" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  + '<svg class="ic-close" width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="white" stroke-width="2.5" stroke-linecap="round"/></svg>'
  + '</button>'
  + '<div id="ac-window" role="dialog">'
  + '<div id="ac-head"><div id="ac-head-inner">'
  + '<div id="ac-avatar"><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M9.5 9a.5.5 0 100-1 .5.5 0 000 1zM14.5 9a.5.5 0 100-1 .5.5 0 000 1z" fill="white"/><path d="M12 3C7.03 3 3 6.58 3 11c0 1.7.56 3.27 1.5 4.57L3 19l4.17-1.32A9.8 9.8 0 0012 19c4.97 0 9-3.58 9-8s-4.03-8-9-8z" stroke="white" stroke-width="1.8" stroke-linecap="round"/><path d="M9 13s.875 1.5 3 1.5S15 13 15 13" stroke="white" stroke-width="1.5" stroke-linecap="round"/></svg></div>'
  + '<div id="ac-head-text"><div id="ac-head-name">' + AGENT_NAME + '</div><div id="ac-head-sub">Online · Replies instantly</div></div>'
  + '</div></div>'
  + '<div id="ac-msgs"></div>'
  + '<div id="ac-quick">'
  + '<button class="ac-quick-btn" data-msg="What are your delivery charges?">🚚 Delivery</button>'
  + '<button class="ac-quick-btn" data-msg="Do you have cash on delivery?">💵 COD</button>'
  + '<button class="ac-quick-btn" data-msg="What is your return policy?">↩ Returns</button>'
  + '<button class="ac-quick-btn" data-msg="What sizes do you have?">📏 Sizes</button>'
  + '</div>'
  + '<div id="ac-foot">'
  + '<textarea id="ac-input" placeholder="Type a message..." rows="1"></textarea>'
  + '<button id="ac-send"><svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>'
  + '</div>'
  + '<div id="ac-brand">Powered by <a href="https://agentcomerce.com" target="_blank">AgentComerce</a></div>'
  + '</div>';

  document.body.appendChild(root);

  var launcher = document.getElementById('ac-launcher');
  var win = document.getElementById('ac-window');
  var msgsEl = document.getElementById('ac-msgs');
  var input = document.getElementById('ac-input');
  var sendBtn = document.getElementById('ac-send');
  var notif = document.getElementById('ac-notif');
  var quickEl = document.getElementById('ac-quick');

  function ts() {
    var d = new Date();
    return d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
  }

  function addMsg(text, role) {
    var row = document.createElement('div');
    row.className = 'ac-row ' + role;
    var avatar = role === 'bot'
      ? '<div class="ac-mini-avatar"><svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 3C7.03 3 3 6.58 3 11c0 1.57.47 3.03 1.28 4.28L3 19l4.3-1.14A9.8 9.8 0 0012 19c4.97 0 9-3.58 9-8s-4.03-8-9-8z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></div>'
      : '';
    row.innerHTML = avatar + '<div class="ac-bubble-wrap"><div class="ac-bubble">' + text.replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>') + '</div><div class="ac-time">' + ts() + '</div></div>';
    msgsEl.appendChild(row);
    msgsEl.scrollTop = msgsEl.scrollHeight;
    msgCount++;
  }

  function showTyping() {
    var el = document.createElement('div');
    el.id = 'ac-typing';
    el.className = 'ac-row bot';
    el.innerHTML = '<div class="ac-mini-avatar" style="color:var(--ac)"><svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 3C7.03 3 3 6.58 3 11c0 1.57.47 3.03 1.28 4.28L3 19l4.3-1.14A9.8 9.8 0 0012 19c4.97 0 9-3.58 9-8s-4.03-8-9-8z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></div><div class="ac-typing-bubble"><div class="ac-dot"></div><div class="ac-dot"></div><div class="ac-dot"></div></div>';
    msgsEl.appendChild(el);
    msgsEl.scrollTop = msgsEl.scrollHeight;
  }

  function hideTyping() {
    var el = document.getElementById('ac-typing');
    if (el) el.remove();
  }

  function send(text) {
    if (!text.trim() || isTyping) return;
    isTyping = true;
    input.value = '';
    input.style.height = 'auto';
    sendBtn.disabled = true;
    quickEl.style.display = 'none';
    addMsg(text, 'user');
    showTyping();
    fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ store_id: STORE_ID, session_id: SESSION_ID, message: text })
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      hideTyping();
      addMsg(data.reply || "Sorry, could not get a response. Please try again.", 'bot');
      if (data.msg_count && data.msg_limit) {
        var rem = data.msg_limit - data.msg_count;
        if (rem < 101 && rem > 0) addMsg('Note: ' + rem + ' messages remaining this month.', 'bot');
      }
    })
    .catch(function() {
      hideTyping();
      addMsg("Sorry, having trouble connecting. Please try again in a moment.", 'bot');
    })
    .finally(function() {
      isTyping = false;
      sendBtn.disabled = false;
      input.focus();
    });
  }

  function toggle() {
    isOpen = !isOpen;
    win.classList.toggle('open', isOpen);
    launcher.classList.toggle('open', isOpen);
    notif.classList.remove('show');
    if (isOpen) {
      input.focus();
      if (msgCount === 0) setTimeout(function() { addMsg(WELCOME, 'bot'); }, 350);
    }
  }

  launcher.addEventListener('click', toggle);
  sendBtn.addEventListener('click', function() { send(input.value.trim()); });
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(this.value.trim()); }
  });
  input.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 110) + 'px';
  });
  document.querySelectorAll('.ac-quick-btn').forEach(function(btn) {
    btn.addEventListener('click', function() { send(this.dataset.msg); });
  });
  document.addEventListener('click', function(e) {
    if (isOpen && !win.contains(e.target) && !launcher.contains(e.target)) toggle();
  });
  setTimeout(function() { if (!isOpen) notif.classList.add('show'); }, 3000);

})();

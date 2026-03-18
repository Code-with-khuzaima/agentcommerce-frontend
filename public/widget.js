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
  css.textContent = ''
  + '@import url("https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600&display=swap");'
  + '#ac-root{--ac:' + ACCENT + ';--ac-soft:' + ACCENT + '12;--ac-mid:' + ACCENT + '30;font-family:"DM Sans",system-ui,sans-serif;}'
  + '#ac-root *{box-sizing:border-box;margin:0;padding:0;}'

  /* Launcher */
  + '#ac-launcher{position:fixed;bottom:28px;right:28px;width:56px;height:56px;border-radius:16px;background:var(--ac);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:999998;box-shadow:0 8px 24px var(--ac-mid),0 2px 8px rgba(0,0,0,0.1);transition:transform .3s cubic-bezier(.34,1.56,.64,1),box-shadow .2s;}'
  + '#ac-launcher:hover{transform:scale(1.1) translateY(-2px);box-shadow:0 12px 32px var(--ac-mid);}'
  + '#ac-launcher .ic-chat{transition:all .3s cubic-bezier(.34,1.56,.64,1);position:absolute;}'
  + '#ac-launcher .ic-close{transition:all .3s cubic-bezier(.34,1.56,.64,1);position:absolute;transform:scale(0) rotate(-45deg);opacity:0;}'
  + '#ac-launcher.open .ic-chat{transform:scale(0) rotate(45deg);opacity:0;}'
  + '#ac-launcher.open .ic-close{transform:scale(1) rotate(0deg);opacity:1;}'
  + '#ac-notif{position:absolute;top:-4px;right:-4px;width:13px;height:13px;background:#f43f5e;border-radius:50%;border:2.5px solid white;display:none;animation:ac-pulse 2.5s infinite;}'
  + '#ac-notif.show{display:block;}'
  + '@keyframes ac-pulse{0%,100%{box-shadow:0 0 0 0 rgba(244,63,94,0.4)}50%{box-shadow:0 0 0 6px rgba(244,63,94,0)}}'

  /* Window */
  + '#ac-window{position:fixed;bottom:98px;right:28px;width:380px;background:#fff;border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,0.13),0 4px 16px rgba(0,0,0,0.06),0 0 0 1px rgba(0,0,0,0.05);display:flex;flex-direction:column;z-index:999997;overflow:hidden;transform:translateY(20px) scale(0.94);opacity:0;pointer-events:none;transition:all .35s cubic-bezier(.34,1.56,.64,1);transform-origin:bottom right;max-height:580px;}'
  + '#ac-window.open{transform:translateY(0) scale(1);opacity:1;pointer-events:all;}'

  /* Header */
  + '#ac-head{background:var(--ac);padding:20px 20px 18px;flex-shrink:0;position:relative;overflow:hidden;}'
  + '#ac-head::after{content:"";position:absolute;width:180px;height:180px;border-radius:50%;background:rgba(255,255,255,0.06);top:-80px;right:-50px;pointer-events:none;}'
  + '#ac-head::before{content:"";position:absolute;width:100px;height:100px;border-radius:50%;background:rgba(255,255,255,0.05);bottom:-40px;left:10px;pointer-events:none;}'
  + '#ac-head-inner{display:flex;align-items:center;gap:14px;position:relative;z-index:1;}'
  + '#ac-avatar{width:46px;height:46px;border-radius:14px;background:rgba(255,255,255,0.18);border:1.5px solid rgba(255,255,255,0.28);display:flex;align-items:center;justify-content:center;flex-shrink:0;}'
  + '#ac-head-text{flex:1;min-width:0;}'
  + '#ac-head-name{font-size:15.5px;font-weight:600;color:#fff;line-height:1.3;letter-spacing:-0.2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}'
  + '#ac-status{font-size:12px;color:rgba(255,255,255,0.82);margin-top:3px;display:flex;align-items:center;gap:6px;}'
  + '#ac-status-dot{width:7px;height:7px;border-radius:50%;background:#4ade80;box-shadow:0 0 8px rgba(74,222,128,0.7);flex-shrink:0;animation:ac-blink 2s infinite;}'
  + '@keyframes ac-blink{0%,100%{opacity:1}50%{opacity:0.5}}'

  /* Messages area */
  + '#ac-msgs{flex:1;overflow-y:auto;padding:20px 18px 12px;display:flex;flex-direction:column;gap:14px;background:#f8f9fb;min-height:280px;max-height:340px;}'
  + '#ac-msgs::-webkit-scrollbar{width:4px;}'
  + '#ac-msgs::-webkit-scrollbar-track{background:transparent;}'
  + '#ac-msgs::-webkit-scrollbar-thumb{background:#dde1e9;border-radius:4px;}'

  /* Message rows */
  + '.ac-row{display:flex;align-items:flex-end;gap:9px;}'
  + '.ac-row.bot{align-self:flex-start;max-width:86%;}'
  + '.ac-row.user{align-self:flex-end;max-width:86%;flex-direction:row-reverse;}'
  + '@keyframes ac-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}'
  + '.ac-row{animation:ac-in .25s ease;}'

  /* Avatar */
  + '.ac-av{width:30px;height:30px;border-radius:10px;background:var(--ac-soft);border:1.5px solid var(--ac-mid);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--ac);margin-bottom:2px;}'

  /* Bubbles */
  + '.ac-bw{display:flex;flex-direction:column;gap:4px;}'
  + '.ac-row.user .ac-bw{align-items:flex-end;}'
  + '.ac-b{padding:13px 16px;border-radius:16px;font-size:14px;line-height:1.6;word-break:break-word;letter-spacing:-0.1px;}'
  + '.ac-row.bot .ac-b{background:#ffffff;color:#1c1c2e;border-bottom-left-radius:4px;box-shadow:0 1px 3px rgba(0,0,0,0.06),0 0 0 1px rgba(0,0,0,0.04);}'
  + '.ac-row.user .ac-b{background:var(--ac);color:#fff;border-bottom-right-radius:4px;box-shadow:0 4px 12px var(--ac-mid);}'
  + '.ac-t{font-size:10.5px;color:#b0b8c8;padding:0 2px;}'
  + '.ac-row.user .ac-t{text-align:right;}'

  /* Typing */
  + '#ac-typing{display:flex;align-items:flex-end;gap:9px;animation:ac-in .25s ease;}'
  + '.ac-tb{background:#fff;border-radius:16px;border-bottom-left-radius:4px;padding:16px 18px;display:flex;gap:5px;align-items:center;box-shadow:0 1px 3px rgba(0,0,0,0.06),0 0 0 1px rgba(0,0,0,0.04);}'
  + '.ac-d{width:7px;height:7px;border-radius:50%;background:#c8cfd9;animation:ac-bd 1.4s ease-in-out infinite;}'
  + '.ac-d:nth-child(2){animation-delay:.16s;}'
  + '.ac-d:nth-child(3){animation-delay:.32s;}'
  + '@keyframes ac-bd{0%,60%,100%{transform:translateY(0);background:#c8cfd9}30%{transform:translateY(-7px);background:var(--ac)}}'

  /* Quick replies */
  + '#ac-quick{padding:12px 18px;display:flex;gap:8px;flex-wrap:wrap;background:#f8f9fb;border-bottom:1px solid #f0f0f6;}'
  + '.ac-qb{padding:7px 14px;border-radius:20px;border:1.5px solid #e0e3eb;background:#fff;color:#4a5068;font-size:12.5px;font-weight:500;cursor:pointer;transition:all .15s;font-family:inherit;white-space:nowrap;letter-spacing:-0.1px;}'
  + '.ac-qb:hover{background:var(--ac);color:#fff;border-color:var(--ac);transform:translateY(-1px);box-shadow:0 4px 12px var(--ac-mid);}'

  /* Input */
  + '#ac-foot{padding:14px 16px;border-top:1px solid #f0f0f6;display:flex;gap:10px;align-items:flex-end;background:#fff;flex-shrink:0;}'
  + '#ac-input{flex:1;background:#f4f5f8;border:1.5px solid transparent;border-radius:12px;padding:11px 15px;font-size:14px;font-family:inherit;color:#1c1c2e;resize:none;outline:none;min-height:44px;max-height:110px;line-height:1.45;transition:all .2s;letter-spacing:-0.1px;}'
  + '#ac-input:focus{background:#fff;border-color:var(--ac-mid);box-shadow:0 0 0 4px var(--ac-soft);}'
  + '#ac-input::placeholder{color:#a8b0bf;}'
  + '#ac-send{width:44px;height:44px;border-radius:12px;background:var(--ac);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .2s;box-shadow:0 4px 12px var(--ac-mid);}'
  + '#ac-send:hover{transform:scale(1.07);box-shadow:0 6px 18px var(--ac-mid);}'
  + '#ac-send:disabled{opacity:0.45;cursor:not-allowed;transform:none;box-shadow:none;}'

  /* Branding */
  + '#ac-brand{text-align:center;padding:8px 0 10px;font-size:11px;color:#c8cfd9;background:#fff;flex-shrink:0;letter-spacing:0.1px;}'
  + '#ac-brand a{color:#b0b8c8;text-decoration:none;font-weight:500;transition:color .15s;}'
  + '#ac-brand a:hover{color:var(--ac);}'

  /* Mobile */
  + '@media(max-width:480px){#ac-window{width:calc(100vw - 16px);right:8px;bottom:84px;}#ac-launcher{bottom:18px;right:18px;}}';

  document.head.appendChild(css);

  var root = document.createElement('div');
  root.id = 'ac-root';
  root.innerHTML = ''
  /* Launcher */
  + '<button id="ac-launcher" aria-label="Chat">'
  + '<span id="ac-notif"></span>'
  + '<svg class="ic-chat" width="23" height="23" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  + '<svg class="ic-close" width="19" height="19" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="white" stroke-width="2.5" stroke-linecap="round"/></svg>'
  + '</button>'
  /* Window */
  + '<div id="ac-window" role="dialog">'
  /* Header */
  + '<div id="ac-head"><div id="ac-head-inner">'
  + '<div id="ac-avatar"><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="10" r="1" fill="white"/><circle cx="15" cy="10" r="1" fill="white"/><path d="M12 3C7.03 3 3 6.58 3 11c0 1.7.56 3.27 1.5 4.57L3 20l4.17-1.4A9.8 9.8 0 0012 20c4.97 0 9-3.58 9-8s-4.03-8-9-8z" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M9.5 13.5s.8 1.2 2.5 1.2 2.5-1.2 2.5-1.2" stroke="white" stroke-width="1.4" stroke-linecap="round"/></svg></div>'
  + '<div id="ac-head-text"><div id="ac-head-name">' + AGENT_NAME + '</div><div id="ac-status"><span id="ac-status-dot"></span>Online · Replies instantly</div></div>'
  + '</div></div>'
  /* Messages */
  + '<div id="ac-msgs"></div>'
  /* Quick replies */
  + '<div id="ac-quick">'
  + '<button class="ac-qb" data-msg="What are your delivery charges?">Delivery charges</button>'
  + '<button class="ac-qb" data-msg="Do you have cash on delivery?">Cash on delivery</button>'
  + '<button class="ac-qb" data-msg="What is your return policy?">Return policy</button>'
  + '<button class="ac-qb" data-msg="What sizes do you have?">Available sizes</button>'
  + '</div>'
  /* Input */
  + '<div id="ac-foot">'
  + '<textarea id="ac-input" placeholder="Type your message..." rows="1"></textarea>'
  + '<button id="ac-send"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>'
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
    var av = role === 'bot'
      ? '<div class="ac-av"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 3C7.03 3 3 6.58 3 11c0 1.57.47 3.03 1.28 4.28L3 19l4.3-1.14A9.8 9.8 0 0012 19c4.97 0 9-3.58 9-8s-4.03-8-9-8z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></div>'
      : '';
    var safe = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');
    row.innerHTML = av + '<div class="ac-bw"><div class="ac-b">' + safe + '</div><div class="ac-t">' + ts() + '</div></div>';
    msgsEl.appendChild(row);
    msgsEl.scrollTop = msgsEl.scrollHeight;
    msgCount++;
  }

  function showTyping() {
    var el = document.createElement('div');
    el.id = 'ac-typing';
    el.innerHTML = '<div class="ac-av" style="color:var(--ac)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 3C7.03 3 3 6.58 3 11c0 1.57.47 3.03 1.28 4.28L3 19l4.3-1.14A9.8 9.8 0 0012 19c4.97 0 9-3.58 9-8s-4.03-8-9-8z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></div><div class="ac-tb"><div class="ac-d"></div><div class="ac-d"></div><div class="ac-d"></div></div>';
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
      addMsg("Having trouble connecting. Please try again in a moment.", 'bot');
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
      if (msgCount === 0) setTimeout(function() { addMsg(WELCOME, 'bot'); }, 320);
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
  document.querySelectorAll('.ac-qb').forEach(function(btn) {
    btn.addEventListener('click', function() { send(this.dataset.msg); });
  });
  document.addEventListener('click', function(e) {
    if (isOpen && !win.contains(e.target) && !launcher.contains(e.target)) toggle();
  });
  setTimeout(function() { if (!isOpen) notif.classList.add('show'); }, 3000);

})();

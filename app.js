// app.js — chat logic and UI interactions (no external API calls)
(function () {
  // Markdown renderer for bot replies (safe by default: HTML disabled)
  const md = (window.markdownit && window.markdownit({ breaks: true, linkify: true })) || null;
  let msgCounter = 0;
  const messagesEl = document.getElementById("messages");
  const input = document.getElementById("inputMessage");
  const sendBtn = document.getElementById("sendBtn");

  const quickBtns = document.querySelectorAll(".quick button");
  quickBtns.forEach((b) =>
    b.addEventListener("click", () => {
      addUserMessage(b.dataset.quick);
    })
  );

  // --- fixed history data (hard-coded) ---
  const historyData = [
    {
      id: "h1",
      title: "Tư vấn nhanh - CNTT",
      snippet: "Các trường nổi bật: Bách Khoa, FPT, ĐHQG...",
      time: "2 ngày trước",
      messages: [
        { who: "user", text: "Mình muốn học ngành Công nghệ thông tin, có những trường nào phù hợp?" },
        { who: "bot", text: "Các trường nổi bật: Đại học Bách Khoa, Đại học FPT, Đại học CNTT - ĐHQG và nhiều trường kỹ thuật khác." },
        { who: "user", text: "Mức độ khó của ngành này như thế nào?" },
        { who: "bot", text: "CNTT đòi hỏi tư duy logic, toán cơ bản và khả năng lập trình. Nếu bạn thích giải quyết vấn đề thì phù hợp." },
        { who: "user", text: "Học ngành này mất bao lâu và bằng cấp ra sao?" },
        { who: "bot", text: "Thông thường 4 năm cho bằng Cử nhân; có chương trình 2+2, liên thông và cao học nếu bạn muốn chuyên sâu." },
        { who: "user", text: "Có những chuyên ngành nhỏ nào trong CNTT?" },
        { who: "bot", text: "Ví dụ: Khoa học máy tính, Kỹ thuật phần mềm, Mạng, An toàn thông tin, Trí tuệ nhân tạo, Dữ liệu lớn." },
        { who: "user", text: "Học phí trung bình cho CNTT là bao nhiêu?" },
        { who: "bot", text: "Tùy trường: công lập ~8-12tr/năm; trường tư/CT cao cấp ~40-120tr/năm." }
      ]
    },
    {
      id: "h2",
      title: "Học phí & Chi phí",
      snippet: "Học phí dao động 8-120 triệu/năm tùy trường",
      time: "1 tuần trước",
      messages: [
        { who: "user", text: "Chi phí học đại học khối A hết khoảng bao nhiêu?" },
        { who: "bot", text: "Tùy trường: công lập ~8-12tr, tư thục/CT chất lượng cao ~40-120tr/năm." },
        { who: "user", text: "Ngoài học phí còn chi phí nào khác?" },
        { who: "bot", text: "Chi phí ăn ở, tài liệu, đồng phục (nếu có), đi lại và hoạt động ngoại khóa — dao động nhiều theo nơi bạn sống." },
        { who: "user", text: "Có cách nào giảm chi phí không?" },
        { who: "bot", text: "Bạn có thể xin học bổng, ở ký túc xá, xin hợp tác thực tập trả lương hoặc học chương trình bán thời gian." },
        { who: "user", text: "Học bổng thường chi trả bao nhiêu?" },
        { who: "bot", text: "Có loại bao toàn phần, bán phần, hoặc giảm học phí theo phần trăm; tùy chương trình và điều kiện." },
        { who: "user", text: "Làm sao để tìm học bổng phù hợp?" },
        { who: "bot", text: "Theo dõi trang tuyển sinh của trường, liên hệ phòng QHDN, và tìm các quỹ học bổng từ doanh nghiệp, tổ chức." }
      ]
    },
    {
      id: "h3",
      title: "Học bổng",
      snippet: "Học bổng tuyển thẳng, khuyến khích, tài trợ doanh nghiệp",
      time: "3 tuần trước",
      messages: [
        { who: "user", text: "Mình muốn xin học bổng, điều kiện như thế nào?" },
        { who: "bot", text: "Điều kiện thường: điểm, bài luận, phỏng vấn; tùy chương trình." },
        { who: "user", text: "Có mẫu đơn chuẩn không?" },
        { who: "bot", text: "Mỗi trường có form riêng; thường yêu cầu CV, thư giới thiệu, bài luận và bảng điểm." },
        { who: "user", text: "Thời gian nộp hồ sơ học bổng là khi nào?" },
        { who: "bot", text: "Thường cùng kỳ tuyển sinh hoặc theo đợt riêng; kiểm tra lịch trên website trường." },
        { who: "user", text: "Nếu trượt học bổng thì sao?" },
        { who: "bot", text: "Bạn vẫn có thể nộp hồ sơ thường; hoặc tìm học bổng học kỳ sau dựa trên kết quả học tập." },
        { who: "user", text: "Cần chuẩn bị gì cho phỏng vấn học bổng?" },
        { who: "bot", text: "Ôn kỹ CV, mục tiêu học tập, các dự án/hoạt động tiêu biểu và luyện trả lời câu hỏi phỏng vấn." }
      ]
    }
  ];

  function renderHistoryList() {
    const container = document.getElementById("historyList");
    container.innerHTML = "";
    historyData.forEach((h) => {
      const card = document.createElement("button");
      card.className = "history-card";
      card.type = "button";
      card.tabIndex = 0;

      card.innerHTML = `
        <div class="history-avatar">TS</div>
        <div class="history-body">
          <p class="history-title">${escapeHtml(h.title)}</p>
          <div class="history-snippet">${escapeHtml(h.snippet)}</div>
        </div>
        <div class="history-meta">
          <div style="display:flex;align-items:center;gap:8px;">
            <div style="color:var(--muted);font-size:12px">${escapeHtml(h.time)}</div>
            <div class="badge">Mới</div>
          </div>
        </div>
      `;

      card.addEventListener("click", () => loadConversation(h.id));
      container.appendChild(card);
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function loadConversation(id) {
    const h = historyData.find((x) => x.id === id);
    if (!h) return;
    messagesEl.innerHTML = "";
    h.messages.forEach((m, idx) => renderMessage(m.text, m.who, { messageId: `${id}-${idx}` }));
  }

  // render history on load
  renderHistoryList();

  // start in full-screen chat mode by default
  document.body.classList.add("full-chat");
  const startBtn = document.getElementById("toggleFull");
  if (startBtn) startBtn.innerText = "Thoát toàn màn hình";
  setTimeout(() => scrollToBottom(), 140);

  // full-screen chat toggle
  const toggleBtn = document.getElementById("toggleFull");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const isFull = document.body.classList.toggle("full-chat");
      toggleBtn.innerText = isFull ? "Thoát toàn màn hình" : "Toàn màn hình";
      // give the browser a tick to recalc layout and scroll
      setTimeout(() => scrollToBottom(), 80);
    });
  }

  // New chat button: clear messages and seed a greeting
  const newChatBtn = document.getElementById("newChatBtn");
  if (newChatBtn) {
    newChatBtn.addEventListener("click", () => {
      messagesEl.innerHTML = "";
      renderMessage("Xin chào! Đây là một cuộc trò chuyện mới. Hãy đặt câu hỏi của bạn.", "bot", { messageId: `greet-${Date.now()}-${++msgCounter}` });
      input.focus();
    });
  }

  // exit full-screen on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.body.classList.contains("full-chat")) {
      document.body.classList.remove("full-chat");
      const btn = document.getElementById("toggleFull");
      if (btn) btn.innerText = "Toàn màn hình";
    }
  });

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function renderMessage(text, who = "bot", opts = {}) {
    const wrap = document.createElement("div");
    wrap.className = "msg " + (who === "user" ? "user" : "bot");
    const messageId = opts.messageId || `${who}-${Date.now()}-${++msgCounter}`;
    wrap.dataset.messageId = messageId;

    const bubble = document.createElement("div");
    bubble.className = "bubble " + (who === "user" ? "user" : "bot");
    if (who === "bot" && md) {
      // render markdown for bot
      try {
        bubble.innerHTML = md.render(String(text));
      } catch (_) {
        bubble.innerText = String(text);
      }
    } else {
      bubble.innerText = String(text);
    }

    wrap.appendChild(bubble);

    // metadata (timestamp)
    if (opts.showTime !== false) {
      const meta = document.createElement("div");
      meta.className = "meta";
      const now = new Date();
      meta.innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      wrap.appendChild(meta);
    }
    // rating (bot only)
    if (who === "bot") {
      wrap.appendChild(createRatingUI(messageId, getRating(messageId)));
    }
    messagesEl.appendChild(wrap);
    scrollToBottom();
  }

  // ===== Ratings in localStorage =====
  const RATINGS_KEY = "CHAT_RATINGS_V1";
  function loadRatings() {
    try { return JSON.parse(localStorage.getItem(RATINGS_KEY) || "{}"); } catch (_) { return {}; }
  }
  function saveRatings(map) { try { localStorage.setItem(RATINGS_KEY, JSON.stringify(map)); } catch (_) {} }
  function getRating(id) { const all = loadRatings(); return all[id] || 0; }
  function setRating(id, value) { const all = loadRatings(); all[id] = value; saveRatings(all); }

  function createRatingUI(messageId, currentValue = 0) {
    const cont = document.createElement("div");
    cont.className = "rating";
    for (let i = 1; i <= 5; i++) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "star" + (i <= currentValue ? " active" : "");
      b.textContent = "★";
      b.setAttribute("aria-label", `Đánh giá ${i} sao`);
      b.addEventListener("click", () => {
        setRating(messageId, i);
        Array.from(cont.querySelectorAll(".star")).forEach((el, idx) => {
          if (idx < i) el.classList.add("active"); else el.classList.remove("active");
        });
      });
      cont.appendChild(b);
    }
    return cont;
  }

  function showTyping() {
    const t = document.createElement("div");
    t.className = "msg bot typing-row";
    t.innerHTML =
      '<div class="bubble bot"><span class="typing"><span class="dot-typing"></span><span class="dot-typing"></span><span class="dot-typing"></span></span></div>';
    messagesEl.appendChild(t);
    scrollToBottom();
    return t;
  }

  function addUserMessage(text) {
    if (!text || !text.trim()) return;
    renderMessage(text.trim(), "user");
    input.value = "";
    updateSendState();

    // simulate bot thinking
    const tNode = showTyping();
    const prompt = text.trim();
    const key = getApiKey();
    if (key) {
      // Call Gemini API
      callGemini(prompt, key)
        .then((reply) => {
          tNode.remove();
          renderMessage(reply || "(Không có nội dung phản hồi)", "bot", { messageId: `ai-${Date.now()}-${++msgCounter}` });
        })
        .catch((err) => {
          console.error("Gemini API error:", err);
          tNode.remove();
          renderMessage(
            "(Không thể gọi API: " + (err && err.message ? err.message : "Lỗi không xác định") + ")\nMình sẽ trả lời tạm bằng nội dung tham khảo.",
            "bot"
          );
          renderMessage(generateBotReply(prompt), "bot", { showTime: false, messageId: `fb-${Date.now()}-${++msgCounter}` });
        });
    } else {
      // No API key -> fallback
      setTimeout(() => {
        tNode.remove();
        const reply = generateBotReply(prompt);
        renderMessage(reply, "bot", { messageId: `rb-${Date.now()}-${++msgCounter}` });
      }, 750 + Math.random() * 900);
    }
  }

  function generateBotReply(text) {
    const lower = text.toLowerCase();
    if (/cntt|công nghệ thông tin|\bit\b|it\b/.test(lower)) {
      return "Ngành Công nghệ thông tin rất phổ biến. Các trường nổi bật: Đại học Bách Khoa, Đại học FPT, Đại học CNTT - ĐHQG, cùng nhiều trường kỹ thuật khác. Bạn ưu tiên thành phố nào, học phí hay học bổng?";
    }
    if (/học phí|chi phí|bao nhiêu/.test(lower)) {
      return "Học phí dao động tùy trường: từ khoảng 8-12 triệu/năm (các trường công lập) đến 40-120 triệu/năm (các trường tư thục/đào tạo chất lượng cao). Bạn muốn mình liệt kê theo khu vực hay theo trường cụ thể?";
    }
    if (/học bổng|họcbổng|bổng/.test(lower)) {
      return "Học bổng thường chia làm: tuyển thẳng (điểm cao), khuyến khích học tập, và học bổng doanh nghiệp. Điều kiện: điểm, bài luận, phỏng vấn tùy chương trình. Bạn cần mẫu đơn hay điều kiện của trường cụ thể?";
    }
    if (/hồ sơ|thủ tục|xét tuyển/.test(lower)) {
      return "Thủ tục thông thường gồm: đơn đăng ký, bảng điểm/học bạ, chứng chỉ (nếu yêu cầu), giấy tờ cá nhân. Nhiều trường có xét tuyển học bạ hoặc xét tuyển theo kết quả thi. Bạn muốn checklist ngắn gọn không?";
    }
    return 'Mình chưa rõ lắm — bạn có thể hỏi cụ thể hơn (ví dụ: "trường A có ngành B không" hoặc "học phí ngành X ở trường Y là bao nhiêu"). Mình sẽ trả lời dựa trên thông tin tham khảo.';
  }

  // UI events
  sendBtn.addEventListener("click", () => addUserMessage(input.value));
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addUserMessage(input.value);
    }
  });

  // enable keyboard activation for quick items
  document.querySelectorAll(".conv-item, .quick button").forEach((el) =>
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter") el.click();
    })
  );

  // disable send when empty
  function updateSendState() {
    sendBtn.disabled = !input.value || !input.value.trim();
  }
  input.addEventListener("input", updateSendState);
  updateSendState();

  // seed conversation
  renderMessage("Xin chào! Mình là trợ lý tư vấn tuyển sinh. Bạn muốn hỏi về ngành học, học phí, học bổng hay thủ tục?", "bot", { messageId: `seed-${Date.now()}-${++msgCounter}` });

  // ========== Gemini API integration ==========
  const API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

  function getApiKey() {
    try {
      return localStorage.getItem("GEMINI_API_KEY") || "";
    } catch (_) {
      return "";
    }
  }

  function setApiKey(v) {
    try {
      if (v) localStorage.setItem("GEMINI_API_KEY", v);
      else localStorage.removeItem("GEMINI_API_KEY");
    } catch (_) {}
  }

  async function callGemini(userText, apiKey) {
    const SYSTEM_PROMPT = "Bạn là Chat Bot tuyển sinh của Học viện Công nghệ Bưu Chính Viễn Thông (PTIT). Nếu người dùng hỏi về trường khác, hãy trả lời: 'Tôi không biết do là chat bot của PTIT.'";
    const res = await fetch(`${API_ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }]
        },
        contents: [
          {
            role: "user",
            parts: [{ text: userText }]
          }
        ]
      })
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`HTTP ${res.status} ${res.statusText}: ${txt}`);
    }
    const data = await res.json();
    // Extract first candidate text
    const candidates = data && data.candidates ? data.candidates : [];
    if (!candidates.length) return "";
    const parts = (candidates[0].content && candidates[0].content.parts) || [];
    const text = parts.map((p) => p.text).filter(Boolean).join("\n");
    return text;
  }

  // UI: prompt for API key
  const configBtn = document.getElementById("configApi");
  if (configBtn) {
    configBtn.addEventListener("click", () => {
      const current = getApiKey();
      const v = window.prompt("Nhập Google Gemini API key (được lưu trong trình duyệt của bạn):", current || "");
      if (v !== null) {
        setApiKey(v.trim());
        alert(v.trim() ? "Đã lưu API key." : "Đã xoá API key.");
      }
    });
  }
})();

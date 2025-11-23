$(document).ready(function () {
    /* ---------- Calculator using AJAX (PHP) ---------- */
    $("#calcBtn").on("click", function () {

        const age = Number($("#age").val());
        const gender = $("#gender").val();
        const weight = Number($("#weight").val());
        const height = Number($("#height").val());
        const activity = Number($("#activity").val());

        if (!age || !gender || !weight || !height || !activity) {
            $("#results").text("⚠ Please fill all fields correctly.");
            return;
        }

        $.ajax({
            url: '/calorie-app/api/calc.php',
            type: "POST",
            dataType: "json",
            data: { age, gender, weight, height, activity },
            success: function (res) {
                $("#results").html(`
                    🧘 Maintenance: <strong>${res.maintenance}</strong> kcal/day<br>
                    🔻 Weight loss target: <strong>${res.loss}</strong> kcal/day<br>
                    ⚡ Weight gain target: <strong>${res.gain}</strong> kcal/day
                `);
            },
            error: function () {
                $("#results").text("❌ Server error — check calc.php path");
            }
        });

    });


/* ---------- Chatbot ---------- */
const chatToggle = document.getElementById('chatToggle');
const chatBox = document.getElementById('chatBox');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const chatSend = document.getElementById('chatSend');

let ttsAvailable = 'speechSynthesis' in window && typeof window.speechSynthesis.speak === 'function';

/* toggle open/close */
chatToggle.addEventListener('click', () => {
  const isOpen = chatBox.style.display === 'flex';
  if (isOpen) {
    chatBox.style.display = 'none';
    chatBox.setAttribute('aria-hidden','true');
  } else {
    chatBox.style.display = 'flex';         // ensure flex (so column layout works)
    chatBox.setAttribute('aria-hidden','false');
    // focus input for quick typing:
    setTimeout(()=>chatInput.focus(),120);
  }
});

/* helper to add messages */
function addMessage(kind, text) {
  const el = document.createElement('div');
  el.className = 'chat-message ' + (kind==='user' ? 'user' : 'bot');
  el.textContent = text;
  chatMessages.appendChild(el);
  // auto scroll
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

/* initial greeting */
addMessage('bot', "✨ Psst — I'm HealthyBot. Ask about activity levels, calories, or diet.");

/* core bot reply logic with short 3-4 word activity descriptions support */
function generateReply(msg) {
  const t = msg.trim().toLowerCase();

  // if user asks specifically for short descriptions:
  if (t.includes('activity') && (t.includes('short') || t.includes('3') || t.includes('3-4') || t.includes('describe'))) {
    // concise 3-4 word descriptions:
    return "Sedentary — little/no exercise\nLight — 1–3 days/week\nModerate — 3–5 days/week\nVery active — 6–7 days/week\nExtra active — heavy training/job";
  }

  // simpler keyword mapping
  if (t.includes('hello') || t.includes('hi')) return "Hey! Ready to stay active?";
  if (t.includes('calorie')) return "Calories = energy units. Balance intake.";
  if (t.includes('diet')) return "Balanced diet: fruits, protein, veggies.";
  if (t.includes('workout')) return "Combine cardio + strength training.";
  if (t.includes('sedentary')) return "Sedentary — little/no exercise";
  if (t.includes('light') || t.includes('lightly')) return "Light — 1–3 days/week";
  if (t.includes('moderate')) return "Moderate — 3–5 days/week";
  if (t.includes('very') || t.includes('active')) return "Very active — 6–7 days/week";
  if (t.includes('extra')) return "Extra active — heavy training/job";
  if (t.includes('activity levels') || t.includes('levels')) {
    // provide short descriptions (3-4 words)
    return "Sedentary — little/no exercise\nLight — 1–3 days/week\nModerate — 3–5 days/week\nVery active — 6–7 days/week\nExtra active — heavy training/job";
  }

  // default fallback
  return "Ask about activity levels, calories, workouts, or diet.";
}

/* speak helper */
function speak(text) {
  if (!ttsAvailable) return;
  try {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-US';
    utter.rate = 1;
    utter.pitch = 1;
    // split long replies into shorter utterances so TTS plays cleanly
    const chunks = text.split('\n');
    // cancel any current speech to avoid overlap
    window.speechSynthesis.cancel();
    chunks.forEach((c, i) => {
      const u = new SpeechSynthesisUtterance(c);
      u.lang = 'en-US';
      u.rate = 1;
      u.pitch = 1;
      // queue them in order
      if (i === 0) window.speechSynthesis.speak(u);
      else window.speechSynthesis.speak(u);
    });
  } catch (err) {
    console.warn('TTS failed', err);
  }
}

/* send flow */
function sendChat() {
  const text = chatInput.value.trim();
  if (!text) return;
  addMessage('user', text);
  chatInput.value = '';
  // small delay to feel natural
  setTimeout(() => {
    const reply = generateReply(text);
    addMessage('bot', reply);
    speak(reply);
  }, 400);
}

/* button & Enter handling */
chatSend.addEventListener('click', sendChat);
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    sendChat();
  } else if (e.key === 'Escape') {
    // quick hide
    chatBox.style.display = 'none';
    chatBox.setAttribute('aria-hidden','true');
    chatToggle.focus();
  }
});

/* Accessibility: allow toggle with keyboard (space/enter) */
chatToggle.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    chatToggle.click();
  }
});

/* If TTS blocked, show small console note */
if (!ttsAvailable) console.info('SpeechSynthesis not available — bot will not speak on this browser.');
});
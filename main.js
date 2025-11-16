// main.js
// 全体のロジック。data.js に定義された `cards` を参照します。

let pool = [];          // 出題候補プール
let currentCard = null;
let streak = 0;

const q = {
  packSelect: () => document.getElementById("pack-select"),
  raritySelect: () => document.getElementById("rarity-select"),
  classSelect: () => document.getElementById("class-select"),
  startBtn: () => document.getElementById("start-btn"),
  quizArea: () => document.getElementById("quiz-area"),
  audio: () => document.getElementById("audio"),
  volume: () => document.getElementById("volume"),
  answerIn: () => document.getElementById("answer-input"),
  submitBtn: () => document.getElementById("submit-btn"),
  result: () => document.getElementById("result"),
  streakEl: () => document.getElementById("streak"),
  currentCardIdEl: () => document.getElementById("current-card-id")
};

function init() {
  // ボタンイベント
  q().startBtn().addEventListener("click", startQuiz);
  q().submitBtn().addEventListener("click", checkAnswer);
  q().volume().addEventListener("input", e => { q().audio().volume = e.target.value; });
  // 4種の再生ボタン
  document.querySelectorAll(".voice-buttons .btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const type = btn.getAttribute("data-type");
      playVoice(type);
    });
  });

  // Enterで送信
  q().answerIn().addEventListener("keydown", e => {
    if (e.key === "Enter") checkAnswer();
  });

  // 初ボリューム
  q().audio().volume = q().volume().value;
}

function startQuiz() {
  const pack = q().packSelect().value;
  const rarity = q().raritySelect().value;
  const cls = q().classSelect().value;

  pool = cards.filter(card => {
    return (pack === "all" || card.pack === pack) &&
           (rarity === "all" || card.rarity === rarity) &&
           (cls === "all" || card.class === cls);
  });

  if (!pool.length) {
    alert("選択条件に合うカードがありません。条件を見直してください。");
    return;
  }

  // show quiz
  q().quizArea().style.display = "block";
  nextQuestion();
}

function nextQuestion() {
  // pick random
  currentCard = pool[Math.floor(Math.random() * pool.length)];
  q().currentCardIdEl().innerText = currentCard.id;
  q().result().innerText = "";
  q().answerIn().value = "";
}

function playVoice(type) {
  if (!currentCard) return alert("まず『クイズ開始』してください");
  const src = currentCard.voices[type];
  if (!src) return alert("その種別の音声がありません");
  q().audio().src = src;
  q().audio().play();
}

// convert input to normalized hiragana for comparison
function toHira(str) {
  if (!str) return "";
  // Normalize width and compose
  let s = str.normalize("NFKC");
  // convert Katakana -> Hiragana by codepoint subtraction
  // handle fullwidth katakana range
  s = s.replace(/[\u30A1-\u30F6]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0x60));
  // lowercase ASCII fullwidth to ASCII etc already handled by NFKC
  // remove punctuation and spaces
  s = s.replace(/[^ぁ-ん一-龥\u3000-\u303F\u3040-\u309F]/g, ""); // keep hiragana & kanji (kanji left intentionally)
  return s;
}

function isCorrect(userInput, card) {
  const user = toHira(userInput);
  // Check readings array (normalize each reading)
  if (Array.isArray(card.reading)) {
    for (const r of card.reading) {
      if (!r) continue;
      const rr = toHira(r);
      if (user === rr) return true;          // exact match
      if (user && rr && user.includes(rr)) return true; // user includes reading
      if (rr && user.includes(rr)) return true;
    }
  }
  // fallback: compare with name (漢字含む) - allow user to input kanji directly
  if (card.name && userInput === card.name) return true;
  // partial match: allow entering short forms (e.g., 入力に '乙姫' が入っていたらOK)
  if (card.name && userInput.includes(card.name)) return true;
  return false;
}

function checkAnswer() {
  if (!currentCard) return alert("問題がセットされていません。開始してください");
  const input = q().answerIn().value.trim();
  const res = q().result();
  if (!input) { alert("解答を入力してください"); return; }

  if (isCorrect(input, currentCard)) {
    streak++;
    res.innerText = "正解！ 🎉";
  } else {
    streak = 0;
    res.innerText = `不正解… 正解: ${currentCard.name}`;
  }
  q().streakEl().innerText = streak;
  // 自動で次問に進む（1.5s後）
  setTimeout(nextQuestion, 1200);
}

// 初期化
document.addEventListener("DOMContentLoaded", init);

// main.js
// data.js に定義された `cards` を使用

let pool = [];
let currentCard = null;
let streak = 0;

// DOMヘルパ
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
  q.startBtn().addEventListener("click", startQuiz);
  q.submitBtn().addEventListener("click", checkAnswer);
  q.volume().addEventListener("input", e => {
    q.audio().volume = e.target.value;
  });

  document.querySelectorAll(".voice-buttons .btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const type = btn.getAttribute("data-type");
      playVoice(type);
    });
  });

  q.answerIn().addEventListener("keydown", e => {
    if (e.key === "Enter") checkAnswer();
  });

  q.audio().volume = q.volume().value;
}

function startQuiz() {
  const pack = q.packSelect().value;
  const rarity = q.raritySelect().value;
  const cls = q.classSelect().value;

  pool = cards.filter(card => {
    return (pack === "all" || card.pack === pack) &&
           (rarity === "all" || card.rarity === rarity) &&
           (cls === "all" || card.class === cls);
  });

  if (!pool.length) {
    alert("選択条件に合うカードがありません");
    return;
  }

  q.quizArea().style.display = "block";
  nextQuestion();
}

function nextQuestion() {
  currentCard = pool[Math.floor(Math.random() * pool.length)];

  // 答えを隠す
  q.currentCardIdEl().innerText = "";

  q.result().innerText = "";
  q.answerIn().value = "";
}

function playVoice(type) {
  if (!currentCard) {
    alert("まず『クイズ開始』を押してください");
    return;
  }
  const src = currentCard.voices[type];
  if (!src) {
    alert("この種類のボイスはありません");
    return;
  }
  q.audio().src = src;
  q.audio().play();
}

// ▼▼▼▼ 正規化（ひらがな・カタカナ対応） ▼▼▼▼
function toHira(str) {
  if (!str) return "";

  let s = str.normalize("NFKC");

  // カタカナ → ひらがな
  s = s.replace(/[\u30A1-\u30FA]/g, ch =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  );

  // 漢字・ひらがな以外を削除
  s = s.replace(/[^ぁ-ん一-龥]/g, "");

  return s;
}
// ▲▲▲▲ 正規化ここまで ▲▲▲▲


// ▼▼▼ 完全修正版の回答判定 ▼▼▼
function isCorrect(userInput, card) {
  const userH = toHira(userInput);     // ひらがな化
  const cardNameH = toHira(card.name); // カード名をひらがな化

  if (!userH) return false;

  // 読み（reading）の完全一致（ひらがな）
  if (Array.isArray(card.reading)) {
    for (const r of card.reading) {
      const rr = toHira(r);
      if (userH === rr) return true;
    }
  }

  // カード名（漢字）の完全一致（そのまま）
  if (userInput === card.name) return true;

  // カード名の「ひらがな化」が一致 → カタカナ名も正解！
  // 例：「ケルベロス」→「けるべろす」
  if (userH === cardNameH) return true;

  return false;
}
// ▲▲▲ 回答判定ここまで ▲▲▲


function checkAnswer() {
  if (!currentCard) {
    alert("問題がセットされていません");
    return;
  }

  const input = q.answerIn().value.trim();
  const res = q.result();

  if (!input) {
    alert("解答を入力してください");
    return;
  }

  if (isCorrect(input, currentCard)) {
    streak++;
    res.innerText = "正解！ 🎉";
  } else {
    streak = 0;
    res.innerText = `不正解… 正解: ${currentCard.name}`;
  }

  q.streakEl().innerText = streak;

  setTimeout(nextQuestion, 1200);
}

document.addEventListener("DOMContentLoaded", init);

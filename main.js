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

  q.currentCardIdEl().innerText = "";
  q.result().innerText = "";
  q.answerIn().value = "";

  // 既存の音声停止
  stopAudio();
}

// === 音声停止処理 ===
function stopAudio() {
  const audio = q.audio();
  audio.pause();
  audio.currentTime = 0;
}

// === 音声再生（②・⑤・⑥完全修正） ===
function playVoice(type) {
  if (!currentCard) {
    alert("まず『クイズ開始』を押してください");
    return;
  }

  const src = currentCard.voices?.[type];

  if (!src) {
    alert("この種類のボイスはありません");
    return;
  }

  const audio = q.audio();

  // 先に停止
  stopAudio();

  // ソースをセット
  audio.src = src;

  // load → play の順で確実に再生
  audio.load();
  audio.play().catch(() => {
    console.warn("自動再生に失敗しました（ユーザ操作が必要な場合あり）");
  });
}


// ▼▼▼ 入力正規化（③完全対応） ▼▼▼

// 全角 → 半角
function toHalfWidth(str) {
  return str.replace(/[！-～]/g, s =>
    String.fromCharCode(s.charCodeAt(0) - 0xFEE0)
  ).replace(/　/g, " ");
}

// カタカナ → ひらがな
function kataToHira(str) {
  return str.replace(/[\u30a1-\u30f6]/g, s =>
    String.fromCharCode(s.charCodeAt(0) - 0x60)
  );
}

// 入力を正規化
function normalize(str) {
  if (!str) return "";
  str = str.trim();
  str = toHalfWidth(str);
  str = kataToHira(str);
  return str.toLowerCase();
}

// === 正解判定（③修正版） ===
function isCorrect(userInput, card) {
  const user = normalize(userInput);
  const readings = card.reading.map(r => normalize(r));
  return readings.includes(user);
}
// ▲▲▲ 入力正規化ここまで ▲▲▲


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

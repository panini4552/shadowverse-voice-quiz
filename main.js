// main.js
// 全体のロジック。data.js に定義された `cards` を参照します。

let pool = [];          // 出題候補プール
let currentCard = null;
let streak = 0;

// DOM取得をまとめたヘルパ
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
  q.startBtn().addEventListener("click", startQuiz);
  q.submitBtn().addEventListener("click", checkAnswer);
  q.volume().addEventListener("input", e => { q.audio().volume = e.target.value; });

  // 4種の音声ボタン
  document.querySelectorAll(".voice-buttons .btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const type = btn.getAttribute("data-type");
      playVoice(type);
    });
  });

  // Enterで送信
  q.answerIn().addEventListener("keydown", e => {
    if (e.key === "Enter") checkAnswer();
  });

  // 初期音量
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
    alert("選択条件に合うカードがありません。条件を見直してください。");
    return;
  }

  q.quizArea().style.display = "block";
  nextQuestion();
}

function nextQuestion() {
  currentCard = pool[Math.floor(Math.random() * pool.length)];
  q.currentCardIdEl().innerText = currentCard.id;
  q.result().innerText = "";
  q.answerIn().value = "";
}

function playVoice(type) {
  if (!currentCard) {
    alert("まず『クイズ開始』してください");
    return;
  }

  const src = currentCard.voices[type];
  if (!src) {
    alert("その種別の音声がありません");
    return;
  }

  q.audio().src = src;
  q.audio().play();
}

// ひらがな正規化
function toHira(str) {
  if (!str) return "";
  // Normalize width
  let s = str.normalize("NFKC");

  // Katakana → Hiragana
  s = s.replace(/[\u30A1-\u30F6]/g, ch =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  );

  // 不要記号削除
  s = s.replace(/[^ぁ-ん一-龥]/g, "");

  return s;
}

function isCorrect(userInput, card) {
  const user = toHira(userInput);

  // 読みチェック
  if (Array.isArray(card.reading)) {
    for (const r of card.reading) {
      if (!r) continue;

      const rr = toHira(r);
      if (user === rr) return true;
      if (user && rr && user.includes(rr)) return true;
      if (rr && rr.includes(user)) return true;
    }
  }

  // 漢字完全一致
  if (card.name && userInput === card.name) return true;

  // 一部一致（例：乙姫 → 海底都市王・乙姫 OK）
  if (card.name && card.name.includes(userInput)) return true;

  return false;
}

function checkAnswer() {
  if (!currentCard) {
    alert("問題がセットされていません。開始してください");
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

  // 自動で次へ
  setTimeout(nextQuestion, 1200);
}

document.addEventListener("DOMContentLoaded", init);

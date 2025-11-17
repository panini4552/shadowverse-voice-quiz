let filteredCards = [];
let currentCard = null;
let streak = 0;

/* ================================
   文字正規化
================================ */
function normalize(str) {
    if (!str) return "";
    return str
        .toLowerCase()
        .normalize("NFKC")
        .replace(/[ぁ-ん]/g, s => String.fromCharCode(s.charCodeAt(0) + 0x60));
}

/* ================================
   toggle-btn の ON/OFF（複数選択）
================================ */
document.addEventListener("click", (e) => {
    if (e.target.classList.contains("toggle-btn")) {
        e.target.classList.toggle("selected");
    }
});

/* ================================
   選択された toggle-btn を取得
================================ */
function getSelectedFilters(groupClass) {
    const list = [...document.querySelectorAll(`.${groupClass} .toggle-btn.selected`)]
        .map(btn => btn.dataset.value);

    // 何も選ばれていなければ「全て許可」
    if (list.length === 0) {
        return [...document.querySelectorAll(`.${groupClass} .toggle-btn`)]
            .map(btn => btn.dataset.value);
    }
    return list;
}

/* ================================
   画像表示（なければ「準備中」）
================================ */
function showCardImage(card) {
    const imgEl = document.getElementById("resultImage");
    const placeholder = document.getElementById("imagePlaceholder");

    imgEl.style.display = "none";
    placeholder.style.display = "none";

    const imgPath = `${card.folder}/${card.id}.png`;

    fetch(imgPath, { method: "HEAD" })
        .then(res => {
            if (res.ok) {
                imgEl.src = imgPath;
                imgEl.style.display = "block";
            } else {
                placeholder.style.display = "flex";
            }
        })
        .catch(() => placeholder.style.display = "flex");
}

/* ================================
   次の問題
================================ */
function nextQuestion() {
    document.getElementById("result").textContent = "";
    document.getElementById("next-btn").style.display = "none";
    document.getElementById("resultImage").style.display = "none";
    document.getElementById("imagePlaceholder").style.display = "none";
    document.getElementById("answer-input").value = "";

    currentCard = filteredCards[Math.floor(Math.random() * filteredCards.length)];
}

/* ================================
   クイズ開始
================================ */
document.getElementById("start-btn").onclick = () => {

    const packs = getSelectedFilters("filter-pack");
    const rarities = getSelectedFilters("filter-rarity");
    const classes = getSelectedFilters("filter-class");

    filteredCards = cards.filter(c =>
        packs.includes(c.pack) &&
        rarities.includes(c.rarity) &&
        classes.includes(c.class)
    );

    if (filteredCards.length === 0) {
        alert("条件に一致するカードがありません");
        return;
    }

    document.getElementById("quiz-area").style.display = "block";
    nextQuestion();
};

/* ================================
   音声再生
================================ */
/* ================================
   音声再生（voices を直接使用）
================================ */
document.querySelectorAll(".voice-buttons .btn").forEach(btn => {
    btn.onclick = () => {
        if (!currentCard) return;

        const type = btn.dataset.type;  // fanfare / attack / evolve / destroy

        const audio = document.getElementById("audio");
        audio.volume = document.getElementById("volume").value;

        // 🔥 voices から直接パスを読む
        audio.src = currentCard.voices[type];

        audio.play().catch(err => {
            console.error("音声再生失敗:", err, audio.src);
        });
    };
});

/* ================================
   回答チェック
================================ */
document.getElementById("submit-btn").onclick = () => {
    if (!currentCard) return;

    const input = normalize(document.getElementById("answer-input").value);
    const readings = currentCard.reading.map(r => normalize(r));
    const correct = readings.some(r => r === input);

    const resultEl = document.getElementById("result");

    if (correct) {
        resultEl.textContent = "正解！";
        resultEl.style.color = "green";

        streak++;
        document.getElementById("streak").textContent = streak;

        showCardImage(currentCard);

        document.getElementById("share-x").href =
            `https://twitter.com/intent/tweet?text=Shadowverseボイスクイズで${streak}問連続正解しました！`;
        document.getElementById("share-x").style.display = "inline-block";

    } else {
        resultEl.textContent = `不正解… 正解：${currentCard.name}`;
        resultEl.style.color = "red";

        streak = 0;
        document.getElementById("streak").textContent = "0";

        showCardImage(currentCard);
        document.getElementById("share-x").style.display = "none";
    }

    document.getElementById("next-btn").style.display = "inline-block";
};

/* ================================
   次の問題
================================ */
document.getElementById("next-btn").onclick = nextQuestion;

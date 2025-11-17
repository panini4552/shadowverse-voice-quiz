let filteredCards = [];
let currentCard = null;
let streak = 0;

// ■正規化：ひらがな・カタカナ・全角/半角を統一
function normalize(str) {
    if (!str) return "";

    return str
        .toLowerCase()
        .normalize("NFKC")
        .replace(/[ぁ-ん]/g, s => String.fromCharCode(s.charCodeAt(0) + 0x60)); // ひらがな→カタカナ
}

// ■複数選択値の取得
function getSelectedValues(selectEl) {
    return [...selectEl.selectedOptions].map(o => o.value);
}

// ■カード画像表示（無ければ準備中）
function showCardImage(card) {
    const imgEl = document.getElementById("resultImage");
    const placeholder = document.getElementById("imagePlaceholder");

    imgEl.style.display = "none";
    placeholder.style.display = "none";

    // 音声フォルダと同じ場所に cardName.png がある前提
    const folder = card.folder;
    const imgPath = `${folder}/${card.id}.png`;

    fetch(imgPath, { method: "HEAD" })
        .then(res => {
            if (res.ok) {
                imgEl.src = imgPath;
                imgEl.style.display = "block";
            } else {
                placeholder.style.display = "block";
            }
        })
        .catch(() => placeholder.style.display = "block");
}

// ■次の問題を出す
function nextQuestion() {
    document.getElementById("result").textContent = "";
    document.getElementById("next-btn").style.display = "none";
    document.getElementById("resultImage").style.display = "none";
    document.getElementById("imagePlaceholder").style.display = "none";

    const rand = Math.random();
    currentCard = filteredCards[Math.floor(rand * filteredCards.length)];

    document.getElementById("current-card-id").textContent = currentCard.id;
}

// ■開始ボタン
document.getElementById("start-btn").onclick = () => {
    const packs = getSelectedValues(document.getElementById("pack-select"));
    const rarities = getSelectedValues(document.getElementById("rarity-select"));
    const classes = getSelectedValues(document.getElementById("class-select"));

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

// ■音声再生ボタン
document.querySelectorAll(".voice-buttons .btn").forEach(btn => {
    btn.onclick = () => {
        const type = btn.dataset.type;
        const audio = document.getElementById("audio");
        audio.volume = document.getElementById("volume").value;
        audio.src = `${currentCard.folder}/${currentCard.id}_${type}.mp3`;
        audio.play();
    };
});

// ■回答
document.getElementById("submit-btn").onclick = () => {
    const input = normalize(document.getElementById("answer-input").value);

    const readings = currentCard.reading.map(r => normalize(r));
    const correct = readings.some(r => r === input);

    const resultEl = document.getElementById("result");

    if (correct) {
        resultEl.textContent = "正解！";
        resultEl.style.color = "green";

        streak++;
        document.getElementById("streak").textContent = streak;

        // 画像表示
        showCardImage(currentCard);

        // X共有リンク
        const shareUrl =
            `https://twitter.com/intent/tweet?text=Shadowverseボイスクイズで${streak}問連続正解しました！`;
        document.getElementById("share-x").href = shareUrl;
        document.getElementById("share-x").style.display = "inline-block";

        document.getElementById("next-btn").style.display = "inline-block";

    } else {
        resultEl.textContent = `不正解… 正解：${currentCard.name}`;
        resultEl.style.color = "red";
        streak = 0;
        document.getElementById("streak").textContent = "0";

        // 画像表示
        showCardImage(currentCard);

        document.getElementById("next-btn").style.display = "inline-block";
    }
};

// ■次の問題へ
document.getElementById("next-btn").onclick = () => {
    nextQuestion();
};

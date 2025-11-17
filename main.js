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
   filter-item の ON/OFF
================================ */
document.querySelectorAll(".filter-item").forEach(item => {
    item.addEventListener("click", () => {
        item.classList.toggle("selected");
    });
});

/* ================================
   選択された filter-item を取得
================================ */
function getSelectedFilter(selector) {
    const list = [...document.querySelectorAll(`${selector} .filter-item.selected`)]
        .map(el => el.dataset.value);

    // 何も選ばれていない → そのグループの全カードを許可
    if (list.length === 0) {
        return [...document.querySelectorAll(`${selector} .filter-item`)]
            .map(el => el.dataset.value);
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
    const packs = getSelectedFilter("#pack-filter");
    const rarities = getSelectedFilter("#rarity-filter");
    const classes = getSelectedFilter("#class-filter");

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
document.querySelectorAll(".voice-buttons .btn").forEach(btn => {
    btn.onclick = () => {
        if (!currentCard) return;
        const type = btn.dataset.type;

        const audio = document.getElementById("audio");
        audio.volume = document.getElementById("volume").value;
        audio.src = `${currentCard.folder}/${currentCard.id}_${type}.mp3`;
        audio.play();
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
// ▼ フィルタートグル操作（複数選択）
document.addEventListener("click", (e) => {
    if (e.target.classList.contains("toggle-btn")) {
        e.target.classList.toggle("selected");
        updateFilters();  // ← フィルター反映処理（ユーザーの環境に合わせて）
    }
});
function getSelectedFilters(groupClass) {
    return [...document.querySelectorAll(`.${groupClass} .toggle-btn.selected`)]
        .map(btn => btn.dataset.value);
}

function updateFilters() {
    const selectedClasses = getSelectedFilters("filter-class");
    const selectedRarities = getSelectedFilters("filter-rarity");
    const selectedPacks = getSelectedFilters("filter-pack");

    console.log("クラス:", selectedClasses);
    console.log("レアリティ:", selectedRarities);
    console.log("パック:", selectedPacks);

    // ★ ここでフィルター結果を使い、カードの検索処理を更新する
}


/* ================================
   必須ライブラリ（JSZip）
   <script src="https://cdn.jsdelivr.net/npm/jszip@3.7.1/dist/jszip.min.js"></script>
================================ */
let filteredCards = [];
let currentCard = null;
let streak = 0;

function normalize(str) {
    if (!str) return "";
    return str
        .toLowerCase()
        .normalize("NFKC")
        .replace(/[ぁ-ん]/g, s => String.fromCharCode(s.charCodeAt(0) + 0x60));
}

/* ZIPから画像と音声を読み取る */
async function loadZipAssets(card) {
    const zipPath = `voices/${card.pack}/${card.rarity}/${card.id}/${card.id}.zip`;

    const response = await fetch(zipPath);
    if (!response.ok) {
        console.error("ZIPが読み込めません:", zipPath);
        return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    const assets = {
        image: null,
        voices: {
            fanfare: null,
            attack: null,
            destroy: null,
            evolve: null,
            others: [] // その他ボイス
        }
    };

    const files = Object.keys(zip.files);

    for (const filename of files) {
        const lower = filename.toLowerCase();

        // 画像（png）
        if (lower.endsWith(".png") && !assets.image) {
            const blob = await zip.files[filename].async("blob");
            assets.image = URL.createObjectURL(blob);
        }

        // ボイス（mp3）
        if (lower.endsWith(".mp3")) {
            const blob = await zip.files[filename].async("blob");
            const url = URL.createObjectURL(blob);

            if (lower.includes("fanfare")) assets.voices.fanfare = url;
            else if (lower.includes("attack")) assets.voices.attack = url;
            else if (lower.includes("destroy")) assets.voices.destroy = url;
            else if (lower.includes("evolve")) assets.voices.evolve = url;
            else assets.voices.others.push(url); // その他ボイス
        }
    }

    return assets;
}

/* ▼ クイズ開始 */
document.getElementById("start-btn").addEventListener("click", () => {
    const packs = getSelectedValues("pack-filter");
    const rarities = getSelectedValues("rarity-filter");
    const classes = getSelectedValues("class-filter");

    filteredCards = cards.filter(c =>
        packs.includes(c.pack) &&
        rarities.includes(c.rarity) &&
        classes.includes(c.class)
    );

    if (filteredCards.length === 0) {
        alert("条件に一致するカードがありません");
        return;
    }

    streak = 0;
    document.getElementById("streak").textContent = streak;
    document.getElementById("quiz-area").style.display = "block";

    nextQuestion();
});

/* 値取得 */
function getSelectedValues(id) {
    return [...document.querySelectorAll(`#${id} .toggle-btn.selected`)]
        .map(btn => btn.dataset.value);
}

/* ▼ 次の問題 */
async function nextQuestion() {
    currentCard = filteredCards[Math.floor(Math.random() * filteredCards.length)];

    const assets = await loadZipAssets(currentCard);
    if (!assets) {
        console.warn("ZIPロード失敗。次の問題を出します");
        return nextQuestion();
    }

    // 画像
    const img = document.getElementById("resultImage");
    img.style.display = assets.image ? "block" : "none";
    img.src = assets.image;

    document.getElementById("imagePlaceholder").style.display =
        assets.image ? "none" : "flex";

    // ボイスボタンにURL登録
    document.querySelectorAll(".voice-buttons .btn").forEach(btn => {
        const type = btn.dataset.type;
        btn.dataset.url = assets.voices[type] || "";
    });

    // その他ボイスボタン生成
    setupOtherVoices(assets.voices.others);

    document.getElementById("result").textContent = "";
    document.getElementById("next-btn").style.display = "none";
}

/* ▼ その他ボイスボタンを生成 */
function setupOtherVoices(list) {
    const container = document.querySelector(".voice-buttons");

    // 既存のその他ボタンを削除
    document.querySelectorAll(".other-voice-btn").forEach(e => e.remove());

    list.forEach(url => {
        const btn = document.createElement("button");
        btn.className = "btn other-voice-btn";
        btn.textContent = "その他";
        btn.dataset.url = url;

        container.appendChild(btn);
    });
}

/* ▼ ボイス再生 */
document.addEventListener("click", e => {
    if (e.target.matches(".voice-buttons .btn")) {
        const url = e.target.dataset.url;
        if (!url) return;

        const audio = document.getElementById("audio");
        audio.volume = document.getElementById("volume").value;
        audio.src = url;
        audio.play();
    }
});

/* ▼ 回答チェック */
document.getElementById("submit-btn").addEventListener("click", () => {
    const input = normalize(document.getElementById("answer-input").value);
    const names = currentCard.reading.map(r => normalize(r));

    if (names.includes(input)) {
        document.getElementById("result").textContent = "正解！";
        streak++;
        document.getElementById("streak").textContent = streak;
    } else {
        document.getElementById("result").textContent = "不正解… (" + currentCard.name + ")";
        streak = 0;
        document.getElementById("streak").textContent = streak;
    }

    document.getElementById("next-btn").style.display = "inline-block";
});

/* ▼ 次ボタン */
document.getElementById("next-btn").addEventListener("click", nextQuestion);

/* ▼ トグルボタン */
document.addEventListener("click", e => {
    if (e.target.classList.contains("toggle-btn")) {
        e.target.classList.toggle("selected");
    }
});

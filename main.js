/* ============================================
   Shadowverse ボイス当てクイズ + フィルター対応版
============================================ */

/* ====== 変数 ====== */
let cards = [];             // data.js 読み込み
let filteredCards = [];     // フィルタ後
let currentCard = null;
let streak = 0;

// ZIP キャッシュ
const zipCache = {};


/* ======================================
   ZIP 読み込み（初回のみ）
====================================== */
async function loadZip(card) {
    if (zipCache[card.id]) return zipCache[card.id];

    const zip = await JSZip.loadAsync(await fetch(card.zip).then(r => r.arrayBuffer()));
    zipCache[card.id] = zip;
    return zip;
}

/* ======================================
   ZIP内のファイルを自動検出
====================================== */
async function extractCardAssets(card) {
    const zip = await loadZip(card);

    const assets = {
        image: null,
        fanfare: null,
        attack: null,
        evolve: null,
        destroy: null,
        others: []
    };

    const name = card.id;
    const files = Object.keys(zip.files);

    for (const fileName of files) {
        const lower = fileName.toLowerCase();

        /* ---------- 画像 ---------- */
        if (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".webp")) {
            assets.image = await zip.files[fileName].async("blob");
            continue;
        }

        /* ---------- ボイス ---------- */
        if (lower.endsWith(".mp3") || lower.endsWith(".ogg") || lower.endsWith(".wav")) {

            if (lower.includes(name.toLowerCase() + "_fanfare")) {
                assets.fanfare = URL.createObjectURL(await zip.files[fileName].async("blob"));
                continue;
            }
            if (lower.includes(name.toLowerCase() + "_attack")) {
                assets.attack = URL.createObjectURL(await zip.files[fileName].async("blob"));
                continue;
            }
            if (lower.includes(name.toLowerCase() + "_evolve")) {
                assets.evolve = URL.createObjectURL(await zip.files[fileName].async("blob"));
                continue;
            }
            if (lower.includes(name.toLowerCase() + "_destroy")) {
                assets.destroy = URL.createObjectURL(await zip.files[fileName].async("blob"));
                continue;
            }

            if (lower.startsWith(name.toLowerCase() + "_")) {
                const blob = await zip.files[fileName].async("blob");
                assets.others.push({
                    name: fileName.replace(name + "_", "").replace(/\.(mp3|ogg|wav)$/i, ""),
                    url: URL.createObjectURL(blob)
                });
            }
        }
    }

    return assets;
}

/* ======================================
   カード画像の表示
====================================== */
async function showCard(card) {
    const assets = await extractCardAssets(card);

    if (assets.image) {
        const url = URL.createObjectURL(assets.image);
        document.getElementById("cardImage").src = url;
    }
}

/* ======================================
   ボイス再生
====================================== */
async function playVoice(card, type) {
    const assets = await extractCardAssets(card);

    let url = null;

    switch (type) {
        case "fanfare": url = assets.fanfare; break;
        case "attack":  url = assets.attack; break;
        case "evolve":  url = assets.evolve; break;
        case "destroy": url = assets.destroy; break;

        case "other":
            if (assets.others.length === 0) return;
            const pick = assets.others[Math.floor(Math.random() * assets.others.length)];
            url = pick.url;
            break;
    }

    if (!url) return;

    const audio = new Audio(url);
    audio.play();
}

/* ======================================
   フィルター処理
====================================== */
function applyFilters() {
    const classBtn = document.querySelector(".filter-btn.active[data-class]");
    const rarityBtn = document.querySelector(".filter-btn.active[data-rarity]");
    const envBtn = document.querySelector(".filter-btn.active[data-env]");

    const classFilter = classBtn ? classBtn.dataset.class : null;
    const rarityFilter = rarityBtn ? rarityBtn.dataset.rarity : null;
    const envFilter = envBtn ? true : false;

    filteredCards = cards.filter(card => {
        if (classFilter && card.class !== classFilter) return false;
        if (rarityFilter && card.rarity !== rarityFilter) return false;

        // environment フィルター
        if (envFilter && !card.environment) return false;

        return true;
    });

    // 空なら全カード
    if (filteredCards.length === 0) {
        filteredCards = cards.slice();
    }

    nextQuestion();
}

/* ======================================
   フィルターボタンのクリック制御
====================================== */
function setupFilterButtons() {
    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.addEventListener("click", () => {

            // environment は ON/OFF
            if (btn.dataset.env !== undefined) {
                btn.classList.toggle("active");
                applyFilters();
                return;
            }

            // class / rarity は排他
            const type = btn.dataset.class ? "class" : "rarity";
            const selector = `[data-${type}]`;

            document.querySelectorAll(selector).forEach(b => b.classList.remove("active"));

            btn.classList.add("active");
            applyFilters();
        });
    });
}

/* ======================================
   クイズ部分
====================================== */

function startQuiz() {
    streak = 0;
    nextQuestion();
}

function nextQuestion() {
    if (filteredCards.length === 0) filteredCards = cards.slice();

    currentCard = filteredCards[Math.floor(Math.random() * filteredCards.length)];
    showCard(currentCard);

    document.getElementById("status").textContent =
        `現在: ${streak} 連続正解中`;
}

function answer(cardId) {
    if (cardId === currentCard.id) {
        streak++;
        document.getElementById("status").textContent =
            `正解！ 現在 ${streak} 連続正解中`;
        nextQuestion();
    } else {
        document.getElementById("status").textContent =
            `不正解… 連続正解は ${streak} で終了`;
        streak = 0;
        nextQuestion();
    }
}

/* ======================================
   初期化
====================================== */
window.onload = () => {
    cards = window.SV_DATA; // data.js 読み込み
    filteredCards = cards.slice();

    setupFilterButtons();
    startQuiz();
};

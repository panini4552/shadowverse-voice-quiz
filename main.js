/* ============================================
   Shadowverse ボイス当てクイズ — 完成版 main.js
   - ZIP対応 / 複数フィルター / 重複無し出題
   - 要: JSZip (html で読み込み済み)
============================================ */

let cards = [];               // data.js から読み込み
let remainingCards = [];      // 今回の挑戦で残っているカード
let totalQuestions = 0;
let currentIndex = 0;
let currentCard = null;
let streak = 0;

// キャッシュ: cardId -> { imageUrl, voices: { fanfare, attack, evolve, destroy, other: [{name,url}] } }
const cardResourceCache = new Map();

/* ================================
   ユーティリティ
================================ */
function normalize(str) {
    if (!str) return "";
    return str.toLowerCase().normalize("NFKC").replace(/[ぁ-ん]/g, s => String.fromCharCode(s.charCodeAt(0) + 0x60));
}
function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/* ================================
   UI: select-all ボタン（トグル）
   data-target の値は "filter-pack" など（HTML 側に合わせる）
================================ */
document.addEventListener("click", (e) => {
    const el = e.target;

    // toggle-btn のクリック（HTML は .toggle-btn を使っている想定）
    if (el.classList && el.classList.contains("toggle-btn")) {
        el.classList.toggle("selected");
        return;
    }

    // select-all ボタン（1回押すと全選択、再押下で全解除）
    if (el.classList && el.classList.contains("select-all-btn")) {
        const target = el.dataset.target; // 例: "filter-pack" (この名前は class か id どちらでも対応)
        if (!target) return;
        // try id then class
        let group = document.getElementById(target) || document.querySelector(`.${target}`);
        // allow both 'filter-pack' (class) and 'pack-filter' (id) by trying common variants:
        if (!group) {
            group = document.getElementById(target.replace(/^filter-/, "") + "-filter") || document.querySelector(`.${target.replace(/^filter-/, "")}-filter`);
        }
        if (!group) return;

        const buttons = [...group.querySelectorAll(".toggle-btn")];
        if (buttons.length === 0) return;

        const allSelected = buttons.every(b => b.classList.contains("selected"));
        if (allSelected) {
            buttons.forEach(b => b.classList.remove("selected"));
        } else {
            buttons.forEach(b => b.classList.add("selected"));
        }
        return;
    }
});

/* ================================
   フィルタ取得ヘルパー
   groupSelector: class name (例: "filter-pack") or id (例: "pack-filter")
   → group の中の .toggle-btn.selected の data-value を返す
   - 何も選ばれていない場合は group 内のすべての data-value を返す（＝全選択扱い）
================================ */
function getSelectedFilters(groupSelector) {
    // try id or class (groupSelector might be like "filter-pack" or "pack-filter")
    let group = document.getElementById(groupSelector) || document.querySelector(`.${groupSelector}`);
    if (!group) {
        // fallback common patterns
        group = document.getElementById(groupSelector.replace(/^filter-/, "") + "-filter") || document.querySelector(`.${groupSelector.replace(/^filter-/, "")}-filter`);
    }
    if (!group) return [];

    const selected = [...group.querySelectorAll(".toggle-btn.selected")].map(btn => btn.dataset.value);

    if (selected.length === 0) {
        // return all values in group
        return [...group.querySelectorAll(".toggle-btn")].map(btn => btn.dataset.value);
    }
    return selected;
}

/* ================================
   カードリソースの読み込み（ZIP優先、フォールバックあり）
   戻り値: { imageUrl, voices: {fanfare,attack,evolve,destroy, other: [{name,url}] } }
   キャッシュあり
================================ */
async function loadCardResources(card) {
    if (cardResourceCache.has(card.id)) return cardResourceCache.get(card.id);

    const result = {
        imageUrl: null,
        voices: { fanfare: null, attack: null, evolve: null, destroy: null, other: [] }
    };

    // Try ZIP (prefer card.zip if present)
    const zipCandidates = [];
    if (card.zip) zipCandidates.push(card.zip);
    // also try convention: packages/{id}.zip
    zipCandidates.push(`packages/${card.id}.zip`);

    let zipLoaded = null;
    for (const z of zipCandidates) {
        try {
            const resp = await fetch(z);
            if (!resp.ok) continue;
            const ab = await resp.arrayBuffer();
            zipLoaded = await JSZip.loadAsync(ab);
            break;
        } catch (e) {
            // continue to next
        }
    }

    if (zipLoaded) {
        const files = Object.keys(zipLoaded.files);
        for (const path of files) {
            const entry = zipLoaded.files[path];
            if (entry.dir) continue;
            const lower = path.toLowerCase();
            // image
            if (!result.imageUrl && (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".webp"))) {
                try {
                    const blob = await entry.async("blob");
                    result.imageUrl = URL.createObjectURL(blob);
                } catch (e) {}
                continue;
            }
            // audio
            if (lower.endsWith(".mp3") || lower.endsWith(".ogg") || lower.endsWith(".wav")) {
                try {
                    const blob = await entry.async("blob");
                    const url = URL.createObjectURL(blob);
                    const base = path.split('/').pop().toLowerCase();
                    if (base.includes(`${card.id.toLowerCase()}_fanfare`)) result.voices.fanfare = url;
                    else if (base.includes(`${card.id.toLowerCase()}_attack`)) result.voices.attack = url;
                    else if (base.includes(`${card.id.toLowerCase()}_evolve`)) result.voices.evolve = url;
                    else if (base.includes(`${card.id.toLowerCase()}_destroy`)) result.voices.destroy = url;
                    else if (base.startsWith(card.id.toLowerCase() + "_")) {
                        result.voices.other.push({ name: base.replace(new RegExp(`^${card.id.toLowerCase()}_`), "").replace(/\.(mp3|ogg|wav)$/, ""), url });
                    } else {
                        result.voices.other.push({ name: base.replace(/\.(mp3|ogg|wav)$/, ""), url });
                    }
                } catch (e) {}
            }
        }
    } else {
        // Fallback: try data.js voices paths (if provided) and folder images
        if (card.voices) {
            for (const k of ["fanfare", "attack", "evolve", "destroy"]) {
                if (card.voices[k]) {
                    try {
                        // check HEAD
                        const head = await fetch(card.voices[k], { method: "HEAD" });
                        if (head.ok) result.voices[k] = card.voices[k];
                    } catch (e) {}
                }
            }
            // try to find other voices by naming convention if possible (best-effort)
            const folder = card.folder ? card.folder.trim() : "";
            if (folder) {
                // try a few common patterns (best-effort only)
                const maybeNames = ["_battle", "_laugh", "_other", "_1"];
                for (const nm of maybeNames) {
                    const p = `${folder}/${card.id}${nm}.mp3`;
                    try {
                        const h = await fetch(p, { method: "HEAD" });
                        if (h.ok) result.voices.other.push({ name: p.split('/').pop().slice(0, -4), url: p });
                    } catch (e) {}
                }
            }
        }
        // image fallback attempts
        const imgCandidates = [];
        if (card.folder) {
            imgCandidates.push(`${card.folder}/${card.id}.png`);
            imgCandidates.push(`${card.folder}/${card.id}.jpg`);
            imgCandidates.push(`${card.folder}/card.png`);
        }
        if (card.zip) {
            // sometimes zip path's parent folder may contain image
            const parent = card.zip.replace(/\/[^\/]+$/, "");
            imgCandidates.push(`${parent}/${card.id}.png`);
            imgCandidates.push(`${parent}/card.png`);
        }
        imgCandidates.push(`${card.id}.png`);
        for (const p of imgCandidates) {
            try {
                const r = await fetch(p, { method: "HEAD" });
                if (r.ok) {
                    result.imageUrl = p;
                    break;
                }
            } catch (e) {}
        }
    }

    cardResourceCache.set(card.id, result);
    return result;
}

/* ================================
   画像表示
================================ */
function showCardImage(card) {
    const imgEl = document.getElementById("resultImage");
    const placeholder = document.getElementById("imagePlaceholder");
    imgEl.style.display = "none";
    placeholder.style.display = "none";

    loadCardResources(card).then(res => {
        if (res.imageUrl) {
            imgEl.src = res.imageUrl;
            imgEl.style.display = "block";
        } else {
            placeholder.style.display = "flex";
        }
    }).catch(() => placeholder.style.display = "flex");
}

/* ================================
   その他ボイスリスト表示
================================ */
function populateOtherVoicesUI(card) {
    const listEl = document.getElementById("other-voices-list");
    listEl.innerHTML = "";
    listEl.style.display = "none";

    loadCardResources(card).then(res => {
        const items = res.voices.other || [];
        if (!items.length) return;
        items.forEach(it => {
            const btn = document.createElement("button");
            btn.className = "voice-item btn";
            btn.textContent = it.name;
            btn.onclick = () => {
                const audio = document.getElementById("audio");
                audio.volume = document.getElementById("volume").value;
                audio.src = it.url;
                audio.play().catch(err => console.error(err));
            };
            listEl.appendChild(btn);
        });
        listEl.style.display = "block";
    }).catch(err => console.error("other list err", err));
}

/* ================================
   ボイス再生（既存ボタン）
================================ */
document.addEventListener("click", async (e) => {
    const el = e.target;
    if (!el.classList) return;

    // voice-buttons .btn の再生
    if (el.closest && el.closest(".voice-buttons") && el.dataset.type) {
        const type = el.dataset.type;
        if (!currentCard) return;
        const audio = document.getElementById("audio");
        audio.volume = document.getElementById("volume").value;

        if (type === "other") {
            // toggle list visibility
            const listEl = document.getElementById("other-voices-list");
            if (listEl.style.display === "block") listEl.style.display = "none";
            else populateOtherVoicesUI(currentCard);
            return;
        }

        try {
            const res = await loadCardResources(currentCard);
            let src = res.voices[type];
            // fallback to card.voices path if exists
            if (!src && currentCard.voices && currentCard.voices[type]) src = currentCard.voices[type].trim();
            if (!src) {
                console.warn("no voice", type, currentCard.id);
                return;
            }
            audio.src = src;
            audio.play().catch(err => console.error("play err", err));
        } catch (err) {
            console.error(err);
        }
    }
});

/* ================================
   フィルター適用ロジック & UI取得
   - パック / rarity / class / tags (OR 条件 per filter group)
================================ */
function collectSelectedArray(groupSelector) {
    // groupSelector is like "filter-pack" or "filter-rarity" or "filter-class" or "filter-tags"
    let group = document.getElementById(groupSelector) || document.querySelector(`.${groupSelector}`);
    if (!group) {
        group = document.getElementById(groupSelector.replace(/^filter-/, "") + "-filter") || document.querySelector(`.${groupSelector.replace(/^filter-/, "")}-filter`);
    }
    if (!group) return [];
    const vals = [...group.querySelectorAll(".toggle-btn.selected")].map(b => b.dataset.value);
    if (vals.length === 0) {
        // none selected -> treat as "all allowed" -> return all available values
        return [...group.querySelectorAll(".toggle-btn")].map(b => b.dataset.value);
    }
    return vals;
}

/* ================================
   クイズ開始（start-btn）
================================ */
document.getElementById("start-btn").onclick = () => {
    // get selected filters
    const packs = collectSelectedArray("filter-pack");
    const rarities = collectSelectedArray("filter-rarity");
    const classes = collectSelectedArray("filter-class");
    const tags = collectSelectedArray("filter-tags");

    // filter cards
    let filtered = cards.filter(c =>
        packs.includes(c.pack) &&
        rarities.includes(c.rarity) &&
        classes.includes(c.class)
    );

    // tags: OR condition — keep card if card.tags has intersection with selected tags
    if (tags && tags.length > 0) {
        filtered = filtered.filter(c => {
            if (!c.tags || c.tags.length === 0) {
                // if card has no tags, treat as not matching selected tag set -> but because collectSelectedArray returns all when none selected, this is okay
                return tags.some(t => (c.tags || []).includes(t));
            }
            return c.tags.some(t => tags.includes(t));
        });
    }

    if (filtered.length === 0) {
        alert("条件に一致するカードがありません");
        return;
    }

    // prepare remainingCards
    remainingCards = shuffleArray(filtered.slice());
    totalQuestions = remainingCards.length;
    currentIndex = 0;
    streak = 0;
    document.getElementById("streak").textContent = "0";

    document.getElementById("quiz-area").style.display = "block";

    // init progress UI
    document.getElementById("totalQuestions").textContent = totalQuestions;
    document.getElementById("currentIndex").textContent = currentIndex;
    document.getElementById("remainingCount").textContent = remainingCards.length;

    nextQuestion();
};

/* ================================
   次の問題（remainingCards から一つ取り出し）
================================ */
function nextQuestion() {
    document.getElementById("result").textContent = "";
    document.getElementById("next-btn").style.display = "none";
    document.getElementById("resultImage").style.display = "none";
    document.getElementById("imagePlaceholder").style.display = "none";
    document.getElementById("answer-input").value = "";
    document.getElementById("other-voices-list").style.display = "none";

    if (remainingCards.length === 0) {
        document.getElementById("result").textContent = "全問終了しました！";
        document.getElementById("currentIndex").textContent = totalQuestions;
        document.getElementById("remainingCount").textContent = 0;
        return;
    }

    currentCard = remainingCards.shift();
    currentIndex++;
    updateProgressUI();

    // preload resources in background
    loadCardResources(currentCard).then(() => {}).catch(e => console.warn("load err", e));
}

/* ================================
   回答チェック
================================ */
document.getElementById("submit-btn").onclick = () => {
    if (!currentCard) return;

    const input = normalize(document.getElementById("answer-input").value);
    const readings = (currentCard.reading || []).map(r => normalize(r));
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
    updateProgressUI();
};

/* ================================
   次へボタン
================================ */
document.getElementById("next-btn").onclick = nextQuestion;

/* ================================
   update progress UI
================================ */
function updateProgressUI() {
    document.getElementById("currentIndex").textContent = currentIndex;
    document.getElementById("totalQuestions").textContent = totalQuestions;
    document.getElementById("remainingCount").textContent = Math.max(0, remainingCards.length);
}

/* ================================
   初期化（ページロード時）
================================ */
window.addEventListener("load", () => {
    // load card data from data.js (global variable)
    cards = window.cards || window.SV_DATA || [];

    // ensure toggle-btn click toggles selected class
    document.querySelectorAll(".toggle-btn").forEach(btn => {
        btn.addEventListener("click", () => btn.classList.toggle("selected"));
    });

    // wire select-all buttons (also possible via delegated handler but ensure here)
    document.querySelectorAll(".select-all-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const target = btn.dataset.target;
            let group = document.getElementById(target) || document.querySelector(`.${target}`);
            if (!group) {
                group = document.getElementById(target.replace(/^filter-/, "") + "-filter") || document.querySelector(`.${target.replace(/^filter-/, "")}-filter`);
            }
            if (!group) return;
            const buttons = [...group.querySelectorAll(".toggle-btn")];
            const allSelected = buttons.every(b => b.classList.contains("selected"));
            if (allSelected) buttons.forEach(b => b.classList.remove("selected"));
            else buttons.forEach(b => b.classList.add("selected"));
        });
    });

    // wire voice buttons - handled by delegated click listener earlier

    // initial UI state: hide quiz-area
    document.getElementById("quiz-area").style.display = "none";
});

/* ============================================
   main.js — ZIP内の画像/音声を自動読込する最終版
   - 要: JSZip を HTML で読み込み済み
   - data.js の cards 配列を利用
============================================ */

let cards = []; // data.js から読み込まれる想定
let remainingCards = [];
let totalQuestions = 0;
let currentIndex = 0;
let currentCard = null;
let streak = 0;

// cache: cardId -> { imageUrl, voices: { fanfare, attack, evolve, destroy, other: [ { name, url } ] } }
const cardResourceCache = new Map();

/* ================================
   ユーティリティ
================================ */
function normalize(str) {
    if (!str) return "";
    return str
        .toLowerCase()
        .normalize("NFKC")
        .replace(/[ぁ-ん]/g, s => String.fromCharCode(s.charCodeAt(0) + 0x60))
        .replace(/\s+/g, "");
}

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/* ================================
   DOM ヘルパー（柔軟に group を探す）
   groupKey: "filter-pack" / "pack-filter" / "#pack-filter" / ".filter-pack"
================================ */
function findGroup(groupKey) {
    if (!groupKey) return null;
    // direct id
    if (groupKey.startsWith("#")) {
        return document.getElementById(groupKey.slice(1));
    }
    // direct class
    if (groupKey.startsWith(".")) {
        return document.querySelector(groupKey);
    }
    // id or class as given
    let el = document.getElementById(groupKey);
    if (el) return el;
    el = document.querySelector(`.${groupKey}`);
    if (el) return el;
    // try alternate patterns: "filter-pack" -> "pack-filter" or ".pack-filter"
    const alt = groupKey.replace(/^filter-/, "");
    el = document.getElementById(`${alt}-filter`) || document.querySelector(`.${alt}-filter`);
    if (el) return el;
    // try adding "filter-" prefix if missing
    if (!groupKey.startsWith("filter-")) {
        el = document.getElementById(`filter-${groupKey}`) || document.querySelector(`.filter-${groupKey}`);
        if (el) return el;
    }
    return null;
}

/* ================================
   collectSelectedArray: groupKey を渡すと選択値配列を返す
   - 何も選択されていない場合は group 内の全 data-value を返す（＝全選択扱い）
================================ */
function collectSelectedArray(groupKey) {
    const group = findGroup(groupKey);
    if (!group) return [];
    const selectedBtns = [...group.querySelectorAll(".toggle-btn.active")];
    if (selectedBtns.length === 0) {
        // return all values
        return [...group.querySelectorAll(".toggle-btn")].map(b => b.dataset.value);
    }
    return selectedBtns.map(b => b.dataset.value);
}

/* ================================
   toggle の一元化（.toggle-btn を .active 切替）
================================ */
document.addEventListener("click", (e) => {
    const t = e.target;
    if (!t || !t.classList) return;

    // toggle buttons
    if (t.classList.contains("toggle-btn")) {
        t.classList.toggle("active");
        return;
    }

    // select-all buttons
    if (t.classList.contains("select-all-btn")) {
        const target = t.dataset.target;
        if (!target) return;
        const group = findGroup(target);
        if (!group) return;
        const buttons = [...group.querySelectorAll(".toggle-btn")];
        if (buttons.length === 0) return;
        const allActive = buttons.every(b => b.classList.contains("active"));
        buttons.forEach(b => b.classList.toggle("active", !allActive));
        return;
    }

    // voice-buttons (delegation handled later in specifically wired listener)
});

/* ================================
   ZIP から資源をロードする関数
   - card.zip を fetch -> JSZip.loadAsync -> ファイル走査して image と voices を判定
   - 返り値: { imageUrl, voices: { fanfare, attack, evolve, destroy, other: [{name,url}] } }
   - 失敗時は可能な限り空オブジェクトを返す
================================ */
async function loadCardResources(card) {
    if (!card || !card.id) return null;
    if (cardResourceCache.has(card.id)) return cardResourceCache.get(card.id);

    const result = {
        imageUrl: null,
        voices: { fanfare: null, attack: null, evolve: null, destroy: null, other: [] }
    };

    // zip path available?
    const zipPath = card.zip ? card.zip : null;
    if (!zipPath) {
        cardResourceCache.set(card.id, result);
        return result;
    }

    try {
        const resp = await fetch(zipPath);
        if (!resp.ok) {
            console.warn("zip fetch failed", zipPath, resp.status);
            cardResourceCache.set(card.id, result);
            return result;
        }
        const ab = await resp.arrayBuffer();
        const zip = await JSZip.loadAsync(ab);

        // iterate files
        const fileNames = Object.keys(zip.files);
        for (const path of fileNames) {
            try {
                const entry = zip.files[path];
                if (entry.dir) continue;
                const lower = path.toLowerCase();
                // image detection: id.png/jpg/jpeg/webp
                const idLower = card.id.toLowerCase();
                if (!result.imageUrl && (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".webp"))) {
                    // prefer file that contains the id in name, else first image
                    if (lower.includes(idLower) || !result.imageUrl) {
                        const blob = await entry.async("blob");
                        result.imageUrl = URL.createObjectURL(blob);
                        // don't continue here; still want to gather voices
                        continue;
                    }
                }

                // audio detection
                if (lower.endsWith(".mp3") || lower.endsWith(".ogg") || lower.endsWith(".wav")) {
                    const blob = await entry.async("blob");
                    const url = URL.createObjectURL(blob);
                    const base = path.split("/").pop().toLowerCase(); // filename only
                    // heuristics: try to detect voice type from filename
                    if (base.includes("_attack") || base.includes("attack")) {
                        if (!result.voices.attack) result.voices.attack = url;
                    } else if (base.includes("_evolve") || base.includes("evolve")) {
                        if (!result.voices.evolve) result.voices.evolve = url;
                    } else if (base.includes("_destroy") || base.includes("destroy") || base.includes("dead") || base.includes("death")) {
                        if (!result.voices.destroy) result.voices.destroy = url;
                    } else if (base.includes("_fanfare") || base.includes("play") || base.includes("fanfare")) {
                        // "play" often corresponds to fanfare
                        if (!result.voices.fanfare) result.voices.fanfare = url;
                    } else {
                        // if filename starts with id_, treat as other; else push as generic other
                        const prettyName = base.replace(new RegExp(`^${card.id.toLowerCase()}_?`), "").replace(/\.(mp3|ogg|wav)$/, "");
                        result.voices.other.push({ name: prettyName || base, url });
                    }
                }
            } catch (e) {
                console.warn("zip entry read err", path, e);
            }
        }

        // final heuristics: if fanfare empty but there is an audio named like `${id}_play` or `${id}_01`, already handled above
        // If some canonical types still missing, try to salvage from "other" by checking their names
        if (!result.voices.fanfare) {
            const found = result.voices.other.find(o => /play|fanfare|enter|summon|sample|01/.test(o.name));
            if (found) {
                result.voices.fanfare = found.url;
                // remove from other
                result.voices.other = result.voices.other.filter(o => o !== found);
            }
        }

        // cache and return
        cardResourceCache.set(card.id, result);
        return result;

    } catch (err) {
        console.error("loadCardResources error", card.id, err);
        cardResourceCache.set(card.id, result);
        return result;
    }
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
        if (res && res.imageUrl) {
            imgEl.src = res.imageUrl;
            imgEl.style.display = "block";
        } else {
            placeholder.style.display = "block";
            placeholder.textContent = "画像なし";
        }
    }).catch(() => {
        placeholder.style.display = "block";
        placeholder.textContent = "画像読み込みエラー";
    });
}

/* ================================
   その他ボイス UI を作る
================================ */
function populateOtherVoicesUI(card) {
    const listEl = document.getElementById("other-voices-list");
    listEl.innerHTML = "";
    listEl.style.display = "none";

    loadCardResources(card).then(res => {
        const items = res && res.voices ? res.voices.other || [] : [];
        if (!items.length) return;
        items.forEach(it => {
            const btn = document.createElement("button");
            btn.className = "voice-item btn";
            btn.textContent = it.name || "その他";
            btn.addEventListener("click", () => {
                const audio = document.getElementById("audio");
                audio.volume = parseFloat(document.getElementById("volume").value || 1);
                audio.src = it.url;
                audio.play().catch(err => console.warn("play err", err));
            });
            listEl.appendChild(btn);
        });
        listEl.style.display = "block";
    }).catch(err => {
        console.warn("populateOtherVoicesUI err", err);
    });
}

/* ================================
   voice-buttons の再生ハンドラ（委譲）
================================ */
document.querySelector(".voice-buttons").addEventListener("click", async (e) => {
    const btn = e.target;
    if (!btn || !btn.dataset) return;
    const type = btn.dataset.type;
    if (!type) return;
    if (!currentCard) return;

    const audio = document.getElementById("audio");
    audio.volume = parseFloat(document.getElementById("volume").value || 1);

    if (type === "other") {
        const listEl = document.getElementById("other-voices-list");
        // toggle display: if shown, hide; else build and show
        if (listEl.style.display === "block") {
            listEl.style.display = "none";
        } else {
            populateOtherVoicesUI(currentCard);
        }
        return;
    }

    try {
        const res = await loadCardResources(currentCard);
        let src = res && res.voices ? res.voices[type] : null;
        // fallback: if type 'fanfare' but res.voices.fanfare empty, try to use first of other
        if (!src && type === "fanfare" && res && res.voices && res.voices.other && res.voices.other.length) {
            src = res.voices.other[0].url;
        }
        if (!src) {
            console.warn("no voice for type", type, currentCard.id);
            return;
        }
        audio.src = src;
        audio.play().catch(err => console.warn("play err", err));
    } catch (err) {
        console.error("voice play err", err);
    }
});

/* ================================
   フィルタ収集 & クイズ開始
================================ */
document.getElementById("start-btn").addEventListener("click", () => {
    // collect filters (if none selected, collectSelectedArray returns all values in group)
    const packs = collectSelectedArray("filter-pack");
    const rarities = collectSelectedArray("filter-rarity");
    const classes = collectSelectedArray("filter-class");
    const tags = collectSelectedArray("filter-tags");

    // filter cards: each group is OR within group, AND across groups
    let filtered = (cards || []).filter(c => {
        const okPack = packs.length ? packs.includes(c.pack) : true;
        const okRarity = rarities.length ? rarities.includes(c.rarity) : true;
        const okClass = classes.length ? classes.includes(c.class) : true;

        // tags: if tags group exists but card has no tags -> only match if tags selection is "all" (handled by collectSelectedArray)
        let okTag = true;
        if (tags && tags.length) {
            // if card.tags absent -> treat as no match
            if (!c.tags || c.tags.length === 0) {
                okTag = tags.length === 0; // but collectSelectedArray returns all when none selected so this will usually be true
            } else {
                okTag = c.tags.some(t => tags.includes(t));
            }
        }
        return okPack && okRarity && okClass && okTag;
    });

    if (!filtered || filtered.length === 0) {
        alert("条件に一致するカードがありません");
        return;
    }

    remainingCards = shuffleArray(filtered.slice());
    totalQuestions = remainingCards.length;
    currentIndex = 0;
    streak = 0;
    currentCard = null;

    document.getElementById("streak").textContent = "0";
    document.getElementById("totalQuestions").textContent = totalQuestions;
    document.getElementById("currentIndex").textContent = currentIndex;
    document.getElementById("remainingCount").textContent = remainingCards.length;

    document.getElementById("quiz-area").style.display = "block";

    nextQuestion();
});

/* ================================
   次の問題
================================ */
function nextQuestion() {
    document.getElementById("result").textContent = "";
    document.getElementById("next-btn").style.display = "none";
    document.getElementById("resultImage").style.display = "none";
    document.getElementById("imagePlaceholder").style.display = "none";
    document.getElementById("answer-input").value = "";
    document.getElementById("other-voices-list").style.display = "none";

    if (!remainingCards || remainingCards.length === 0) {
        document.getElementById("result").textContent = "全問終了しました！";
        document.getElementById("currentIndex").textContent = totalQuestions;
        document.getElementById("remainingCount").textContent = 0;
        return;
    }

    currentCard = remainingCards.shift();
    currentIndex++;
    updateProgressUI();

    // preload resources (non-blocking)
    loadCardResources(currentCard).then(() => {
        // resources loaded — nothing else needed right now
    }).catch(err => {
        console.warn("preload err", err);
    });
}

/* ================================
   回答チェック
================================ */
document.getElementById("submit-btn").addEventListener("click", () => {
    if (!currentCard) return;

    const inputRaw = document.getElementById("answer-input").value || "";
    const input = normalize(inputRaw.trim());
    document.getElementById("answer-input").value = "";

    const readings = (currentCard.reading || []).map(r => normalize(r));
    const acceptedNames = [normalize(currentCard.name)].concat(readings);

    const correct = acceptedNames.some(r => r === input);

    const resultEl = document.getElementById("result");
    if (correct) {
        resultEl.textContent = "正解！";
        resultEl.style.color = "green";
        streak++;
        document.getElementById("streak").textContent = streak;
        // show image
        showCardImage(currentCard);
        // show share link (X)
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
});

/* ================================
   次へボタン
================================ */
document.getElementById("next-btn").addEventListener("click", nextQuestion);

/* ================================
   進捗更新
================================ */
function updateProgressUI() {
    document.getElementById("currentIndex").textContent = currentIndex;
    document.getElementById("totalQuestions").textContent = totalQuestions;
    document.getElementById("remainingCount").textContent = Math.max(0, remainingCards.length);
}

/* ================================
   初期化
================================ */
window.addEventListener("load", () => {
    // global cards from data.js
    cards = window.cards || window.SV_DATA || [];

    // ensure toggle-btn has click behavior if JS didn't handle delegation for some reason (defensive)
    document.querySelectorAll(".toggle-btn").forEach(btn => {
        // don't add duplicated listeners — rely on delegation above
        // but ensure initial aria/role if desired
    });

    // hide quiz area initially
    const quizArea = document.getElementById("quiz-area");
    if (quizArea) quizArea.style.display = "none";
});

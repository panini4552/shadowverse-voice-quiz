/* ============================================
   main.js — 安全化・整合性強化版
============================================ */

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
        .replace(/[・\s\-\ー＿／,\.!！?？'’"”“]/g, "")
        .replace(/[　・‐―－]/g, "");
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
================================ */
function findGroup(groupKey) {
    if (!groupKey) return null;
    if (groupKey.startsWith("#")) {
        return document.getElementById(groupKey.slice(1));
    }
    if (groupKey.startsWith(".")) {
        return document.querySelector(groupKey);
    }
    let el = document.getElementById(groupKey);
    if (el) return el;
    el = document.querySelector(`.${groupKey}`);
    if (el) return el;
    const alt = groupKey.replace(/^filter-/, "");
    el = document.getElementById(`${alt}-filter`) || document.querySelector(`.${alt}-filter`);
    if (el) return el;
    if (!groupKey.startsWith("filter-")) {
        el = document.getElementById(`filter-${groupKey}`) || document.querySelector(`.filter-${groupKey}`);
        if (el) return el;
    }
    return null;
}

/* ================================
   collectSelectedArray
   - 実装: 選択された .toggle-btn.active の data-value を返す
   - 選択が0個の場合は空配列を返す（start ボタン側で空配列は「全選択扱い」されます）
================================ */
function collectSelectedArray(groupKey) {
    const group = findGroup(groupKey);
    if (!group) return [];
    const selectedBtns = [...group.querySelectorAll(".toggle-btn.active")];
    if (selectedBtns.length === 0) {
        return [];
    }
    return selectedBtns.map(b => b.dataset.value);
}

/* ================================
   トグル系イベント（委譲）
================================ */
document.addEventListener("click", (e) => {
    const t = e.target;
    if (!t || !t.classList) return;

    if (t.classList.contains("toggle-btn")) {
        t.classList.toggle("active");
        return;
    }

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
});

/* ================================
   ZIP から資源をロードする関数（堅牢化）
================================ */
async function loadCardResources(card) {
    if (!card || !card.id) return null;
    if (cardResourceCache.has(card.id)) return cardResourceCache.get(card.id);

    const result = {
        imageUrl: null,
        voices: { fanfare: null, attack: null, evolve: null, destroy: null, other: [] }
    };

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

        const fileNames = Object.keys(zip.files);
        for (const path of fileNames) {
            try {
                const entry = zip.files[path];
                if (entry.dir) continue;
                const lower = path.toLowerCase();
                const idLower = (card.id || "").toLowerCase();

                // 画像
                if (!result.imageUrl && (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".webp"))) {
                    if (lower.includes(idLower) || !result.imageUrl) {
                        const blob = await entry.async("blob");
                        result.imageUrl = URL.createObjectURL(blob);
                        // continue to collect audio as well
                        continue;
                    }
                }

                // 音声
                if (lower.endsWith(".mp3") || lower.endsWith(".ogg") || lower.endsWith(".wav")) {
                    const blob = await entry.async("blob");
                    const url = URL.createObjectURL(blob);
                    const base = path.split("/").pop().toLowerCase();

                    if (base.includes("_attack") || base.includes("attack")) {
                        if (!result.voices.attack) result.voices.attack = url;
                    } else if (base.includes("_evolve") || base.includes("evolve")) {
                        if (!result.voices.evolve) result.voices.evolve = url;
                    } else if (base.includes("_destroy") || base.includes("destroy") || base.includes("dead") || base.includes("death")) {
                        if (!result.voices.destroy) result.voices.destroy = url;
                    } else if (base.includes("_fanfare") || base.includes("play") || base.includes("fanfare")) {
                        if (!result.voices.fanfare) result.voices.fanfare = url;
                    } else {
                        const prettyName = base.replace(new RegExp(`^${(card.id || "").toLowerCase()}_?`), "").replace(/\.(mp3|ogg|wav)$/, "");
                        result.voices.other.push({ name: prettyName || base, url });
                    }
                }
            } catch (e) {
                console.warn("zip entry read err", path, e);
            }
        }

        if (!result.voices.fanfare) {
            const found = result.voices.other.find(o => /play|fanfare|enter|summon|sample|01/.test(o.name));
            if (found) {
                result.voices.fanfare = found.url;
                result.voices.other = result.voices.other.filter(o => o !== found);
            }
        }

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
    if (!imgEl || !placeholder) return;

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
    if (!listEl) return;
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
                if (!audio) return;
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
   voice-buttons 再生ハンドラ（登録は DOMContentLoaded 内で）
================================ */
// 登録は初期化時に行う（下）

/* ================================
   フィルタ収集 & クイズ開始
================================ */
function startQuizHandler() {
    const packs = collectSelectedArray("filter-pack");
    const rarities = collectSelectedArray("filter-rarity");
    const classes = collectSelectedArray("filter-class");
    const tags = collectSelectedArray("filter-tags");

    let filtered = (window.cards || []).filter(c => {
        const okPack = packs.length ? packs.includes(c.pack) : true;
        const okRarity = rarities.length ? rarities.includes(c.rarity) : true;
        const okClass = classes.length ? classes.includes(c.class) : true;

        let okTag = true;
        if (tags && tags.length) {
            if (!c.tags || c.tags.length === 0) {
                okTag = tags.length === 0;
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

    const elStreak = document.getElementById("streak");
    if (elStreak) elStreak.textContent = "0";
    const elTotal = document.getElementById("totalQuestions");
    if (elTotal) elTotal.textContent = totalQuestions;
    const elCurrent = document.getElementById("currentIndex");
    if (elCurrent) elCurrent.textContent = currentIndex;
    const elRemaining = document.getElementById("remainingCount");
    if (elRemaining) elRemaining.textContent = remainingCards.length;

    const quizArea = document.getElementById("quiz-area");
    if (quizArea) quizArea.style.display = "block";

    nextQuestion();
}

/* ================================
   次の問題
================================ */
function nextQuestion() {
    const resultEl = document.getElementById("result");
    if (resultEl) resultEl.textContent = "";
    const nextBtn = document.getElementById("next-btn");
    if (nextBtn) nextBtn.style.display = "none";
    const resultImage = document.getElementById("resultImage");
    if (resultImage) resultImage.style.display = "none";
    const imagePlaceholder = document.getElementById("imagePlaceholder");
    if (imagePlaceholder) imagePlaceholder.style.display = "none";
    const answerInput = document.getElementById("answer-input");
    if (answerInput) answerInput.value = "";
    const otherList = document.getElementById("other-voices-list");
    if (otherList) otherList.style.display = "none";

    if (!remainingCards || remainingCards.length === 0) {
        if (resultEl) resultEl.textContent = "全問終了しました！";
        const elCurrent = document.getElementById("currentIndex");
        if (elCurrent) elCurrent.textContent = totalQuestions;
        const elRemaining = document.getElementById("remainingCount");
        if (elRemaining) elRemaining.textContent = 0;
        return;
    }

    currentCard = remainingCards.shift();
    currentIndex++;
    updateProgressUI();

    // preload resources (非同期で安全に取得)
    loadCardResources(currentCard).then(() => {
        // preload 完了（必要ならここで何かする）
    }).catch(err => {
        console.warn("preload err", err);
    });
}

/* ================================
   回答チェック
================================ */
function submitAnswerHandler() {
    if (!currentCard) return;

    // --- 入力 ---
    const inputRaw = (document.getElementById("answer-input")?.value) || "";
    const input = normalize(inputRaw.trim());
    if (document.getElementById("answer-input")) {
        document.getElementById("answer-input").value = "";
    }

    // --- 判定用に normalize したカード名・読み ---
    const readings = (currentCard.reading || []).map(r => normalize(r));
    const acceptedNames = [ normalize(currentCard.name) ].concat(readings);

    // --- 正解判定（3文字以上 & 部分一致 & 順番一致） ---
    const correct = acceptedNames.some(normalizedName => {
        if (input.length < 3) return false;
        return normalizedName.includes(input);
    });

    // --- UI 反映 ---
    const resultEl = document.getElementById("result");
    if (!resultEl) return;

    if (correct) {
        resultEl.textContent = "正解！";
        resultEl.style.color = "green";
        streak++;
        document.getElementById("streak").textContent = streak;
        showCardImage(currentCard);

        // tweet
        const text = `Shadowverseボイスクイズで${streak}問連続正解しました！`;
        const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        const shareEl = document.getElementById("share-x");
        if (shareEl) {
            shareEl.href = tweetUrl;
            shareEl.style.display = "inline-block";
        }
    } else {
        // ★ 表示はオリジナル名（記号あり）
        resultEl.textContent = `不正解… 正解：${currentCard.name}`;
        resultEl.style.color = "red";
        streak = 0;
        document.getElementById("streak").textContent = "0";
        showCardImage(currentCard);

        const shareEl = document.getElementById("share-x");
        if (shareEl) shareEl.style.display = "none";
    }

    const nextBtn = document.getElementById("next-btn");
    if (nextBtn) nextBtn.style.display = "inline-block";
    updateProgressUI();
       resultEl.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}

/* ================================
   次へボタン
================================ */
function nextButtonHandler() {
    nextQuestion();
}

/* ================================
   進捗更新
================================ */
function updateProgressUI() {
    const elCurrent = document.getElementById("currentIndex");
    if (elCurrent) elCurrent.textContent = currentIndex;
    const elTotal = document.getElementById("totalQuestions");
    if (elTotal) elTotal.textContent = totalQuestions;
    const elRemaining = document.getElementById("remainingCount");
    if (elRemaining) elRemaining.textContent = Math.max(0, remainingCards.length);
}

/* ================================
   初期化（DOMContentLoaded）
================================ */
window.addEventListener("DOMContentLoaded", () => {
    // 安全に要素を取得してイベントを登録
    const voiceButtons = document.querySelector(".voice-buttons");
    if (voiceButtons) {
        voiceButtons.addEventListener("click", async (e) => {
            const btn = e.target;
            if (!btn || !btn.dataset) return;
            const type = btn.dataset.type;
            if (!type) return;
            if (!currentCard) return;

            const audio = document.getElementById("audio");
            if (!audio) return;
            audio.volume = parseFloat(document.getElementById("volume")?.value || 1);

            if (type === "other") {
                const listEl = document.getElementById("other-voices-list");
                if (!listEl) return;
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
                if (!src && type === "fanfare" && res && res.voices && res.voices.other && res.voices.other.length) {
                    src = res.voices.other[0].url;
                }
                if (!src) {
                    console.warn("no voice for type", type, currentCard?.id);
                    return;
                }
                audio.src = src;
                audio.play().catch(err => console.warn("play err", err));
            } catch (err) {
                console.error("voice play err", err);
            }
        });
    }

    const startBtn = document.getElementById("start-btn");
    if (startBtn) startBtn.addEventListener("click", startQuizHandler);

    const submitBtn = document.getElementById("submit-btn");
    if (submitBtn) submitBtn.addEventListener("click", submitAnswerHandler);

    const nextBtn = document.getElementById("next-btn");
    if (nextBtn) nextBtn.addEventListener("click", nextButtonHandler);

    // 初期は quiz エリア非表示（HTML に既にあるので冗長ではあるが確実にする）
    const quizArea = document.getElementById("quiz-area");
    if (quizArea) quizArea.style.display = "none";
});
// ==============================
// Enterキー送信（IME変換中は無効 / Next誤動作防止）
// ==============================

let isComposing = false;

// IME 変換開始
document.addEventListener("compositionstart", () => {
    isComposing = true;
});

// IME 変換終了
document.addEventListener("compositionend", () => {
    isComposing = false;
});

document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;

    // 変換中なら Enter を無効化
    if (isComposing) return;

    const submitBtn = document.getElementById("submit-btn");
    const nextBtn   = document.getElementById("next-btn");
    const resultEl  = document.getElementById("result");

    // result 表示が空 → 回答前と判定
    const isAnswered = resultEl && resultEl.textContent.trim() !== "";

    if (!isAnswered) {
        // --- 回答前：Enter で送信 ---
        if (submitBtn && submitBtn.offsetParent !== null && !submitBtn.disabled) {
            e.preventDefault();   // Next 誤作動防止
            submitBtn.click();
        }
    } else {
        // --- 回答後：Enter で次へ ---
        if (nextBtn && nextBtn.offsetParent !== null && !nextBtn.disabled) {
            e.preventDefault();
            nextBtn.click();
        }
    }
});
   /* ================================
   スマホ用音声再生アンロック（重要）
================================ */
function unlockAudioOnce() {
    const audio = document.getElementById("audio");
    if (!audio) return;

    // すでに解除済みなら何もしない
    if (window.__audioUnlocked) return;

    // 無音データを再生してスマホの再生制限を解除
    audio.src =
        "data:audio/mp3;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAACAAACcQCA...";
    audio.volume = 0;

    audio
        .play()
        .then(() => {
            window.__audioUnlocked = true;
            console.log("🔓 Audio unlocked for mobile");
        })
        .catch((e) => {
            console.warn("unlock failed:", e);
        });
}

// スマホでは「最初のタップ」でのみ実行
window.addEventListener(
    "touchstart",
    () => {
        unlockAudioOnce();
    },
    { once: true }
);

// PCは click でも一応発火
window.addEventListener(
    "click",
    () => {
        unlockAudioOnce();
    },
    { once: true }
);

});







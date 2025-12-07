/* ============================================
   main.js — 安全化・整合性強化版（スマホ音声対応 完全統合）
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
   ZIP から資源をロードする関数（堅牢化）
   - 既にキャッシュがあればそれを返す
   - 呼び出し側は await で待てる（preload 用）
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
                    // 名前に id を含むファイルを優先
                    if (lower.includes(idLower) || !result.imageUrl) {
                        const blob = await entry.async("blob");
                        result.imageUrl = URL.createObjectURL(blob);
                        // 画像見つけても音声を引き続き収集
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

        // fallback: other に似た名前のものを fanfare に割り当てる
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
   画像表示（キャッシュ優先）
================================ */
function showCardImage(card) {
    const imgEl = document.getElementById("resultImage");
    const placeholder = document.getElementById("imagePlaceholder");
    if (!imgEl || !placeholder) return;

    imgEl.style.display = "none";
    placeholder.style.display = "none";

    const cached = cardResourceCache.get(card.id);
    if (cached && cached.imageUrl) {
        imgEl.src = cached.imageUrl;
        imgEl.style.display = "block";
        return;
    }

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
   その他ボイス UI を作る（キャッシュ優先・未キャッシュならバックグラウンドで読み込み）
   注意: 再生ボタン（play）はここでは呼ばない（再生は別ボタンで即行う）
================================ */
function populateOtherVoicesUI(card) {
    const listEl = document.getElementById("other-voices-list");
    if (!listEl) return;
    listEl.innerHTML = "";
    listEl.style.display = "none";

    const cached = cardResourceCache.get(card.id);
    if (cached && cached.voices && cached.voices.other && cached.voices.other.length) {
        cached.voices.other.forEach(it => {
            const btn = document.createElement("button");
            btn.className = "voice-item btn";
            btn.textContent = it.name || "その他";
            btn.addEventListener("click", () => {
                const audio = document.getElementById("audio");
                if (!audio) return;
                audio.volume = parseFloat(document.getElementById("volume").value || 1);
                audio.src = it.url;
                // ここでは再生を行って OK（ボタン押下が直接のユーザー操作）
                audio.play().catch(err => console.warn("play err", err));
            });
            listEl.appendChild(btn);
        });
        listEl.style.display = "block";
        return;
    }

    // 未キャッシュならバックグラウンドでロードして UI を更新（非同期・非ブロッキング）
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
   重要：ここでは一切 await を使わない（audio.play() を直後に呼べるようにする）
================================ */
function handleVoiceButtonClick(e) {
    const btn = e.target;
    if (!btn || !btn.dataset) return;
    const type = btn.dataset.type;
    if (!type) return;
    if (!currentCard) return;

    const audioEl = document.getElementById("audio");
    if (!audioEl) return;
    audioEl.volume = parseFloat(document.getElementById("volume")?.value || 1);

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

    // キャッシュから取得（ここで絶対に await を挟まない）
    const cached = cardResourceCache.get(currentCard.id);
    let src = cached && cached.voices ? cached.voices[type] : null;

    // fanfare のフォールバック
    if (!src && type === "fanfare" && cached && cached.voices && cached.voices.other && cached.voices.other.length) {
        src = cached.voices.other[0].url;
    }

    if (!src) {
        // キャッシュがない、あるいは該当音声が未ロードの可能性
        // 背景でロードだけ開始しておく（ただしここでは再生は行わない）
        console.warn("no voice in cache for type", type, currentCard?.id);
        // kick off background load so next press will succeed
        loadCardResources(currentCard).then(() => {
            console.log("background preload for missing voice complete:", currentCard.id);
        }).catch(() => {});
        return;
    }

    // 即再生（ユーザー操作直後に呼ぶ -> スマホで許可される）
    audioEl.src = src;
    audioEl.play().catch(err => console.warn("play err", err));
}

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
   - ランダム選択済みの remainingCards から shift で取り出す
   - ここで **await loadCardResources(currentCard)** を行い完全プリロードする（音声ボタンは待たせない）
================================ */
async function nextQuestion() {
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

    // pick next
    currentCard = remainingCards.shift();
    currentIndex++;
    updateProgressUI();

    // ここで完全プリロード（await）しておく → 以後の再生ボタンは即 play を呼べる
    try {
        await loadCardResources(currentCard);
        console.log("ZIP preload complete:", currentCard.id);
    } catch (err) {
        console.warn("ZIP preload error:", err);
    }
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
        voiceButtons.addEventListener("click", handleVoiceButtonClick);
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

/* ================================
   Enterキー送信（IME変換中は無効 / Next誤動作防止）
================================ */
let isComposing = false;
document.addEventListener("compositionstart", () => { isComposing = true; });
document.addEventListener("compositionend", () => { isComposing = false; });

document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    if (isComposing) return;

    const submitBtn = document.getElementById("submit-btn");
    const nextBtn   = document.getElementById("next-btn");
    const resultEl  = document.getElementById("result");
    const isAnswered = resultEl && resultEl.textContent.trim() !== "";

    if (!isAnswered) {
        if (submitBtn && submitBtn.offsetParent !== null && !submitBtn.disabled) {
            e.preventDefault();
            submitBtn.click();
        }
    } else {
        if (nextBtn && nextBtn.offsetParent !== null && !nextBtn.disabled) {
            e.preventDefault();
            nextBtn.click();
        }
    }
});

/* ================================
   スマホ用音声再生アンロック（重要）
   - DOMContentLoaded の外に出して確実に実行されるようにする
   - 無音 base64 を利用（外部ファイル不要）
================================ */
function unlockAudioOnce() {
    const audio = document.getElementById("audio");
    if (!audio) return;

    if (window.__audioUnlocked) return;

    // 小さめの無音 WAV（十分なトリガーになる）
    audio.src = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAIlYAAESsAAACABAAZGF0YQAAAAA=";
    audio.volume = 0;

    audio.play()
        .then(() => {
            window.__audioUnlocked = true;
            console.log("🔓 Audio unlocked for mobile");
            // すぐに停止して再利用できるようにする
            audio.pause();
            audio.currentTime = 0;
        })
        .catch((e) => {
            console.warn("unlock failed:", e);
        });
}

// スマホでは「最初のタップ」でのみ実行
window.addEventListener("touchstart", () => { unlockAudioOnce(); }, { once: true });
// PCは click でも一応発火（保険）
window.addEventListener("click", () => { unlockAudioOnce(); }, { once: true });

/* ============================================
   End of file
============================================ */

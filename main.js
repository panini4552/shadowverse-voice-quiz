let filteredCards = [];
let currentCard = null;
let streak = 0;

let remainingCards = []; // この挑戦で残っているカード
let totalQuestions = 0;
let currentIndex = 0;

// キャッシュ：cardId -> {imageUrl, voices: {fanfare:, attack:, evolve:, destroy:, other: [{name,url}]}}
const cardResourceCache = new Map();

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

    // select-all ボタン
    if (e.target.classList.contains("select-all-btn")) {
        const targetClass = e.target.dataset.target;
        const group = document.querySelector(`.${targetClass}`);
        if (!group) return;
        const buttons = [...group.querySelectorAll('.toggle-btn')];
        // もし全選択されているなら解除、そうでなければ全選択
        const allSelected = buttons.every(b => b.classList.contains('selected'));
        if (allSelected) {
            buttons.forEach(b => b.classList.remove('selected'));
        } else {
            buttons.forEach(b => b.classList.add('selected'));
        }
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
   リソース読み込み（zip or fallback）
   - B案：zip 内のオリジナル名を扱う
   - fallback: 既存の直置きパスを参照
================================ */
async function loadCardResources(card) {
    if (cardResourceCache.has(card.id)) {
        return cardResourceCache.get(card.id);
    }

    const result = {
        imageUrl: null,
        voices: {
            fanfare: null,
            attack: null,
            evolve: null,
            destroy: null,
            other: [] // {name, url}
        }
    };

    // try zip at packages/{id}.zip
    const zipUrl = `packages/${card.id}.zip`;
    try {
        const zipResp = await fetch(zipUrl);
        if (zipResp.ok) {
            const arrayBuffer = await zipResp.arrayBuffer();
            const zip = await JSZip.loadAsync(arrayBuffer);

            // iterate files
            const files = Object.keys(zip.files);
            for (const path of files) {
                const entry = zip.files[path];
                if (entry.dir) continue;
                const lower = path.toLowerCase();
                // image
                if (!result.imageUrl && (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg"))) {
                    const blob = await entry.async("blob");
                    result.imageUrl = URL.createObjectURL(blob);
                    continue;
                }
                // mp3s that start with card.id + '_'
                const base = path.split('/').pop();
                if (base.toLowerCase().endsWith(".mp3") && base.startsWith(card.id + "_")) {
                    const nameWithoutExt = base.slice(0, -4); // remove .mp3
                    // 判定：末尾が数字なら通常ボイス、それ以外は「その他」
                    const suffix = nameWithoutExt.slice((card.id + "_").length);
                    const isNumericSuffix = /^\d+$/.test(suffix);
                    const blob = await entry.async("blob");
                    const url = URL.createObjectURL(blob);

                    // try map known names
                    if (/_fanfare$/i.test(nameWithoutExt)) {
                        result.voices.fanfare = url;
                    } else if (/_attack$/i.test(nameWithoutExt)) {
                        result.voices.attack = url;
                    } else if (/_evolve$/i.test(nameWithoutExt)) {
                        result.voices.evolve = url;
                    } else if (/_destroy$/i.test(nameWithoutExt)) {
                        result.voices.destroy = url;
                    } else if (!isNumericSuffix) {
                        // その他（Q2=1: 数字で終わらないもの）
                        result.voices.other.push({ name: nameWithoutExt, url });
                    } else {
                        // numeric suffix → try to assign to first empty standard slot if specific mapping missing
                        // (ユーザー側 data.js の voices を使うためここは保険)
                        // if not assigned above, we can keep them in other as fallback
                        result.voices.other.push({ name: nameWithoutExt, url });
                    }
                }
            }
        } else {
            // zip not found -> fallback
            await loadResourcesFallback(card, result);
        }
    } catch (err) {
        // network or parse error -> fallback
        await loadResourcesFallback(card, result);
    }

    cardResourceCache.set(card.id, result);
    return result;
}

async function loadResourcesFallback(card, result) {
    // image fallback: try card.folder/{id}.png or voices folder parent
    const imgPathCandidates = [
        `${card.folder}/${card.id}.png`,
        `${card.folder}/${card.id}.jpg`,
        `${card.folder}/card.png`,
        `voices/${card.id}.png`,
        `${card.id}.png`
    ];
    for (const p of imgPathCandidates) {
        try {
            const r = await fetch(p, { method: "HEAD" });
            if (r.ok) {
                result.imageUrl = p;
                break;
            }
        } catch (e) {}
    }

    // voices fallback - use data.js entries if present
    if (card.voices) {
        for (const k of ["fanfare", "attack", "evolve", "destroy"]) {
            if (card.voices[k]) {
                // check existence
                try {
                    const r = await fetch(card.voices[k], { method: "HEAD" });
                    if (r.ok) result.voices[k] = card.voices[k];
                } catch (e) {}
            }
        }
    }

    // scan for "other" files in same folder by attempting a few patterns
    // ※ これは限定的なフォールバック（直置き運用時に役立つ）
    const folder = card.folder ? card.folder.trim() : "";
    if (folder) {
        // attempt wildcard-like checks for a few common patterns
        // we can't list server directory from client, so try common suffixes if you have them
        const candidates = [
            `${folder}/${card.id}_battle.mp3`,
            `${folder}/${card.id}_laugh.mp3`,
            `${folder}/${card.id}_other.mp3`
        ];
        for (const p of candidates) {
            try {
                const r = await fetch(p, { method: "HEAD" });
                if (r.ok) {
                    result.voices.other.push({ name: p.split('/').pop().slice(0, -4), url: p });
                }
            } catch (e) {}
        }
    }
}

/* ================================
   画像表示（なければ「準備中」）
   - ここは zip 展開結果か直置きパスを使う
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
    }).catch(() => {
        placeholder.style.display = "flex";
    });
}

/* ================================
   その他ボイスリスト表示 / 再生
================================ */
function populateOtherVoicesUI(card) {
    const listEl = document.getElementById("other-voices-list");
    listEl.innerHTML = "";
    listEl.style.display = "none";

    loadCardResources(card).then(res => {
        const items = res.voices.other || [];
        if (items.length === 0) return;

        items.forEach((it, idx) => {
            const btn = document.createElement("div");
            btn.className = "voice-item";
            btn.textContent = it.name.replace(/^.+_/, ""); // show suffix
            btn.title = it.name;
            btn.onclick = () => {
                const audio = document.getElementById("audio");
                audio.volume = document.getElementById("volume").value;
                audio.src = it.url;
                audio.play().catch(err => console.error("other play err", err));
            };
            listEl.appendChild(btn);
        });
        listEl.style.display = "block";
    }).catch(err => {
        console.error("populateOtherVoicesUI err", err);
    });
}

/* ================================
   次の問題（remainingCards を使う）
================================ */
function nextQuestion() {
    document.getElementById("result").textContent = "";
    document.getElementById("next-btn").style.display = "none";
    document.getElementById("resultImage").style.display = "none";
    document.getElementById("imagePlaceholder").style.display = "none";
    document.getElementById("answer-input").value = "";
    document.getElementById("other-voices-list").style.display = "none";

    if (remainingCards.length === 0) {
        // 終了
        document.getElementById("result").textContent = "全問終了しました！";
        document.getElementById("currentIndex").textContent = totalQuestions;
        document.getElementById("remainingCount").textContent = 0;
        return;
    }

    currentCard = remainingCards.shift(); // ポップ（先頭取り出し）
    currentIndex++;
    updateProgressUI();

    // preload resources (非同期)
    loadCardResources(currentCard).then(() => {
        // nothing required; resources cached
    }).catch(err => console.warn("loadCardResources err", err));
}

/* ================================
   クイズ開始
================================ */
document.getElementById("start-btn").onclick = () => {

    const packs = getSelectedFilters("filter-pack");
    const rarities = getSelectedFilters("filter-rarity");
    const classes = getSelectedFilters("filter-class");
    const tags = getSelectedFilters("filter-tags");

    // filter by pack/rarity/class first
    filteredCards = cards.filter(c =>
        packs.includes(c.pack) &&
        rarities.includes(c.rarity) &&
        classes.includes(c.class)
    );

    // if tag filters selected (they are default "all allowed" when none selected)
    // only include cards that have at least one of the selected tags if card.tags exists.
    filteredCards = filteredCards.filter(c => {
        // if card has no tags, we keep it only if the user selected the "all" (i.e., no specific tags chosen),
        // but per getSelectedFilters logic, tags will be a full list if none clicked,
        // so we allow cards without tags in that case.
        if (!c.tags || c.tags.length === 0) {
            // if user explicitly selected some tag subset (i.e., getSelectedFilters returned full set only when none selected),
            // current behavior: keep card (because tags list will be all tags); this is acceptable for now.
            return true;
        }
        // check intersection
        return c.tags.some(t => tags.includes(t));
    });

    if (filteredCards.length === 0) {
        alert("条件に一致するカードがありません");
        return;
    }

    // shuffle and set remainingCards
    remainingCards = shuffleArray(filteredCards.slice());
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
   音声再生（既存ボタン）
   - type: fanfare/attack/destroy/evolve
   - try to use loaded zip resources first, fallback to card.voices path
================================ */
document.querySelectorAll(".voice-buttons .btn").forEach(btn => {
    btn.onclick = async () => {
        if (!currentCard) return;

        const type = btn.dataset.type;
        const audio = document.getElementById("audio");
        audio.volume = document.getElementById("volume").value;

        // if "other" clicked -> toggle list
        if (type === "other") {
            const listEl = document.getElementById("other-voices-list");
            if (listEl.style.display === "block") {
                listEl.style.display = "none";
            } else {
                populateOtherVoicesUI(currentCard);
            }
            return;
        }

        try {
            const res = await loadCardResources(currentCard);
            let src = res.voices[type];
            // fallback to data.js voices path
            if (!src && currentCard.voices && currentCard.voices[type]) {
                src = currentCard.voices[type].trim();
            }
            if (!src) {
                console.warn("no voice for", type, currentCard.id);
                return;
            }
            audio.src = src;
            audio.play().catch(err => console.error("音声再生失敗:", err, src));
        } catch (err) {
            console.error("play err", err);
        }
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
    updateProgressUI();
};

/* ================================
   次の問題ボタン
================================ */
document.getElementById("next-btn").onclick = () => {
    nextQuestion();
};

/* ================================
   ヘルパー: update progress UI
================================ */
function updateProgressUI() {
    document.getElementById("currentIndex").textContent = currentIndex;
    document.getElementById("totalQuestions").textContent = totalQuestions;
    document.getElementById("remainingCount").textContent = Math.max(0, remainingCards.length);
}

/* ================================
   シャッフル
================================ */
function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/* ============================================
   main.js — 完全最適化版（PC/スマホ対応・音声即再生）
============================================ */

let remainingCards = [];
let totalQuestions = 0;
let currentIndex = 0;
let currentCard = null;
let streak = 0;

const cardResourceCache = new Map(); // cardId -> { imageUrl, voices }

/* ================================
   ユーティリティ
================================ */
function normalize(str) {
    if (!str) return "";
    return str.toLowerCase().normalize("NFKC")
        .replace(/[ぁ-ん]/g, s => String.fromCharCode(s.charCodeAt(0)+0x60))
        .replace(/[・\s\-\ー＿／,\.!！?？'’"”“]/g, "")
        .replace(/[　・‐―－]/g, "");
}

function shuffleArray(arr) {
    for (let i = arr.length-1; i>0; i--) {
        const j = Math.floor(Math.random()*(i+1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/* ================================
   DOM ヘルパー
================================ */
function findGroup(groupKey) {
    if (!groupKey) return null;
    if (groupKey.startsWith("#")) return document.getElementById(groupKey.slice(1));
    if (groupKey.startsWith(".")) return document.querySelector(groupKey);

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

function collectSelectedArray(groupKey) {
    const group = findGroup(groupKey);
    if (!group) return [];
    const selectedBtns = [...group.querySelectorAll(".toggle-btn.active")];
    return selectedBtns.length===0 ? [] : selectedBtns.map(b=>b.dataset.value);
}

/* ================================
   トグルイベント
================================ */
document.addEventListener("click", (e)=>{
    const t = e.target;
    if(!t||!t.classList) return;

    if(t.classList.contains("toggle-btn")) {
        t.classList.toggle("active");
        return;
    }
    if(t.classList.contains("select-all-btn")) {
        const target = t.dataset.target;
        const group = target ? findGroup(target) : null;
        if(!group) return;

        const buttons = [...group.querySelectorAll(".toggle-btn")];
        if(buttons.length===0) return;

        const allActive = buttons.every(b=>b.classList.contains("active"));
        buttons.forEach(b=>b.classList.toggle("active", !allActive));
    }
});

/* ================================
   ZIP 事前ロード
================================ */
async function loadCardResources(card) {
    if(!card||!card.id) return null;
    if(cardResourceCache.has(card.id)) return cardResourceCache.get(card.id);

    const result = {
        imageUrl:null,
        voices:{ fanfare:null, attack:null, evolve:null, destroy:null, other:[] }
    };

    const zipPath = card.zip || null;
    if(!zipPath) {
        cardResourceCache.set(card.id, result);
        return result;
    }

    try {
        const resp = await fetch(zipPath);
        if(!resp.ok) {
            console.warn("zip fetch failed", zipPath, resp.status);
            cardResourceCache.set(card.id,result);
            return result;
        }

        const ab = await resp.arrayBuffer();
        const zip = await JSZip.loadAsync(ab);

        for(const path of Object.keys(zip.files)) {
            const entry = zip.files[path];
            if(entry.dir) continue;
            const lower = path.toLowerCase();

            if(!result.imageUrl && /\.(png|jpg|jpeg|webp)$/.test(lower)) {
                const blob = await entry.async("blob");
                result.imageUrl = URL.createObjectURL(blob);
            }

            if(/\.(mp3|ogg|wav)$/.test(lower)) {
                const blob = await entry.async("blob");
                const url = URL.createObjectURL(blob);
                const base = path.split("/").pop().toLowerCase();
                if(base.includes("attack")) result.voices.attack ??= url;
                else if(base.includes("evolve")) result.voices.evolve ??= url;
                else if(base.includes("destroy")||base.includes("dead")) result.voices.destroy ??= url;
                else if(base.includes("fanfare")||base.includes("play")) result.voices.fanfare ??= url;
                else result.voices.other.push({ name:base.replace(/\.(mp3|ogg|wav)$/,""), url });
            }
        }

        if(!result.voices.fanfare && result.voices.other.length) {
            const found = result.voices.other.find(o=>/play|fanfare|enter|sample|01/.test(o.name));
            if(found){
                result.voices.fanfare = found.url;
                result.voices.other = result.voices.other.filter(o=>o!==found);
            }
        }

        cardResourceCache.set(card.id,result);
        return result;
    } catch(err){
        console.error("loadCardResources error", card.id, err);
        cardResourceCache.set(card.id,result);
        return result;
    }
}

/* ================================
   安全音声再生
================================ */
function playAudio(url){
    const audio = document.getElementById("audio");
    if(!audio) return;
    audio.src = url;
    audio.volume = parseFloat(document.getElementById("volume").value||1);
    audio.play().catch(()=>{console.warn("Audio play prevented");});
}

/* ================================
   カード表示
================================ */
function showCardImage(card){
    const imgEl = document.getElementById("resultImage");
    const placeholder = document.getElementById("imagePlaceholder");
    imgEl.style.display = "none"; placeholder.style.display = "none";

    const cached = cardResourceCache.get(card.id);
    if(cached?.imageUrl){
        imgEl.src = cached.imageUrl;
        imgEl.style.display = "block";
    } else {
        placeholder.textContent="画像なし";
        placeholder.style.display="block";
    }
}

function populateOtherVoicesUI(card){
    const listEl = document.getElementById("other-voices-list");
    listEl.innerHTML=""; listEl.style.display="none";

    const cached = cardResourceCache.get(card.id);
    if(!cached?.voices?.other?.length) return;

    cached.voices.other.forEach(it=>{
        const btn = document.createElement("button");
        btn.className="voice-item btn";
        btn.textContent=it.name;
        btn.addEventListener("click",()=>playAudio(it.url));
        listEl.appendChild(btn);
    });
    listEl.style.display="block";
}

/* ================================
   クイズ開始
================================ */
function startQuizHandler(){
    const packs = collectSelectedArray("filter-pack");
    const rarities = collectSelectedArray("filter-rarity");
    const classes = collectSelectedArray("filter-class");
    const tags = collectSelectedArray("filter-tags");

    let filtered = (window.cards||[]).filter(c=>{
        const okPack=packs.length?packs.includes(c.pack):true;
        const okRarity=rarities.length?rarities.includes(c.rarity):true;
        const okClass=classes.length?classes.includes(c.class):true;
        const okTag=tags.length?c.tags?.some(t=>tags.includes(t)):true;
        return okPack&&okRarity&&okClass&&okTag;
    });

    if(!filtered.length){ alert("条件に一致するカードがありません"); return; }

    remainingCards = shuffleArray(filtered.slice());
    totalQuestions = remainingCards.length;
    currentIndex = 0; streak=0;

    document.getElementById("streak").textContent="0";
    document.getElementById("totalQuestions").textContent=totalQuestions;
    document.getElementById("currentIndex").textContent=0;
    document.getElementById("remainingCount").textContent=remainingCards.length;

    document.getElementById("quiz-area").style.display="block";

    // 最初のカードを取得し、事前ロード
    nextQuestion(true);
}

/* ================================
   次の問題
================================ */
function nextQuestion(preloadOnly=false){
    const resultEl = document.getElementById("result");
    resultEl.textContent="";
    document.getElementById("next-btn").style.display="none";
    document.getElementById("resultImage").style.display="none";
    document.getElementById("imagePlaceholder").style.display="none";
    document.getElementById("answer-input").value="";
    document.getElementById("other-voices-list").style.display="none";

    if(!remainingCards.length){
        resultEl.textContent="全問終了しました！";
        document.getElementById("currentIndex").textContent=totalQuestions;
        document.getElementById("remainingCount").textContent=0;
        return;
    }

    currentCard = remainingCards.shift();
    currentIndex++;
    updateProgressUI();

    loadCardResources(currentCard).then(()=>{
        if(!preloadOnly){
            showCardImage(currentCard);
        }
    });
}

/* ================================
   回答処理
================================ */
function submitAnswerHandler(){
    if(!currentCard) return;

    const inputRaw = document.getElementById("answer-input").value||"";
    const input = normalize(inputRaw.trim());
    document.getElementById("answer-input").value="";

    const readings=(currentCard.reading||[]).map(r=>normalize(r));
    const accepted=[normalize(currentCard.name),...readings];

    const correct = accepted.some(n=>input.length>=3&&n.includes(input));
    const resultEl = document.getElementById("result");

    if(correct){
        resultEl.textContent="正解！";
        resultEl.style.color="green";
        streak++;
        document.getElementById("streak").textContent=streak;
    }else{
        resultEl.textContent=`不正解… 正解：${currentCard.name}`;
        resultEl.style.color="red";
        streak=0;
        document.getElementById("streak").textContent="0";
    }

    showCardImage(currentCard);
    document.getElementById("next-btn").style.display="inline-block";
    updateProgressUI();
    resultEl.scrollIntoView({behavior:"smooth", block:"center"});
}

/* ================================
   次へ
================================ */
function nextButtonHandler(){ nextQuestion(); }

/* ================================
   進捗更新
================================ */
function updateProgressUI(){
    document.getElementById("currentIndex").textContent=currentIndex;
    document.getElementById("totalQuestions").textContent=totalQuestions;
    document.getElementById("remainingCount").textContent=Math.max(0,remainingCards.length);
}

/* ================================
   スマホ音声アンロック
================================ */
function unlockAudioOnce(){
    const audio = document.getElementById("audio");
    if(!audio || window.__audioUnlocked) return;

    audio.src="data:audio/mp3;base64,//uQxAAAAAAAAAAAAAA..."; // 短い無音音声
    audio.volume=0;
    audio.play().then(()=>{ window.__audioUnlocked=true; console.log("🔓 Audio unlocked for mobile"); }).catch(()=>{});
}

/* ================================
   初期化
================================ */
window.addEventListener("DOMContentLoaded",()=>{
    const voiceButtons=document.querySelector(".voice-buttons");
    if(voiceButtons){
        voiceButtons.addEventListener("click",(e)=>{
            const btn = e.target;
            if(!btn.dataset.type || !currentCard) return;

            const type = btn.dataset.type;
            if(type==="other"){
                const list = document.getElementById("other-voices-list");
                if(list.style.display==="block") list.style.display="none";
                else populateOtherVoicesUI(currentCard);
                return;
            }

            const cached = cardResourceCache.get(currentCard.id);
            if(!cached) return;
            let src = cached.voices[type];
            if(!src && type==="fanfare" && cached.voices.other.length) src=cached.voices.other[0].url;
            if(!src) return;

            playAudio(src);
        });
    }

    document.getElementById("start-btn")?.addEventListener("click", startQuizHandler);
    document.getElementById("submit-btn")?.addEventListener("click", submitAnswerHandler);
    document.getElementById("next-btn")?.addEventListener("click", nextButtonHandler);

    document.getElementById("quiz-area").style.display="none";
    window.addEventListener("touchstart", unlockAudioOnce,{once:true});
    window.addEventListener("click", unlockAudioOnce,{once:true});
});

/* ================================
   Enter キー送信（IME対応）
================================ */
let isComposing=false;
document.addEventListener("compositionstart",()=>{isComposing=true;});
document.addEventListener("compositionend",()=>{isComposing=false;});
document.addEventListener("keydown",(e)=>{
    if(e.key!=="Enter"||isComposing) return;
    const submitBtn = document.getElementById("submit-btn");
    const nextBtn = document.getElementById("next-btn");
    const resultEl = document.getElementById("result");
    const isAnswered = resultEl.textContent.trim()!=="";
    if(!isAnswered){
        if(submitBtn && submitBtn.offsetParent!==null){ e.preventDefault(); submitBtn.click(); }
    }else{
        if(nextBtn && nextBtn.offsetParent!==null){ e.preventDefault(); nextBtn.click(); }
    }
});
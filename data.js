// data.js — カードデータ（例: 最初は3枚だけ）
const cards = [
  {
    id: "otohime",
    name: "海底都市王・乙姫",
    reading: ["おとひめ", "乙姫", "オトヒメ"],
    class: "ロイヤル",
    rarity: "Legendary",
    pack: "Classic",
    voices: {
      fanfare: "voices/Classic/Legendary/otohime/fanfare.mp3",
      attack:  "voices/Classic/Legendary/otohime/attack.mp3",
      destroy: "voices/Classic/Legendary/otohime/destroy.mp3",
      evolve:  "voices/Classic/Legendary/otohime/evolve.mp3"
    }
  },
  {
    id: "fenrir",
    name: "フェンリル",
    reading: ["ふぇんりる", "フェンリル"],
    class: "ドラゴン",
    rarity: "Legendary",
    pack: "Classic",
    voices: {
      fanfare: "voices/Classic/Legendary/fenrir/fanfare.mp3",
      attack:  "voices/Classic/Legendary/fenrir/attack.mp3",
      destroy: "voices/Classic/Legendary/fenrir/destroy.mp3",
      evolve:  "voices/Classic/Legendary/fenrir/evolve.mp3"
    }
  },
  {
    id: "cerberus",
    name: "ケルベロス",
    reading: ["けるべろす", "ケルベロス"],
    class: "ネクロマンサー",
    rarity: "Legendary",
    pack: "Classic",
    voices: {
      fanfare: "voices/Classic/Legendary/cerberus/fanfare.mp3",
      attack:  "voices/Classic/Legendary/cerberus/attack.mp3",
      destroy: "voices/Classic/Legendary/cerberus/destroy.mp3",
      evolve:  "voices/Classic/Legendary/cerberus/evolve.mp3"
    }
  }
];

// export not needed for browser; main.js will use global `cards`.

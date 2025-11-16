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
      fanfare: "voices/Classic/Legendary/otohime/otohime_fanfare.mp3",
      attack:  "voices/Classic/Legendary/otohime/otohime_attack.mp3",
      destroy: "voices/Classic/Legendary/otohime/otohime_destroy.mp3",
      evolve:  "voices/Classic/Legendary/otohime/otohime_evolve.mp3"
    }
  },
  {
    id: "Dark_Dragoon_Forte",
    name: "ダークドラグーン・フォルテ",
    reading: ["ふぉるて", "フォルテ","ダークドラグーンフォルテ"],
    class: "ドラゴン",
    rarity: "Legendary",
    pack: "Classic",
    voices: {
      fanfare: "voices/Classic/Legendary/Dark_Dragoon_Forte/Dark_Dragoon_Forte_fanfare.mp3",
      attack:  "voices/Classic/Legendary/Dark_Dragoon_Forte/Dark_Dragoon_Forte_attack.mp3",
      destroy: "voices/Classic/Legendary/Dark_Dragoon_Forte/Dark_Dragoon_Forte_destroy.mp3",
      evolve:  "voices/Classic/Legendary/Dark_Dragoon_Forte/Dark_Dragoon_Forte_evolve.mp3"
    }
  },
  {
    id: "cerberus",
    name: "ケルベロス",
    reading: ["けるべろす", "ケルベロス","ケル"],
    class: "ネクロマンサー",
    rarity: "Legendary",
    pack: "Classic",
    voices: {
      fanfare: "voices/Classic/Legendary/cerberus/cerberus_fanfare.mp3",
      attack:  "voices/Classic/Legendary/cerberus/cerberus_attack.mp3",
      destroy: "voices/Classic/Legendary/cerberus/cerberus_destroy.mp3",
      evolve:  "voices/Classic/Legendary/cerberus/cerberus_evolve.mp3"
    }
  }
];

// export not needed for browser; main.js will use global `cards`.

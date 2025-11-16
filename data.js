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
    id: "Queen_Vampire",                     
    name: "クイーンヴァンパイア",            
    reading: ["クイーンヴァンパイア", "くいーんヴぁんぱいあ"],     
    class: "ヴァンパイア",                 
    rarity: "Legendary",            
    pack: "Classic",                
    voices: {
      fanfare: "voices/Classic/Legendary/Queen_Vampire/Queen_Vampire_fanfare.mp3",
      attack:  "voices/Classic/Legendary/Queen_Vampire/Queen_Vampire_attack.mp3",
      evolve:  "voices/Classic/Legendary/Queen_Vampire/Queen_Vampire_evolve.mp3",
      death:   "voices/Classic/Legendary/Queen_Vampire/Queen_Vampire_death.mp3"
    }
  },
  {
    id: "soul dealer",                     
    name: ""ソウルディーラー,            
    reading: ["ソウルディーラー", "そうるでぃーらー"],     
    class: "ヴァンパイア",                 
    rarity: "Legendary",            
    pack: "Classic",                
    voices: {
      fanfare: "voices/Classic/Legendary/soul dealer/soul dealer_fanfare.mp3",
      attack:  "voices/Classic/Legendary/soul dealer/soul dealer_attack.mp3",
      evolve:  "voices/Classic/Legendary/soul dealer/soul dealer_evolve.mp3",
      death:   "voices/Classic/Legendary/soul dealer/soul dealer_death.mp3"
    }
  },
  {
    id: "Beast Dominator",                     
    name: ""ビーストドミネーター,            
    reading: ["ビーストドミネーター", "びーすとどみねーたー"],     
    class: "ヴァンパイア",                 
    rarity: "Legendary",            
    pack: "Classic",                
    voices: {
      fanfare: "voices/Classic/Legendary/Beast Dominator/Beast Dominator_fanfare.mp3",
      attack:  "voices/Classic/Legendary/Beast Dominator/Beast Dominator_attack.mp3",
      evolve:  "voices/Classic/Legendary/Beast Dominator/Beast Dominator_evolve.mp3",
      death:   "voices/Classic/Legendary/Beast Dominator/Beast Dominator_death.mp3"
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

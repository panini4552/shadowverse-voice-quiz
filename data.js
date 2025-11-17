// data.js — カードデータ
const cards = [
  // === エルフ ===
  {
    id: "Ancient_Elf",
    name: "エンシェントエルフ",
    reading: ["えんしぇんとえるふ", "エンシェントエルフ"],
    class: "エルフ",
    rarity: "Legendary",
    pack: "Classic",
    folder: "voices/Classic/Legendary/Ancient_Elf",
    voices: {
      fanfare: "voices/Classic/Legendary/Ancient_Elf/Ancient_Elf_fanfare.mp3",
      attack:  "voices/Classic/Legendary/Ancient_Elf/Ancient_Elf_attack.mp3",
      evolve:  "voices/Classic/Legendary/Ancient_Elf/Ancient_Elf_evolve.mp3",
      destroy: "voices/Classic/Legendary/Ancient_Elf/Ancient_Elf_destroy.mp3"
    }
  },
  {
    id: "Fairy_Princess",
    name: "フェアリープリンセス",
    reading: ["ふぇありーぷりんせす", "フェアリープリンセス"],
    class: "エルフ",
    rarity: "Legendary",
    pack: "Classic",
    folder: "voices/Classic/Legendary/Fairy_Princess",
    voices: {
      fanfare: "voices/Classic/Legendary/Fairy_Princess/Fairy_Princess_fanfare.mp3",
      attack:  "voices/Classic/Legendary/Fairy_Princess/Fairy_Princess_attack.mp3",
      evolve:  "voices/Classic/Legendary/Fairy_Princess/Fairy_Princess_evolve.mp3",
      destroy: "voices/Classic/Legendary/Fairy_Princess/Fairy_Princess_destroy.mp3"
    }
  },
  {
    id: "Rose_Queen",
    name: "ローズクイーン",
    reading: ["ろーずくいーん", "ローズクイーン"],
    class: "エルフ",
    rarity: "Legendary",
    pack: "Classic",
    folder: "voices/Classic/Legendary/"Rose_Queen",
    voices: {
      fanfare: "voices/Classic/Legendary/Rose_Queen/Rose_Queen_fanfare.mp3",
      attack:  "voices/Classic/Legendary/Rose_Queen/Rose_Queen_attack.mp3",
      evolve:  "voices/Classic/Legendary/Rose_Queen/Rose_Queen_evolve.mp3",
      destroy: "voices/Classic/Legendary/Rose_Queen/Rose_Queen_destroy.mp3"
    }
  },

  // === ロイヤル ===
  {
    id: "Aurelia",
    name: "ロイヤルセイバー・オーレリア",
    reading: ["おーれりあ", "ロイヤルセイバー・オーレリア", "オーレリア"],
    class: "ロイヤル",
    rarity: "Legendary",
    pack: "Classic",
    folder: "voices/Classic/Legendary/Aurelia",
    voices: {
      fanfare: "voices/Classic/Legendary/Aurelia/Aurelia_fanfare.mp3",
      attack:  "voices/Classic/Legendary/Aurelia/Aurelia_attack.mp3",
      evolve:  "voices/Classic/Legendary/Aurelia/Aurelia_evolve.mp3",
      destroy: "voices/Classic/Legendary/Aurelia/Aurelia_destroy.mp3"
    }
  },
  {
    id: "Tsubaki",
    name: "ツバキ",
    reading: ["つばき", "ツバキ"],
    class: "ロイヤル",
    rarity: "Legendary",
    pack: "Classic",
    folder: "voices/Classic/Legendary/Tsubaki",
    voices: {
      fanfare: "voices/Classic/Legendary/Tsubaki/Tsubaki_fanfare.mp3",
      attack:  "voices/Classic/Legendary/Tsubaki/Tsubaki_attack.mp3",
      evolve:  "voices/Classic/Legendary/Tsubaki/Tsubaki_evolve.mp3",
      destroy: "voices/Classic/Legendary/Tsubaki/Tsubaki_destroy.mp3"
    }
  },
  {
    id: "otohime",
    name: "海底都市王・乙姫",
    reading: ["おとひめ", "乙姫", "オトヒメ"],
    class: "ロイヤル",
    rarity: "Legendary",
    pack: "Classic",
    folder: "voices/Classic/Legendary/otohime",
    voices: {
      fanfare: "voices/Classic/Legendary/otohime/otohime_fanfare.mp3",
      attack:  "voices/Classic/Legendary/otohime/otohime_attack.mp3",
      evolve:  "voices/Classic/Legendary/otohime/otohime_evolve.mp3",
      destroy: "voices/Classic/Legendary/otohime/otohime_destroy.mp3"
    }
  },

  // === ドラゴン ===
  {
    id: "Zirnitra",
    name: "ジルニトラ",
    reading: ["じるにとら", "ジルニトラ"],
    class: "ドラゴン",
    rarity: "Legendary",
    pack: "Classic",
    folder: "voices/Classic/Legendary/Zirnitra",
    voices: {
      fanfare: "voices/Classic/Legendary/Zirnitra/Zirnitra_fanfare.mp3",
      attack:  "voices/Classic/Legendary/Zirnitra/Zirnitra_attack.mp3",
      evolve:  "voices/Classic/Legendary/Zirnitra/Zirnitra_evolve.mp3",
      destroy: "voices/Classic/Legendary/Zirnitra/Zirnitra_destroy.mp3"
    }
  },
  {
    id: "Fafnir",
    name: "ファフニール",
    reading: ["ふぁふにーる", "ファフニール"],
    class: "ドラゴン",
    rarity: "Legendary",
    pack: "Classic",
    folder: "voices/Classic/Legendary/Fafnir",
    voices: {
      fanfare: "voices/Classic/Legendary/Fafnir/Fafnir_fanfare.mp3",
      attack:  "voices/Classic/Legendary/Fafnir/Fafnir_attack.mp3",
      evolve:  "voices/Classic/Legendary/Fafnir/Fafnir_evolve.mp3",
      destroy: "voices/Classic/Legendary/Fafnir/Fafnir_destroy.mp3"
    }
  },
  {
    id: "Dark_Dragoon_Forte",
    name: "ダークドラグーン・フォルテ",
    reading: ["ふぉるて", "フォルテ", "ダークドラグーンフォルテ"],
    class: "ドラゴン",
    rarity: "Legendary",
    pack: "Classic",
    folder: "voices/Classic/Legendary/Dark_Dragoon_Forte",
    voices: {
      fanfare: "voices/Classic/Legendary/Dark_Dragoon_Forte/Dark_Dragoon_Forte_fanfare.mp3",
      attack:  "voices/Classic/Legendary/Dark_Dragoon_Forte/Dark_Dragoon_Forte_attack.mp3",
      evolve:  "voices/Classic/Legendary/Dark_Dragoon_Forte/Dark_Dragoon_Forte_evolve.mp3",
      destroy: "voices/Classic/Legendary/Dark_Dragoon_Forte/Dark_Dragoon_Forte_destroy.mp3"
    }
  },

  // === ウィッチ ===
  {
    id: "Arch_Summoner_Erasmus",
    name: "アークサモナー・エラスムス",
    reading: ["えらすむす", "アークサモナー・エラスムス", "エラスムス"],
    class: "ウィッチ",
    rarity: "Legendary",
    pack: "Classic",
    folder: "voices/Classic/Legendary/Arch_Summoner_Erasmus",
    voices: {
      fanfare: "voices/Classic/Legendary/Arch_Summoner_Erasmus/Arch_Summoner_Erasmus_fanfare.mp3",
      attack:  "voices/Classic/Legendary/Arch_Summoner_Erasmus/Arch_Summoner_Erasmus_attack.mp3",
      evolve:  "voices/Classic/Legendary/Arch_Summoner_Erasmus/Arch_Summoner_Erasmus_evolve.mp3",
      destroy: "voices/Classic/Legendary/Arch_Summoner_Erasmus/Arch_Summoner_Erasmus_destroy.mp3"
    }
  },
  {
    id: "merlin",
    name: "マーリン",
    reading: ["まーりん", "マーリン"],
    class: "ウィッチ",
    rarity: "Legendary",
    pack: "Classic",
    folder: "voices/Classic/Legendary/merlin",
    voices: {
      fanfare: "voices/Classic/Legendary/merlin/merlin_fanfare.mp3",
      attack:  "voices/Classic/Legendary/merlin/merlin_attack.mp3",
      evolve:  "voices/Classic/Legendary/merlin/merlin_evolve.mp3",
      destroy: "voices/Classic/Legendary/merlin/merlin_destroy.mp3"
    }
  },
  {
    id: "Mythril_Golem",
    name: "ミスリルゴーレム",
    reading: ["みすりるごーれむ", "ミスリルゴーレム"],
    class: "ウィッチ",
    rarity: "Legendary",
    pack: "Classic",
    folder: "voices/Classic/Legendary/Mythril_Golem",
    voices: {
      fanfare: "voices/Classic/Legendary/Mythril_Golem/Mythril_Golem_fanfare.mp3",
      attack:  "voices/Classic/Legendary/Mythril_Golem/Mythril_Golem_attack.mp3",
      evolve:  "voices/Classic/Legendary/Mythril_Golem/Mythril_Golem_evolve.mp3",
      destroy: "voices/Classic/Legendary/Mythril_Golem/Mythril_Golem_destroy.mp3"
    }
  },

  // === ネクロマンサー ===
  {
    id: "Pluto",
    name: "プルート",
    reading: ["ぷるーと", "プルート"],
    class: "ネクロマンサー",
    rarity: "Legendary",
    pack: "Classic",
    folder: "voices/Classic/Legendary/Pluto",
    voices: {
      fanfare: "voices/Classic/Legendary/Pluto/Pluto_fanfare.mp3",
      attack:  "voices/Classic/Legendary/Pluto/Pluto_attack.mp3",
      evolve:  "voices/Classic/Legendary/Pluto/Pluto_evolve.mp3",
      destroy: "voices/Classic/Legendary/Pluto/Pluto_destroy.mp3"
    }
  },
  {
    id: "Lord_Atomy",
    name: "骸の王",
    reading: ["むくろのおう", "骸の王"],
    class: "ネクロマンサー",
    rarity: "Legendary",
    pack: "Classic",
    folder: "voices/Classic/Legendary/Lord_Atomy",
    voices: {
      fanfare: "voices/Classic/Legendary/Lord_Atomy/Lord_Atomy_fanfare.mp3",
      attack:  "voices/Classic/Legendary/Lord_Atomy/Lord_Atomy_attack.mp3",
      evolve:  "voices/Classic/Legendary/Lord_Atomy/Lord_Atomy_evolve.mp3",
      destroy: "voices/Classic/Legendary/Lord_Atomy/Lord_Atomy_destroy.mp3"
    }
  },
  {
    id: "cerberus",
    name: "ケルベロス",
    reading: ["けるべろす", "ケルベロス", "ケル"],
    class: "ネクロマンサー",
    rarity: "Legendary",
    pack: "Classic",
    folder: "voices/Classic/Legendary/cerberus",
    voices: {
      fanfare: "voices/Classic/Legendary/cerberus/cerberus_fanfare.mp3",
      attack:  "voices/Classic/Legendary/cerberus/cerberus_attack.mp3",
      evolve:  "voices/Classic/Legendary/cerberus/cerberus_evolve.mp3",
      destroy: "voices/Classic/Legendary/cerberus/cerberus_destroy.mp3"
    }
  },

  // === ヴァンパイア ===
  {
    id: "Queen_Vampire",
    name: "クイーンヴァンパイア",
    reading: ["クイーンヴァンパイア", "くいーんヴぁんぱいあ"],
    class: "ヴァンパイア",
    rarity: "Legendary",
    pack: "Classic",
    folder: "voices/Classic/Legendary/Queen_Vampire",
    voices: {
      fanfare: "voices/Classic/Legendary/Queen_Vampire/Queen_Vampire_fanfare.mp3",
      attack:  "voices/Classic/Legendary/Queen_Vampire/Queen_Vampire_attack.mp3",
      evolve:  "voices/Classic/Legendary/Queen_Vampire/Queen_Vampire_evolve.mp3",
      destroy: "voices/Classic/Legendary/Queen_Vampire/Queen_Vampire_destroy.mp3"
    }
  },
  {
    id: "soul_dealer",
    name: "ソウルディーラー",
    reading: ["ソウルディーラー", "そうるでぃーらー"],
    class: "ヴァンパイア",
    rarity: "Legendary",
    pack: "Classic",
    folder: "voices/Classic/Legendary/soul_dealer",
    voices: {
      fanfare: "voices/Classic/Legendary/soul_dealer/soul_dealer_fanfare.mp3",
      attack:  "voices/Classic/Legendary/soul_dealer/soul_dealer_attack.mp3",
      evolve:  "voices/Classic/Legendary/soul_dealer/soul_dealer_evolve.mp3",
      destroy: "voices/Classic/Legendary/soul_dealer/soul_dealer_destroy.mp3"
    }
  },
  {
    id: "Beast_Dominator",
    name: "ビーストドミネーター",
    reading: ["ビーストドミネーター", "びーすとどみねーたー"],
    class: "ヴァンパイア",
    rarity: "Legendary",
    pack: "Classic",
    folder: "voices/Classic/Legendary/Beast_Dominator",
    voices: {
      fanfare: "voices/Classic/Legendary/Beast_Dominator/Beast_Dominator_fanfare.mp3",
      attack:  "voices/Classic/Legendary/Beast_Dominator/Beast_Dominator_attack.mp3",
      evolve:  "voices/Classic/Legendary/Beast_Dominator/Beast_Dominator_evolve.mp3",
      destroy: "voices/Classic/Legendary/Beast_Dominator/Beast_Dominator_destroy.mp3"
    }
  },

  // === ニュートラル ===
  {
    id: "Gabriel",
    name: "ガブリエル",
    reading: ["がぶりえる", "ガブリエル"],
    class: "ニュートラル",
    rarity: "Legendary",
    pack: "Classic",
    folder: "voices/Classic/Legendary/Gabriel",
    voices: {
      fanfare: "voices/Classic/Legendary/Gabriel/Gabriel_fanfare.mp3",
      attack:  "voices/Classic/Legendary/Gabriel/Gabriel_attack.mp3",
      evolve:  "voices/Classic/Legendary/Gabriel/Gabriel_evolve.mp3",
      destroy: "voices/Classic/Legendary/Gabriel/Gabriel_destroy.mp3"
    }
  },  <!-- ⭐ここにカンマが必要 -->

  {
    id: "Prince_of_Darkness",
    name: "サタン",
    reading: ["さたん", "サタン"],
    class: "ニュートラル",
    rarity: "Legendary",
    pack: "Classic",
    folder: "voices/Classic/Legendary/Prince_of_Darkness",
    voices: {
      fanfare: "voices/Classic/Legendary/Prince_of_Darkness/Prince_of_Darkness_fanfare.mp3",
      attack:  "voices/Classic/Legendary/Prince_of_Darkness/Prince_of_Darkness_attack.mp3",
      evolve:  "voices/Classic/Legendary/Prince_of_Darkness/Prince_of_Darkness_evolve.mp3",
      destroy: "voices/Classic/Legendary/Prince_of_Darkness/Prince_of_Darkness_destroy.mp3"
    }
  }
];


// export not needed for browser; main.js will use global `cards`.

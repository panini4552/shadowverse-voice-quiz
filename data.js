// data.js — ZIP方式用カードデータ
const cards = [
  // === エルフ ===
  {
    id: "Ancient_Elf",
    name: "エンシェントエルフ",
    reading: ["えんしぇんとえるふ", "エンシェントエルフ"],
    class: "エルフ",
    rarity: "Legendary",
    pack: "Classic",
    zip: "voices/Classic/Legendary/Ancient_Elf/Ancient_Elf.zip"
  },
  {
    id: "Fairy_Princess",
    name: "フェアリープリンセス",
    reading: ["ふぇありーぷりんせす", "フェアリープリンセス"],
    class: "エルフ",
    rarity: "Legendary",
    pack: "Classic",
    zip: "voices/Classic/Legendary/Fairy_Princess/Fairy_Princess.zip"
  },
  {
    id: "Rose_Queen",
    name: "ローズクイーン",
    reading: ["ろーずくいーん", "ローズクイーン"],
    class: "エルフ",
    rarity: "Legendary",
    pack: "Classic",
    zip: "voices/Classic/Legendary/Rose_Queen/Rose_Queen.zip"
  },

  // === ロイヤル ===
  {
    id: "Aurelia",
    name: "ロイヤルセイバー・オーレリア",
    reading: ["おーれりあ", "ロイヤルセイバー・オーレリア", "オーレリア"],
    class: "ロイヤル",
    rarity: "Legendary",
    pack: "Classic",
    zip: "voices/Classic/Legendary/Aurelia/Aurelia.zip"
  },
  {
    id: "Tsubaki",
    name: "ツバキ",
    reading: ["つばき", "ツバキ"],
    class: "ロイヤル",
    rarity: "Legendary",
    pack: "Classic",
    zip: "voices/Classic/Legendary/Tsubaki/Tsubaki.zip"
  },
  {
    id: "otohime",
    name: "海底都市王・乙姫",
    reading: ["おとひめ", "乙姫", "オトヒメ"],
    class: "ロイヤル",
    rarity: "Legendary",
    pack: "Classic",
    zip: "voices/Classic/Legendary/otohime/otohime.zip"
  },

  // === ドラゴン ===
  {
    id: "Zirnitra",
    name: "ジルニトラ",
    reading: ["じるにとら", "ジルニトラ"],
    class: "ドラゴン",
    rarity: "Legendary",
    pack: "Classic",
    zip: "voices/Classic/Legendary/Zirnitra/Zirnitra.zip"
  },
  {
    id: "Fafnir",
    name: "ファフニール",
    reading: ["ふぁふにーる", "ファフニール"],
    class: "ドラゴン",
    rarity: "Legendary",
    pack: "Classic",
    zip: "voices/Classic/Legendary/Fafnir/Fafnir.zip"
  },
  {
    id: "Dark_Dragoon_Forte",
    name: "ダークドラグーン・フォルテ",
    reading: ["ふぉるて", "フォルテ", "ダークドラグーンフォルテ"],
    class: "ドラゴン",
    rarity: "Legendary",
    pack: "Classic",
    zip: "voices/Classic/Legendary/Dark_Dragoon_Forte/Dark_Dragoon_Forte.zip"
  },

  // === ウィッチ ===
  {
    id: "Arch_Summoner_Erasmus",
    name: "アークサモナー・エラスムス",
    reading: ["えらすむす", "アークサモナー・エラスムス", "エラスムス"],
    class: "ウィッチ",
    rarity: "Legendary",
    pack: "Classic",
    zip: "voices/Classic/Legendary/Arch_Summoner_Erasmus/Arch_Summoner_Erasmus.zip"
  },
  {
    id: "merlin",
    name: "マーリン",
    reading: ["まーりん", "マーリン"],
    class: "ウィッチ",
    rarity: "Legendary",
    pack: "Classic",
    zip: "voices/Classic/Legendary/merlin/merlin.zip"
  },
  {
    id: "Mythril_Golem",
    name: "ミスリルゴーレム",
    reading: ["みすりるごーれむ", "ミスリルゴーレム"],
    class: "ウィッチ",
    rarity: "Legendary",
    pack: "Classic",
    zip: "voices/Classic/Legendary/Mythril_Golem/Mythril_Golem.zip"
  },

  // === ネクロマンサー ===
  {
    id: "Pluto",
    name: "プルート",
    reading: ["ぷるーと", "プルート"],
    class: "ネクロマンサー",
    rarity: "Legendary",
    pack: "Classic",
    zip: "voices/Classic/Legendary/Pluto/Pluto.zip"
  },
  {
    id: "Lord_Atomy",
    name: "骸の王",
    reading: ["むくろのおう", "骸の王"],
    class: "ネクロマンサー",
    rarity: "Legendary",
    pack: "Classic",
    zip: "voices/Classic/Legendary/Lord_Atomy/Lord_Atomy.zip"
  },
  {
    id: "cerberus",
    name: "ケルベロス",
    reading: ["けるべろす", "ケルベロス", "ケル"],
    class: "ネクロマンサー",
    rarity: "Legendary",
    pack: "Classic",
    zip: "voices/Classic/Legendary/cerberus/cerberus.zip"
  },

  // === ヴァンパイア ===
  {
    id: "Queen_Vampire",
    name: "クイーンヴァンパイア",
    reading: ["クイーンヴァンパイア", "くいーんヴぁんぱいあ"],
    class: "ヴァンパイア",
    rarity: "Legendary",
    pack: "Classic",
    zip: "voices/Classic/Legendary/Queen_Vampire/Queen_Vampire.zip"
  },
  {
    id: "soul_dealer",
    name: "ソウルディーラー",
    reading: ["ソウルディーラー", "そうるでぃーらー"],
    class: "ヴァンパイア",
    rarity: "Legendary",
    pack: "Classic",
    zip: "voices/Classic/Legendary/soul_dealer/soul_dealer.zip"
  },
  {
    id: "Beast_Dominator",
    name: "ビーストドミネーター",
    reading: ["ビーストドミネーター", "びーすとどみねーたー"],
    class: "ヴァンパイア",
    rarity: "Legendary",
    pack: "Classic",
    zip: "voices/Classic/Legendary/Beast_Dominator/Beast_Dominator.zip"
  },

  // === ニュートラル ===
  {
    id: "Gabriel",
    name: "ガブリエル",
    reading: ["がぶりえる", "ガブリエル"],
    class: "ニュートラル",
    rarity: "Legendary",
    pack: "Classic",
    zip: "voices/Classic/Legendary/Gabriel/Gabriel.zip"
  },
  {
    id: "Lucifer",
    name: "ルシフェル",
    reading: ["るしふぇる", "ルシフェル"],
    class: "ニュートラル",
    rarity: "Legendary",
    pack: "Classic",
    zip: "voices/Classic/Legendary/Lucifer/Lucifer.zip"
  },
  {
    id: "Prince_of_Darkness",
    name: "サタン",
    reading: ["さたん", "サタン"],
    class: "ニュートラル",
    rarity: "Legendary",
    pack: "Classic",
    zip: "voices/Classic/Legendary/Prince_of_Darkness/Prince_of_Darkness.zip"
  }
];

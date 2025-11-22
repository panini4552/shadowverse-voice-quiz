// data/index.js
import { Classic_Legendary } from "./Classic/Legendary.js";
import { Classic_Gold } from "./Classic/Gold.js";
import { Classic_Silver } from "./Classic/Silver.js";
import { Classic_Bronze } from "./Classic/Bronze.js";
import { DRK_Legendary } from "./DRK/Legendary.js";
import { DRK_Gold } from "./DRK/Gold.js";
import { DRK_Silver } from "./DRK/Silver.js";
import { DRK_Bronze } from "./DRK/Bronze.js";
import { ROB_Legendary } from "./ROB/Legendary.js";
import { ROB_Gold } from "./ROB/Gold.js";
import { ROB_Silver } from "./ROB/Silver.js";
import { ROB_Bronze } from "./ROB/Bronze.js";
import { TOG_Legendary } from "./TOG/Legendary.js";
import { TOG_Gold } from "./TOG/Gold.js";
import { TOG_Silver } from "./TOG/Silver.js";
import { TOG_Bronze } from "./TOG/Bronze.js";
import { WLD_Legendary } from "./WLD/Legendary.js";
import { WLD_Gold } from "./WLD/Gold.js";
import { WLD_Silver } from "./WLD/Silver.js";
import { WLD_Bronze } from "./WLD/Bronze.js";
import { SFL_Legendary } from "./SFL/Legendary.js";
import { SFL_Gold } from "./SFL/Gold.js";
import { SFL_Silver } from "./SFL/Silver.js";
import { SFL_Bronze } from "./SFL/Bronze.js";
// 必要なら他パックもここに import

export const cards = [
  ...Classic_Legendary,
  ...Classic_Gold,
  ...Classic_Silver,
  ...Classic_Bronze,
  ...DRK_Legendary,
  ...DRK_Gold,
  ...DRK_Silver,
  ...DRK_Bronze,
  ...ROB_Legendary,
  ...ROB_Gold,
  ...ROB_Silver,
  ...ROB_Bronze,
  ...TOG_Legendary,
  ...TOG_Gold,
  ...TOG_Silver,
  ...TOG_Bronze,
  ...WLD_Legendary,
  ...WLD_Gold,
  ...WLD_Silver,
  ...WLD_Bronze,
  ...SFL_Legendary,
  ...SFL_Gold,
  ...SFL_Silver,
  ...SFL_Bronze
];

// 互換性のためグローバルにも公開（既存の main.js が参照するため）
window.cards = cards;








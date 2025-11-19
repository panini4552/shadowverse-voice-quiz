// data/index.js
import { Classic_Legendary } from "./Classic/Legendary.js";
import { Classic_Gold } from "./Classic/Gold.js";
import { Classic_Silver } from "./Classic/Silver.js";
import { Classic_Bronze } from "./Classic/Bronze.js";

// 必要なら他パックもここに import

export const cards = [
  ...Classic_Legendary,
  ...Classic_Gold,
  ...Classic_Silver,
  ...Classic_Bronze
];

window.cards = cards;

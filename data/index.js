// data/index.js

/* ==============================
   各パックのカードをインポート
============================== */

// Classic
import { Classic_Legendary } from "./Classic/Legendary.js";
import { Classic_Gold } from "./Classic/Gold.js";
import { Classic_Silver } from "./Classic/Silver.js";
import { Classic_Bronze } from "./Classic/Bronze.js";

// DRK
import { DRK_Legendary } from "./DRK/Legendary.js";
import { DRK_Gold } from "./DRK/Gold.js";
import { DRK_Silver } from "./DRK/Silver.js";
import { DRK_Bronze } from "./DRK/Bronze.js";

// ROB
import { ROB_Legendary } from "./ROB/Legendary.js";
import { ROB_Gold } from "./ROB/Gold.js";
import { ROB_Silver } from "./ROB/Silver.js";
import { ROB_Bronze } from "./ROB/Bronze.js";

// TOG
import { TOG_Legendary } from "./TOG/Legendary.js";
import { TOG_Gold } from "./TOG/Gold.js";
import { TOG_Silver } from "./TOG/Silver.js";
import { TOG_Bronze } from "./TOG/Bronze.js";

// WLD
import { WLD_Legendary } from "./WLD/Legendary.js";
import { WLD_Gold } from "./WLD/Gold.js";
import { WLD_Silver } from "./WLD/Silver.js";
import { WLD_Bronze } from "./WLD/Bronze.js";

// SFL
import { SFL_Legendary } from "./SFL/Legendary.js";
import { SFL_Gold } from "./SFL/Gold.js";
import { SFL_Silver } from "./SFL/Silver.js";
import { SFL_Bronze } from "./SFL/Bronze.js";

// CGS
import { CGS_Legendary } from "./CGS/Legendary.js";
import { CGS_Gold } from "./CGS/Gold.js";
import { CGS_Silver } from "./CGS/Silver.js";
import { CGS_Bronze } from "./CGS/Bronze.js";

// DBN
import { DBN_Legendary } from "./DBN/Legendary.js";
import { DBN_Gold } from "./DBN/Gold.js";
import { DBN_Silver } from "./DBN/Silver.js";
import { DBN_Bronze } from "./DBN/Bronze.js";

// BOS
import { BOS_Legendary } from "./BOS/Legendary.js";
import { BOS_Gold } from "./BOS/Gold.js";
import { BOS_Silver } from "./BOS/Silver.js";
import { BOS_Bronze } from "./BOS/Bronze.js";

// OOT
import { OOT_Legendary } from "./OOT/Legendary.js";
import { OOT_Gold } from "./OOT/Gold.js";
import { OOT_Silver } from "./OOT/Silver.js";
import { OOT_Bronze } from "./OOT/Bronze.js";

// ALT
import { ALT_Legendary } from "./ALT/Legendary.js";
import { ALT_Gold } from "./ALT/Gold.js";
import { ALT_Silver } from "./ALT/Silver.js";
import { ALT_Bronze } from "./ALT/Bronze.js";

// STR
import { STR_Legendary } from "./STR/Legendary.js";
import { STR_Gold } from "./STR/Gold.js";
import { STR_Silver } from "./STR/Silver.js";
import { STR_Bronze } from "./STR/Bronze.js";

// ROG
import { ROG_Legendary } from "./ROG/Legendary.js";
import { ROG_Gold } from "./ROG/Gold.js";
import { ROG_Silver } from "./ROG/Silver.js";
import { ROG_Bronze } from "./ROG/Bronze.js";

// VEC
import { VEC_Legendary } from "./VEC/Legendary.js";
import { VEC_Gold } from "./VEC/Gold.js";
import { VEC_Silver } from "./VEC/Silver.js";
import { VEC_Bronze } from "./VEC/Bronze.js";

// UCL
import { UCL_Legendary } from "./UCL/Legendary.js";
import { UCL_Gold } from "./UCL/Gold.js";
import { UCL_Silver } from "./UCL/Silver.js";
import { UCL_Bronze } from "./UCL/Bronze.js";

// 新規パック（WUP〜Basic）
import { WUP_Legendary } from "./WUP/Legendary.js";
import { WUP_Gold } from "./WUP/Gold.js";
import { WUP_Silver } from "./WUP/Silver.js";
import { WUP_Bronze } from "./WUP/Bronze.js";

import { FOH_Legendary } from "./FOH/Legendary.js";
import { FOH_Gold } from "./FOH/Gold.js";
import { FOH_Silver } from "./FOH/Silver.js";
import { FOH_Bronze } from "./FOH/Bronze.js";

import { SOR_Legendary } from "./SOR/Legendary.js";
import { SOR_Gold } from "./SOR/Gold.js";
import { SOR_Silver } from "./SOR/Silver.js";
import { SOR_Bronze } from "./SOR/Bronze.js";

import { ETA_Legendary } from "./ETA/Legendary.js";
import { ETA_Gold } from "./ETA/Gold.js";
import { ETA_Silver } from "./ETA/Silver.js";
import { ETA_Bronze } from "./ETA/Bronze.js";

import { DOV_Legendary } from "./DOV/Legendary.js";
import { DOV_Gold } from "./DOV/Gold.js";
import { DOV_Silver } from "./DOV/Silver.js";
import { DOV_Bronze } from "./DOV/Bronze.js";

import { RSC_Legendary } from "./RSC/Legendary.js";
import { RSC_Gold } from "./RSC/Gold.js";
import { RSC_Silver } from "./RSC/Silver.js";
import { RSC_Bronze } from "./RSC/Bronze.js";

import { DOC_Legendary } from "./DOC/Legendary.js";
import { DOC_Gold } from "./DOC/Gold.js";
import { DOC_Silver } from "./DOC/Silver.js";
import { DOC_Bronze } from "./DOC/Bronze.js";

import { OOS_Legendary } from "./OOS/Legendary.js";
import { OOS_Gold } from "./OOS/Gold.js";
import { OOS_Silver } from "./OOS/Silver.js";
import { OOS_Bronze } from "./OOS/Bronze.js";

import { EOP_Legendary } from "./EOP/Legendary.js";
import { EOP_Gold } from "./EOP/Gold.js";
import { EOP_Silver } from "./EOP/Silver.js";
import { EOP_Bronze } from "./EOP/Bronze.js";

import { RGW_Legendary } from "./RGW/Legendary.js";
import { RGW_Gold } from "./RGW/Gold.js";
import { RGW_Silver } from "./RGW/Silver.js";
import { RGW_Bronze } from "./RGW/Bronze.js";

import { CDB_Legendary } from "./CDB/Legendary.js";
import { CDB_Gold } from "./CDB/Gold.js";
import { CDB_Silver } from "./CDB/Silver.js";
import { CDB_Bronze } from "./CDB/Bronze.js";

import { EAA_Legendary } from "./EAA/Legendary.js";
import { EAA_Gold } from "./EAA/Gold.js";
import { EAA_Silver } from "./EAA/Silver.js";
import { EAA_Bronze } from "./EAA/Bronze.js";

import { AOA_Legendary } from "./AOA/Legendary.js";
import { AOA_Gold } from "./AOA/Gold.js";
import { AOA_Silver } from "./AOA/Silver.js";
import { AOA_Bronze } from "./AOA/Bronze.js";

import { HOR_Legendary } from "./HOR/Legendary.js";
import { HOR_Gold } from "./HOR/Gold.js";
import { HOR_Silver } from "./HOR/Silver.js";
import { HOR_Bronze } from "./HOR/Bronze.js";

import { ORS_Legendary } from "./ORS/Legendary.js";
import { ORS_Gold } from "./ORS/Gold.js";
import { ORS_Silver } from "./ORS/Silver.js";
import { ORS_Bronze } from "./ORS/Bronze.js";

import { RSL_Legendary } from "./RSL/Legendary.js";
import { RSL_Gold } from "./RSL/Gold.js";
import { RSL_Silver } from "./RSL/Silver.js";
import { RSL_Bronze } from "./RSL/Bronze.js";

import { HOS_Legendary } from "./HOS/Legendary.js";
import { HOS_Gold } from "./HOS/Gold.js";
import { HOS_Silver } from "./HOS/Silver.js";
import { HOS_Bronze } from "./HOS/Bronze.js";

import { Basic_Gold } from "./Basic/Gold.js";
import { Basic_Silver } from "./Basic/Silver.js";
import { Basic_Bronze } from "./Basic/Bronze.js";

/* ==============================
   cards 配列にすべて展開
============================== */
export const cards = [
  ...Classic_Legendary, ...Classic_Gold, ...Classic_Silver, ...Classic_Bronze,
  ...DRK_Legendary, ...DRK_Gold, ...DRK_Silver, ...DRK_Bronze,
  ...ROB_Legendary, ...ROB_Gold, ...ROB_Silver, ...ROB_Bronze,
  ...TOG_Legendary, ...TOG_Gold, ...TOG_Silver, ...TOG_Bronze,
  ...WLD_Legendary, ...WLD_Gold, ...WLD_Silver, ...WLD_Bronze,
  ...SFL_Legendary, ...SFL_Gold, ...SFL_Silver, ...SFL_Bronze,
  ...CGS_Legendary, ...CGS_Gold, ...CGS_Silver, ...CGS_Bronze,
  ...DBN_Legendary, ...DBN_Gold, ...DBN_Silver, ...DBN_Bronze,
  ...BOS_Legendary, ...BOS_Gold, ...BOS_Silver, ...BOS_Bronze,
  ...OOT_Legendary, ...OOT_Gold, ...OOT_Silver, ...OOT_Bronze,
  ...ALT_Legendary, ...ALT_Gold, ...ALT_Silver, ...ALT_Bronze,
  ...STR_Legendary, ...STR_Gold, ...STR_Silver, ...STR_Bronze,
  ...ROG_Legendary, ...ROG_Gold, ...ROG_Silver, ...ROG_Bronze,
  ...VEC_Legendary, ...VEC_Gold, ...VEC_Silver, ...VEC_Bronze,
  ...UCL_Legendary, ...UCL_Gold, ...UCL_Silver, ...UCL_Bronze,
  ...WUP_Legendary, ...WUP_Gold, ...WUP_Silver, ...WUP_Bronze,
  ...FOH_Legendary, ...FOH_Gold, ...FOH_Silver, ...FOH_Bronze,
  ...SOR_Legendary, ...SOR_Gold, ...SOR_Silver, ...SOR_Bronze,
  ...ETA_Legendary, ...ETA_Gold, ...ETA_Silver, ...ETA_Bronze,
  ...DOV_Legendary, ...DOV_Gold, ...DOV_Silver, ...DOV_Bronze,
  ...RSC_Legendary, ...RSC_Gold, ...RSC_Silver, ...RSC_Bronze,
  ...DOC_Legendary, ...DOC_Gold, ...DOC_Silver, ...DOC_Bronze,
  ...OOS_Legendary, ...OOS_Gold, ...OOS_Silver, ...OOS_Bronze,
  ...EOP_Legendary, ...EOP_Gold, ...EOP_Silver, ...EOP_Bronze,
  ...RGW_Legendary, ...RGW_Gold, ...RGW_Silver, ...RGW_Bronze,
  ...CDB_Legendary, ...CDB_Gold, ...CDB_Silver, ...CDB_Bronze,
  ...EAA_Legendary, ...EAA_Gold, ...EAA_Silver, ...EAA_Bronze,
  ...AOA_Legendary, ...AOA_Gold, ...AOA_Silver, ...AOA_Bronze,
  ...HOR_Legendary, ...HOR_Gold, ...HOR_Silver, ...HOR_Bronze,
  ...ORS_Legendary, ...ORS_Gold, ...ORS_Silver, ...ORS_Bronze,
  ...RSL_Legendary, ...RSL_Gold, ...RSL_Silver, ...RSL_Bronze,
  ...HOS_Legendary, ...HOS_Gold, ...HOS_Silver, ...HOS_Bronze,
  ...Basic_Gold, ...Basic_Silver, ...Basic_Bronze
];

// グローバル公開
window.cards = cards;



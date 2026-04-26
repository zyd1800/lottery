import { Prize, PrizeType } from "./types";
import { generateId } from "./lib/utils";

export const DEFAULT_PRIZES: Prize[] = [
  {
    id: generateId(),
    type: PrizeType.GRAND,
    title: "特等奖：华为 Mate 60 Pro",
    count: 1,
    remaining: 1,
  },
  {
    id: generateId(),
    type: PrizeType.FIRST,
    title: "一等奖：iPad Pro 11-inch",
    count: 3,
    remaining: 3,
  },
  {
    id: generateId(),
    type: PrizeType.SECOND,
    title: "二等奖：戴森吹风机",
    count: 5,
    remaining: 5,
  },
  {
    id: generateId(),
    type: PrizeType.THIRD,
    title: "三等奖：飞利浦电动牙刷",
    count: 10,
    remaining: 10,
  }
];

export const APP_CONFIG = {
  LS_KEY_EMPLOYEES: "luckydraw_employees",
  LS_KEY_WINNERS: "luckydraw_winners",
  LS_KEY_PRIZES: "luckydraw_prizes",
  LS_KEY_LOGO: "luckydraw_logo",
  LS_KEY_BACKGROUND: "luckydraw_background",
};

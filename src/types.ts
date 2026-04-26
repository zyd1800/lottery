export enum PrizeType {
  GRAND = "特等奖",
  FIRST = "一等奖",
  SECOND = "二等奖",
  THIRD = "三等奖",
  FOURTH = "四等奖",
  SPECIAL = "特别奖",
}

export interface Employee {
  id: string;
  name: string;
  department?: string;
  avatar?: string;
}

export interface Prize {
  id: string;
  type: PrizeType;
  title: string;
  count: number;
  remaining: number;
  image?: string;
}

export interface Winner {
  employee: Employee;
  prize: Prize;
  timestamp: number;
}

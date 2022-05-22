export interface Reading {
  id: number;
  date: Date;
  verses: string;
  label: string;
  complete: boolean;
  readingPlanId: number;
  readingDayIndex: number;
}

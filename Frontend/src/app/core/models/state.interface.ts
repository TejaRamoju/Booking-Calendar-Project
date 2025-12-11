export interface EventData {
  id: number | string;
  title: string;
  start: string;       
  end: string;         
  booked: boolean;
  bookedById: number | null;
}
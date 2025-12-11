export interface UserDetails {
    id: number;
    email: string;
    is_admin: boolean;
    username: string;
}
export interface UserBookedEvent {
    id: string | number;
    title: string;
    start: string | Date;
    end: string | Date;
    booked: boolean;
}
export interface CategoryEvent {
    id: number;
    title: string;
    start: string;
    end: string;
    booked: boolean;
    bookedById: number | null;
}
export interface EventUnsubscribeResponse {
    event: {
        id: number | string;
        title: string;
        start: string;
        end: string;
        booked: boolean;
        bookedById: number | null;
    };
    msg: string;
}

export interface EventsubscribeResponse {
    event: {
        id: number | string;
        title: string;
        start: string;
        end: string;
        booked: boolean;
        user: string;
        bookedById: number | null;
    };
    msg: string;
}

export interface AddEventRequest {
  title: string;
  start: string;   
  end: string;     
}

export interface AddEventResponse {
  event: {
    id: number | string;
    title: string;
    start: string;
    end: string;
    booked: boolean;
    bookedById: number | null;
  };
  msg: string;
}

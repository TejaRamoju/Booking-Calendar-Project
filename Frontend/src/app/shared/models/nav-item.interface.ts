export interface NavbarUser {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
  token?: string;
  access_token?: string;
  [key: string]: any;

}

export interface NavbarEvent {
  id: number;
  title: string;
  booked?: boolean;
  bookedById?: number;
  user?: any;
  [key: string]: any;
}


export interface NavbarCategoryChangeEvent {
  value: string;
}

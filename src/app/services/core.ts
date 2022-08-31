export const enum BizStatus {
  ACTIVE = 2,
  DEF = 6,
}
export interface Auth {
  id: string;
  currentPassword: string;
  newPassword: string;
}

export interface CONFIG {
  url: string;
  mask: MaskConfig
}
export interface MaskConfig {
  maxnumber_count: string;
  brand_sku_count : string
}
export interface ViewResult<T> {
  success: boolean;
  status: number;
  message: string;
  errors: any;
  log: any;
  details: T;
  queryLog: any;
}

export interface User {
  first_name: string;
  last_name: string;
  nrc_value: string;
  image_url: string;
  email: string;
  phone: string;
  address: string;
  brand: any;
  user_type: any;
  user_roles: [];
}
export const enum UserTypes {
  ADMIN = "admin",
  SELLER = "brand_owner",
  USER = "user"
}
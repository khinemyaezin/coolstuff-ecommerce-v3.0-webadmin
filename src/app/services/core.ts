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
  mask: MaskConfig;
}
export interface MaskConfig {
  maxnumber_count: string;
  brand_sku_count: string;
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
  ADMIN = 'admin',
  SELLER = 'brand_owner',
  USER = 'user',
}

export interface Product {
  id: string;
  biz_status: number;
  title: string;
  brand: string;
  manufacture: string;
  package_qty: number;
  fk_brand_id: string;
  fk_category_id: string;
  fk_packtype_id: string;
  fk_prod_group_id: string | null;
  fk_currency_id: string;
  fk_varopt_1_hdr_id: string | null;
  fk_varopt_2_hdr_id: string | null;
  fk_varopt_3_hdr_id: string | null;
  created_at: string;
  updated_at: string;
  variants: any;
}

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
  id: string;
  status: number;
  first_name: string;
  last_name: string;
  nrc_value: string;
  profile_image: any;
  email: string;
  phone: string;
  address: string;
  brand: any;
  user_type: UserTypes;
  user_roles: [];
}
export const enum UserTypes {
  ADMIN = '1',
  SELLER = '2',
  USER = '3',
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
export interface Category {
  id: string|null;
  biz_status: number;
  title: string;
  full_path: string;
  lft: number;
  rgt: number;
  created_at: string;
  updated_at: string;
}
export interface CategoryLeave {
  id: string|null;
  biz_status: number;
  title: string;
  full_path: string;
  lft: number;
  rgt: number;
  lvl_id:string|null
}

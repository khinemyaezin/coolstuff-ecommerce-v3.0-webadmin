export interface RoleUpdateRequest {
  tasks: {
    id: string;
  }[];
}
export interface RoleSaveRequest {
  title: string;
  tasks: {
    id: string;
  }[];
}

export interface RoleUserSaveRequest {
  roles: { id: string }[];
}

export interface UserSaveRequest {
  user_type_id: string;
  first_name: string;
  last_name: string;
  profile_image: string;
  email: string;
  phone: string;
  address: string;
  password: string;
}

export interface ProductSaveRequest {
  id: string;
  biz_status: number;
  title: string;
  brand: string;
  manufacture: string;
  package_qty: number;
  fk_brand_id: string;
  fk_category_id: string;
  fk_packtype_id: string;
  fk_group_id: string;
  fk_currency_id: string;
  fk_varopt_1_hdr_id: string | null;
  fk_varopt_2_hdr_id: string | null;
  fk_varopt_3_hdr_id: string | null;
  fk_lvlcategory_id: string | null;
  fk_prod_group_id: string | null;
  hasVariant: boolean;
  variants: Partial<ProductSaveRequestVariant>[];
}
export interface ProductSaveRequestVariant {
  id: string;
  biz_status: number;
  seller_sku: string;
  fk_varopt_1_hdr_id: string;
  fk_varopt_1_dtl_id: string;
  fk_varopt_1_unit_id: string;
  var_1_title: string;
  fk_varopt_2_hdr_id: string;
  fk_varopt_2_dtl_id: string;
  fk_varopt_2_unit_id: string;
  var_2_title: string;
  fk_varopt_3_hdr_id: string;
  fk_varopt_3_dtl_id: string;
  fk_varopt_3_unit_id: string;
  var_3_title: string;
  buy_price: number;
  compared_price: number;
  fk_buy_currency_id: string;
  selling_price: number;
  track_qty: boolean;
  qty: number;
  fk_condition_id: string;
  condition_desc: string;
  features: string[];
  prod_desc: string;
  start_at: string | null;
  expired_at: string | null;
  attributes: {
    fk_varopt_hdr_id: string;
    fk_varopt_dtl_id: string;
    fk_varopt_unit_id: string;
    value: string;
  }[];

  media_1_image: string;
  media_2_image: string;
  media_3_image: string;
  media_4_image: string;
  media_5_image: string;
  media_6_image: string;
  media_7_image: string;
  media_8_video: string;
  media_9_video: string;

  locations: {
    fk_location_id: string;
    quantity: string;
  }[];
}

export interface BrandBioUpdateRequest {
  description: string;
}
export interface BrandUpdateRequest {
  title: string;
  profile_image: string | null;
  cover_image: string | null;
}

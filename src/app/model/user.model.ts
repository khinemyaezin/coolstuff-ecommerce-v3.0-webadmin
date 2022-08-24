
export const enum UserTypes {
  ADMIN = "admin",
  SELLER = "brand_owner",
  USER = "user"
}

export class User {
  constructor(
    public first_name: string,
    public last_name: string,
    public nrc_value: string,
    public image_url: string,
    public email: string,
    public phone: string,
    public address: string,
    public brand: any,
    public user_type: any,
    public user_roles: []
  ) {}
}

export type UserType= UserTypes;

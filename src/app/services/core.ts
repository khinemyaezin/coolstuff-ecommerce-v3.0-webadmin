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
  mask: {
    maxnumber_count: string;
  };
}

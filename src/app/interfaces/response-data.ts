export interface ResponseObject<T> {
  success: boolean;
  status: number;
  message: string;
  details:T
}

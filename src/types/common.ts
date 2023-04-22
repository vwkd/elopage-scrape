export interface ErrorResponse {
  success: false;
  error: Error;
}

export interface Error {
  message: string;
  type: string;
}

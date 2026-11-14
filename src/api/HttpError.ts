export class HttpError extends Error {
  status = 0;
  constructor(status: number) {
    super();
    void status;
  }
}

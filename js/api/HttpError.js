export class HttpError extends Error {
    status = 0;
    constructor(status) {
        super();
        this.status = status;
    }
}
//# sourceMappingURL=HttpError.js.map
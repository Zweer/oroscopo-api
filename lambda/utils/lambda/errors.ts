export class ErrorWithStatus extends Error {
  static DEFAULT_STATUS_CODE: number = 500;

  constructor(message?: string, readonly statusCode: number = ErrorWithStatus.DEFAULT_STATUS_CODE) {
    super(message);
  }

  toJSON() {
    return {
      message: this.message,
    };
  }

  static fromError(error: Error): ErrorWithStatus {
    const errorWithStatus = new ErrorWithStatus(error.message);

    errorWithStatus.stack = error.stack;

    return errorWithStatus;
  }
}

export class ErrorWithStatus404 extends ErrorWithStatus {
  constructor(message?: string) { super(message, 404); }
}

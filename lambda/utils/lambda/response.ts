import { APIGatewayProxyResult } from 'aws-lambda';

import { ErrorWithStatus } from './errors';

type headers = {
  [header: string]: boolean | number | string;
};

function createResponse(data: { [key: string]: any }, statusCode: number, headers: headers): APIGatewayProxyResult {
  const body = JSON.stringify({ statusCode, ...data });

  return {
    statusCode,
    headers,
    body,
  };
}

export function createSuccessResponse(data: any, statusCode: number = 200, headers?: headers) {
  return createResponse({ data }, statusCode, headers);
}

export function createErrorResponse(error: ErrorWithStatus | Error, headers?: headers): APIGatewayProxyResult {
  const errorWithStatus = error instanceof ErrorWithStatus ? error : ErrorWithStatus.fromError(error);

  return createResponse({ error: errorWithStatus.toJSON() }, errorWithStatus.statusCode, headers);
}

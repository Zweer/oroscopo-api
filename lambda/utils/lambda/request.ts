import { APIGatewayProxyEvent } from 'aws-lambda';

export function parseBody(event: APIGatewayProxyEvent): object {
  const body = event.body;
  const contentTypeRaw = event.headers['Content-Type'] || event.headers['content-type'] || '';
  const [contentType] = contentTypeRaw.split(';');

  let bodyObj = {};

  if (contentType.startsWith('multipart/form-data')) {
    throw new Error('Don\'t want to handle multipart bodies');
  }

  switch (contentType) {
    case 'application/json':
      bodyObj = JSON.parse(body);
      break;

    case 'application/x-www-form-urlencoded':
      (body || '')
        .split('&')
        .map(keyValue => keyValue.split('='))
        .forEach(([key, value]) => {
          bodyObj[key] = value;
        });
      break;

    case 'text/plain':
      bodyObj = body;
      break;

    case '':
      // do nothing
      break;

    default:
      throw new Error(`Invalid Content-Type: ${contentType}`);
  }

  return bodyObj;
}

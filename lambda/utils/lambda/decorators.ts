import 'reflect-metadata';

import { parseBody } from './request';
import { createSuccessResponse, createErrorResponse } from './response';
import { APIGatewayProxyEvent, SNSEvent } from 'aws-lambda';

type paramKey = string | Symbol | number;
type paramMetadata = {
  paramKey: paramKey;
  paramIndex: number;
};

const paramMetadataKey = Symbol('param');
export function param(paramKey: paramKey): ParameterDecorator {
  return createRouteParamDecorator(paramMetadataKey)(paramKey);
}

const bodyMetadataKey = Symbol('body');
const bodyEntireKey = Symbol('entire-body');
export function body(paramKey: paramKey = bodyEntireKey): ParameterDecorator {
  return createRouteParamDecorator(bodyMetadataKey)(paramKey);
}

const snsMessageMetadataKey = Symbol('sns');
export function sns(): ParameterDecorator {
  return createRouteParamDecorator(snsMessageMetadataKey)(0);
}

const createRouteParamDecorator = (paramType: Symbol) => (paramKey: paramKey): ParameterDecorator => (target: Object, propertyKey: string | symbol, paramIndex: number): void => {
  const existingParamMetadata: paramMetadata[] = Reflect.getOwnMetadata(paramType, target, propertyKey) || [];

  existingParamMetadata.push({ paramKey, paramIndex });

  Reflect.defineMetadata(paramType, existingParamMetadata, target, propertyKey);
};

export function endpoint(target: any, propertyName: string, descriptor: TypedPropertyDescriptor<Function>): void {
  const method = descriptor.value;

  descriptor.value = async function (...args) {
    const event = args[0] as APIGatewayProxyEvent;

    const paramMetadata: paramMetadata[] = Reflect.getOwnMetadata(paramMetadataKey, target, propertyName) || [];
    paramMetadata.forEach(({ paramKey, paramIndex }) => {
      args[paramIndex] = event.pathParameters && event.pathParameters[paramKey as string];
    });

    const bodyMetadata = Reflect.getOwnMetadata(bodyMetadataKey, target, propertyName) || [];
    bodyMetadata.forEach(({ paramKey, paramIndex }) => {
      const body = parseBody(event);

      args[paramIndex] = body && paramKey === bodyEntireKey ? body : body[paramKey];
    });

    const snsMessageMetadata = Reflect.getOwnMetadata(snsMessageMetadataKey, target, propertyName) || [];
    snsMessageMetadata.forEach(({ paramKey, paramIndex }) => {
      let message;

      try {
        message = (event as unknown as SNSEvent).Records[paramKey as number].Sns.Message;
      } catch (error) {}

      try {
        message = typeof message === 'string' ? JSON.parse(message) : message;
        message = {
          text: '',
          ...message,
        };
      } catch (error) {
        message = { text: message };
      }

      args[paramIndex] = message;
    });

    try {
      const result = await method.apply(this, args);

      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error);
    }
  };
}

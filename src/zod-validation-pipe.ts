import { PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ZodError, ZodSchema  } from 'zod';
import { CodedRpcException } from './coded-error';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    if (metadata.type === 'custom') {
        return value;
    }
    try {
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error) {
      throw new CodedRpcException('Invalid Params', -32602, {
        validationErrors: (error as ZodError).issues,
      });
    }
  }
}

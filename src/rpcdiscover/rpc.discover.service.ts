import { OnModuleInit, Injectable } from '@nestjs/common';
import { DiscoveryService } from '@golevelup/nestjs-discovery';
import {
  JSONRPC_CLASS_METADATA,
  JSONRPC_METHOD_OPENRPC_SCHEMAS,
  OpenRPCMethodMetadata,
} from '../decorators';
import { ZodSchema } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import documentBuilder from './DocumentBuilder';

const transformPropertiesToParams = (
  zodSchema: ZodSchema,
  methodName: string,
) => {
  const schema = zodToJsonSchema(zodSchema, {
    name: methodName,
    nameStrategy: 'title',
    $refStrategy: 'none',
  });
  const properties = (schema as any).properties;
  if (!(schema as any).properties) {
    throw new Error('Schema must have properties to be used as params');
  }
  const params = Object.entries(properties).map(([key, value]) => {
    return {
      name: key,
      required: (schema as any).required?.includes(key) || undefined,
      schema: value,
    };
  });
  return params;
};

@Injectable()
export class RpcDiscoverService implements OnModuleInit {
  public openrpcDocument: any;

  constructor(private readonly discover: DiscoveryService) {
    this.onModuleInit();
  }

  public async onModuleInit() {
    const namespaces = await this.discover.controllersWithMetaAtKey(
      JSONRPC_CLASS_METADATA,
    );
    const methods =
      await this.discover.methodsAndControllerMethodsWithMetaAtKey<OpenRPCMethodMetadata>(
        JSONRPC_METHOD_OPENRPC_SCHEMAS,
      );

    const openrpcDocument = {
      info: { title: 'My API', version: '1.0.0' },
      methods: methods.map((m) => {
        let name = m.discoveredMethod.methodName;
        const jsonSchema = transformPropertiesToParams(m.meta.params, name);
        const parentClass = namespaces.find(
          (n) => n.discoveredClass.name === m.discoveredMethod.parentClass.name,
        );
        if (parentClass && (parentClass.meta as any).namespace) {
          name = `${(parentClass.meta as any).namespace}.${name}`;
        }
        const resultSchema = m.meta.result ? zodToJsonSchema(m.meta.result) : undefined;
        if (resultSchema && resultSchema.$schema) {
          delete resultSchema.$schema;
        }
        return {
          name,
          params: jsonSchema,
          result: m.meta.result ? {
            name: name + 'Result',
            schema: resultSchema
          } : undefined
        };
      }),
    };

    documentBuilder.setDocument(openrpcDocument);
  }

  setVersion(version: string) {
    documentBuilder.setVersion(version);
  }

  getOpenRPCDocument() {
    return documentBuilder.getDocument();
  }
}

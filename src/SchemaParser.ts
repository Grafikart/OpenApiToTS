import { IJsonSchema, OpenAPIV3, OpenAPIV3_1 } from "openapi-types";
import { ObjectType } from "./nodes/ObjectType.js";
import { NodeType } from "./nodes/NodeType.js";
import { SimpleType } from "./nodes/SimpleType.js";
import { EnumType } from "./nodes/EnumType.js";
import { ArrayType } from "./nodes/ArrayType.js";
import { UnionType } from "./nodes/UnionType.js";
import { IntersectionType } from "./nodes/IntersectionType.js";
import { StringLiteralType } from "./nodes/StringLiteralType.js";

function capitalize(s: string): string {
  return s[0].toUpperCase() + s.slice(1);
}

type Parameter = OpenAPIV3_1.ParameterObject;
type Ref = OpenAPIV3_1.ReferenceObject;
type Operation = OpenAPIV3_1.OperationObject;
type Document = OpenAPIV3_1.Document;
type Responses = OpenAPIV3_1.ResponsesObject;
type Response = OpenAPIV3_1.ResponseObject;
type Schema =
  | IJsonSchema
  | OpenAPIV3_1.BaseSchemaObject
  | IJsonSchema[]
  | OpenAPIV3.BaseSchemaObject;
type RequestBody = OpenAPIV3_1.RequestBodyObject;

export class SchemaParser {
  constructor(private document: Document) {}

  convertToCode(): string {
    const types = [] as [string, NodeType][];

    // Components (shared types)
    for (const [group, schemas] of Object.entries(
      this.document.components ?? {},
    )) {
      // We don't handle auth yet
      if (group === "securitySchemes") {
        continue;
      }
      const typeName = "API" + capitalize(group);
      const components = new ObjectType();
      for (const [schemaName, componentSchema] of Object.entries(schemas)) {
        components.addProperty(
          schemaName,
          this.itemToNode(
            componentSchema?.["content"]?.["application/json"]?.["schema"] ??
              componentSchema,
          ),
        );
      }
      types.push([typeName, components]);
    }

    // Api Endpoints
    const apiEndpoints = new ObjectType();
    for (const [endpoint, methods] of Object.entries(
      this.document.paths ?? {},
    )) {
      const apiEndpoint = new ObjectType();
      const responses = new ObjectType();
      const requests = new UnionType([]);
      for (const [method, pathSchema] of Object.entries(methods ?? {})) {
        if (typeof pathSchema === "string" || Array.isArray(pathSchema)) {
          throw new Error(`Can't handle string ${pathSchema}`);
        }
        requests.addSubtype(this.requestToType(pathSchema, method));
        responses.addProperty(
          method,
          this.responseToType(pathSchema.responses),
        );
      }
      apiEndpoint.addProperty("responses", responses);
      apiEndpoint.addProperty("requests", requests);
      apiEndpoints.addProperty(endpoint, apiEndpoint);
    }
    types.push(["APIEndpoints", apiEndpoints]);

    return (
      types
        .map(([name, type]) => `export type ${name} = ${type.toString()}`)
        .join("\n\n") +
      `
  
export type APIPaths = keyof APIEndpoints

export type APIRequests<T extends APIPaths> = APIEndpoints[T]["requests"]

export type APIMethods<T extends APIPaths> = NonNullable<APIRequests<T>["method"]>

export type APIRequest<
  T extends APIPaths,
  M extends APIMethods<T>
> = Omit<{
  [MM in APIMethods<T>]: APIRequests<T> & { method: MM }
}[M], "method"> & {method?: M}

type DefaultToGet<T extends string | undefined> = T extends string
  ? T
  : "get"

export type APIResponse<
  T extends APIPaths,
  M extends string | undefined
> = DefaultToGet<M> extends keyof APIEndpoints[T]["responses"]
  ? APIEndpoints[T]["responses"][DefaultToGet<M>]
  : never`
    );
  }

  private requestToType(pathSchema: Operation, method: string): NodeType {
    const type = new ObjectType();
    type.addProperty("method", new StringLiteralType(method), method === "get");

    if (pathSchema.parameters) {
      const params = pathSchema.parameters.map((v) => this.resolveRefs(v));
      this.addParamsToType(type, params, "query", "query");
      this.addParamsToType(type, params, "path", "urlParams");
    }

    if ("requestBody" in pathSchema && pathSchema.requestBody) {
      const requestBody = this.resolveRefs(pathSchema.requestBody);
      const jsonBody = requestBody.content["application/json"];
      const multipartBody = requestBody.content["multipart/form-data"];
      const bodyTypes: NodeType[] = [];

      if (jsonBody && "schema" in jsonBody && jsonBody.schema) {
        bodyTypes.push(this.itemToNode(jsonBody.schema));
      }

      if (multipartBody && "schema" in multipartBody && multipartBody.schema) {
        bodyTypes.push(new SimpleType("FormData"));
      }

      if (bodyTypes.length > 0) {
        type.addProperty("body", new UnionType(bodyTypes));
      }
    }

    return type;
  }

  private responseToType(responses: Responses): NodeType {
    let response = this.successResponse(responses);
    if (!response) {
      return new SimpleType("null");
    }
    if ("$ref" in response) {
      response = this.resolveRefs(response) as Responses[string];
    }
    if (!("content" in response)) {
      return new SimpleType("null");
    }
    const jsonBody = response.content?.["application/json"]?.["schema"];
    if (!jsonBody) {
      return new SimpleType("null");
    }
    return this.itemToNode(jsonBody);
  }

  /**
   * Find a 2XX response among responses
   */
  private successResponse(responses?: Responses): Ref | Response | undefined {
    if (!responses) {
      return undefined;
    }
    for (const [status, response] of Object.entries(responses)) {
      if (status.startsWith("2")) {
        return response;
      }
    }
    return undefined;
  }

  /**
   * Extract parameters
   */
  private addParamsToType(
    type: ObjectType,
    parameters: Parameter[],
    inName: string,
    propertyName: string,
  ): ObjectType {
    const filteredParameters = parameters.filter((p) => p.in === inName);
    const requiredParameters = filteredParameters.filter((p) => p.required);
    if (filteredParameters.length === 0) {
      return type;
    }
    const subType = new ObjectType();
    for (const param of filteredParameters) {
      if ("schema" in param && param.schema) {
        subType.addProperty(
          param["name"],
          this.itemToNode(param.schema),
          param["required"] !== true,
        );
      } else if ("content" in param && param.content) {
        subType.addProperty(
          param["name"],
          this.itemToNode(param.content),
          param["required"] !== true,
        );
      } else if (
        "type" in param &&
        param.type &&
        typeof param.type === "string"
      ) {
        subType.addProperty(
          param["name"],
          this.itemToNode({ type: param.type } satisfies Schema),
          param["required"] !== true,
        );
      } else {
        throw new Error(`Can't handle param ${JSON.stringify(param)}`);
      }
    }
    type.addProperty(propertyName, subType, requiredParameters.length === 0);
    return type;
  }

  private resolveRefs<T extends Parameter | RequestBody>(schema: T | Ref): T {
    if ("$ref" in schema) {
      const [_, __, groupName, componentName] = schema.$ref.split("/");
      const components = this.document.components ?? {};
      if (!(groupName in components)) {
        throw new Error(`Can't find component ${schema.$ref}`);
      }
      const componentsInGroup =
        components[groupName as keyof typeof components];
      if (!componentsInGroup || !(componentName in componentsInGroup)) {
        throw new Error(`Can't find component ${schema.$ref}`);
      }
      const component = componentsInGroup[componentName];
      if (!component || "$ref" in component) {
        throw new Error(`Can't handle nested $ref ${schema.$ref}`);
      }
      return component as T;
    }
    return schema;
  }

  private itemToNode(item: Schema): NodeType {
    try {
      if (Array.isArray(item)) {
        return new UnionType(item.map((v) => this.itemToNode(v)));
      }

      if ("type" in item && Array.isArray(item.type)) {
        if (item.type.includes("object") && item.type.includes("null")) {
          item.type = "object";
          // @ts-expect-error we set an arbitrary value here
          item.nullable = true;
        } else {
          throw new Error(
            `Can't convert item to NodeType : ${JSON.stringify(item.type)}`,
          );
        }
      }

      const infos = {
        format: "format" in item ? item.format : undefined,
        example: "example" in item ? item.example : undefined,
        description: "description" in item ? item.description : undefined,
      };

      if ("nullable" in item && item.nullable) {
        item.nullable = false;
        return new UnionType([
          new SimpleType("null"),
          this.itemToNode(item),
        ]).with(infos);
      }

      if ("application/json" in item) {
        return this.itemToNode(
          (item["application/json"] as { schema: Schema })["schema"],
        ).with(infos);
      }

      if ("in" in item && "schema" in item) {
        return this.itemToNode(item["schema"] as Schema).with(infos);
      }

      if ("$ref" in item && item.$ref) {
        const [_, __, group, name] = item.$ref.split("/");
        return new SimpleType(`API${capitalize(group)}['${name}']`).with(infos);
      }

      if ("anyOf" in item && item.anyOf) {
        return new UnionType(item.anyOf.map((v) => this.itemToNode(v))).with(
          infos,
        );
      }

      if ("allOf" in item && item.allOf) {
        return new IntersectionType(
          item.allOf.map((v) => this.itemToNode(v)),
        ).with(infos);
      }

      if ("oneOf" in item && item.oneOf) {
        return new UnionType(item.oneOf.map((v) => this.itemToNode(v))).with(
          infos,
        );
      }

      // Handle malformed openapi document with missing type
      if (!("type" in item) && "properties" in item) {
        (item as any).type = "object";
      }

      if (!("type" in item) || typeof item.type !== "string") {
        throw new Error(
          `Can't convert item to NodeType : ${JSON.stringify(item)}`,
        );
      }
      if (["object"].includes(item.type)) {
        const type = new ObjectType().with(infos);
        if ("properties" in item || "items" in item) {
          let properties =
            "properties" in item ? item.properties! : item.items!;
          for (const [propertyName, propertyItem] of Object.entries(
            properties,
          )) {
            type.addProperty(
              propertyName,
              this.itemToNode(propertyItem),
              !(item.required ?? []).includes(propertyName),
            );
          }
        }
        // We have additional properties (unnamed properties)
        if ("additionalProperties" in item && item.additionalProperties) {
          if (typeof item.additionalProperties === "boolean") {
            type.addAdditionalProperties(new SimpleType("unknown"));
          } else {
            type.addAdditionalProperties(
              this.itemToNode(item.additionalProperties),
            );
          }
        }
        return type;
      }

      if (["string"].includes(item.type)) {
        if (item.enum) {
          return new EnumType(item.enum).with(infos);
        }
        return new SimpleType("string").with(infos);
      }

      if (["array"].includes(item.type)) {
        if (!("items" in item) || !item.items) {
          return new ArrayType(new SimpleType("unknown")).with(infos);
        }
        return new ArrayType(this.itemToNode(item.items)).with(infos);
      }

      if (["int", "integer", "number"].includes(item.type)) {
        return new SimpleType("number").with(infos);
      }

      if (["boolean", "bool"].includes(item.type)) {
        return new SimpleType("boolean").with(infos);
      }

      console.error(item);
      throw new Error(`Can't convert item to NodeType`);
    } catch (e) {
      console.error("VVVV From VVVV");
      console.error(item);
      throw e;
    }
  }
}

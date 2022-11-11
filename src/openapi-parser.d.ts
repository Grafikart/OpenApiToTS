import { OpenAPIV3_1 } from 'openapi-types'

declare module '@readme/openapi-parser' {
  export default {
    parse: (v: string) => OpenAPIV3_1.Document
  }
}

import test from 'ava';
import { dirname, join } from 'path';
import {readFileSync} from 'fs';
import { fileURLToPath } from 'url';

import OpenAPI from '@readme/openapi-parser'
import { OpenAPIV3_1 } from 'openapi-types'
import { SchemaParser } from '../src/SchemaParser.js'
import { format } from 'prettier'

const testDir = dirname(fileURLToPath(import.meta.url))


const shouldMatchFiles = async (file: string, t: any) => {
  const apiSchema = await OpenAPI.parse(join(testDir, `${file}.yml`)) as OpenAPIV3_1.Document;
  const options = new SchemaParser(apiSchema)
  const code = options.convertToCode()
  t.is(format(code, { semi: false, parser: "typescript" }), readFileSync(join(testDir, `${file}.ts`), 'utf-8'))
}

test('it should work with OpenAPIV3.1', t => {
  return shouldMatchFiles('openapiv31', t)
})
 test('it should work with OpenAPIV3.0', (t) => {
    return shouldMatchFiles('openapiv30', t)
});

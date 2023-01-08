import test from 'ava';
import { dirname, join } from 'path';
import {readFileSync} from 'fs';
import { fileURLToPath } from 'url';

import OpenAPI from '@readme/openapi-parser'
import { OpenAPIV3_1 } from 'openapi-types'
import { SchemaParser } from '../src/SchemaParser.js'
import { format } from 'prettier'

const testDir = dirname(fileURLToPath(import.meta.url))
const fixture = join(testDir, 'petstore.yml');
const snapshot = join(testDir, 'petstore.ts');


test('should compile correctly', async t => {
  const apiSchema = await OpenAPI.parse(fixture) as OpenAPIV3_1.Document;
  const options = new SchemaParser(apiSchema)
  const code = options.convertToCode()
  t.is(format(code, { semi: false, parser: "typescript" }), readFileSync(snapshot, 'utf-8'))
});

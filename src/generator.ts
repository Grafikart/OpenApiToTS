#!/usr/bin/env node

import { parse } from "@readme/openapi-parser";
import type { OpenAPIV3_1 } from "openapi-types";
import { format } from "prettier";
import { writeFileSync } from "node:fs";
import { SchemaParser } from "./SchemaParser.js";

try {
  const args = process.argv.slice(2);
  const yamlFile = args[0] ?? "./openapi.yml";
  const tsFile = args[1]
    ? args[1]
    : args[0].replace(".yml", ".ts").replace(".yaml", ".ts");
  const apiSchema = (await parse(yamlFile)) as OpenAPIV3_1.Document;
  const options = new SchemaParser(apiSchema);
  const code = options.convertToCode();
  writeFileSync(
    tsFile,
    await format(code, { semi: false, parser: "typescript" }),
  );
  process.stdout.write(`${tsFile} created with success`);
  process.exit(0);
} catch (err) {
  console.error(err);
}

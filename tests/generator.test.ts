import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { expect, test } from "bun:test";

import { parse } from "@readme/openapi-parser";
import { OpenAPIV3_1 } from "openapi-types";
import { SchemaParser } from "../src/SchemaParser.js";
import { format } from "prettier";

const testDir = dirname(fileURLToPath(import.meta.url));

const shouldMatchFiles = async (file: string) => {
  const apiSchema = (await parse(
    join(testDir, `${file}.yml`),
  )) as OpenAPIV3_1.Document;
  const options = new SchemaParser(apiSchema);
  const code = options.convertToCode();
  const got = await format(code, { semi: false, parser: "typescript" });
  const fixturePath = join(testDir, `${file}.ts`);

  try {
    const want = await Bun.file(fixturePath).text();
    expect(got).toBe(want);
  } catch (error) {
    // If the fixture file doesn't exist, create it
    await Bun.write(fixturePath, got);
    console.log(`Created fixture file: ${fixturePath}`);
  }
};

test("it should work with OpenAPIV3.1", () => {
  return shouldMatchFiles("openapiv31");
});
test("it should work with OpenAPIV3.0", () => {
  return shouldMatchFiles("openapiv30");
});
test("it should work with multipart/form-data request body", () => {
  return shouldMatchFiles("multipart");
});
test("it should work with unknown items type for array", () => {
  return shouldMatchFiles("unknown");
});
test("it should handle additional properties correctly", () => {
  return shouldMatchFiles("additionProperties");
});
test("it should handle multiple type correctly", () => {
  return shouldMatchFiles("multipleType");
});

#!/usr/bin/env node

import OpenAPI from '@readme/openapi-parser'
import type { OpenAPIV3_1 } from 'openapi-types'
import { format } from 'prettier'
import { writeFileSync } from 'node:fs'
import { SchemaParser } from './SchemaParser.js'
import { getConfig } from './config.js'
import path from 'node:path'

try {
  const args = process.argv.slice(2)
  const yamlFile = args[0] ?? './openapi.yml'
  const tsFile = args[1] ? args[1] : args[0].replace('.yml', '.ts').replace('.yaml', '.ts')

  // Récupérer la configuration
  const projectRoot = process.cwd()
  const config = getConfig(projectRoot)

  const apiSchema = await OpenAPI.parse(yamlFile) as OpenAPIV3_1.Document;
  const options = new SchemaParser(apiSchema, config.generator)
  const code = options.convertToCode()

  // Utiliser les options de format de la configuration
  const formatOptions = {
    parser: "typescript",
    semi: config.format?.semi ?? false,
    tabWidth: config.format?.tabWidth ?? 2,
    singleQuote: config.format?.singleQuote ?? true,
    trailingComma: config.format?.trailingComma ? "all" : "none"
  }

  writeFileSync(tsFile, await format(code, formatOptions))
  process.stdout.write(`${tsFile} created with success`)
  process.exit(0)
}
catch(err) {
  console.error(err);
}

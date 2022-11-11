# @grafikart/o2ts

A simple tool to convert OpenAPI 3.1 specs into a TypeScript file with usefull type.

## Install

```bash
npm i -D @grafikart/o2ts
yarn add -D @grafikart/o2ts
pnpm add -D @grafikart/o2ts
```

## Usage

Then to convert a yaml file to ts, in your package.json

```json
{
  "scripts": {
    "openapi": "o2ts ./openapi.yml"
  }
}
```

Then

```bash
npm run openapi
```

## Example

Here are some examples to that can use the definition generated with the tool.

```ts
import type { APIPaths, APIRequests, APIResponse } from './openapi'

export async function fetchAPI<
  Path extends APIPaths,
  Options extends APIRequests<Path>
> (path: Path, options: Options): Promise<APIResponse<Path, DefaultToGet<Options['method']>>> {
  // Your code here
}
```

You can find some implementations in the examples directory


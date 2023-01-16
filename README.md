# @grafikart/o2ts

A simple tool to convert OpenAPI 3.0/3.1 specs into a TypeScript file with useful types.

## Install

```bash
npm i -D @grafikart/o2ts
yarn add -D @grafikart/o2ts
pnpm add -D @grafikart/o2ts
```

## Usage

Add the following script to your `package.json`:

```json
{
  "scripts": {
    "openapi": "o2ts ./openapi.yml"
  }
}
```

Then:

```bash
npm run openapi
```

## Example

Here is an example of using the definitions generated with the tool:

```ts
import type { APIPaths, APIRequests, APIResponse } from './openapi'

export async function fetchAPI<
  Path extends APIPaths,
  Options extends APIRequests<Path>
> (path: Path, options: Options): Promise<APIResponse<Path, Options['method']>> {
  // Your code here
}
```

You can find more implementations in the [examples directory](./examples).


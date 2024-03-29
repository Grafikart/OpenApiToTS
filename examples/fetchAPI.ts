import type { APIPaths, APIRequests, APIResponse } from '../tests/openapiv31'

const baseURL = 'https://petstore3.swagger.io/api/v3'

export async function fetchAPI<
  Path extends APIPaths,
  Options extends APIRequests<Path>
  > (path: Path, options?: Options): Promise<APIResponse<Path, Options['method']>> {
  const fetchOptions: RequestInit = {
    method: options?.method ?? 'get',
    credentials: 'include',
    headers: {
      'Accept': 'application/json'
    }
  }
  options = (options ?? {}) as Options

  // Request body
  const body = 'body' in options ? options['body'] : null
  if (body && (
    typeof body === 'string' ||
    body instanceof FormData
  )) {
    fetchOptions.body = body
  } else if (body) {
    (fetchOptions.headers as Record<string, string>)['Content-Type'] = 'application/json'
    fetchOptions.body = JSON.stringify(body)
  }

  // Replace url parameters (for instance "/path/{id}"
  let urlPath: string = path
  if ('urlParams' in options) {
    for (const [name, value] of Object.entries(options.urlParams)) {
      urlPath = urlPath.replace(`{${name}}`, value.toString())
    }
  }

  const url = new URL(baseURL + urlPath);

  // Add query parameters
  if ('query' in options && options.query) {
    for (const [name, value] of Object.entries(options.query)) {
      url.searchParams.set(name, typeof value === 'object' ? JSON.stringify(value) : (value as any).toString())
    }
  }

  const response = await fetch(url.toString(), fetchOptions)
  if (!response.headers.get('content-type')?.includes('application/json')) {
    throw new APIError({
      message: await response.text()
    }, response.status)
  }
  if (response.status === 204) {
    return null as any
  }
  const data = await response.json()
  if (response.ok) {
    return data
  }
  throw new APIError(data, response.status)
}

export class APIError extends Error {

  constructor (public data: object, public status: number) {
    super()
  }

}

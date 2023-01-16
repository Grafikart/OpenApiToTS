import { APIPaths, APIRequests, APIRequest, APIResponse, APIMethods } from './openapiv31'

/**
 * This file is used to test if the type would work in a real use case
 */
function fetch2Params<
  Path extends APIPaths,
  Options extends APIRequests<Path>
> (path: Path, options?: Options): Promise<APIResponse<Path, Options['method']>> {
  return {path, options} as any // fake return, we are not interested by the implementation
}

function fetch3Params<
  Path extends APIPaths,
  Method extends APIMethods<Path>
> (path: Path, method: Method, options: APIRequest<Path, Method>): Promise<APIResponse<Path, Method>> {
  return {path, options, method} as any // fake return, we are not interested by the implementation
}

const data = await fetch2Params("/pet/{petId}", {method: "post", urlParams: {petId: 3}})
const data2 = await fetch3Params("/pet/{petId}", "post", {urlParams: {petId: 3}})
const b: APIRequest<"/pet/{petId}", "get">


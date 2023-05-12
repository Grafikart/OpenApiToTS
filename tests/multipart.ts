export type APISchemas = {
  File: {
    /*
     * Format: int64
     * @example 10
     */
    id?: number
    /* @example demo.mp4 */
    name: string
  }
}

export type APIEndpoints = {
  "/upload": {
    responses: { post: APISchemas["File"] }
    requests: { method: "post"; body: FormData }
  }
}

export type APIPaths = keyof APIEndpoints

export type APIRequests<T extends APIPaths> = APIEndpoints[T]["requests"]

export type APIMethods<T extends APIPaths> = NonNullable<
  APIRequests<T>["method"]
>

export type APIRequest<T extends APIPaths, M extends APIMethods<T>> = Omit<
  {
    [MM in APIMethods<T>]: APIRequests<T> & { method: MM }
  }[M],
  "method"
> & { method?: M }

type DefaultToGet<T extends string | undefined> = T extends string ? T : "get"

export type APIResponse<
  T extends APIPaths,
  M extends string | undefined
> = DefaultToGet<M> extends keyof APIEndpoints[T]["responses"]
  ? APIEndpoints[T]["responses"][DefaultToGet<M>]
  : never

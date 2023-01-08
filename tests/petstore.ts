export type APISchemas = {
  Order: {
    /*
     * Format: int64
     * @example 10
     */
    id?: number
    /*
     * Format: int64
     * @example 198772
     */
    petId?: number
    /*
     * Format: int32
     * @example 7
     */
    quantity?: number
    /* Format: date-time */
    shipDate?: string
    /*
     * Order Status
     * @example approved
     */
    status?: "placed" | "approved" | "delivered"
    complete?: boolean
  }
  Customer: {
    /*
     * Format: int64
     * @example 100000
     */
    id?: number
    /* @example fehguy */
    username?: string
    address?: Array<APISchemas["Address"]>
  }
  Address: {
    /* @example 437 Lytton */
    street?: string
    /* @example Palo Alto */
    city?: string
    /* @example CA */
    state?: string
    /* @example 94301 */
    zip?: string
  }
  Category: {
    /*
     * Format: int64
     * @example 1
     */
    id?: number
    /* @example Dogs */
    name?: string
  }
  User: {
    /*
     * Format: int64
     * @example 10
     */
    id?: number
    /* @example theUser */
    username?: string
    /* @example John */
    firstName?: string
    /* @example James */
    lastName?: string
    /* @example john@email.com */
    email?: string
    /* @example 12345 */
    password?: string
    /* @example 12345 */
    phone?: string
    /*
     * User Status
     * Format: int32
     * @example 1
     */
    userStatus?: number
  }
  Tag: {
    /* Format: int64 */
    id?: number
    name?: string
  }
  Pet: {
    /*
     * Format: int64
     * @example 10
     */
    id?: number
    /* @example doggie */
    name: string
    category?: APISchemas["Category"]
    photoUrls: Array<string>
    tags?: Array<APISchemas["Tag"]>
    /* pet status in the store */
    status?: "available" | "pending" | "sold"
  }
  ApiResponse: {
    /* Format: int32 */
    code?: number
    type?: string
    message?: string
  }
}

export type APIRequestBodies = {
  Pet: APISchemas["Pet"]
  UserArray: Array<APISchemas["User"]>
}

export type APIEndpoints = {
  "/pet": {
    responses: { put: APISchemas["Pet"]; post: APISchemas["Pet"] }
    requests:
      | { method: "put"; body: APISchemas["Pet"] }
      | { method: "post"; body: APISchemas["Pet"] }
  }
  "/pet/findByStatus": {
    responses: { get: Array<APISchemas["Pet"]> }
    requests: {
      method?: "get"
      query?: { status?: "available" | "pending" | "sold" }
    }
  }
  "/pet/findByTags": {
    responses: { get: Array<APISchemas["Pet"]> }
    requests: { method?: "get"; query?: { tags?: Array<string> } }
  }
  "/pet/{petId}": {
    responses: { get: APISchemas["Pet"]; post: null; delete: null }
    requests:
      | {
          method?: "get"
          urlParams: {
            /* Format: int64 */
            petId: number
          }
        }
      | {
          method: "post"
          query?: { name?: string; status?: string }
          urlParams: {
            /* Format: int64 */
            petId: number
          }
        }
      | {
          method: "delete"
          urlParams: {
            /* Format: int64 */
            petId: number
          }
        }
  }
  "/pet/{petId}/uploadImage": {
    responses: { post: APISchemas["ApiResponse"] }
    requests: {
      method: "post"
      query?: { additionalMetadata?: string }
      urlParams: {
        /* Format: int64 */
        petId: number
      }
    }
  }
  "/store/inventory": { responses: { get: {} }; requests: { method?: "get" } }
  "/store/order": {
    responses: { post: APISchemas["Order"] }
    requests: { method: "post"; body: APISchemas["Order"] }
  }
  "/store/order/{orderId}": {
    responses: { get: APISchemas["Order"]; delete: null }
    requests:
      | {
          method?: "get"
          urlParams: {
            /* Format: int64 */
            orderId: number
          }
        }
      | {
          method: "delete"
          urlParams: {
            /* Format: int64 */
            orderId: number
          }
        }
  }
  "/user": {
    responses: { post: null }
    requests: { method: "post"; body: APISchemas["User"] }
  }
  "/user/createWithList": {
    responses: { post: APISchemas["User"] }
    requests: { method: "post"; body: Array<APISchemas["User"]> }
  }
  "/user/login": {
    responses: { get: string }
    requests: {
      method?: "get"
      query?: { username?: string; password?: string }
    }
  }
  "/user/logout": { responses: { get: null }; requests: { method?: "get" } }
  "/user/{username}": {
    responses: { get: APISchemas["User"]; put: null; delete: null }
    requests:
      | { method?: "get"; urlParams: { username: string } }
      | {
          method: "put"
          urlParams: { username: string }
          body: APISchemas["User"]
        }
      | { method: "delete"; urlParams: { username: string } }
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

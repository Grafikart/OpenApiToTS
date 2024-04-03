export type APISchemas = {
  Document: {
    /*
     * The uuid of the document
     * @example 123e4567-e89b-12d3-a456-426655440000
     */
    uuid?: string /*
     * The type of risk object of the document is attached to
     * @example ContractRequest
     */
    objectType?:
      | "PolicyOwner"
      | "Car"
      | "Motorbike"
      | "ContractRequest"
      | "Contract" /*
     * The id of the risk object of the document is attached to
     * @example 25421
     */
    objectId?: number /*
     * The type of the document (DriverLicense, IdentityCard, AccidentRecord, PlateRegistrationCertificate, OdometerPicture, PurchaseInvoice, CurrentContract)
     * @example DriverLicense
     */
    documentType?:
      | "DriverLicense"
      | "IdentityCard"
      | "AccidentRecord"
      | "PlateRegistrationCertificate"
      | "OdometerPicture"
      | "PurchaseInvoice"
      | "CurrentContract" /*
     * The name of the file
     * @example driver-license.jpg
     */
    fileName?: string /*
     * The mime type of the file
     * @example image/jpeg
     */
    mimeType?: string /*
     * The date the document was created
     * @example 2020-01-01T00:00:00.000Z
     */
    createdAt?: string /*
     * The date the document was last updated
     * @example 2020-01-01T00:00:00.000Z
     */
    updatedAt?: string
  }
}

export type APIEndpoints = {
  "/document": {
    responses: {
      post: {
        /*
         * The uuid of the document
         * @example 123e4567-e89b-12d3-a456-426655440000
         */
        documentId?: string
      }
    }
    requests: { method: "post"; body: FormData }
  }
  "/documents": {
    responses: { get: Array<APISchemas["Document"]> }
    requests: { method?: "get" }
  }
  "/document/{documentUuid}": {
    responses: { get: APISchemas["Document"] }
    requests: {
      method?: "get"
      urlParams: {
        /* @example 123e4567-e89b-12d3-a456-426655440000 */
        documentUuid: string
      }
    }
  }
  "/required_documents": {
    responses: { get: null }
    requests: {
      method?: "get"
      query: {
        /* @example 123e4567-e89b-12d3-a456-426655440000 */
        contractRequestId: string
      }
    }
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

export type APIResponse<T extends APIPaths, M extends string | undefined> =
  DefaultToGet<M> extends keyof APIEndpoints[T]["responses"]
    ? APIEndpoints[T]["responses"][DefaultToGet<M>]
    : never

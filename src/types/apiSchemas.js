/**
 * Enum values reflected from OpenAPI schemas.
 */
export const SELLER_INCOTERMS = ["EXW", "FCA", "FOB"];
export const BUYER_INCOTERMS = ["CFR", "CIF", "DAP", "DDP"];
export const OFFER_STATUSES = ["OPEN", "ACTIVE", "LOCKED", "DELETED"];
export const SERVICE_REQUEST_STATUSES = ["REQUESTED"];

/**
 * @typedef {Object} OfferImageResponse
 * @property {string} id
 * @property {string} url
 */

/**
 * @typedef {Object} OfferResponse
 * @property {string} id
 * @property {string} product_name
 * @property {string | null} description
 * @property {number} quantity
 * @property {string} price - string number, see backend pattern validation.
 * @property {"EXW" | "FCA" | "FOB"} seller_incoterm
 * @property {string} port_of_loading
 * @property {string} cargo_ready_date - date string (YYYY-MM-DD)
 * @property {string | null} payment_terms
 * @property {"OPEN" | "ACTIVE" | "LOCKED" | "DELETED"} status
 * @property {string} seller_id
 * @property {OfferImageResponse[]} images
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} PrivateOfferResponse
 * @property {string} id
 * @property {string} offer_id
 * @property {string} service_request_id
 * @property {string} provider_id
 * @property {number | string} negotiated_price
 * @property {string | null} updated_crd
 * @property {string | null} updated_etd
 * @property {string} seller_documentation
 * @property {string | null} internal_notes
 * @property {string} status
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} PrivateOfferCreatePayload
 * @property {number} negotiated_price
 * @property {string | null} updated_crd
 * @property {string | null} updated_etd
 * @property {string} seller_documentation
 * @property {string | null} internal_notes
 */

/**
 * Minimal Buyer Interest shape used in the UI.
 * @typedef {Object} BuyerInterest
 * @property {string} id
 * @property {string} offer_id
 * @property {string} buyer_id
 * @property {string} created_at
 */

/**
 * @typedef {Object} ServiceRequestResponse
 * @property {string} id
 * @property {string} offer_id
 * @property {string} buyer_id
 * @property {"CFR" | "CIF" | "DAP" | "DDP"} incoterm_buyer
 * @property {string | null} note
 * @property {"REQUESTED"} status
 * @property {string | null} port_of_discharge
 * @property {string | null} country_code
 * @property {string | null} insurance_type
 * @property {string | null} warehouse_code
 * @property {string | null} warehouse_address
 * @property {string | null} contact_name
 * @property {string | null} contact_phone
 * @property {string | null} contact_email
 * @property {string} created_at
 * @property {string} updated_at
 */

/** Standard JSON-RPC 2.0 error response builder for gateway errors */

interface JsonRpcErrorBody {
  jsonrpc: "2.0";
  id: string | number | null;
  error: { code: number; message: string; data?: unknown };
}

// Gateway-specific error codes mapped to JSON-RPC ranges
const GATEWAY_ERROR_CODES = {
  PAYMENT_REQUIRED: -32000,
  NOT_FOUND: -32001,
  BAD_GATEWAY: -32002,
  GATEWAY_TIMEOUT: -32003,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
} as const;

export type GatewayErrorCode = keyof typeof GATEWAY_ERROR_CODES;

/** Build a JSON-RPC 2.0 error response */
export function jsonRpcError(
  id: string | number | null,
  code: GatewayErrorCode,
  message: string,
  data?: unknown,
): JsonRpcErrorBody {
  return {
    jsonrpc: "2.0",
    id,
    error: {
      code: GATEWAY_ERROR_CODES[code],
      message,
      ...(data !== undefined && { data }),
    },
  };
}

/** Map HTTP status to JSON-RPC error code */
export function httpStatusToErrorCode(status: number): GatewayErrorCode {
  switch (status) {
    case 402: return "PAYMENT_REQUIRED";
    case 404: return "NOT_FOUND";
    case 502: return "BAD_GATEWAY";
    case 504: return "GATEWAY_TIMEOUT";
    default: return "BAD_GATEWAY";
  }
}

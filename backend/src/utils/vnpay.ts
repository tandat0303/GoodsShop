import * as crypto from 'crypto';

/** Sorts an object by key — VNPay requires params signed/sent in key order. */
export function sortParams(
  params: Record<string, string | number>,
): Record<string, string | number> {
  const sorted: Record<string, string | number> = {};
  Object.keys(params)
    .sort()
    .forEach((key) => {
      sorted[key] = params[key];
    });
  return sorted;
}

/**
 * Builds the exact query string VNPay expects to be signed (and later
 * appended to the payment URL). Spaces must encode as "+", not "%20".
 */
export function buildVnpSignData(
  params: Record<string, string | number>,
): string {
  return Object.entries(sortParams(params))
    .map(
      ([key, value]) =>
        `${key}=${encodeURIComponent(String(value)).replace(/%20/g, '+')}`,
    )
    .join('&');
}

export function signVnp(signData: string, hashSecret: string): string {
  return crypto
    .createHmac('sha512', hashSecret)
    .update(Buffer.from(signData, 'utf-8'))
    .digest('hex');
}

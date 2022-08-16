import type { NextApiRequest } from 'next';
import { JWTPayload, jwtVerify } from 'jose/jwt/verify';
import { createRemoteJWKSet } from 'jose/jwks/remote';
import { JOSEError } from 'jose/util/errors';

const AUTH_DOMAIN = process.env.AUTH_DOMAIN;
const JWKS_ENDPOINT = `${AUTH_DOMAIN}/cdn-cgi/access/certs`;
const AUD_TAG = process.env.AUD_TAG;
const JWT_ALGORITHM = process.env.JWT_ALGORITHM || "RS256";
const JWT_COOKIE = process.env.JWT_COOKIE;

// Initialize remote JWKS
const jwks = createRemoteJWKSet(new URL(JWKS_ENDPOINT));

/**
 * Extracts the value of an `string[]` using the index provided or returns the value as-is.
 * @param value The value to use
 * @param index The index of the 
 * @returns The extracted value from the Array or the value as-is.
 */
const getHeader = (value?: string | string[], index = 0): string | undefined => {
  if (Array.isArray(value)) return value[index];
  return value;
};

export type IsAuthenticatedReturn = {
  authenticated: true,
  user: JWTPayload,
} | {
  authenticated: false,
  tokenFound: boolean,
  statusCode?: number,
  message?: string,
};

export const isAuthenticated = async (req: NextApiRequest): Promise<IsAuthenticatedReturn> => {
  if (!JWT_COOKIE) {
    throw new Error("No JWT_COOKIE was provided.");
  }

  const jwt = getHeader(req.cookies[JWT_COOKIE]);

  if (!jwt) {
    return {
      authenticated: false,
      tokenFound: false,
    };
  }

  try {
    const { payload } = await jwtVerify(jwt, jwks, {
      algorithms: [JWT_ALGORITHM],
      audience: AUD_TAG,
      issuer: AUTH_DOMAIN,
    });

    return {
      authenticated: true,
      user: payload,
    };
  } catch (err) {
    if (err instanceof SyntaxError) {
      return {
        authenticated: false,
        statusCode: 400,
        tokenFound: true,
        message: 'Invalid JWT token provided.',
      };
    } else if (err instanceof JOSEError) {
      return {
        authenticated: false,
        statusCode: 403,
        tokenFound: true,
        message: 'Forbidden',
      };
    }
    
    throw err;
  }
};

import { getRefreshToken } from "./auth0";

/**
 * Exchange the user's Auth0 refresh token for an external provider's access token
 * via the Token Vault federated-connection-access-token grant.
 */
async function exchangeTokenVault(connection: string): Promise<string> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    throw new Error("No refresh token available. User must be logged in.");
  }

  const response = await fetch(
    `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type:
          "urn:auth0:params:oauth:grant-type:token-exchange:federated-connection-access-token",
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        subject_token_type: "urn:ietf:params:oauth:token-type:refresh_token",
        subject_token: refreshToken,
        connection,
        requested_token_type:
          "http://auth0.com/oauth/token-type/federated-connection-access-token",
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error(`[token-vault] Exchange failed for ${connection}:`, error);
    throw new Error(
      `Token exchange failed for ${connection}. User may need to connect their account.`
    );
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Get a Google access token from Token Vault.
 */
export async function getGoogleAccessToken(): Promise<string> {
  return exchangeTokenVault("google-oauth2");
}

/**
 * Get a GitHub access token from Token Vault.
 */
export async function getGitHubAccessToken(): Promise<string> {
  return exchangeTokenVault("github");
}

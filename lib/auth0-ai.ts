import { Auth0AI, getAccessTokenFromTokenVault } from "@auth0/ai-vercel";
import { getRefreshToken } from "./auth0";

const auth0AI = new Auth0AI();

// Get the access token for the current Token Vault connection
export const getAccessToken = async () => getAccessTokenFromTokenVault();

// Connection for Google services (Gmail, Calendar, Drive)
export const withGoogleConnection = auth0AI.withTokenVault({
  connection: "google-oauth2",
  scopes: [
    "openid",
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send",
  ],
  refreshToken: getRefreshToken,
});

// Connection for GitHub services
export const withGitHubConnection = auth0AI.withTokenVault({
  connection: "github",
  scopes: ["read:user", "repo"],
  refreshToken: getRefreshToken,
});

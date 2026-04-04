import { Auth0Client } from "@auth0/nextjs-auth0/server";

// Create an Auth0 Client with Token Vault support
export const auth0 = new Auth0Client({
  authorizationParameters: {
    scope: "openid profile email offline_access",
  },
  enableConnectAccountEndpoint: true,
});

// Get the refresh token from Auth0 session for Token Vault exchanges
export const getRefreshToken = async () => {
  const session = await auth0.getSession();
  return session?.tokenSet?.refreshToken;
};

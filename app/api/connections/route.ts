import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";

/**
 * Check the connection status for Google and GitHub by attempting
 * a token exchange. Returns which connections are active.
 */
export async function GET() {
  const session = await auth0.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const refreshToken = session.tokenSet?.refreshToken;
  if (!refreshToken) {
    return NextResponse.json({
      google: { connected: false },
      github: { connected: false },
      notion: { connected: false },
    });
  }

  const domain = process.env.AUTH0_DOMAIN!;
  const clientId = process.env.AUTH0_CLIENT_ID!;
  const clientSecret = process.env.AUTH0_CLIENT_SECRET!;

  async function checkConnection(connection: string): Promise<boolean> {
    try {
      const response = await fetch(`https://${domain}/oauth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grant_type:
            "urn:auth0:params:oauth:grant-type:token-exchange:federated-connection-access-token",
          client_id: clientId,
          client_secret: clientSecret,
          subject_token_type: "urn:ietf:params:oauth:token-type:refresh_token",
          subject_token: refreshToken,
          connection,
          requested_token_type:
            "http://auth0.com/oauth/token-type/federated-connection-access-token",
        }),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  const [googleConnected, githubConnected, notionConnected] = await Promise.all([
    checkConnection("google-oauth2"),
    checkConnection("github"),
    checkConnection("Notion"),
  ]);

  return NextResponse.json({
    google: { connected: googleConnected },
    github: { connected: githubConnected },
    notion: { connected: notionConnected },
  });
}

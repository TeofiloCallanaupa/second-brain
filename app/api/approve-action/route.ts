import { auth0 } from "@/lib/auth0";
import { getGoogleAccessToken, getGitHubAccessToken } from "@/lib/auth0-ai";
import { logAction } from "@/lib/actions/log-action";
import { google } from "googleapis";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth0.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.sub;
  const { actionType, preview } = await req.json();

  try {
    if (actionType === "gmail-send") {
      return await executeGmailSend(userId, preview);
    } else if (actionType === "github-comment") {
      return await executeGithubComment(userId, preview);
    } else {
      return NextResponse.json(
        { error: "Unknown action type" },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("[approve-action] Error:", error?.message || error);
    return NextResponse.json(
      { error: error?.message || "Action failed" },
      { status: 500 }
    );
  }
}

async function executeGmailSend(
  userId: string,
  preview: { to: string; subject: string; body: string }
) {
  const accessToken = await getGoogleAccessToken();

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const gmail = google.gmail({ version: "v1", auth });

  const email = [
    `To: ${preview.to}`,
    `Subject: ${preview.subject}`,
    "Content-Type: text/plain; charset=utf-8",
    "",
    preview.body,
  ].join("\n");

  const encodedEmail = Buffer.from(email)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw: encodedEmail },
  });

  await logAction({
    userId,
    action: "gmail.send",
    toolName: "gmail-send",
    riskLevel: "high",
    status: "success",
    inputSummary: `Send email to ${preview.to}: "${preview.subject}"`,
    outputSummary: "Email sent after user approval",
  });

  return NextResponse.json({
    success: true,
    message: `Email sent to ${preview.to}`,
  });
}

async function executeGithubComment(
  userId: string,
  preview: { owner: string; repo: string; issueNumber: number; body: string }
) {
  const accessToken = await getGitHubAccessToken();

  const response = await fetch(
    `https://api.github.com/repos/${preview.owner}/${preview.repo}/issues/${preview.issueNumber}/comments`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "SecondBrain-Agent",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ body: preview.body }),
    }
  );

  if (!response.ok) {
    throw new Error(
      `GitHub API error: ${response.status} ${response.statusText}`
    );
  }

  const comment = await response.json();

  await logAction({
    userId,
    action: "github.comment",
    toolName: "github-comment",
    riskLevel: "high",
    status: "success",
    inputSummary: `Comment on ${preview.owner}/${preview.repo}#${preview.issueNumber}`,
    outputSummary: "Comment posted after user approval",
  });

  return NextResponse.json({
    success: true,
    message: `Comment posted on ${preview.owner}/${preview.repo}#${preview.issueNumber}`,
    url: comment.html_url,
  });
}

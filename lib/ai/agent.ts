import { createBrainReadTool } from "./tools/brain-read";
import { createBrainWriteTool } from "./tools/brain-write";
import { createBrainSearchTool } from "./tools/brain-search";
import { createBrainListTool } from "./tools/brain-list";
import { createGmailReadTool } from "./tools/gmail-read";
import { createGmailSendTool } from "./tools/gmail-send";
import { createGithubReposTool } from "./tools/github-repos";
import { createGithubIssuesTool } from "./tools/github-issues";
import { createGithubCommentTool } from "./tools/github-comment";
import { createNotionSearchTool } from "./tools/notion-search";
import { createNotionReadTool } from "./tools/notion-read";
import { createCalendarReadTool } from "./tools/calendar-read";
import { createCalendarCreateTool } from "./tools/calendar-create";

export function createAgentTools(userId: string) {
  return {
    brainRead: createBrainReadTool(userId),
    brainWrite: createBrainWriteTool(userId),
    brainSearch: createBrainSearchTool(userId),
    brainList: createBrainListTool(userId),
    gmailRead: createGmailReadTool(userId),
    gmailSend: createGmailSendTool(userId),
    githubRepos: createGithubReposTool(userId),
    githubIssues: createGithubIssuesTool(userId),
    githubComment: createGithubCommentTool(userId),
    notionSearch: createNotionSearchTool(userId),
    notionRead: createNotionReadTool(userId),
    calendarRead: createCalendarReadTool(userId),
    calendarCreate: createCalendarCreateTool(userId),
  };
}

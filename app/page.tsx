import { auth0 } from "@/lib/auth0";

export default async function LandingPage() {
  const session = await auth0.getSession();
  const isLoggedIn = !!session?.user;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#131313",
        color: "#e8e4de",
      }}
    >
      {/* Nav */}
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "24px 48px",
          maxWidth: "1100px",
          width: "100%",
          margin: "0 auto",
        }}
      >
        <span
          style={{
            fontSize: "16px",
            fontWeight: 600,
            letterSpacing: "-0.01em",
          }}
        >
          Second Brain
        </span>
        <a
          href={isLoggedIn ? "/dashboard" : "/auth/login"}
          style={{
            fontSize: "14px",
            color: isLoggedIn ? "#d4a844" : "#8a8580",
            textDecoration: "none",
          }}
        >
          {isLoggedIn ? "Dashboard" : "Sign in"}
        </a>
      </nav>

      {/* Hero */}
      <main
        style={{
          maxWidth: "1100px",
          width: "100%",
          margin: "0 auto",
          padding: "80px 48px 0",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(2.5rem, 5vw, 3.75rem)",
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            marginBottom: "24px",
            maxWidth: "700px",
          }}
        >
          Your knowledge, connected.
        </h1>

        <p
          style={{
            fontSize: "18px",
            lineHeight: 1.6,
            color: "#8a8580",
            maxWidth: "520px",
            marginBottom: "40px",
          }}
        >
          An AI assistant that connects your Gmail, GitHub, and Notion into one
          searchable brain. It reads, organizes, and acts — with your approval.
        </p>

        <a
          href={isLoggedIn ? "/dashboard" : "/auth/login"}
          style={{
            display: "inline-block",
            padding: "12px 28px",
            background: "#d4a844",
            color: "#402d00",
            fontSize: "14px",
            fontWeight: 600,
            borderRadius: "8px",
            textDecoration: "none",
            border: "none",
          }}
        >
          {isLoggedIn ? "Go to Dashboard" : "Get started"}
        </a>

        {/* Integrations row */}
        <div
          style={{
            marginTop: "80px",
            paddingTop: "32px",
            borderTop: "1px solid #2a2a2a",
            display: "flex",
            flexWrap: "wrap" as const,
            gap: "24px",
          }}
        >
          {["Gmail", "GitHub", "Notion", "Token Vault"].map((label) => (
            <span
              key={label}
              style={{ fontSize: "13px", color: "#6b6560", letterSpacing: "0.01em" }}
            >
              {label}
            </span>
          ))}
        </div>

        {/* Features */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "32px",
            marginTop: "80px",
            paddingBottom: "80px",
          }}
        >
          {[
            {
              title: "Connect your tools",
              desc: "Link Gmail, GitHub, and Notion with one click. Auth0 Token Vault handles credentials securely.",
            },
            {
              title: "Chat with context",
              desc: "Ask questions across all your connected services in a single conversation.",
            },
            {
              title: "Approve before it acts",
              desc: "The AI shows you exactly what it wants to do. You approve or deny inline.",
            },
          ].map(({ title, desc }) => (
            <div key={title}>
              <h3
                style={{
                  fontSize: "15px",
                  fontWeight: 600,
                  marginBottom: "8px",
                }}
              >
                {title}
              </h3>
              <p
                style={{
                  fontSize: "14px",
                  lineHeight: 1.6,
                  color: "#8a8580",
                  margin: 0,
                }}
              >
                {desc}
              </p>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div
          style={{
            borderTop: "1px solid #2a2a2a",
            paddingTop: "80px",
            paddingBottom: "80px",
          }}
        >
          {[
            {
              step: "01",
              title: "Connect your accounts",
              desc: "Sign in with Auth0, then link Gmail, GitHub, and Notion. Token Vault stores and refreshes your OAuth tokens so no API keys ever touch our server.",
            },
            {
              step: "02",
              title: "Ask your AI anything",
              desc: "Chat naturally. The AI reads your emails, searches your GitHub repos, and browses Notion pages in real time — all in one conversation.",
            },
            {
              step: "03",
              title: "Approve before anything is sent",
              desc: "When the AI wants to send an email or post a comment, it shows you exactly what it will do. You approve or deny before anything goes out.",
            },
          ].map(({ step, title, desc }, i) => (
            <div
              key={step}
              style={{
                maxWidth: "520px",
                marginBottom: i < 2 ? "64px" : 0,
                paddingBottom: i < 2 ? "64px" : 0,
                borderBottom: i < 2 ? "1px solid #2a2a2a" : "none",
              }}
            >
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#d4a844",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  display: "block",
                  marginBottom: "12px",
                }}
              >
                Step {step}
              </span>
              <h3
                style={{
                  fontSize: "24px",
                  fontWeight: 700,
                  letterSpacing: "-0.01em",
                  marginBottom: "12px",
                }}
              >
                {title}
              </h3>
              <p
                style={{
                  fontSize: "15px",
                  lineHeight: 1.6,
                  color: "#8a8580",
                  margin: 0,
                }}
              >
                {desc}
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          padding: "32px 48px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "24px",
          fontSize: "13px",
          color: "#6b6560",
          borderTop: "1px solid #2a2a2a",
        }}
      >
        <span>
          Built for the{" "}
          <a
            href="https://authorizedtoact.devpost.com/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#d4a844", textDecoration: "none" }}
          >
            Auth0 Hackathon
          </a>
        </span>
        <span style={{ color: "#2a2a2a" }}>|</span>
        <a
          href="https://github.com/TeofiloCallanaupa/second-brain"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#8a8580", textDecoration: "none" }}
        >
          GitHub
        </a>
        <a
          href="https://www.linkedin.com/in/teofilocallanaupa/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#8a8580", textDecoration: "none" }}
        >
          LinkedIn
        </a>
      </footer>
    </div>
  );
}

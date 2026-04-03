import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const session = await auth0.getSession();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-2xl text-center animate-fade-in">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center text-4xl shadow-lg shadow-indigo-500/20">
              🧠
            </div>
          </div>

          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
            Second Brain
          </h1>

          <p className="text-xl text-[var(--text-secondary)] mb-3 leading-relaxed">
            Your AI-powered personal knowledge system.
          </p>
          <p className="text-[var(--text-muted)] mb-10 max-w-lg mx-auto leading-relaxed">
            Store knowledge as markdown. Connect Gmail and GitHub. Let your AI
            agent read, write, search, and act — with secure approval for
            high-risk actions.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {[
              { icon: "📧", label: "Gmail" },
              { icon: "🐙", label: "GitHub" },
              { icon: "🔐", label: "Token Vault" },
              { icon: "📱", label: "CIBA Approval" },
              { icon: "📋", label: "Audit Trail" },
            ].map(({ icon, label }) => (
              <span
                key={label}
                className="glass px-4 py-2 rounded-full text-sm text-[var(--text-secondary)] flex items-center gap-2 hover:border-[var(--border-glow)] transition-colors duration-200"
              >
                <span>{icon}</span>
                {label}
              </span>
            ))}
          </div>

          {/* CTA */}
          <a
            href="/auth/login"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)] text-white font-semibold text-lg hover:opacity-90 transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98]"
          >
            Get Started
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>

          <p className="mt-6 text-xs text-[var(--text-muted)]">
            Secured by Auth0 • Open Source • Self-Hostable
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-[var(--text-muted)] border-t border-[var(--border-color)]">
        Built for the{" "}
        <a
          href="https://authorizedtoact.devpost.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--accent-blue)] hover:underline"
        >
          Auth0 Hackathon
        </a>
      </footer>
    </div>
  );
}

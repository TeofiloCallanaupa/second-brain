import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/DashboardClient";

export default async function DashboardPage() {
  const session = await auth0.getSession();

  if (!session?.user) {
    redirect("/");
  }

  return (
    <DashboardClient
      user={{
        name: session.user.name || session.user.email || "User",
        email: session.user.email || "",
        sub: session.user.sub,
      }}
    />
  );
}

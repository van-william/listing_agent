import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Bypass check for local development
  if (process.env.NODE_ENV === "development" && process.env.SKIP_ADMIN_CHECK === "true") {
    return <>{children}</>;
  }

  const { orgRole } = await auth();
  
  // Only allow org admins/owners to access admin routes
  if (orgRole !== "org:admin" && orgRole !== "org:owner") {
    redirect("/listings");
  }

  return <>{children}</>;
}


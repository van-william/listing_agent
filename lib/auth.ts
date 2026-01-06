import "server-only";
import { auth, clerkClient } from "@clerk/nextjs/server";

/**
 * Check if the current user is an admin (org owner or admin)
 */
export async function isAdmin() {
  // LOCAL DEV BYPASS: Allow access on localhost if SKIP_ADMIN_CHECK is set
  if (process.env.NODE_ENV === "development" && process.env.SKIP_ADMIN_CHECK === "true") {
    console.log("Local Dev Bypass: Admin access granted via SKIP_ADMIN_CHECK");
    return true;
  }

  const { orgId, orgRole } = await auth();
  if (!orgId) return false;
  return orgRole === "org:admin" || orgRole === "org:owner";
}

/**
 * Require admin access, throw error if not admin
 */
export async function requireAdmin() {
  const admin = await isAdmin();
  if (!admin) {
    throw new Error("Admin access required");
  }
}

/**
 * Invite a client to the organization via email
 */
export async function inviteClient(email: string) {
  const { orgId } = await auth();
  if (!orgId) throw new Error("No organization context found");

  const client = await clerkClient();
  return await client.organizations.createOrganizationInvitation({
    organizationId: orgId,
    emailAddress: email,
    role: "org:member",
  });
}


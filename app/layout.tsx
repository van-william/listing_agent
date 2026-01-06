import type { Metadata } from "next";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton
} from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chicago Client Portal (Demo)",
  description: "Login-only MLS-style portal with realtor insight layer (demo)."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" data-theme="modern">
        <body>
          <header
            style={{
              display: "flex",
              gap: 12,
              padding: "16px 24px",
              alignItems: "center",
              justifyContent: "flex-end"
            }}
          >
            <SignedOut>
              <SignInButton />
              <SignUpButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}

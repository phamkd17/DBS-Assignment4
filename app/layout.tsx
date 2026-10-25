import { ClerkProvider } from "@clerk/nextjs";
import type { ComponentProps } from "react";
import type { Metadata } from "next";
import { instrumentSerif, jost } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lift Log",
  description: "A no-ads lifting log: see what you lifted last time and balance your weekly volume.",
};

// Clerk's sign-in and account screens, restyled to match Line & Stone.
const clerkAppearance: ComponentProps<typeof ClerkProvider>["appearance"] = {
  variables: {
    colorPrimary: "#23449a",
    colorBackground: "#f8f6f1",
    colorForeground: "#1c1d1f",
    colorMutedForeground: "#5e656e",
    colorInput: "#f8f6f1",
    colorInputForeground: "#1c1d1f",
    colorBorder: "#8a8377",
    colorSuccess: "#3e6b45",
    colorShadow: "transparent",
    colorDanger: "#9a4a31",
    borderRadius: "0",
    fontFamily: "var(--font-jost), system-ui, sans-serif",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${jost.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-ls-sans">
        <ClerkProvider appearance={clerkAppearance}>{children}</ClerkProvider>
      </body>
    </html>
  );
}

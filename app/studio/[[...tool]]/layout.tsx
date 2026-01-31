import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sanity Studio - Kitchen of Tech",
  description: "Content Management System for Kitchen of Tech",
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No navbar or other layout components - just the studio
  return <>{children}</>;
}

import Sidebar from "./sidebar";
import Header from "./header";
import { useSidebar } from "@/lib/sidebar-context";
import { cn } from "@/lib/utils";
import React from "react";

interface AppLayoutProps {
  title: string;
  children: React.ReactNode;
}

export default function AppLayout({ title, children }: AppLayoutProps) {
  const { isOpen, isMobile } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className={cn(
        "flex-1 transition-all duration-300",
        // Desktop: always have margin, Mobile: only when sidebar is open
        isMobile 
          ? (isOpen ? "ml-64" : "ml-0")
          : "ml-64"
      )}>
        <Header title={title} />
        <main className="p-3 sm:p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 
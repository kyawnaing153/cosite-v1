import Sidebar from "./sidebar";
import Header from "./header";
import { useSidebar } from "@/lib/sidebar-context";
import React from "react";

interface AppLayoutProps {
  title: string;
  children: React.ReactNode;
}

export default function AppLayout({ title, children }: AppLayoutProps) {
  const { isOpen } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className={isOpen ? "flex-1 ml-64 transition-all duration-300" : "flex-1 transition-all duration-300"}>
        <Header title={title} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth.tsx";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/lib/sidebar-context";
import { useEffect } from "react";

const navigation = [
  { name: "Dashboard", href: "/", icon: "fas fa-chart-line" },
  { name: "Construction Sites", href: "/sites", icon: "fas fa-building" },
  { name: "Labour Management", href: "/labour", icon: "fas fa-users" },
  { name: "Material Purchases", href: "/purchases", icon: "fas fa-shopping-cart" },
  { name: "Invoices", href: "/invoices", icon: "fas fa-file-invoice" },
  { name: "Payroll & Wages", href: "/payroll", icon: "fas fa-money-check-alt" },
  { name: "Attendance", href: "/attendance", icon: "fas fa-clipboard-check" },
  { name: "Reports", href: "/reports", icon: "fas fa-chart-bar" },
  { name: "Notifications", href: "/notifications", icon: "fas fa-bell" },
  { name: "Settings", href: "/settings", icon: "fas fa-cog" },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { logout } = useAuth();
  const { isOpen, close, isMobile } = useSidebar();

  // Close sidebar on route change (mobile only)
  useEffect(() => {
    if (isMobile) {
      close();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, isMobile]);

  return (
    <>
      {/* Overlay - only show on mobile */}
      {isMobile && (
        <div
          className={cn(
            "fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity duration-300 lg:hidden",
            isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
          onClick={close}
          aria-hidden={!isOpen}
        />
      )}
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-white shadow-2xl text-black z-50 transition-transform duration-300",
          // Desktop: always visible, Mobile: slide in/out
          isMobile 
            ? (isOpen ? "translate-x-0" : "-translate-x-full")
            : "translate-x-0"
        )}
        aria-label="Sidebar"
      >
        <div className="p-7 border-b border-black-700">
          <div className="flex items-center space-x-3">
            <i className="fas fa-hard-hat text-orange-500 text-2xl"></i>
            <h1 className="text-xl font-bold">ConstructPro</h1>
          </div>
        </div>
        <nav className="mt-6">
          <ul className="space-y-2 px-4">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link href={item.href}>
                  <a
                    className={cn(
                      "flex items-center space-x-3 p-3 rounded-lg transition-colors",
                      location === item.href
                        ? "bg-cyan-600 text-white"
                        : "hover:bg-cyan-600 hover:text-white"
                    )}
                  >
                    <i className={`${item.icon} w-5`}></i>
                    <span>{item.name}</span>
                  </a>
                </Link>
              </li>
            ))}
          </ul>
          <div className="px-4 mt-8">
            <button
              onClick={logout}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 hover:text-white transition-colors w-full text-left"
            >
              <i className="fas fa-sign-out-alt w-5"></i>
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
}

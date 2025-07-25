import { useAuth } from "@/lib/auth.tsx";
import { useSidebar } from "@/lib/sidebar-context";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

export default function Header({ title }: { title: string }) {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const { toggle, isMobile } = useSidebar();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: notifications = [] } = useQuery({
    queryKey: ['/api/notifications'],
  });

  const unreadCount = (notifications as any[]).filter((n: any) => n.status === 'unread').length;

  const toggleSidebar = () => {
    toggle();
  };

  // Navigation stub functions
  const goToProfile = () => {
    // TODO: Replace with your navigation logic
    alert("Go to Profile");
    setOpen(false);
  };
  const goToSettings = () => {
    // TODO: Replace with your navigation logic
    alert("Go to Settings");
    setOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Hamburger Icon - only show on mobile */}
          {isMobile && (
            <button
              onClick={toggleSidebar}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg lg:hidden"
            >
              <i className="fas fa-bars text-xl"></i>
            </button>
          )}
          <div className="">
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
            <p className="text-gray-600">
              Welcome back,{" "}
              <span className="font-semibold">{user?.fullname}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <Link href="/notifications">
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg relative">
                <i className="fas fa-bell text-xl"></i>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
            </Link>
          </div>

          {/* User Profile */}
          <div className="flex items-center relative">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-white font-semibold text-sm">
                {user?.fullname?.charAt(0) || "U"}
              </span>
            </div>
            <div className="ml-3 hidden sm:block">
              <p className="text-sm font-semibold text-gray-800">
                {user?.fullname}
              </p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
            <button
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-150 ml-2"
              onClick={() => setOpen((v) => !v)}
              aria-label="Open user menu"
            >
              <i className={`fas fa-chevron-${open ? "up" : "down"} text-sm`}></i>
            </button>
            {/* Dropdown */}
            {open && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 bg-black bg-opacity-25 z-40 transition-opacity duration-200"
                  onClick={() => setOpen(false)}
                ></div>
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-50">
                  <div className="p-4 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.fullname}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                  </div>
                  <ul className="py-2">
                    <li>
                      <button
                        className="w-full flex items-center gap-3 text-left px-4 py-3 hover:bg-gray-50 transition-colors duration-150 text-sm"
                        onClick={goToProfile}
                      >
                        <i className="fas fa-user text-gray-400 w-4"></i> 
                        <span>Profile</span>
                      </button>
                    </li>
                    <li>
                      <button
                        className="w-full flex items-center gap-3 text-left px-4 py-3 hover:bg-gray-50 transition-colors duration-150 text-sm"
                        onClick={goToSettings}
                      >
                        <i className="fas fa-cog text-gray-400 w-4"></i> 
                        <span>Settings</span>
                      </button>
                    </li>
                    <li className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        className="w-full flex items-center gap-3 text-left px-4 py-3 hover:bg-red-50 transition-colors duration-150 text-sm text-red-600"
                        onClick={() => {
                          setOpen(false);
                          logout();
                        }}
                      >
                        <i className="fas fa-sign-out-alt text-red-500 w-4"></i> 
                        <span>Logout</span>
                      </button>
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth.tsx";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: "fas fa-chart-line" },
  { name: "Construction Sites", href: "/sites", icon: "fas fa-building" },
  { name: "Labour Management", href: "/labour", icon: "fas fa-users" },
  { name: "Material Purchases", href: "/purchases", icon: "fas fa-shopping-cart" },
  { name: "Payroll & Wages", href: "/payroll", icon: "fas fa-money-check-alt" },
  { name: "Invoices", href: "/invoices", icon: "fas fa-file-invoice" },
  { name: "Attendance", href: "/attendance", icon: "fas fa-clipboard-check" },
  { name: "Reports", href: "/reports", icon: "fas fa-chart-bar" },
  { name: "Settings", href: "/settings", icon: "fas fa-cog" },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { logout } = useAuth();

  return (
    <div className="w-64 bg-white shadow-2xl text-black fixed h-full z-30">
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
    </div>
  );
}

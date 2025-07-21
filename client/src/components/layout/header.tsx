import { useAuth } from "@/lib/auth.tsx";

export default function Header({ title }: { title: string }) {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <p className="text-gray-600">
            Welcome back, <span className="font-semibold">{user?.fullname}</span>
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg relative">
              <i className="fas fa-bell text-xl"></i>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </button>
          </div>
          
          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                {user?.fullname?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{user?.fullname}</p>
              <p className="text-xs text-gray-600">{user?.role}</p>
            </div>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <i className="fas fa-chevron-down"></i>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

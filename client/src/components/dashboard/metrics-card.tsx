import { cn } from "@/lib/utils";

interface MetricsCardProps {
  title: string;
  value: string | number;
  icon: string;
  iconColor: string;
  change?: {
    value: string;
    type: 'increase' | 'decrease';
  };
}

export default function MetricsCard({ title, value, icon, iconColor, change }: MetricsCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={cn("w-12 h-12 bg-opacity-10 rounded-lg flex items-center justify-center", iconColor)}>
          <i className={cn(icon, "text-xl")}></i>
        </div>
      </div>
      {change && (
        <div className="mt-4 flex items-center">
          <i className={cn(
            "text-sm mr-1",
            change.type === 'increase' ? "fas fa-arrow-up text-green-500" : "fas fa-arrow-down text-red-500"
          )}></i>
          <span className={cn(
            "text-sm",
            change.type === 'increase' ? "text-green-500" : "text-red-500"
          )}>
            {change.value}
          </span>
          <span className="text-sm text-gray-500 ml-1">vs last month</span>
        </div>
      )}
    </div>
  );
}

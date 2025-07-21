export default function RecentActivity() {
  const activities = [
    {
      id: 1,
      type: 'user-plus',
      color: 'cyan',
      title: 'New labour registered',
      details: 'Mike Johnson joined Downtown Plaza',
      time: '2 hours ago',
    },
    {
      id: 2,
      type: 'money-check-alt',
      color: 'orange',
      title: 'Wage payment processed',
      details: '$2,500 paid to Construction Group A',
      time: '5 hours ago',
    },
    {
      id: 3,
      type: 'clipboard-check',
      color: 'green',
      title: 'Attendance recorded',
      details: '25 workers marked present today',
      time: '8 hours ago',
    },
    {
      id: 4,
      type: 'shopping-cart',
      color: 'yellow',
      title: 'Material purchase',
      details: '50 bags of cement purchased',
      time: '1 day ago',
    },
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      cyan: 'border-cyan-500 bg-cyan-50 text-cyan-600',
      orange: 'border-orange-500 bg-orange-50 text-orange-600',
      green: 'border-green-500 bg-green-50 text-green-600',
      yellow: 'border-yellow-500 bg-yellow-50 text-yellow-600',
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.cyan;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Recent Labour Activity</h3>
          <button className="text-cyan-600 hover:text-cyan-800 text-sm font-medium">
            View All
          </button>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className={`flex items-center space-x-3 p-3 border-l-4 ${getColorClasses(activity.color)}`}
            >
              <div className="w-8 h-8 bg-opacity-10 rounded-full flex items-center justify-center">
                <i className={`fas fa-${activity.type} text-sm`}></i>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{activity.title}</p>
                <p className="text-xs text-gray-600">{activity.details}</p>
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

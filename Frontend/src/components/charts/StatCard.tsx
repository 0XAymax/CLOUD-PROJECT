import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

const StatCard = ({ title, value, icon, trend, color = 'blue' }: StatCardProps) => {
  const colorClasses = {
    blue: {
      gradient: 'from-blue-500 to-blue-600',
      icon: 'bg-blue-400',
      shadow: 'shadow-blue-500/50',
    },
    green: {
      gradient: 'from-green-500 to-green-600',
      icon: 'bg-green-400',
      shadow: 'shadow-green-500/50',
    },
    yellow: {
      gradient: 'from-yellow-500 to-orange-600',
      icon: 'bg-yellow-400',
      shadow: 'shadow-yellow-500/50',
    },
    red: {
      gradient: 'from-red-500 to-red-600',
      icon: 'bg-red-400',
      shadow: 'shadow-red-500/50',
    },
    purple: {
      gradient: 'from-purple-500 to-purple-600',
      icon: 'bg-purple-400',
      shadow: 'shadow-purple-500/50',
    },
  };

  const currentColor = colorClasses[color];

  return (
    <div className={`bg-gradient-to-br ${currentColor.gradient} rounded-xl shadow-lg ${currentColor.shadow} p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-white/90 mb-2">{title}</p>
          <p className="text-4xl font-bold text-white drop-shadow-lg">{value}</p>
          {trend && (
            <p className={`text-sm mt-3 font-medium ${trend.isPositive ? 'text-white' : 'text-white/80'}`}>
              <span className="inline-flex items-center gap-1">
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
            </p>
          )}
        </div>
        {icon && (
          <div className={`${currentColor.icon} p-4 rounded-full text-white text-2xl shadow-xl backdrop-blur-sm bg-opacity-50`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;

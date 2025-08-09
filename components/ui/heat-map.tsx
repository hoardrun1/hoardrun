import React from 'react';

interface HeatMapData {
  date: string;
  value: number;
}

interface HeatMapProps {
  data?: HeatMapData[];
  width?: number;
  height?: number;
  cellSize?: number;
  cellGap?: number;
}

export const HeatMap: React.FC<HeatMapProps> = ({ 
  data = [],
  width = 800,
  height = 200,
  cellSize = 12,
  cellGap = 2
}) => {
  // Generate a year's worth of dates if no data provided
  const generateDefaultData = () => {
    const dates = [];
    const today = new Date();
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push({
        date: date.toISOString().split('T')[0],
        value: Math.random() * 100
      });
    }
    return dates;
  };

  const heatMapData = data.length > 0 ? data : generateDefaultData();
  
  // Calculate max value for color scaling
  const maxValue = Math.max(...heatMapData.map(d => d.value));
  
  // Get color intensity based on value
  const getColorIntensity = (value: number) => {
    if (value === 0) return 'bg-gray-100';
    const intensity = Math.ceil((value / maxValue) * 4);
    switch (intensity) {
      case 1: return 'bg-green-200';
      case 2: return 'bg-green-400';
      case 3: return 'bg-green-600';
      case 4: return 'bg-green-800';
      default: return 'bg-gray-100';
    }
  };

  // Group data by weeks
  const weeks: (HeatMapData | null)[][] = [];
  let currentWeek: (HeatMapData | null)[] = [];
  
  heatMapData.forEach((item, index) => {
    const date = new Date(item.date);
    const dayOfWeek = date.getDay();
    
    if (index === 0) {
      // Fill empty days at the start of the first week
      for (let i = 0; i < dayOfWeek; i++) {
        currentWeek.push(null);
      }
    }
    
    currentWeek.push(item);
    
    if (dayOfWeek === 6 || index === heatMapData.length - 1) {
      // End of week or end of data
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
  });

  return (
    <div className="heat-map">
      <div className="flex flex-col space-y-1">
        {/* Month labels */}
        <div className="flex space-x-1 text-xs text-gray-500 mb-2">
          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, i) => (
            <div key={month} className="w-12 text-center">
              {i % 3 === 0 ? month : ''}
            </div>
          ))}
        </div>
        
        {/* Heat map grid */}
        <div className="flex space-x-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col space-y-1">
              {week.map((day, dayIndex) => (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={`w-3 h-3 rounded-sm ${
                    day ? getColorIntensity(day.value) : 'bg-transparent'
                  }`}
                  title={day ? `${day.date}: ${day.value.toFixed(1)}` : ''}
                />
              ))}
            </div>
          ))}
        </div>
        
        {/* Legend */}
        <div className="flex items-center space-x-2 text-xs text-gray-500 mt-2">
          <span>Less</span>
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-gray-100 rounded-sm" />
            <div className="w-3 h-3 bg-green-200 rounded-sm" />
            <div className="w-3 h-3 bg-green-400 rounded-sm" />
            <div className="w-3 h-3 bg-green-600 rounded-sm" />
            <div className="w-3 h-3 bg-green-800 rounded-sm" />
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
};

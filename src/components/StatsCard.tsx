import React from "react";
import { IconType } from "react-icons"; // Import the IconType from react-icons

interface StatsCardProps {
  title: string;
  value: number;
  showPercentage?: boolean;
  icon?: IconType; // Update the icon prop's type to IconType
  iconColor?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  showPercentage = false,
  icon,
  iconColor = "",
}) => (
  <div className="bg-slate-900 backdrop-blur-3xl bg-opacity-50 text-white p-4 rounded-lg flex items-center">
    <div className="flex items-center">
      {icon && (
        <div className={`text-4xl mr-2  ${iconColor}`}>
          {icon({ size: 64 })}
        </div>
      )}
      <div className="text-4xl font-semibold">
        <div className="text-xs font-medium mb-1 ont-thin text-gray-500 ">
          {title}
        </div>
        <div className="flex flex-row">
          <span className="font-thin text-gray-200 2xl:text-4xl xl:text-xl lg:text-xs">{value}</span>{" "}
          {showPercentage && (
            <div className="text-2xl text-gray-500 ml-2 2xl:text-2xl xl:text-sm lg:text-sm">% </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

export default StatsCard;

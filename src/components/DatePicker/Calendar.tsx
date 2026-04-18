import React from "react";
import { addMonths, startOfMonth, endOfMonth } from "date-fns";
import { CalendarDay } from "./CalendarDay";
import type { WeatherData, DateRange } from "./types";

type CalendarProps = {
  currentMonth: Date;
  weatherData: WeatherData[];
  dateRange: DateRange;
  handleSelect: (date: Date) => void;
};

export const Calendar: React.FC<CalendarProps> = ({
  currentMonth,
  weatherData,
  dateRange,
  handleSelect,
}) => {
  const renderCalendar = (month: Date) => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const days = [];
    for (let i = 0; i < start.getDay(); i++) {
      days.push(
        <div
          key={`empty-${i}`}
          className="wdrp-empty-day text-center p-1"
        ></div>,
      );
    }
    for (let day = 1; day <= end.getDate(); day++) {
      const date = new Date(month.getFullYear(), month.getMonth(), day);
      days.push(
        <CalendarDay
          key={date.toISOString()}
          date={date}
          weatherData={weatherData}
          dateRange={dateRange}
          handleSelect={handleSelect}
        />,
      );
    }
    return days;
  };

  return (
    <div className="wdrp-calendar flex space-x-4">
      {[currentMonth, addMonths(currentMonth, 1)].map((month, index) => (
        <div key={index} className="wdrp-month flex-1">
          <div className="wdrp-weekdays grid grid-cols-7 gap-1">
            {["일", "월", "화", "수", "목", "금", "토"].map((day, i) => (
              <div
                key={i}
                className={`wdrp-weekday text-center font-bold ${i === 0 ? "wdrp-sunday text-red-500" : ""} ${i === 6 ? "wdrp-saturday text-blue-500" : ""}`}
              >
                {day}
              </div>
            ))}
          </div>
          <div className="wdrp-days grid grid-cols-7 gap-1">
            {renderCalendar(month)}
          </div>
        </div>
      ))}
    </div>
  );
};

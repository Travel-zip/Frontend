import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  isSameDay,
  isToday,
  isSaturday,
  isSunday,
} from "date-fns";
import { ko } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface WeatherData {
  date: Date;
  icon: string;
  temperature: number;
}

interface WeatherDateRangePickerProps {
  detectedCity: { lat: number; lon: number } | null;
  onDateChange: (start: string, end: string) => void;
}

export default function WeatherDateRangePicker({
  detectedCity,
  onDateChange,
}: WeatherDateRangePickerProps) {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsCalendarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!detectedCity || !API_KEY) return;
      try {
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/forecast`,
          {
            params: {
              lat: detectedCity.lat,
              lon: detectedCity.lon,
              appid: API_KEY,
              units: "metric",
            },
          },
        );
        const weatherList = response.data.list
          .filter((_: any, index: number) => index % 8 === 0)
          .slice(0, 5)
          .map((item: any) => ({
            date: new Date(item.dt * 1000),
            icon: item.weather[0].icon,
            temperature: Math.round(item.main.temp),
          }));
        setWeatherData(weatherList);
      } catch (error) {
        console.error("날씨 데이터 호출 실패:", error);
      }
    };
    fetchWeatherData();
  }, [detectedCity, API_KEY]);

  const handleSelect = (date: Date) => {
    let newRange = { ...dateRange };
    if (!dateRange.from || (dateRange.from && dateRange.to)) {
      newRange = { from: date, to: undefined };
    } else if (dateRange.from && !dateRange.to) {
      if (date >= dateRange.from) {
        newRange = { from: dateRange.from, to: date };
      } else {
        newRange = { from: date, to: undefined };
      }
    }
    setDateRange(newRange);

    if (newRange.from && newRange.to) {
      onDateChange(
        format(newRange.from, "yyyy-MM-dd"),
        format(newRange.to, "yyyy-MM-dd"),
      );
      setTimeout(() => setIsCalendarOpen(false), 200);
    } else if (newRange.from) {
      onDateChange(format(newRange.from, "yyyy-MM-dd"), "");
    } else {
      onDateChange("", "");
    }
  };

  const renderCalendar = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = [];

    for (let i = 0; i < start.getDay(); i++) {
      days.push(<div key={`empty-${i}`} className="w-9 h-12" />);
    }

    for (let day = 1; day <= end.getDate(); day++) {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day,
      );
      const isPastDate = date < new Date(new Date().setHours(0, 0, 0, 0));
      const isTodayDate = isToday(date);
      const isSelectedFrom = dateRange.from && isSameDay(date, dateRange.from);
      const isSelectedTo = dateRange.to && isSameDay(date, dateRange.to);
      const isInRange =
        dateRange.from &&
        dateRange.to &&
        date > dateRange.from &&
        date < dateRange.to;
      const weather = weatherData.find((d) => isSameDay(d.date, date));

      let bgClass = "bg-transparent";
      let textClass = "text-gray-700 hover:bg-gray-100";

      if (isPastDate && !isTodayDate)
        textClass = "text-gray-300 cursor-not-allowed";
      else if (isSelectedFrom || isSelectedTo) {
        bgClass = "bg-primary-600 shadow-sm";
        textClass = "text-white font-bold";
      } else if (isInRange) {
        bgClass = "bg-primary-50 rounded-none";
        textClass = "text-primary-800 font-medium";
      } else if (isSaturday(date)) textClass = "text-blue-500 hover:bg-blue-50";
      else if (isSunday(date)) textClass = "text-red-500 hover:bg-red-50";

      days.push(
        <button
          key={date.toISOString()}
          disabled={isPastDate && !isTodayDate}
          onClick={() => handleSelect(date)}
          className={`relative w-9 h-12 flex flex-col items-center pt-1.5 rounded-lg transition-all duration-150 ${bgClass} ${textClass}`}
        >
          <span
            className={`text-[12px] leading-none ${isTodayDate ? "underline underline-offset-2 decoration-2" : ""}`}
          >
            {day}
          </span>
          {weather && (
            <div className="absolute bottom-0.5 flex flex-col items-center pointer-events-none">
              <img
                src={`https://openweathermap.org/img/wn/${weather.icon}.png`}
                alt="weather"
                className="w-5 h-5 -mb-1"
              />
              <span className="text-[9px] font-medium scale-90">
                {weather.temperature}°
              </span>
            </div>
          )}
        </button>,
      );
    }
    return days;
  };

  return (
    <div className="relative w-full flex flex-col" ref={dropdownRef}>
      <div
        className="flex items-center w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => setIsCalendarOpen(!isCalendarOpen)}
      >
        <CalendarIcon className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
        <input
          type="text"
          placeholder="시작일"
          value={dateRange.from ? format(dateRange.from, "yyyy. MM. dd") : ""}
          readOnly
          className="flex-1 bg-transparent text-sm text-center outline-none cursor-pointer text-gray-700 w-full"
        />
        <span className="text-gray-300 text-sm mx-1 font-medium">-</span>
        <input
          type="text"
          placeholder="종료일"
          value={dateRange.to ? format(dateRange.to, "yyyy. MM. dd") : ""}
          readOnly
          className="flex-1 bg-transparent text-sm text-center outline-none cursor-pointer text-gray-700 w-full"
        />
      </div>

      {isCalendarOpen && (
        <div className="absolute top-[110%] left-1/2 -translate-x-1/2 w-[320px] bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-[100] origin-top">
          <div className="flex justify-between items-center mb-3 px-1">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
            >
              &lt;
            </button>
            <h2 className="text-[14px] font-bold text-gray-800 tracking-tight">
              {format(currentMonth, "yyyy년 M월", { locale: ko })}
            </h2>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
            >
              &gt;
            </button>
          </div>

          <div className="grid grid-cols-7 mb-1.5">
            {["일", "월", "화", "수", "목", "금", "토"].map((day, i) => (
              <div
                key={i}
                className={`text-center text-[11px] font-bold ${i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-gray-400"}`}
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-1 justify-items-center">
            {renderCalendar()}
          </div>
        </div>
      )}
    </div>
  );
}

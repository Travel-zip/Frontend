import React from "react";
import { format, addMonths, subMonths } from "date-fns";
import { ko } from "date-fns/locale";
import type { Dispatch, SetStateAction } from "react";

type CalendarHeaderProps = {
  currentMonth: Date;
  setCurrentMonth: Dispatch<SetStateAction<Date>>;
};
//이전, 다음 달로 넘기는 문자 엔티티
export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentMonth,
  setCurrentMonth,
}) => (
  <div className="wdrp-calendar-header flex justify-between items-center mb-4 mt-10">
    <button
      onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
      className="wdrp-month-nav-button p-1"
    >
      &lt;
    </button>
    <h2 className="wdrp-month-title text-lg font-bold">
      {format(currentMonth, "yyyy년 M월", { locale: ko })} -{" "}
      {format(addMonths(currentMonth, 1), "yyyy년 M월", { locale: ko })}
    </h2>
    <button
      onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
      className="wdrp-month-nav-button p-1"
    >
      &gt;
    </button>
  </div>
);

import { useState } from "react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

interface DatePickerProps {
  onSelect: (date: Date) => void;
}

export function DatePicker({ onSelect }: DatePickerProps) {
  const [year, setYear] = useState(2024);
  const [month, setMonth] = useState(7);
  const [selected, setSelected] = useState<number | null>(null);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const monthName = new Date(year, month).toLocaleString("en", {
    month: "long",
  });

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const handleSelect = (day: number) => {
    setSelected(day);
    onSelect(new Date(year, month, day));
  };

  return (
    <div className="date-picker">
      <div className="date-picker-header">
        <button onClick={prevMonth}>
          <span>&lt;</span> {monthName}
        </button>

        <h4>
          {monthName} {year}
        </h4>

        <button onClick={nextMonth}>
          {monthName} <span>&gt;</span>
        </button>
      </div>

      <div
        className="date-picker-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
        }}
      >
        {DAYS.map((day) => (
          <div key={day} className="day-header">
            {day}
          </div>
        ))}

        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          return (
            <div
              key={day}
              tabIndex={0}
              role="button"
              className={`date-cell ${selected === day ? "selected" : ""}`}
              onClick={() => handleSelect(day)}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}

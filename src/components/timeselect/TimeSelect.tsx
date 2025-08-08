import React, { useEffect } from "react";

interface TimeSelectProps {
  time: string;
  setTime: (time: string) => void;
}

const TimeSelect: React.FC<TimeSelectProps> = ({ time, setTime }) => {
  // Saat ve dakika ayrıştırma, eksikse "00" ata
  const [hour, minute] = time.split(":").map(Number);
  const selectedHour = isNaN(hour) ? 0 : hour;
  const selectedMinute = isNaN(minute) ? 0 : minute;

  // **time değeri eksikse düzelt**
  useEffect(() => {
    if (time?.length < 5) {
      setTime(`${String(selectedHour).padStart(2, "0")}:${String(selectedMinute).padStart(2, "0")}`);
    }
  }, [time]);

  // Saat değiştiğinde
  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTime(`${e.target.value}:${String(selectedMinute).padStart(2, "0")}`);
  };

  // Dakika değiştiğinde
  const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTime(`${String(selectedHour).padStart(2, "0")}:${e.target.value}`);
  };

  return (
    <div className="flex space-x-2 gap-1">
      <select value={String(selectedHour).padStart(2, "0")} onChange={handleHourChange} className="border p-1 rounded text-sm">
        {[...Array(24).keys()].map((h) => (
          <option key={h} value={String(h).padStart(2, "0")}>
            {String(h).padStart(2, "0")}
          </option>
        ))}
      </select>
      <span>:</span>
      <select value={String(selectedMinute).padStart(2, "0")} onChange={handleMinuteChange} className="border p-1 rounded text-sm">
        {[...Array(60).keys()].map((m) => (
          <option key={m} value={String(m).padStart(2, "0")}>
            {String(m).padStart(2, "0")}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TimeSelect;

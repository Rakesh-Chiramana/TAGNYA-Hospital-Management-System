import React, { useState, useEffect } from "react";

interface CountdownTimerProps {
  expiry: number;
  onFinish: () => void;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ expiry, onFinish }) => {
  const [timeLeft, setTimeLeft] = useState(Math.max(0, expiry - Date.now()));

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = Math.max(0, expiry - Date.now());
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
        onFinish();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [expiry, onFinish]);

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  return (
    <span className="font-mono font-black text-indigo-600 tabular-nums">
      {minutes.toString().padStart(2, "0")}:
      {seconds.toString().padStart(2, "0")}
    </span>
  );
};

export default CountdownTimer;

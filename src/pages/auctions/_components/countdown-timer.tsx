import { useState, useEffect } from "react";

type CountdownTimerProps = {
  endsAt: string;
  className?: string;
};

type TimeLeft = {
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
};

function calculateTimeLeft(endsAt: string): TimeLeft {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }
  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
    isExpired: false,
  };
}

function padZero(n: number): string {
  return n.toString().padStart(2, "0");
}

export default function CountdownTimer({ endsAt, className }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(endsAt));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endsAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  if (timeLeft.isExpired) {
    return (
      <span className={className}>
        <span className="text-destructive font-bold text-xs">انتهى المزاد</span>
      </span>
    );
  }

  const isUrgent = timeLeft.hours === 0 && timeLeft.minutes < 30;

  return (
    <div className={className}>
      <div className={`flex items-center gap-1 font-mono tabular-nums text-sm font-bold ${isUrgent ? "text-destructive" : "text-foreground"}`}>
        <span className="bg-secondary rounded px-1.5 py-0.5 text-xs">
          {padZero(timeLeft.hours)}
        </span>
        <span className="text-muted-foreground">:</span>
        <span className="bg-secondary rounded px-1.5 py-0.5 text-xs">
          {padZero(timeLeft.minutes)}
        </span>
        <span className="text-muted-foreground">:</span>
        <span className="bg-secondary rounded px-1.5 py-0.5 text-xs">
          {padZero(timeLeft.seconds)}
        </span>
      </div>
    </div>
  );
}

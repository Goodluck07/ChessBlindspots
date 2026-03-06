interface BarRowProps {
  label: string;
  count: number;
  total: number;
  color: string;
  sublabel?: string;
}

export function BarRow({ label, count, total, color, sublabel }: BarRowProps) {
  const pct = total === 0 ? 0 : Math.round((count / total) * 100);
  return (
    <div className="mb-3.5">
      <div className="flex justify-between mb-1.5">
        <span className="text-[#bababa] text-sm">
          {label}
          {sublabel && (
            <span className="text-[#5a5856] text-[0.8em] ml-1.5">
              {sublabel}
            </span>
          )}
        </span>
        <span className="font-bold text-sm" style={{ color }}>
          {count}
        </span>
      </div>
      <div className="h-2 bg-[#272522] rounded overflow-hidden">
        <div
          className="h-full rounded transition-[width] duration-600 ease-in-out"
          style={{
            width: `${pct}%`,
            backgroundColor: color,
            minWidth: count > 0 ? "4px" : "0",
          }}
        />
      </div>
    </div>
  );
}

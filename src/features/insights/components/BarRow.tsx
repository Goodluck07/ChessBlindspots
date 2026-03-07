interface BarRowProps {
  label: string;
  count: number;
  total: number;
  color: string;
  sublabel?: string;
  expanded?: boolean;
  onClick?: () => void;
}

export function BarRow({ label, count, total, color, sublabel, expanded, onClick }: BarRowProps) {
  const pct = total === 0 ? 0 : Math.round((count / total) * 100);
  return (
    <div className="mb-3.5">
      <button
        type="button"
        className={`w-full flex justify-between mb-1.5 bg-transparent border-none p-0 text-left ${onClick ? "cursor-pointer" : "cursor-default"}`}
        onClick={onClick}
      >
        <span className="text-[#bababa] text-sm flex items-center gap-2 flex-wrap">
          {label}
          {sublabel && (
            <span className="text-[#5a5856] text-[0.8em]">{sublabel}</span>
          )}
          {onClick && (
            <span className="text-[#5a7a9a] text-[0.75em]">
              {expanded ? "▲ hide" : "▼ show blunders"}
            </span>
          )}
        </span>
        <span className="font-bold text-sm" style={{ color }}>
          {count}
        </span>
      </button>
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

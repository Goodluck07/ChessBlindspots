interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  color: string;
  hint?: string;
}

export function StatCard({ label, value, sub, color, hint }: Readonly<StatCardProps>) {
  return (
    <div
      className="bg-[#1e1c1a] border border-[#3d3a37] rounded-[10px] pl-5 pr-5 py-4 border-l-4"
      style={{ borderLeftColor: color }}
    >
      <div className="text-[#989795] text-xs uppercase tracking-wide mb-1.5 font-medium flex items-center gap-1">
        {label}
        {hint && (
          <span className="relative group inline-flex items-center">
            <span className="text-[#5d5c59] text-[11px] cursor-help leading-none">ⓘ</span>
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-[#2e2b28] text-[#bababa] text-[11px] font-normal normal-case tracking-normal rounded-lg px-3 py-2 w-52 z-20 shadow-xl border border-[#3d3a37] pointer-events-none leading-snug">
              {hint}
            </span>
          </span>
        )}
      </div>
      <div className="text-[22px] font-bold leading-tight break-words" style={{ color }}>
        {value}
        {sub && (
          <span className="text-[11px] text-[#989795] font-normal ml-1.5">
            {sub}
          </span>
        )}
      </div>
    </div>
  );
}

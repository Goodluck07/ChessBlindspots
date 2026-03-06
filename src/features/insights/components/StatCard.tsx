interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  color: string;
}

export function StatCard({ label, value, sub, color }: StatCardProps) {
  return (
    <div
      className="bg-[#1e1c1a] border border-[#3d3a37] rounded-[10px] pl-5 pr-5 py-4 border-l-4"
      style={{ borderLeftColor: color }}
    >
      <div className="text-[#989795] text-xs uppercase tracking-wide mb-1.5 font-medium">
        {label}
      </div>
      <div className="text-[28px] font-bold leading-none" style={{ color }}>
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

import { Section } from "./Section";

interface BlundersByColorProps {
  byColor: { white: number; black: number };
  total: number;
}

export function BlundersByColor({ byColor, total }: BlundersByColorProps) {
  return (
    <Section title="Blunders by Color">
      <div className="flex gap-4 flex-wrap">
        {[
          {
            label: "As White",
            count: byColor.white,
            color: "#ebecd0",
            bg: "rgba(235,236,208,0.08)",
          },
          {
            label: "As Black",
            count: byColor.black,
            color: "#779556",
            bg: "rgba(119,149,86,0.12)",
          },
        ].map(({ label, count, color, bg }) => (
          <div
            key={label}
            className="flex-1 min-w-30 rounded-[10px] p-5 text-center"
            style={{ backgroundColor: bg, border: `1px solid ${color}40` }}
          >
            <div className="text-[2em] font-bold" style={{ color }}>
              {count}
            </div>
            <div className="text-[#989795] text-[0.85em] mt-1">{label}</div>
            <div className="text-[#5a5856] text-[0.75em] mt-0.5">
              {total > 0 ? `${Math.round((count / total) * 100)}%` : "—"}
            </div>
          </div>
        ))}
      </div>
      {byColor.white !== byColor.black && (
        <p className="mt-4 text-[#989795] text-[0.82em] leading-relaxed">
          {byColor.white > byColor.black
            ? "You blunder more as White — possibly overextending when you have the initiative."
            : "You blunder more as Black — possibly struggling under pressure to find defensive resources."}
        </p>
      )}
    </Section>
  );
}

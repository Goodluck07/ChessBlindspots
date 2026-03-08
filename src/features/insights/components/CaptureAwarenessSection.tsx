import { Section } from "./Section";

interface CaptureAwarenessSectionProps {
  missedCaptures: number;
  blunderWasCapture: number;
}

export function CaptureAwarenessSection({
  missedCaptures,
  blunderWasCapture,
}: Readonly<CaptureAwarenessSectionProps>) {
  return (
    <Section title="Capture Awareness">
      <div className="flex flex-col gap-4">
        {[
          {
            value: missedCaptures,
            label: "Missed captures",
            desc: "Best move was taking a piece — you played something else",
            color: "#fa412d",
          },
          {
            value: blunderWasCapture,
            label: "Blunders were captures",
            desc: "You took a piece but it was the wrong move",
            color: "#e6a23c",
          },
        ].map(({ value, label, desc, color }) => (
          <div
            key={label}
            className="flex justify-between items-center p-3.5 bg-[#272522] rounded-lg border border-[#3d3a37]"
          >
            <div>
              <div className="font-bold text-[1.4em]" style={{ color }}>
                {value}
              </div>
              <div className="text-[#989795] text-[0.8em] mt-0.5">{label}</div>
            </div>
            <div className="text-[#989795] text-[0.82em] max-w-40 text-right leading-relaxed">
              {desc}
            </div>
          </div>
        ))}
        {missedCaptures >= 2 && (
          <p className="m-0 text-[#989795] text-[0.82em] leading-relaxed">
            Scan for captures before every move: "Can I take anything? Is
            anything undefended?"
          </p>
        )}
      </div>
    </Section>
  );
}

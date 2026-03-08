interface SectionProps {
  title: string;
  children: React.ReactNode;
}

export function Section({ title, children }: Readonly<SectionProps>) {
  return (
    <section className="bg-[#1e1c1a] border border-[#3d3a37] rounded-xl p-6">
      <h3 className="m-0 mb-5 text-white text-base font-semibold uppercase tracking-[0.5px]">
        {title}
      </h3>
      {children}
    </section>
  );
}

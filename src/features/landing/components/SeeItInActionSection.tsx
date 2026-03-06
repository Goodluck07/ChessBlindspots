import { DemoBlunder } from "../../../components/DemoBlunder";

export function SeeItInActionSection() {
  return (
    <section
      id="features"
      className="py-20 px-5 border-b border-[#3d3a37] bg-[rgba(0,0,0,0.15)]"
    >
      <div className="max-w-240 mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-bold text-white mb-3">See It In Action</h2>
          <p className="text-[#989795] text-lg m-0">
            An interactive example — toggle between the mistake and the best
            move
          </p>
        </div>
        <DemoBlunder />
      </div>
    </section>
  );
}

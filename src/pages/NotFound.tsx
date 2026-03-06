import { MainLayout } from "../layouts/MainLayout";

export function NotFoundPage() {
  return (
    <MainLayout>
      <div className="px-5 py-8">
        <section className="max-w-240 mx-auto bg-[#1e1c1a] rounded-xl px-5 md:px-10 py-16 text-center border border-[#3d3a37]">
          <div className="text-6xl mb-5 opacity-60">🤔</div>
          <h1 className="m-0 mb-4 text-white">Page Not Found</h1>
          <p className="text-[#989795] text-lg max-w-125 mx-auto mb-6">
            The page you're looking for doesn't exist.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <a
              href="/"
              className="bg-green-600 text-black px-6 py-3 rounded-lg font-semibold hover:bg-green-500 transition-colors"
            >
              Go Home
            </a>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}

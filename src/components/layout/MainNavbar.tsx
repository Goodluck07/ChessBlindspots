import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";

export function MainNavbar() {
  return (
    <header className="sticky top-0 z-50 bg-[rgba(39,37,34,0.96)] backdrop-blur-md border-b border-[#3d3a37] py-3 px-6">
      <div className="max-w-240 mx-auto flex items-center justify-between gap-4 flex-col md:flex-row flex-wrap">
        {/* Logo */}
        <Link className="flex items-center gap-2.5" to="/">
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-green-400 to-green-700 flex items-center justify-center text-lg shadow-md">
            &#9816;
          </div>
          <span className="font-bold text-xl text-white">Chess Blindspots</span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center justify-center gap-6">
          <HashLink
            to="/#how-it-works"
            className="landing-nav-link text-[#989795] text-sm hover:text-white transition-colors"
          >
            How It Works
          </HashLink>
          <HashLink
            to="/#features"
            className="landing-nav-link text-[#989795] text-sm hover:text-white transition-colors"
          >
            Features
          </HashLink>
          <Link
            to="/analyze"
            className="bg-green-600 text-black rounded-lg py-2 px-4 font-bold text-sm hover:bg-green-500 transition-colors no-underline"
          >
            Try It Free
          </Link>
        </nav>
      </div>
    </header>
  );
}

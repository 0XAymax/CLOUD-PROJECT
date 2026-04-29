import Navbar from './common/Navbar';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-6">
        <Navbar />
      </div>
    </header>
  );
}

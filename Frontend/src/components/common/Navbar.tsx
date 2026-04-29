import { Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <div className="py-4 flex items-center justify-between ">
      <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
        <div className="relative w-8 h-8 animate-glow rounded-xl flex items-center justify-center font-bold text-slate-950 bg-gradient-to-br from-blue-400 via-cyan-400 to-blue-500 shadow-lg shadow-blue-500/25">
          <Zap className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent animate-shimmer">
          TechShop
        </h1>
      </div>
    </div>
  );
};

export default Navbar;

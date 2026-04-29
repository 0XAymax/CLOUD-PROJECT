import { Zap, Instagram, Facebook, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-slate-800/50 bg-slate-950/80 backdrop-blur-xl mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 via-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Zap className="w-5 h-5 text-slate-950" />
              </div>
              <h3 className="text-xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                TechShop
              </h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your trusted destination for premium technology and innovation.
            </p>
            <div className="flex gap-3">
              <button className="p-2.5 rounded-lg bg-slate-800/60 hover:bg-blue-500/20 border border-slate-700/50 hover:border-blue-500/30 transition-all duration-200 group">
                <Instagram className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
              </button>
              <button className="p-2.5 rounded-lg bg-slate-800/60 hover:bg-blue-500/20 border border-slate-700/50 hover:border-blue-500/30 transition-all duration-200 group">
                <Facebook className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
              </button>
              <button className="p-2.5 rounded-lg bg-slate-800/60 hover:bg-blue-500/20 border border-slate-700/50 hover:border-blue-500/30 transition-all duration-200 group">
                <Twitter className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-slate-200">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Products</a></li>
              <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Categories</a></li>
              <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">New Arrivals</a></li>
              <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Best Sellers</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-slate-200">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">FAQs</a></li>
              <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Shipping</a></li>
              <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Returns</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-slate-200">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">About Us</a></li>
              <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Careers</a></li>
              <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/50">
          <p className="text-center text-slate-500 text-sm">
            © {new Date().getFullYear()} TechShop. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

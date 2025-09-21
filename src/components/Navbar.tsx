import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import logob from '@/assets/logob.png';

//=========== CONSTANTS ===========//
// Define navigation links in one place to avoid repetition (DRY principle).
const NAV_LINKS = [
  { label: 'Home', targetId: 'home' },
  { label: 'Features', targetId: 'features' },
  { label: 'About', targetId: 'about' },
];

//=========== CUSTOM HOOK ===========//
const useScrollHandler = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return isScrolled;
};

//=========== UI SUB-COMPONENTS (IN-FILE) ===========//

const Logo = React.memo(({ onClick }: { onClick: () => void }) => (
  <div className="flex items-center space-x-3 cursor-pointer group" onClick={onClick} style={{ perspective: '1000px' }}>
    <img src={logob} alt="Blue Carbon Logo" className="h-14 w-14 rounded-full object-cover transition-transform duration-500 group-hover:[transform:rotateY(15deg)_rotateX(-10deg)_translateZ(30px)]" />
    <span className="text-2xl font-semibold" style={{ background: 'linear-gradient(45deg, #005f73, #0a9396, #94d2bd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
      Blue Carbon
    </span>
  </div>
));

const DesktopNav = React.memo(({ onLinkClick }: { onLinkClick: (targetId: string) => void }) => (
  <div className="hidden md:flex items-center space-x-10 font-medium text-gray-700">
    {NAV_LINKS.map((link) => (
      <button key={link.label} onClick={() => onLinkClick(link.targetId)} className="relative group pb-1">
        <span>{link.label}</span>
        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-600 transition-all duration-400 group-hover:w-full"></span>
      </button>
    ))}
  </div>
));

const AuthButtons = React.memo(() => (
  <div className="hidden md:flex items-center space-x-2">
    <Link to="/login"><Button variant="ghost" className="font-semibold rounded-full px-5">Login</Button></Link>
    <Link to="/signup"><Button className="bg-cyan-700 hover:bg-cyan-800 text-white font-semibold rounded-full px-5 shadow-md transform hover:scale-105">Sign Up</Button></Link>
  </div>
));

const MobileMenu = React.memo(({ isOpen, onLinkClick }: { isOpen: boolean; onLinkClick: (targetId: string) => void }) => {
  if (!isOpen) return null;
  return (
    <div className="md:hidden pb-4 pt-2 border-t border-gray-200/80 animate-in slide-in-from-top-3 duration-300">
      <div className="flex flex-col space-y-2">
        {NAV_LINKS.map((link) => (
          <button key={link.label} onClick={() => onLinkClick(link.targetId)} className="px-3 py-3 text-lg text-left hover:text-cyan-700 hover:bg-gray-100 rounded-md">
            {link.label}
          </button>
        ))}
        <div className="flex items-center space-x-2 pt-3 mt-2 border-t">
          <Link to="/login" className="w-full"><Button variant="outline" className="w-full font-semibold">Login</Button></Link>
          <Link to="/signup" className="w-full"><Button className="w-full bg-cyan-700 text-white font-semibold">Sign Up</Button></Link>
        </div>
      </div>
    </div>
  );
});

//=========== MAIN COMPONENT ===========//

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isScrolled = useScrollHandler();

  const handleLinkClick = useCallback((targetId: string) => {
    if (targetId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setIsMenuOpen(false);
  }, []);

  const navContainerClasses = `fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'pt-2' : 'pt-0'}`;
  const innerDivClasses = `max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-500 ${isScrolled ? 'bg-white/80 backdrop-blur-xl shadow-2xl border-x border-b border-gray-200/80 rounded-b-3xl' : ''}`;

  return (
    <nav className={navContainerClasses}>
      <div className={innerDivClasses}>
        <div className="flex justify-between items-center h-20">
          <Logo onClick={() => handleLinkClick('home')} />
          <DesktopNav onLinkClick={handleLinkClick} />
          <div className="flex items-center space-x-4">
            <AuthButtons />
            <button className="md:hidden p-2" onClick={() => setIsMenuOpen(v => !v)}>
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
        <MobileMenu isOpen={isMenuOpen} onLinkClick={handleLinkClick} />
      </div>
    </nav>
  );
};

export default React.memo(Navbar);
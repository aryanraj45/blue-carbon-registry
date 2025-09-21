
import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full mt-auto bg-[#1a2233] text-gray-100 p-8 shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-center w-full max-w-6xl mx-auto gap-6">
        <div className="text-left">
          <h2 className="font-bold text-lg text-blue-400 flex items-center gap-2">
            <span>🌊</span> <span className="text-green-400">🌱</span> Blue Carbon Registry
          </h2>
          <p className="mt-2 text-sm max-w-xs text-gray-200">
            A blockchain-powered platform for monitoring, reporting, and verification of blue carbon ecosystem restoration.
          </p>
          <p className="mt-2 text-xs text-gray-300">© 2024 Blue Carbon Registry. A project for NCCR, MoES.</p>
        </div>
        <div className="text-left md:text-right">
          <h3 className="font-semibold text-base text-blue-200">Quick Links</h3>
          <ul className="mt-2 space-y-1">
            <li><a href="#" className="hover:text-blue-400 text-gray-100 underline underline-offset-2 transition">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-blue-400 text-gray-100 underline underline-offset-2 transition">Terms of Service</a></li>
            <li><a href="#" className="hover:text-blue-400 text-gray-100 underline underline-offset-2 transition">Contact Us</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
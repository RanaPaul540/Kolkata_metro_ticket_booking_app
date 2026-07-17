import React, { useState } from 'react';
import SystemStatus from './components/SystemStatus';
import RouteSelector from './components/RouteSelector';
import Dashboard from './components/Dashboard';
import { Train } from 'lucide-react';

export default function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isSystemUnlocked, setIsSystemUnlocked] = useState(false);
  const [secretCode, setSecretCode] = useState(null);

  const handleTicketBooked = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleStatusVerified = (unlocked, code) => {
    setIsSystemUnlocked(unlocked);
    setSecretCode(code);
  };

  return (
    <div className="min-h-screen text-slate-800 flex flex-col font-sans bg-slate-50">
      
      {/* 1. National Tricolor Strip */}
      <div className="h-1.5 w-full flex">
        <div className="bg-[#FF9933] w-1/3 h-full" /> {/* Saffron */}
        <div className="bg-white w-1/3 h-full" />      {/* White */}
        <div className="bg-[#128807] w-1/3 h-full" />  {/* India Green */}
      </div>

      {/* 2. Top Accessibility & Official Govt Metadata Bar */}
      <div className="bg-slate-100 border-b border-slate-200 py-1.5 px-6 text-[11px] text-slate-600 font-medium hidden sm:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex gap-4">
            <span className="hover:underline cursor-pointer">भारत सरकार | Govt. of India</span>
            <span className="text-slate-300">|</span>
            <span className="hover:underline cursor-pointer">पश्चिम बंगाल सरकार | Govt. of West Bengal</span>
          </div>
          <div className="flex gap-4 items-center">
            <span className="hover:underline cursor-pointer">Skip to Main Content</span>
            <span>|</span>
            <span className="hover:underline cursor-pointer">Screen Reader Access</span>
            <span>|</span>
            <span className="flex items-center gap-1 font-bold">
              <span className="px-1 bg-slate-200 border border-slate-300 rounded cursor-pointer text-[10px] hover:bg-slate-300">A-</span>
              <span className="px-1 bg-slate-200 border border-slate-300 rounded cursor-pointer text-[10px] hover:bg-slate-300">A</span>
              <span className="px-1 bg-slate-200 border border-slate-300 rounded cursor-pointer text-[10px] hover:bg-slate-300">A+</span>
            </span>
            <span>|</span>
            <span className="font-semibold text-slate-700 cursor-pointer">English | বাংলা | हिंदी</span>
          </div>
        </div>
      </div>

      {/* 3. Main Government Agency Header */}
      <header className="bg-white border-b-2 border-slate-200 shadow-sm sticky top-0 z-50 py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Organization logo / metadata */}
          <div className="flex items-center gap-3.5">
            <span className="p-2.5 bg-gradient-to-tr from-[#0F2C59] to-[#1E3A8A] rounded-lg shadow-md flex items-center justify-center">
              <Train className="w-7 h-7 text-white" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-xl font-extrabold tracking-tight text-[#0F2C59]">
                  कोलकाता मेट्रो रेल कॉर्पोरेशन लिमिटेड
                </h1>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 uppercase">
                  KMRCL
                </span>
              </div>
              <h2 className="text-xs md:text-sm font-semibold text-slate-500 mt-0.5">
                Kolkata Metro Rail Corporation Limited
              </h2>
              <p className="text-[9px] font-bold text-[#128807] uppercase tracking-wider mt-0.5">
                A Joint Venture of Ministry of Railways, Govt. of India & Govt. of West Bengal
              </p>
            </div>
          </div>
          
          {/* Status Indicator Panel */}
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 shadow-inner">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isSystemUnlocked ? 'bg-emerald-500' : 'bg-rose-500'
              }`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isSystemUnlocked ? 'bg-emerald-600' : 'bg-rose-600'
              }`} />
            </span>
            <div className="text-left">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Security Gateway</span>
              <span className="text-xs font-bold text-slate-700">
                {isSystemUnlocked ? 'Verification Active' : 'Offline Mode'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 4. Gateway Verification Alert & Code Banner */}
      <SystemStatus onStatusVerified={handleStatusVerified} />

      {/* 5. Main Grid Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Route Planner */}
          <div className="lg:col-span-1">
            <RouteSelector onTicketBooked={handleTicketBooked} />
          </div>

          {/* Ticket Booking Table and Metrics */}
          <div className="lg:col-span-2">
            <Dashboard refreshTrigger={refreshTrigger} />
          </div>
        </div>
      </main>

      {/* 6. Official Government Footer */}
      <footer className="bg-[#0F2C59] text-white border-t border-slate-300 mt-auto">
        {/* Tricolor Strip at bottom header */}
        <div className="h-1 w-full flex">
          <div className="bg-[#FF9933] w-1/3 h-full" />
          <div className="bg-white w-1/3 h-full" />
          <div className="bg-[#128807] w-1/3 h-full" />
        </div>
        
        <div className="max-w-7xl mx-auto py-8 px-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300">
          <div>
            <h4 className="font-bold text-sm text-white mb-2 uppercase">Kolkata Metro Rail Corporation</h4>
            <p className="leading-relaxed">
              HRBC Complex, KMRCL Bhawan, Munshi Premchand Sarani, Kolkata, West Bengal 700021.
              <br />
              Official Portal for Smart Card Recharge, Ticket QR Booking, and System Diagnostics.
            </p>
          </div>
          <div className="md:text-right flex flex-col justify-between">
            <p className="leading-relaxed">
              Content owned, updated and maintained by Kolkata Metro Rail Corporation Limited (KMRCL).
              <br />
              Page last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}.
            </p>
            <p className="text-[10px] text-slate-400 mt-4">
              Designed & developed in association with National Informatics Centre (NIC) / Government Hosting Portal.
            </p>
          </div>
        </div>
        
        <div className="bg-[#0b1d3a] py-3 text-center text-[10px] text-slate-400 border-t border-slate-800">
          <p>© 2026 Kolkata Metro Rail Corporation Limited. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}

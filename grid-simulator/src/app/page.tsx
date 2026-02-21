"use client";

import { useEffect } from 'react';
import { useSimulationStore } from '@/store/useSimulationStore';
import Dashboard from '@/components/Dashboard';
import ControlPanel from '@/components/ControlPanel';
import AIChat from '@/components/AIChat';
import dynamic from 'next/dynamic';

const CityMap = dynamic(() => import('@/components/CityMap'), { ssr: false });

export default function Home() {
  const { initGrid, tickSim } = useSimulationStore();

  useEffect(() => {
    initGrid();

    // Auto-tick simulation every few seconds just in case of unhandled manual events
    const interval = setInterval(() => {
      tickSim();
    }, 2000);
    return () => clearInterval(interval);
  }, [initGrid, tickSim]);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black text-white selection:bg-[#64FFDA]/30">

      {/* 3D Background Layer */}
      <div className="absolute inset-0 z-0">
        <CityMap />
      </div>

      {/* UI Overlay - Using absolute positioning for floating elements */}
      <div className="absolute inset-0 z-10 pointer-events-none p-6 flex flex-col justify-between">

        {/* Top Dashboard - Floating */}
        <div className="pointer-events-auto">
          <Dashboard />
        </div>

        {/* Bottom Section with Sidebars */}
        <div className="flex-1 flex justify-between items-end mt-4 h-[calc(100vh-120px)] overflow-hidden">
          <div className="pointer-events-auto h-full max-h-[800px] rounded-2xl shadow-2xl backdrop-blur-md">
            <ControlPanel />
          </div>

          <div className="pointer-events-auto h-full max-h-[800px] w-96 rounded-2xl shadow-2xl backdrop-blur-md">
            <AIChat />
          </div>
        </div>
      </div>
    </main>
  );
}

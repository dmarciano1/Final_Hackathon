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
    const interval = setInterval(() => {
      tickSim();
    }, 2000);
    return () => clearInterval(interval);
  }, [initGrid, tickSim]);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black text-white selection:bg-[#64FFDA]/30">
      {/* 3D City Map - The App (full viewport) */}
      <div className="absolute inset-0 z-0">
        <CityMap />
      </div>

      {/* Overlays - Floating UI on top of the simulation */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* Dashboard overlay - top */}
        <div className="pointer-events-auto absolute top-4 left-4 right-4">
          <Dashboard />
        </div>

        {/* Control Panel overlay - bottom left */}
        <div className="pointer-events-auto absolute bottom-4 left-4">
          <ControlPanel />
        </div>

        {/* AI Chat overlay - bottom right */}
        <div className="pointer-events-auto absolute bottom-4 right-4">
          <AIChat />
        </div>
      </div>
    </main>
  );
}

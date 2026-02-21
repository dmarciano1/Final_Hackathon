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
      {/* Full-screen 3D simulation */}
      <div className="absolute inset-0 z-0">
        <CityMap />
      </div>

      {/* Overlay UI */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* Top: compact dashboard stats */}
        <div className="pointer-events-auto absolute top-4 left-4 right-4">
          <Dashboard />
        </div>

        {/* Bottom-left: collapsible control panel */}
        <div className="pointer-events-auto absolute bottom-4 left-4">
          <ControlPanel />
        </div>

        {/* Bottom-right: collapsible AI chat */}
        <div className="pointer-events-auto absolute bottom-4 right-4">
          <AIChat />
        </div>
      </div>
    </main>
  );
}

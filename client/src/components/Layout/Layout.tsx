import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomTabBar from './BottomTabBar';
import TopBar from './TopBar';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-yellow-50 via-white to-white">
      {/* Desktop sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col md:ml-64 min-w-0">
        {/* Top bar (mobile only) */}
        <TopBar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 page-enter">
          <Outlet />
        </main>

        {/* Bottom tab bar (mobile only) */}
        <BottomTabBar />
      </div>
    </div>
  );
}

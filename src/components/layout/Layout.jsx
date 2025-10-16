// RUTA: src/components/layout/Layout.jsx

import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNavBar from './BottomNavBar';
import useUserStore from '../../store/userStore';
import BannedUserPage from '../../pages/BannedUserPage';

const Layout = () => {
  const user = useUserStore((state) => state.user);

  if (user && user.status === 'banned') {
    return <BannedUserPage />;
  }

  return (
    <div className="w-full min-h-screen">
      <div className="container mx-auto max-w-lg min-h-screen flex flex-col">
        <main className="flex-1 overflow-y-auto pb-24 no-scrollbar">
          <Outlet />
        </main>
      </div>
      <BottomNavBar />
    </div>
  );
};

export default Layout;
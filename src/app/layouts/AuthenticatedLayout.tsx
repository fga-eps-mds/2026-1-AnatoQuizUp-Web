import { Outlet } from 'react-router-dom';
import { Header } from '../../widgets/header';

export const AuthenticatedLayout = () => (
  <div className="min-h-screen flex flex-col md:flex-row bg-white">
    <Header />
    <main className="flex-1 min-w-0">
      <Outlet />
    </main>
  </div>
);

import { useEffect, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Eye, Home, LogOut, Menu, Users, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';
import logo from '../../../shared/assets/image/logo.png';
import type { Role } from '../../../entities/user/model/types';

type NavItem = {
  key: string;
  label: string;
  icon: LucideIcon;
  onSelect: () => void;
  isActive: boolean;
};

export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isViewingAsStudent, setIsViewingAsStudent] = useState(false);
  const drawerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isDrawerOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        setIsDrawerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDrawerOpen]);

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setIsDrawerOpen(false);
  };

  const handleToggleStudentView = () => {
    setIsViewingAsStudent((prev) => !prev);
  };

  const isRouteActive = (path: string) => location.pathname === path;

  const buildNavItems = (role: Role): NavItem[] => {
    const homeItem: NavItem = {
      key: 'home',
      label: 'Início',
      icon: Home,
      onSelect: () => navigate('/home'),
      isActive: isRouteActive('/home') || isRouteActive('/'),
    };
    switch (role) {
      case 'PROFESSOR':
        return [
          homeItem,
          {
            key: 'view-as-student',
            label: isViewingAsStudent ? 'Sair da visão de aluno' : 'Ver como aluno',
            icon: Eye,
            onSelect: handleToggleStudentView,
            isActive: isViewingAsStudent,
          },
        ];
      case 'ADMIN':
        return [
          homeItem,
          {
            key: 'admin-users',
            label: 'Gerenciar Usuários',
            icon: Users,
            onSelect: () => navigate('/admin/usuarios'),
            isActive: isRouteActive('/admin/usuarios'),
          },
        ];
      case 'STUDENT':
      default:
        return [homeItem];
    }
  };

  const navItems = buildNavItems(user.role);
  const initial = user.name?.charAt(0).toUpperCase() || 'U';

  const handleSelect = (item: NavItem) => {
    item.onSelect();
    setIsDrawerOpen(false);
  };

  const sidebarContent = (
    <>
      <div className="flex items-center justify-center px-4 py-6 border-b border-[#00214d]">
        <img src={logo} alt="AnatoQuizUp" className="w-full max-w-[200px]" />
      </div>

      <nav className="flex-1 py-4 flex flex-col gap-1 px-3 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => handleSelect(item)}
              aria-current={item.isActive ? 'page' : undefined}
              className={
                'flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-bold transition-colors text-left ' +
                (item.isActive
                  ? 'bg-[#F97316] text-white shadow-md'
                  : 'text-[#fffffe]/80 hover:bg-[#00214d] hover:text-[#71edc8]')
              }
            >
              <Icon size={22} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="border-t border-[#00214d] p-4 flex flex-col gap-3">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-[#00214d] border border-[#71edc8] rounded-full flex items-center justify-center text-[#71edc8] text-sm font-black shrink-0">
            {initial}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-[#fffffe] truncate">{user.name}</span>
            <span className="text-[10px] uppercase tracking-widest text-[#fffffe]/40">{user.role}</span>
          </div>
        </div>
        <button
          onClick={() => void handleLogout()}
          className="flex cursor-pointer items-center gap-3 px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#fffffe]/60 hover:text-red-400 transition-colors rounded-lg"
          aria-label="Sair da conta"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </>
  );

  return (
    <>
      <div className="md:hidden sticky top-0 z-40 bg-[#0A1128] h-16 flex items-center justify-between px-4 border-b border-[#00214d]">
        <button onClick={() => navigate('/home')} className="flex items-center">
          <img src={logo} alt="AnatoQuizUp" className="h-10" />
        </button>
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="p-2 text-[#fffffe] hover:text-[#71edc8] transition-colors"
          aria-label="Abrir menu"
          aria-expanded={isDrawerOpen}
        >
          <Menu size={24} />
        </button>
      </div>

      <aside className="hidden md:flex w-64 bg-[#0A1128] text-[#fffffe] flex-col sticky top-0 h-screen shrink-0">
        {sidebarContent}
      </aside>

      {isDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50">
          <div
            ref={drawerRef}
            className="relative h-full w-64 bg-[#0A1128] text-[#fffffe] flex flex-col shadow-2xl"
          >
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="absolute top-3 right-3 z-10 p-2 text-[#fffffe] hover:text-[#71edc8] transition-colors"
              aria-label="Fechar menu"
            >
              <X size={22} />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

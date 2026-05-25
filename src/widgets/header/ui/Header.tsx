import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Eye, Home, LogOut, Coins, Menu, Users, X, Newspaper, BookOpen, List, Calendar } from "lucide-react";

import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../app/providers/AuthProvider";
import logo from "../../../shared/assets/image/logo.png";
import { useStudentCoinsStore } from "../../../features/student-coins/model/useStudentCoinsStore";

type NavItem = {
  key: string;
  label: string;
  icon: LucideIcon;
  onSelect: () => void;
  isActive: boolean;
};

export const Header = () => {
  const { user, logout } = useAuth();
  const saldoMoedas = useStudentCoinsStore((state) => state.saldoMoedas);
  const navigate = useNavigate();
  const location = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isViewingAsStudent, setIsViewingAsStudent] = useState(false);
  const drawerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isDrawerOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(event.target as Node)
      ) {
        setIsDrawerOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDrawerOpen]);

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
    setIsDrawerOpen(false);
  };

  const handleToggleStudentView = () => {
    setIsViewingAsStudent((prev) => !prev);
  };

  const isRouteActive = (path: string) => location.pathname === path;

  const buildNavItems = (role: string): NavItem[] => {
    const homeItem: NavItem = {
      key: "home",
      label: "Início",
      icon: Home,
      onSelect: () => navigate("/home"),
      isActive: isRouteActive("/home") || isRouteActive("/"),
    };

    const homeProfessorItem: NavItem = {
      key: "home",
      label: "Início",
      icon: Home,
      onSelect: () => navigate("/professor/home"),
      isActive:
        isRouteActive("/professor/home") ||
        isRouteActive("/home") ||
        isRouteActive("/"),
    };

    const studentQuestaoItem: NavItem = {
      key: "aluno-questoes",
      label: "Questões",
      icon: Newspaper,
      onSelect: () => navigate("/aluno/quiz/escolha"),
      isActive: location.pathname.startsWith("/aluno/quiz"),
    };

    const studentHistoricoItem: NavItem = {
      key: "aluno-historico",
      label: "Histórico",
      icon: Calendar,
      onSelect: () => navigate("/aluno/historico"),
      isActive: location.pathname.startsWith("/aluno/historico"),
    };

    const turmasItem: NavItem = {
      key: "turmas",
      label: "Turmas",
      icon: BookOpen,
      onSelect: () => navigate("/turmas"),
      isActive: location.pathname.startsWith("/turmas"),
    };

    const minhasTurmasAlunoItem: NavItem = {
      key: "minhas-turmas",
      label: "Minhas Turmas",
      icon: BookOpen,
      onSelect: () => navigate("/aluno/turmas"),
      isActive: location.pathname.startsWith("/aluno/turmas"),
    };

    const listasItem: NavItem = {
      key: "listas",
      label: "Listas",
      icon: List,
      onSelect: () => navigate("/professor/lista"),
      isActive: location.pathname.startsWith("/professor/listas"),
    };

    switch (role) {
      case "PROFESSOR":
        return [
          homeProfessorItem,
          {
            key: "view-as-student",
            label: isViewingAsStudent
              ? "Sair da visão de aluno"
              : "Ver como aluno",
            icon: Eye,
            onSelect: handleToggleStudentView,
            isActive: isViewingAsStudent,
          },
          {
            key: "questoes",
            label: "Questões",
            icon: Newspaper,
            onSelect: () => navigate("/professor/questoes"),
            isActive:
              location.pathname.startsWith("/professor/questoes") ||
              location.pathname.startsWith("/professor/criar-questao"),
          },
          listasItem,
          turmasItem,
        ];

      case "ADMIN":
      case "ADMINISTRADOR":
        return [
          {
            key: "admin-home",
            label: "Início",
            icon: Home,
            onSelect: () => navigate("/admin/home"),
            isActive:
              isRouteActive("/admin/home") ||
              isRouteActive("/home") ||
              isRouteActive("/"),
          },
          {
            key: "questoes",
            label: "Questões",
            icon: Newspaper,
            onSelect: () => navigate("/professor/questoes"),
            isActive:
              location.pathname.startsWith("/professor/questoes") ||
              location.pathname.startsWith("/professor/criar-questao"),
          },
          listasItem,
          turmasItem,
          {
            key: "admin-users",
            label: "Gerenciar Usuários",
            icon: Users,
            onSelect: () => navigate("/admin/dashboard"),
            isActive:
              isRouteActive("/admin/dashboard") ||
              isRouteActive("/admin/usuarios"),
          },
        ];

      case "STUDENT":
      default:
        return [homeItem, studentQuestaoItem, minhasTurmasAlunoItem, studentHistoricoItem];
    }
  };

  const navItems = buildNavItems(user.role);
  const initial = user.name?.charAt(0).toUpperCase() || "U";
  const shouldShowCoins = user.role === "STUDENT";

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
          const estiloItem = item.isActive
            ? "bg-[#F97316] text-white shadow-md"
            : "text-[#fffffe]/80 hover:bg-[#00214d] hover:text-[#71edc8]";

          return (
            <button
              key={item.key}
              onClick={() => handleSelect(item)}
              aria-current={item.isActive ? "page" : undefined}
              className={`flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-bold transition-colors text-left ${estiloItem}`}
            >
              <Icon size={22} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="border-t border-[#00214d] p-4 flex flex-col gap-3">
        {shouldShowCoins && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-[#F59E0B]/30 bg-[#F59E0B]/10 px-4 py-3 text-[#fffffe]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-[#F59E0B] text-[#0A1128] flex items-center justify-center shrink-0">
                <Coins size={18} />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-[#fffffe]/70">
                ATP
              </span>
            </div>
            <span className="text-lg font-black text-[#FDE68A] tabular-nums">
              {saldoMoedas}
            </span>
          </div>
        )}

        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-[#00214d] border border-[#71edc8] rounded-full flex items-center justify-center text-[#71edc8] text-sm font-black shrink-0">
            {initial}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-[#fffffe] truncate">
              {user.name}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-[#fffffe]/40">
              {user.role}
            </span>
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
        <button onClick={() => navigate("/home")} className="flex items-center">
          <img src={logo} alt="AnatoQuizUp" className="h-10" />
        </button>

        <div className="flex items-center gap-2">
          {shouldShowCoins && (
            <div className="h-9 min-w-20 px-3 rounded-full bg-[#F59E0B]/15 border border-[#F59E0B]/30 text-[#FDE68A] flex items-center justify-center gap-1.5">
              <Coins size={16} />
              <span className="text-sm font-black tabular-nums">{saldoMoedas}</span>
            </div>
          )}

          <button
            onClick={() => setIsDrawerOpen(true)}
            className="p-2 text-[#fffffe] hover:text-[#71edc8] transition-colors"
            aria-label="Abrir menu"
            aria-expanded={isDrawerOpen}
          >
            <Menu size={24} />
          </button>
        </div>
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
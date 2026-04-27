import { useState } from "react";
import { Search } from 'lucide-react';
import { UserDetailsDrawer } from "./UserDetailsDrawer";
import type { Role, UserStatus } from '../../../entities/user/model/types';

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
  siape: string;
  department: string;
  course: string;
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "Ana Beatriz Silva",
    email: "ana@email.com",
    role: "PROFESSOR",
    status: "ACTIVE",
    createdAt: "25/04/2026",
    siape: "123456",
    department: "Biologia",
    course: "Fisioterapia",
  },
  {
    id: "2",
    name: "Carlos Eduardo",
    email: "carlos@email.com",
    role: "PROFESSOR",
    status: "PENDING",
    createdAt: "25/04/2026",
    siape: "654321",
    department: "Anatomia",
    course: "Medicina",
  },
];

export const AdminUsersPage = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | UserStatus>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const pendingUsers = mockUsers.filter((u) => u.status === 'PENDING');

  const filteredUsers = mockUsers
    .filter((user) =>
      statusFilter === 'ALL' ? true : user.status === statusFilter,
    )
    .filter((user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
    );

  const getFilterButtonClass = (filter: 'ALL' | UserStatus) =>
    `px-3 py-2 rounded-full text-sm font-medium transition ${
      statusFilter === filter
        ? 'bg-blue-600 text-white cursor-pointer'
        : 'text-gray-500 hover:bg-blue-100 hover:text-blue-600 cursor-pointer'
    }`;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 text-white p-4">
        <h1 className="font-bold text-lg mb-6">AnatoQuizUp</h1>
        <nav className="flex flex-col gap-3">
          <button className="text-left">Dashboard</button>
          <button className="text-left font-semibold">Usuários</button>
          <button className="text-left">Configurações</button>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-semibold mb-6">
          Gerenciar usuários
        </h1>

        {/* Pending Section */}
        {pendingUsers.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span>🕒</span>
              <h2 className="font-medium">Aguardando aprovação</h2>
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
                {pendingUsers.length}
              </span>
            </div>

            <div className="flex gap-4 overflow-x-auto">
              {pendingUsers.map((user) => (
                <div
                  key={user.id}
                  className="min-w-[260px] bg-gray-50 rounded-lg border border-gray-200 p-4"
                >
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>

                  <div className="mt-3 text-xs text-gray-600 space-y-1">
                    <p>SIAPE: {user.siape}</p>
                    <p>Departamento: {user.department}</p>
                    <p>Curso: {user.course}</p>
                    <p>Data: {user.createdAt}</p>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button className="flex-1 bg-green-500 text-white rounded-md py-1">
                      ✔ Aprovar
                    </button>
                    <button className="flex-1 border border-red-500 text-red-500 rounded-md py-1">
                      ✖ Rejeitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Table Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          {/* Filters */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-3 text-sm">
              <button
                type="button"
                className={getFilterButtonClass('ALL')}
                onClick={() => setStatusFilter('ALL')}
              >
                Todos
              </button>
              <button
                type="button"
                className={getFilterButtonClass('PENDING')}
                onClick={() => setStatusFilter('PENDING')}
              >
                Pendentes
              </button>
              <button
                type="button"
                className={getFilterButtonClass('ACTIVE')}
                onClick={() => setStatusFilter('ACTIVE')}
              >
                Ativos
              </button>
              <button
                type="button"
                className={getFilterButtonClass('INACTIVE')}
                onClick={() => setStatusFilter('INACTIVE')}
              >
                Inativos
              </button>
            </div>

            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar por nome ou email..."
                className="w-full rounded-2xl border border-gray-300 bg-white px-11 py-3 text-sm text-gray-700 shadow-sm outline-none transition duration-150 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* Table */}
          <table className="w-full text-sm">
            <thead className="text-gray-500 border-b">
              <tr>
                <th className="text-left py-2">Nome</th>
                <th className="text-left py-2">Email</th>
                <th className="text-left py-2">Tipo</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Data</th>
                <th className="text-left py-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="py-3">{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <Badge type="role" value={user.role} />
                  </td>
                  <td>
                    <Badge type="status" value={user.status} />
                  </td>
                  <td>{user.createdAt}</td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      aria-label={`Ver detalhes de ${user.name}`}
                      className="text-blue-600 font-bold hover:text-blue-800"
                      onClick={() => setSelectedUser(user)}
                    >
                      &gt;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4 text-sm">
            <span>Mostrando {filteredUsers.length} de {mockUsers.length}</span>
            <div className="flex gap-2">
              <button className="px-2">{"<"}</button>
              <button className="px-2 bg-blue-600 text-white rounded">
                1
              </button>
              <button className="px-2">2</button>
              <button className="px-2">{">"}</button>
            </div>
          </div>
        </div>
      </main>

      {/* Drawer */}
      <UserDetailsDrawer
        user={selectedUser}
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
      />
    </div>
  );
};

const Badge = ({
  value,
}: {
  type: "role" | "status";
  value: string;
}) => {
  const styles: any = {
    STUDENT: "bg-blue-100 text-blue-700",
    TEACHER: "bg-green-100 text-green-700",
    ADMIN: "bg-orange-100 text-orange-700",
    ACTIVE: "bg-green-100 text-green-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    INACTIVE: "bg-gray-200 text-gray-600",
  };

  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs ${styles[value]}`}
    >
      {value}
    </span>
  );
};
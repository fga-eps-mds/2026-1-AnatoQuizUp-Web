import { ListarListas } from '../../../features/manage-lista/ListarListas';

export const ListaPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-7xl p-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Listas de Questões</h1>
          <p className="text-sm text-gray-500">Monte e publique listas para suas turmas</p>
        </header>

        <ListarListas />
      </main>
    </div>
  );
};
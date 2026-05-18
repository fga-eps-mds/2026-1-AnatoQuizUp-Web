import { ListaTurmas } from '../../../features/manage-turmas/ui/ListarTurmas';

export const TurmasPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      
      <main className="mx-auto max-w-7xl p-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Turmas</h1>
          <p className="text-sm text-gray-500">Gerencie suas turmas e alunos</p>
        </header>

        <ListaTurmas />
      </main>
    </div>
  );
};
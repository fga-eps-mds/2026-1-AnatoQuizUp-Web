import { ListarListas } from '../../../features/manage-lista/ListarListas';

export const ListaPage = () => {
  return (
    <main className="min-h-[100dvh] w-full bg-[#F8FAFC]">
      <div className="p-6 md:p-8">
        <header className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-[22px] font-bold leading-tight text-gray-900">
              Listas de Questões
            </h1>

            <p className="mt-1 text-[13px] text-gray-500">
              Monte listas e organize as questões. A publicação para alunos acontece em Turmas.
            </p>
          </div>
        </header>

        <ListarListas />
      </div>
    </main>
  );
};
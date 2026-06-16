import { ListarListas } from '../../../features/manage-lista/ListarListas';

export const ListaPage = () => {
  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-[#dde2ea]">
      <div className="p-6 md:p-8 overflow-y-auto flex-1">
        <header className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-gray-900 leading-tight">Listas de Questões</h1>
            <p className="text-[13px] text-gray-500 mt-1">
              Monte listas e organize as questões. A publicação para alunos acontece em Turmas.
            </p>
          </div>
        </header>

        <ListarListas />
      </div>
    </main>
  );
};
import { Edit2, GraduationCap, Plus, Search, Sparkles, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAuth } from '../../../app/providers/AuthProvider';

type QuestionDifficulty = 'Fácil' | 'Médio' | 'Difícil';
type QuestionSource = 'Manual' | 'IA';

type Question = {
  id: string;
  topic: string;
  statement: string;
  difficulty: QuestionDifficulty;
  source: QuestionSource;
  createdAt: string;
};

const questions: Question[] = [
  {
    id: 'question-1',
    topic: 'Tórax',
    statement: 'Qual estrutura forma a parede anterior do mediastino superior?',
    difficulty: 'Médio',
    source: 'IA',
    createdAt: '12/04/2025',
  },
  {
    id: 'question-2',
    topic: 'Tórax',
    statement: 'Cite os ramos do arco aórtico e suas relações anatômicas com o coração.',
    difficulty: 'Difícil',
    source: 'Manual',
    createdAt: '08/04/2025',
  },
  {
    id: 'question-3',
    topic: 'Tórax',
    statement: 'Quais são os limites do triângulo cardíaco na projeção anterior?',
    difficulty: 'Fácil',
    source: 'IA',
    createdAt: '05/04/2025',
  },
  {
    id: 'question-4',
    topic: 'Imagem',
    statement: 'Na radiografia apresentada, identifique o ventrículo direito e sua borda.',
    difficulty: 'Difícil',
    source: 'Manual',
    createdAt: '01/04/2025',
  },
];

const getInitials = (name?: string | null) => {
  if (!name) return 'U';

  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const difficultyStyles: Record<QuestionDifficulty, string> = {
  Fácil: 'bg-[#e1f5ee] text-[#0b6b5a]',
  Médio: 'bg-[#f7ecd8] text-[#633806]',
  Difícil: 'bg-[#fef0f0] text-[#a32d2d]',
};

const topicStyles: Record<string, string> = {
  Tórax: 'bg-[#e1f5ee] text-[#0b6b5a]',
  Imagem: 'bg-[#eef1f8] text-[#993556]',
};

const PageHeader = () => {
  const { user } = useAuth();

  return (
    <header className="flex items-center justify-between gap-4 border-b border-[#e1f5ee] bg-white px-5 py-3">
      <div className="min-w-0">
        <h1 className="text-base font-bold text-[#0b1840]">Banco de Questões</h1>
        <p className="text-[11px] text-[#8a9ab8]">Gerencie todas as suas questões</p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-md border border-[#b5d4f4] bg-[#e0e8ff] px-2.5 py-1 text-[10px] font-bold text-[#185fa5]">
          <GraduationCap size={12} aria-hidden="true" />
          Professor
        </span>
        <span
          className="flex size-7 items-center justify-center rounded-full bg-[#c8d6f8] text-[10px] font-bold text-[#0b1840]"
          aria-label={`Usuário ${user?.name ?? 'autenticado'}`}
        >
          {getInitials(user?.name)}
        </span>
      </div>
    </header>
  );
};

const QuestionsSummary = ({ total, aiTotal }: { total: number; aiTotal: number }) => (
  <section className="flex w-full flex-col gap-4 rounded-xl border border-[#e0e5ef] bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h2 className="text-base font-bold text-[#0b1840]">Suas questões</h2>
      <p className="text-xs text-[#8a9ab8]">
        {total > 0
          ? `${total} questões cadastradas · ${aiTotal} geradas por IA`
          : 'Nenhuma questão cadastrada ainda'}
      </p>
    </div>

    <button
      type="button"
      className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#00e5cc] px-5 py-3 text-xs font-bold text-[#0b1840] transition-colors hover:brightness-95"
    >
      <Plus size={15} aria-hidden="true" />
      Nova Questão
    </button>
  </section>
);

const QuestionsFilters = ({
  resultCount,
  searchTerm,
  onSearchTermChange,
}: {
  resultCount: number;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
}) => (
  <section className="flex w-full flex-wrap items-center gap-2" aria-label="Filtros de questões">
    <label className="relative min-w-[180px] flex-1">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a9ab8]"
        size={14}
        aria-hidden="true"
      />
      <span className="sr-only">Buscar questão</span>
      <input
        value={searchTerm}
        onChange={(event) => onSearchTermChange(event.target.value)}
        placeholder="Buscar questão"
        className="w-full rounded-lg border border-[#e0e5ef] bg-white py-2 pl-9 pr-3 text-xs text-[#333333] outline-none transition-colors placeholder:text-[#8a9ab8] focus:border-[#00e5cc]"
      />
    </label>

    <select
      className="rounded-lg border border-[#e0e5ef] bg-white px-4 py-2 text-xs text-[#4a5578] outline-none focus:border-[#00e5cc]"
      aria-label="Filtrar por tema"
      defaultValue="all"
    >
      <option value="all">Todos os temas</option>
      <option value="torax">Tórax</option>
      <option value="imagem">Imagem</option>
    </select>

    <select
      className="rounded-lg border border-[#e0e5ef] bg-white px-4 py-2 text-xs text-[#4a5578] outline-none focus:border-[#00e5cc]"
      aria-label="Filtrar por dificuldade"
      defaultValue="all"
    >
      <option value="all">Dificuldade</option>
      <option value="facil">Fácil</option>
      <option value="medio">Médio</option>
      <option value="dificil">Difícil</option>
    </select>

    <select
      className="rounded-lg border border-[#e0e5ef] bg-white px-4 py-2 text-xs text-[#4a5578] outline-none focus:border-[#00e5cc]"
      aria-label="Filtrar por origem"
      defaultValue="all"
    >
      <option value="all">Origem</option>
      <option value="manual">Manual</option>
      <option value="ia">IA</option>
    </select>

    <span className="text-[11px] text-[#8a9ab8]">{resultCount} resultado(s)</span>
  </section>
);

const Badge = ({ children, className }: { children: string; className: string }) => (
  <span className={`inline-flex w-fit items-center rounded px-2 py-1 text-[10px] font-bold ${className}`}>
    {children}
  </span>
);

const SourceBadge = ({ source }: { source: QuestionSource }) => {
  if (source === 'Manual') {
    return <span className="text-[10px] text-[#8a9ab8]">Manual</span>;
  }

  return (
    <span className="inline-flex w-fit items-center gap-1 rounded bg-[#f2f4f8] px-1.5 py-1 text-[9px] font-bold text-[#3c3489]">
      <Sparkles size={10} aria-hidden="true" />
      IA
    </span>
  );
};

const QuestionsTable = ({ items }: { items: Question[] }) => (
  <section className="w-full overflow-hidden rounded-xl border border-[#e0e5ef] bg-white">
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse text-left">
        <thead className="bg-[#f8f9fc]">
          <tr className="border-b border-[#e8eaf2]">
            {['Tema', 'Enunciado', 'Dific.', 'Origem', 'Criada em', 'Ações'].map((heading) => (
              <th
                key={heading}
                scope="col"
                className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.06em] text-[#8a9ab8]"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((question) => (
            <tr key={question.id} className="border-b border-[#f2f4f8] last:border-b-0">
              <td className="px-4 py-4 align-top">
                <Badge className={topicStyles[question.topic] ?? topicStyles['Tórax']}>{question.topic}</Badge>
              </td>
              <td className="max-w-[320px] px-4 py-4 text-xs text-[#4a5578]">{question.statement}</td>
              <td className="px-4 py-4 align-top">
                <Badge className={difficultyStyles[question.difficulty]}>{question.difficulty}</Badge>
              </td>
              <td className="px-4 py-4 align-top">
                <SourceBadge source={question.source} />
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-[11px] text-[#8a9ab8]">{question.createdAt}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-[#c8d6f8] bg-[#fef0f0] px-3 py-2 text-[11px] font-bold text-[#185fa5] transition-colors hover:bg-[#e0e8ff]"
                  >
                    <Edit2 size={12} aria-hidden="true" />
                    Editar
                  </button>
                  <button
                    type="button"
                    className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-[#f7c1c1] bg-[#fef0f0] px-3 py-2 text-[11px] font-bold text-[#a32d2d] transition-colors hover:bg-[#fde3e3]"
                  >
                    <Trash2 size={12} aria-hidden="true" />
                    Excluir
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

const EmptyQuestionsState = () => (
  <section className="flex min-h-[338px] w-full items-center justify-center rounded-xl border border-[#e0e5ef] bg-white px-6 py-10 text-center">
    <div className="flex max-w-[300px] flex-col items-center">
      <div className="mb-4 flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-[#fef0f0] to-[#e0e8ff]">
        <Edit2 size={34} className="text-[#0b1840]" aria-hidden="true" />
      </div>
      <h2 className="text-base font-bold text-[#0b1840]">Nenhuma questão cadastrada</h2>
      <p className="mt-3 text-xs leading-5 text-[#8a9ab8]">
        Você ainda não criou nenhuma questão. Comece criando manualmente ou use a IA para gerar questões por tema.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#00e5cc] px-5 py-3 text-xs font-bold text-[#0b1840] transition-colors hover:brightness-95"
        >
          <Plus size={15} aria-hidden="true" />
          Nova questão
        </button>
        <button
          type="button"
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#f2f4f8] px-5 py-3 text-xs font-bold text-[#3c3489] transition-colors hover:bg-[#e0e8ff]"
        >
          <Sparkles size={15} aria-hidden="true" />
          Gerar com IA
        </button>
      </div>
    </div>
  </section>
);

export const QuestionsPage = () => {
  const [searchTerm, setSearchTerm] = useState('coração');

  const filteredQuestions = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase('pt-BR');

    if (!normalizedSearch) return questions;

    return questions.filter((question) =>
      [question.topic, question.statement, question.difficulty, question.source]
        .join(' ')
        .toLocaleLowerCase('pt-BR')
        .includes(normalizedSearch),
    );
  }, [searchTerm]);

  const aiTotal = questions.filter((question) => question.source === 'IA').length;

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#f3f6fb]">
      <PageHeader />
      <main className="flex w-full flex-1 flex-col gap-4 overflow-auto px-5 py-4">
        <QuestionsSummary total={questions.length} aiTotal={aiTotal} />
        {questions.length > 0 ? (
          <>
            <QuestionsFilters
              resultCount={filteredQuestions.length}
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
            />
            {filteredQuestions.length > 0 ? <QuestionsTable items={filteredQuestions} /> : <EmptyQuestionsState />}
          </>
        ) : (
          <EmptyQuestionsState />
        )}
      </main>
    </div>
  );
};

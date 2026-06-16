import {
  Check,
  Edit2,
  GraduationCap,
  Loader2,
  Plus,
  Save,
  Search,
  Trash2,
  X,
  Zap,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';
import {
  createQuestion,
  deleteQuestion,
  listProfessorQuestions,
  updateQuestion,
} from '../../../features/manage-questions/model/questionService';
import type {
  ApiQuestionDifficulty,
  OrigemQuestao,
  ProfessorQuestion,
  QuestionAlternative,
  QuestionDifficulty,
  QuestionFormValues,
  QuestionType,
  TaxonomiaBloom,
} from '../../../features/manage-questions/model/types';

const ORIGENS_QUESTAO: { valor: OrigemQuestao; rotulo: string }[] = [
  { valor: 'ELABORADA_POR_PROFESSOR', rotulo: 'Elaborada por professor' },
  { valor: 'LIVRO', rotulo: 'Livro' },
  { valor: 'PROVA_ANTERIOR', rotulo: 'Prova anterior' },
  { valor: 'GERADA_POR_IA', rotulo: 'Gerada por IA' },
];

const TAXONOMIAS_BLOOM: { valor: TaxonomiaBloom; rotulo: string }[] = [
  { valor: 'LEMBRAR', rotulo: 'Lembrar' },
  { valor: 'COMPREENDER', rotulo: 'Compreender' },
  { valor: 'APLICAR', rotulo: 'Aplicar' },
  { valor: 'ANALISAR', rotulo: 'Analisar' },
  { valor: 'AVALIAR', rotulo: 'Avaliar' },
  { valor: 'CRIAR', rotulo: 'Criar' },
];

const TOPICS =['Tórax', 'Abdome', 'Cabeça e pescoço', 'Membros superiores', 'Membros inferiores', 'Imagem'];
const TYPES: QuestionType[] = ['Múltipla escolha', 'Verdadeiro/Falso'];
const DIFFICULTIES: QuestionDifficulty[] = ['Fácil', 'Médio', 'Difícil'];
const EMPTY_ALTERNATIVES: QuestionAlternative[] = ['A', 'B', 'C', 'D', 'E'].map((label) => ({
  id: label.toLowerCase(),
  label,
  text: '',
  isCorrect: false,
}));
const TRUE_FALSE_ALTERNATIVES: QuestionAlternative[] = [
  { id: 'true', label: 'V', text: 'Verdadeiro', isCorrect: false },
  { id: 'false', label: 'F', text: 'Falso', isCorrect: true },
];

const mapDifficultyToApi = (difficulty: QuestionDifficulty | 'all'): ApiQuestionDifficulty | undefined => {
  if (difficulty === 'Fácil') return 'FACIL';
  if (difficulty === 'Médio') return 'MEDIA';
  if (difficulty === 'Difícil') return 'DIFICIL';
  return undefined;
};

const emptyFormValues: QuestionFormValues = {
  topic: 'Tórax',
  tags: '',
  type: 'Múltipla escolha',
  difficulty: 'Médio',
  origemQuestao: 'ELABORADA_POR_PROFESSOR',
  statement: '',
  explanation: '',
  taxonomiaBloom: '',
  regiaoAnatomica: '',
  alternatives: EMPTY_ALTERNATIVES,
  image: null,
};

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

const questionToFormValues = (question: ProfessorQuestion): QuestionFormValues => ({
  topic: question.topic,
  tags: question.tags.join(', '),
  type: question.type,
  difficulty: question.difficulty,
  origemQuestao: question.origemQuestao,
  statement: question.statement,
  explanation: question.explanation ?? '',
  taxonomiaBloom: question.taxonomiaBloom ?? '',
  regiaoAnatomica: question.regiaoAnatomica ?? '',
  image: question.image || null,
  alternatives: question.type === 'Verdadeiro/Falso'
    ? TRUE_FALSE_ALTERNATIVES.map((alternative) => ({
      ...alternative,
      isCorrect: question.alternatives.some((item) => item.label === alternative.label && item.isCorrect),
    }))
    : question.alternatives,
});

const isStepValid = (values: QuestionFormValues, step: number) => {
  if (step === 1) {
    return Boolean(
      values.topic &&
      values.type &&
      values.difficulty &&
      values.tags.trim() &&
      values.origemQuestao &&
      values.taxonomiaBloom &&
      values.regiaoAnatomica.trim()
    );
  }

  if (step === 2) {
    return values.statement.trim().length > 0 && values.explanation.trim().length > 0;
  }

  const filledAlternatives = values.alternatives.filter((alternative) => alternative.text.trim());
  const requiredAlternatives = values.type === 'Múltipla escolha' ? 5 : 2;

  return filledAlternatives.length === requiredAlternatives && filledAlternatives.some((alternative) => alternative.isCorrect);
};

const isFormValid = (values: QuestionFormValues) => (
  isStepValid(values, 1) && isStepValid(values, 2) && isStepValid(values, 3)
);

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
          {user?.role === 'ADMIN' ? 'Admin' : 'Professor'}
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

const QuestionsSummary = ({
  total,
  onCreate,
}: {
  total: number;
  onCreate: () => void;
}) => (
  <section className="flex w-full flex-col gap-4 rounded-xl border border-[#e0e5ef] bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h2 className="text-base font-bold text-[#0b1840]">Suas questões</h2>
      <p className="text-xs text-[#8a9ab8]">
        {total > 0 ? `${total} questões cadastradas` : 'Nenhuma questão cadastrada ainda'}
      </p>
    </div>

    <button
      type="button"
      onClick={onCreate}
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
  selectedDifficulty,
  selectedTopic,
  selectedBloom,
  topicOptions,
  onDifficultyChange,
  onSearchTermChange,
  onTopicChange,
  onBloomChange,
}: {
  resultCount: number;
  searchTerm: string;
  selectedDifficulty: QuestionDifficulty | 'all';
  selectedTopic: string;
  selectedBloom: TaxonomiaBloom | 'all';
  topicOptions: string[];
  onDifficultyChange: (value: QuestionDifficulty | 'all') => void;
  onSearchTermChange: (value: string) => void;
  onTopicChange: (value: string) => void;
  onBloomChange: (value: TaxonomiaBloom | 'all') => void;
}) => (
  <section className="flex w-full flex-wrap items-center gap-2" aria-label="Filtros de questões">
    <label className="relative min-w-[180px] flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a9ab8]" size={14} aria-hidden="true" />
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
      value={selectedTopic}
      onChange={(event) => onTopicChange(event.target.value)}
    >
      <option value="all">Todos os temas</option>
      {topicOptions.map((topic) => <option key={topic} value={topic}>{topic}</option>)}
    </select>

    <select
      className="rounded-lg border border-[#e0e5ef] bg-white px-4 py-2 text-xs text-[#4a5578] outline-none focus:border-[#00e5cc]"
      aria-label="Filtrar por dificuldade"
      value={selectedDifficulty}
      onChange={(event) => onDifficultyChange(event.target.value as QuestionDifficulty | 'all')}
    >
      <option value="all">Dificuldade</option>
      {DIFFICULTIES.map((difficulty) => <option key={difficulty} value={difficulty}>{difficulty}</option>)}
    </select>

    <select
      className="rounded-lg border border-[#e0e5ef] bg-white px-4 py-2 text-xs text-[#4a5578] outline-none focus:border-[#00e5cc]"
      aria-label="Filtrar por nível cognitivo"
      value={selectedBloom}
      onChange={(event) => onBloomChange(event.target.value as TaxonomiaBloom | 'all')}
    >
      <option value="all">Nível cognitivo</option>
      {TAXONOMIAS_BLOOM.map((bloom) => <option key={bloom.valor} value={bloom.valor}>{bloom.rotulo}</option>)}
    </select>

    <span className="text-[11px] text-[#8a9ab8]">{resultCount} resultado(s)</span>
  </section>
);

const Badge = ({ children, className }: { children: string; className: string }) => (
  <span className={`inline-flex w-fit items-center rounded px-2 py-1 text-[10px] font-bold ${className}`}>
    {children}
  </span>
);

const QuestionsTable = ({
  items,
  onEdit,
  onDelete,
}: {
  items: ProfessorQuestion[];
  onEdit: (question: ProfessorQuestion) => void;
  onDelete: (question: ProfessorQuestion) => void;
}) => (
  <section className="w-full overflow-hidden rounded-xl border border-[#e0e5ef] bg-white">
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse text-left">
        <thead className="bg-[#f8f9fc]">
          <tr className="border-b border-[#e8eaf2]">
            {['Tema', 'Enunciado', 'Tipo', 'Dific.', 'Criada em', 'Ações'].map((heading) => (
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
                <Badge className={topicStyles[question.topic] ?? 'bg-[#eef1f8] text-[#185fa5]'}>
                  {question.topic}
                </Badge>
              </td>
              <td className="max-w-[320px] px-4 py-4 text-xs text-[#4a5578]">{question.statement}</td>
              <td className="whitespace-nowrap px-4 py-4 text-[11px] text-[#4a5578]">{question.type}</td>
              <td className="px-4 py-4 align-top">
                <Badge className={difficultyStyles[question.difficulty]}>{question.difficulty}</Badge>
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-[11px] text-[#8a9ab8]">{question.createdAt}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(question)}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-[#c8d6f8] bg-[#f8f9fc] px-3 py-2 text-[11px] font-bold text-[#185fa5] transition-colors hover:bg-[#e0e8ff]"
                  >
                    <Edit2 size={12} aria-hidden="true" />
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(question)}
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

const EmptyQuestionsState = ({ onCreate }: { onCreate: () => void }) => (
  <section className="flex min-h-[338px] w-full items-center justify-center rounded-xl border border-[#e0e5ef] bg-white px-6 py-10 text-center">
    <div className="flex max-w-[300px] flex-col items-center">
      <div className="mb-4 flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-[#fef0f0] to-[#e0e8ff]">
        <Edit2 size={34} className="text-[#0b1840]" aria-hidden="true" />
      </div>
      <h2 className="text-base font-bold text-[#0b1840]">Nenhuma questão cadastrada</h2>
      <p className="mt-3 text-xs leading-5 text-[#8a9ab8]">
        Você ainda não criou nenhuma questão. Comece criando sua primeira questão para organizar o banco da disciplina.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#00e5cc] px-5 py-3 text-xs font-bold text-[#0b1840] transition-colors hover:brightness-95"
        >
          <Plus size={15} aria-hidden="true" />
          Nova questão
        </button>
      </div>
    </div>
  </section>
);

const FieldLabel = ({ children, required = false }: { children: string; required?: boolean }) => (
  <span className="mb-1 flex text-xs font-bold text-[#334155]">
    {children}
    {required ? <span className="ml-1 text-[#e14b4b]">*</span> : null}
  </span>
);

const RequiredError = ({ children = 'Campo Obrigatório' }: { children?: string }) => (
  <span className="mt-1 block text-[10px] font-bold text-[#e14b4b]">{children}</span>
);

const Stepper = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    ['Identificação', 'Tema e tipo'],
    ['Enunciado', 'Pergunta'],
    ['Alternativas', 'Opções + gabarito'],
  ];

  return (
    <div className="grid grid-cols-[minmax(0,105px)_minmax(34px,122px)_minmax(0,105px)_minmax(34px,122px)_minmax(0,105px)] items-center justify-center border-y border-[#e5e9f0] bg-[#f8f9fc] px-5 py-3">
      {steps.map(([title, subtitle], index) => {
        const step = index + 1;
        const isComplete = currentStep > step;
        const isCurrent = currentStep === step;
        const isInactive = currentStep < step;
        const circleClassName = isComplete
          ? 'bg-[#00e5cc] text-[#0b1840] shadow-[0_0_0_0_rgba(0,229,204,0)]'
          : isCurrent
            ? 'border-2 border-[#00e5cc] bg-[#0b1840] text-white shadow-[0_0_0_4px_rgba(0,229,204,0.12)] scale-110'
            : 'bg-[#e5e9f0] text-[#aaaabb]';
        const textClassName = isInactive ? 'text-[#aaaabb]' : 'text-[#0b1840]';
        const lineIsActive = currentStep > step;
        const lineIsCurrent = currentStep === step;

        return (
          <div key={title} className="contents">
            <div className="flex min-w-0 animate-[question-step-in_180ms_ease-out] items-center gap-[7px]">
              <span
                className={
                  'flex size-[22px] shrink-0 items-center justify-center rounded-full text-[10px] font-bold leading-none transition-all duration-300 ease-out ' +
                  circleClassName
                }
              >
                {isComplete ? <Check size={12} aria-hidden="true" /> : step}
              </span>
              <span className="min-w-0">
                <span className={`block truncate text-[11px] font-bold leading-none transition-colors duration-300 ${textClassName}`}>{title}</span>
                <span className="mt-0.5 hidden truncate text-[9px] leading-none text-[#8a9ab8] sm:block">{subtitle}</span>
              </span>
            </div>
            {step < steps.length ? (
              <span className="mx-2 h-[1.5px] overflow-hidden rounded-full bg-[#e0e5ef]" aria-hidden="true">
                <span
                  className={
                    'block h-full rounded-full bg-[#00e5cc] transition-all duration-500 ease-out ' +
                    (lineIsActive ? 'w-full' : lineIsCurrent ? 'w-1/2' : 'w-0')
                  }
                />
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

const QuestionModal = ({
  values,
  step,
  isSubmitting,
  editingQuestion,
  onChange,
  onClose,
  onNext,
  onBack,
  onSubmit,
}: {
  values: QuestionFormValues;
  step: number;
  isSubmitting: boolean;
  editingQuestion: ProfessorQuestion | null;
  onChange: (values: QuestionFormValues) => void;
  onClose: () => void;
  onNext: () => void;
  onBack: () => void;
  onSubmit: () => void;
}) => {
  const updateValue = <K extends keyof QuestionFormValues>(key: K, value: QuestionFormValues[K]) => {
    onChange({ ...values, [key]: value });
  };
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const markFieldTouched = (field: string) => {
    setTouchedFields((currentFields) => ({ ...currentFields, [field]: true }));
  };
  const showTopicError = touchedFields.topic && !values.topic;
  const showTypeError = touchedFields.type && !values.type;
  const showDifficultyError = touchedFields.difficulty && !values.difficulty;
  const showStatementError = touchedFields.statement && !values.statement.trim();
  const requiredAlternatives = values.type === 'Múltipla escolha' ? 5 : 2;
  const hasEnoughAlternatives = values.alternatives.filter((alternative) => alternative.text.trim()).length === requiredAlternatives;
  const hasCorrectAlternative = values.alternatives.some((alternative) => alternative.isCorrect);
  const showAlternativesError = touchedFields.alternatives && (!hasEnoughAlternatives || !hasCorrectAlternative);

  const updateAlternative = (id: string, text: string) => {
    markFieldTouched('alternatives');
    onChange({
      ...values,
      alternatives: values.alternatives.map((alternative) => (
        alternative.id === id ? { ...alternative, text } : alternative
      )),
    });
  };

  const markCorrect = (id: string) => {
    markFieldTouched('alternatives');
    onChange({
      ...values,
      alternatives: values.alternatives.map((alternative) => ({
        ...alternative,
        isCorrect: alternative.id === id,
      })),
    });
  };

  const removeAlternative = (id: string) => {
    markFieldTouched('alternatives');
    const alternatives = values.alternatives
      .filter((alternative) => alternative.id !== id)
      .map((alternative, index) => ({ ...alternative, label: String.fromCharCode(65 + index) }));
    onChange({ ...values, alternatives });
  };

  const addAlternative = () => {
    markFieldTouched('alternatives');
    const label = String.fromCharCode(65 + values.alternatives.length);
    onChange({
      ...values,
      alternatives: [...values.alternatives, { id: crypto.randomUUID(), label, text: '', isCorrect: false }],
    });
  };

  const handleTypeChange = (type: QuestionType) => {
    updateValue('type', type);
    onChange({
      ...values,
      type,
      alternatives: type === 'Verdadeiro/Falso' ? TRUE_FALSE_ALTERNATIVES : EMPTY_ALTERNATIVES,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1840]/40 px-4 py-6">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="question-modal-title"
        className="flex max-h-[92vh] w-full max-w-[660px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between gap-3 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-lg border border-[#c8d6f8] bg-[#f8f9fc] text-[#185fa5]">
              <Edit2 size={16} aria-hidden="true" />
            </span>
            <div>
              <h2 id="question-modal-title" className="text-base font-bold text-[#0b1840]">
                {editingQuestion ? 'Editar questão' : 'Nova questão'}
              </h2>
              <p className="text-[11px] text-[#8a9ab8]">
                {step === 1 ? 'Banco de questões · Prof. Bezerra' : `${values.topic} · ${values.difficulty} · ${values.type}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-7 cursor-pointer items-center justify-center rounded-lg text-[#64748b] hover:bg-[#f1f5f9]"
            aria-label="Fechar modal"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </header>

        <Stepper currentStep={step} />

        <div className="overflow-y-auto">
          {step === 1 ? (
            <>
              <section className="mx-5 mt-3 flex items-center gap-2.5 rounded-lg border border-[#00c8aa] bg-gradient-to-r from-[#f2f4f8] to-[rgba(0,235,199,0.12)] px-[15px] py-[11px] shadow-[0_8px_20px_rgba(0,200,170,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(0,200,170,0.14)]">
                <span className="flex size-7 shrink-0 animate-[question-ai-pop_260ms_ease-out] items-center justify-center rounded-[7px] bg-white text-[#f97316] shadow-[0_1px_2px_rgba(0,0,0,0.08)]">
                  <Zap size={14} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.5px] text-[#00214d]">Assistente IA</p>
                  <p className="truncate text-[11px] leading-none text-[#4a5578]">
                    Prefere gerar automaticamente? Informe o tema e deixe a IA criar tudo.
                  </p>
                </div>
                <button
                  type="button"
                  className="shrink-0 rounded-md bg-[#00c8aa] px-3 py-1.5 text-[10.8px] font-bold text-[#00214d] transition-all duration-200 hover:brightness-95 active:scale-95"
                >
                  Gerar com IA
                </button>
              </section>
              <div className="grid gap-4 px-5 py-5 sm:grid-cols-2">
                <label>
                  <FieldLabel required>Tema</FieldLabel>
                  <select
                    value={values.topic}
                    onBlur={() => markFieldTouched('topic')}
                    onChange={(event) => updateValue('topic', event.target.value)}
                    className={
                      'h-8 w-full rounded-md border bg-white px-3 text-xs text-[#0b1840] outline-none transition-colors focus:border-[#00e5cc] ' +
                      (showTopicError ? 'border-[#e14b4b]' : 'border-[#d8dee9]')
                    }
                  >
                    <option value="">Selecione um tema</option>
                    {TOPICS.map((topic) => <option key={topic}>{topic}</option>)}
                  </select>
                  {showTopicError ? <RequiredError /> : null}
                </label>
                <label>
                  <FieldLabel required>Tags / palavras-chave</FieldLabel>
                  <input
                    value={values.tags}
                    onChange={(event) => updateValue('tags', event.target.value)}
                    placeholder="ex: aorta, valvas, pericárdio"
                    className="h-8 w-full rounded-md border border-[#d8dee9] px-3 text-xs outline-none placeholder:text-[#94a3b8] focus:border-[#00e5cc]"
                  />
                  <span className="mt-1 block text-[10px] text-[#8a9ab8]">Separe por vírgula. Facilitam a busca no banco.</span>
                </label>
                <label>
                  <FieldLabel required>Tipo</FieldLabel>
                  <select
                    value={values.type}
                    onBlur={() => markFieldTouched('type')}
                    onChange={(event) => handleTypeChange(event.target.value as QuestionType)}
                    className={
                      'h-8 w-full rounded-md border bg-white px-3 text-xs text-[#0b1840] outline-none transition-colors focus:border-[#00e5cc] ' +
                      (showTypeError ? 'border-[#e14b4b]' : 'border-[#d8dee9]')
                    }
                  >
                    <option value="">Selecione o tipo</option>
                    {TYPES.map((type) => <option key={type}>{type}</option>)}
                  </select>
                  {showTypeError ? <RequiredError /> : null}
                </label>
                <label>
                  <FieldLabel required>Dificuldade</FieldLabel>
                  <select
                    value={values.difficulty}
                    onBlur={() => markFieldTouched('difficulty')}
                    onChange={(event) => updateValue('difficulty', event.target.value as QuestionDifficulty)}
                    className={
                      'h-8 w-full rounded-md border bg-white px-3 text-xs text-[#0b1840] outline-none transition-colors focus:border-[#00e5cc] ' +
                      (showDifficultyError ? 'border-[#e14b4b]' : 'border-[#d8dee9]')
                    }
                  >
                    <option value="">Selecione a dificuldade</option>
                    {DIFFICULTIES.map((difficulty) => <option key={difficulty}>{difficulty}</option>)}
                  </select>
                  {showDifficultyError ? <RequiredError /> : null}
                </label>
                <label>
                  <FieldLabel required>Origem</FieldLabel>
                  <select
                    value={values.origemQuestao}
                    onChange={(event) =>
                      updateValue('origemQuestao', event.target.value as OrigemQuestao)
                    }
                    className="h-8 w-full rounded-md border border-[#d8dee9] px-3 text-xs outline-none focus:border-[#00e5cc]"
                  >
                    {ORIGENS_QUESTAO.map((origem) => (
                      <option key={origem.valor} value={origem.valor}>
                        {origem.rotulo}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <FieldLabel required>Nível cognitivo (Bloom)</FieldLabel>
                  <select
                    value={values.taxonomiaBloom ?? ''}
                    onChange={(event) =>
                      updateValue('taxonomiaBloom', event.target.value as TaxonomiaBloom | '')
                    }
                    className="h-8 w-full rounded-md border border-[#d8dee9] px-3 text-xs outline-none focus:border-[#00e5cc]"
                  >
                    <option value="">Não classificado</option>
                    {TAXONOMIAS_BLOOM.map((bloom) => (
                      <option key={bloom.valor} value={bloom.valor}>
                        {bloom.rotulo}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <FieldLabel required>Região anatômica</FieldLabel>
                  <input
                    value={values.regiaoAnatomica ?? ''}
                    onChange={(event) => updateValue('regiaoAnatomica', event.target.value)}
                    placeholder="ex: Tórax"
                    className="h-8 w-full rounded-md border border-[#d8dee9] px-3 text-xs outline-none placeholder:text-[#94a3b8] focus:border-[#00e5cc]"
                  />
                </label>
              </div>
            </>
          ) : null}

          {step === 2 ? (
            <div className="space-y-4 px-5 py-5">
              <label className="block">
                <FieldLabel required>Enunciado da questão</FieldLabel>
                <textarea
                  value={values.statement}
                  onBlur={() => markFieldTouched('statement')}
                  onChange={(event) => updateValue('statement', event.target.value)}
                  rows={4}
                  className={
                    'w-full resize-none rounded-md border px-3 py-3 text-xs leading-5 text-[#0b1840] outline-none transition-colors focus:border-[#00e5cc] ' +
                    (showStatementError ? 'border-[#e14b4b]' : 'border-[#d8dee9]')
                  }
                />
                {showStatementError ? (
                  <RequiredError>Campo Obrigatório</RequiredError>
                ) : (
                  <span className={`mt-1 block text-[10px] ${values.statement.trim() ? 'text-[#0b6b5a]' : 'text-[#8a9ab8]'}`}>
                    {values.statement.trim() ? `✓ Enunciado com ${values.statement.trim().length} caracteres` : 'Informe o enunciado para continuar'}
                  </span>
                )}
              </label>

              <div className="block">
                <FieldLabel>Contexto / imagem (opcional)</FieldLabel>
                <div className="relative">
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/png, image/jpeg, image/svg+xml"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) {
                          alert('A imagem deve ter no máximo 5MB');
                          return;
                        }
                        updateValue('image', file);
                      }
                    }}
                  />
                  {!values.image ? (
                    <label
                      htmlFor="image-upload"
                      className="flex h-[88px] cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-[#cbd5e1] bg-[#f8fafc] text-center transition-colors hover:bg-[#f1f5f9]"
                    >
                      <Plus size={20} className="mb-1 text-[#64748b]" aria-hidden="true" />
                      <span className="text-xs font-bold text-[#64748b]">Clique para adicionar imagem</span>
                      <span className="mt-1 text-[10px] text-[#8a9ab8]">PNG, JPG ou SVG · máx. 5 MB</span>
                    </label>
                  ) : (
                    <div className="relative flex h-[120px] w-full items-center justify-center overflow-hidden rounded-md border border-[#e2e8f0] bg-white p-2">
                      <img
                        src={values.image instanceof File ? URL.createObjectURL(values.image) : values.image}
                        alt="Preview da imagem"
                        className="h-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => onChange({ ...values, image: null })}
                        className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-[#e14b4b] text-white shadow-md hover:bg-[#c03939]"
                        aria-label="Remover imagem"
                      >
                        <X size={14} aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <label className="block">
                <FieldLabel required>Explicação / justificativa</FieldLabel>
                <textarea
                  value={values.explanation}
                  onChange={(event) => updateValue('explanation', event.target.value)}
                  placeholder="Explique a resposta correta para o aluno após a resolução"
                  rows={3}
                  className="w-full resize-none rounded-md border border-[#d8dee9] px-3 py-3 text-xs leading-5 text-[#0b1840] outline-none placeholder:text-[#94a3b8] focus:border-[#00e5cc]"
                />
              </label>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-4 px-5 py-5">
              <div>
                <FieldLabel required>Alternativas</FieldLabel>
                <div className="space-y-2">
                  {values.alternatives.map((alternative) => (
                    <div key={alternative.id} className="grid grid-cols-[18px_26px_1fr_auto] items-center gap-2">
                      <input
                        type="radio"
                        name="correctAlternative"
                        checked={alternative.isCorrect}
                        onChange={() => markCorrect(alternative.id)}
                        aria-label={`Marcar alternativa ${alternative.label} como correta`}
                        className="size-4 accent-[#00e5cc]"
                      />
                      <span className="flex size-7 items-center justify-center rounded-md border border-[#d8dee9] bg-[#f8f9fc] text-[11px] font-bold text-[#0b1840]">
                        {alternative.label}
                      </span>
                      <input
                        value={alternative.text}
                        onChange={(event) => updateAlternative(alternative.id, event.target.value)}
                        onBlur={() => markFieldTouched('alternatives')}
                        readOnly={values.type === 'Verdadeiro/Falso'}
                        aria-label={`Texto da alternativa ${alternative.label}`}
                        className={
                          'h-8 rounded-md border px-3 text-xs text-[#0b1840] outline-none transition-colors focus:border-[#00e5cc] read-only:bg-[#f8fafc] ' +
                          (showAlternativesError && !alternative.text.trim() ? 'border-[#e14b4b]' : 'border-[#d8dee9]')
                        }
                      />
                      {values.type === 'Múltipla escolha' && values.alternatives.length > 5 ? (
                        <button
                          type="button"
                          onClick={() => removeAlternative(alternative.id)}
                          className="flex size-6 cursor-pointer items-center justify-center rounded-md border border-[#f7c1c1] text-[#a32d2d]"
                          aria-label={`Remover alternativa ${alternative.label}`}
                        >
                          <X size={12} aria-hidden="true" />
                        </button>
                      ) : <span className="size-6" />}
                    </div>
                  ))}
                </div>
                {values.type === 'Múltipla escolha' && values.alternatives.length < 5 ? (
                  <button
                    type="button"
                    onClick={addAlternative}
                    className="mt-3 flex h-8 w-full items-center justify-center gap-1 rounded-md border border-dashed border-[#c8d6f8] text-[11px] font-bold text-[#185fa5]"
                  >
                    <Plus size={13} aria-hidden="true" />
                    Adicionar alternativa
                  </button>
                ) : null}
                {showAlternativesError ? (
                  <RequiredError>
                    {!hasEnoughAlternatives ? 'Preencha exatamente cinco alternativas.' : 'Selecione o gabarito correto.'}
                  </RequiredError>
                ) : null}
              </div>
              
              <div className={`flex items-center gap-3 rounded-md border px-4 py-3
                ${values.alternatives.some((alternative) => alternative.isCorrect) && !values.alternatives.find((alternative) => alternative.isCorrect)?.text
                  ? 'border-red-300 bg-red-50' 
                  : values.alternatives.some((alternative) => alternative.isCorrect)
                    ? 'border-[#cdebdc] bg-[#f2fbf7]'
                    : 'border-gray-200 bg-gray-50'
                }
              `}>
                <Check 
                  size={16} 
                  className={`
                    ${values.alternatives.some((alternative) => alternative.isCorrect) && !values.alternatives.find((alternative) => alternative.isCorrect)?.text
                      ? 'text-red-600'
                      : values.alternatives.some((alternative) => alternative.isCorrect)
                        ? 'text-[#0b6b5a]'
                        : 'text-gray-400'
                    }
                  `} 
                  aria-hidden="true" 
                />
                <div>
                  <p className={`
                    text-[11px] font-bold
                    ${values.alternatives.some((alternative) => alternative.isCorrect) && !values.alternatives.find((alternative) => alternative.isCorrect)?.text
                      ? 'text-red-700'
                      : values.alternatives.some((alternative) => alternative.isCorrect)
                        ? 'text-[#0b6b5a]'
                        : 'text-gray-500'
                    }
                  `}>
                    {values.alternatives.some((alternative) => alternative.isCorrect)
                      ? `Gabarito definido: alternativa ${values.alternatives.find((alternative) => alternative.isCorrect)?.label}`
                      : 'Defina o gabarito'}
                  </p>
                  <p className={`
                    text-[10px]
                    ${values.alternatives.some((alternative) => alternative.isCorrect) && !values.alternatives.find((alternative) => alternative.isCorrect)?.text
                      ? 'text-red-600'
                      : 'text-[#64748b]'
                    }
                  `}>
                    {values.alternatives.find((alternative) => alternative.isCorrect)?.text || 'A alternativa selecionada está vazia.'}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <footer className="flex items-center justify-between border-t border-[#e8eaf2] px-5 py-4">
          <span className="text-[11px] font-bold text-[#8a9ab8]">
            {step < 3 ? `Passo ${step} de 3` : 'Passo 3 de 3 — Tudo pronto!'}
          </span>
          <div className="flex items-center gap-2">
            {step === 1 ? (
              <button
                type="button"
                onClick={onClose}
                className="h-8 rounded-md border border-[#d8dee9] px-4 text-xs font-bold text-[#4a5578]"
              >
                Cancelar
              </button>
            ) : (
              <button
                type="button"
                onClick={onBack}
                className="h-8 rounded-md border border-[#d8dee9] px-4 text-xs font-bold text-[#4a5578]"
              >
                Voltar
              </button>
            )}
            {step < 3 ? (
              <button
                type="button"
                disabled={!isStepValid(values, step)}
                onClick={onNext}
                className="h-8 rounded-md bg-[#0b1840] px-5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:bg-[#cbd5e1]"
              >
                Próximo
              </button>
            ) : (
              <button
                type="button"
                disabled={!isFormValid(values) || isSubmitting}
                onClick={onSubmit}
                className="inline-flex h-8 items-center gap-2 rounded-md bg-[#00e5cc] px-5 text-xs font-bold text-[#0b1840] disabled:cursor-not-allowed disabled:bg-[#cbd5e1]"
              >
                {isSubmitting ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : <Save size={14} aria-hidden="true" />}
                Salvar questão
              </button>
            )}
          </div>
        </footer>
      </section>
    </div>
  );
};

const DeleteConfirmationModal = ({
  question,
  isDeleting,
  onCancel,
  onConfirm,
}: {
  question: ProfessorQuestion;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1840]/40 px-4">
    <section role="dialog" aria-modal="true" aria-labelledby="delete-question-title" className="w-full max-w-[420px] rounded-xl bg-white p-5 shadow-2xl">
      <h2 id="delete-question-title" className="text-base font-bold text-[#0b1840]">Excluir questão?</h2>
      <p className="mt-2 text-sm leading-5 text-[#4a5578]">
        Esta ação removerá a questão ativa do seu banco. Confirme para excluir:
      </p>
      <p className="mt-3 rounded-lg bg-[#f8f9fc] p-3 text-xs text-[#4a5578]">{question.statement}</p>
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="h-9 rounded-md border border-[#d8dee9] px-4 text-xs font-bold text-[#4a5578]">
          Cancelar
        </button>
        <button
          type="button"
          disabled={isDeleting}
          onClick={onConfirm}
          className="inline-flex h-9 items-center gap-2 rounded-md bg-[#a32d2d] px-4 text-xs font-bold text-white disabled:cursor-not-allowed disabled:bg-[#e8a5a5]"
        >
          {isDeleting ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : <Trash2 size={14} aria-hidden="true" />}
          Excluir
        </button>
      </div>
    </section>
  </div>
);

export const QuestionsPage = ({ openCreateModal = false }: { openCreateModal?: boolean }) => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<ProfessorQuestion[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuestionDifficulty | 'all'>('all');
  const [selectedBloom, setSelectedBloom] = useState<TaxonomiaBloom | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [modalStep, setModalStep] = useState(1);
  const [formValues, setFormValues] = useState<QuestionFormValues>(emptyFormValues);
  const [editingQuestion, setEditingQuestion] = useState<ProfessorQuestion | null>(null);
  const [questionToDelete, setQuestionToDelete] = useState<ProfessorQuestion | null>(null);
  const isQuestionModalOpen = openCreateModal || editingQuestion !== null;

  const openCreateQuestion = () => {
    setFormValues(emptyFormValues);
    setEditingQuestion(null);
    setModalStep(1);
    navigate('/professor/criar-questao');
  };

  const closeQuestionModal = () => {
    setFormValues(emptyFormValues);
    setEditingQuestion(null);
    setModalStep(1);
    navigate('/professor/questoes');
  };

  const openEditQuestion = (question: ProfessorQuestion) => {
    setEditingQuestion(question);
    setFormValues(questionToFormValues(question));
    setModalStep(1);
  };

  useEffect(() => {
    let isMounted = true;
    const shouldUseSearchEndpoint =
      searchTerm.trim() ||
      selectedTopic !== 'all' ||
      selectedDifficulty !== 'all' ||
      selectedBloom !== 'all';

    const loadQuestions = async () => {
      if (isMounted) {
        setIsLoading(true);
        setError('');
      }

      try {
        const loadedQuestions = await listProfessorQuestions(
          shouldUseSearchEndpoint
            ? {
              tema: selectedTopic !== 'all' ? selectedTopic : searchTerm.trim() || undefined,
              dificuldade: mapDifficultyToApi(selectedDifficulty),
              taxonomiaBloom: selectedBloom !== 'all' ? selectedBloom : undefined,
            }
            : undefined,
        );
        if (isMounted) setQuestions(loadedQuestions);
      } catch (loadError) {
        if (isMounted) setError(loadError instanceof Error ? loadError.message : 'Nao foi possivel carregar as questões.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    const timeoutId = globalThis.setTimeout(() => {
      void loadQuestions();
    }, searchTerm.trim() ? 300 : 0);

    return () => {
      isMounted = false;
      globalThis.clearTimeout(timeoutId);
    };
  }, [searchTerm, selectedDifficulty, selectedTopic, selectedBloom]);

  const topicOptions = useMemo(() => {
    const questionTopics = Array.from(
      new Set(questions.map((question) => question.topic).filter(Boolean)),
    ).sort((firstTopic, secondTopic) => firstTopic.localeCompare(secondTopic, 'pt-BR'));

    return questionTopics.length > 0 ? questionTopics : TOPICS;
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase('pt-BR');

    return questions.filter((question) => {
      const matchesSearch = normalizedSearch
        ? [question.topic, question.statement, question.difficulty, question.type]
          .join(' ')
          .toLocaleLowerCase('pt-BR')
          .includes(normalizedSearch)
        : true;
      const matchesTopic = selectedTopic === 'all' || question.topic === selectedTopic;
      const matchesDifficulty = selectedDifficulty === 'all' || question.difficulty === selectedDifficulty;

      return matchesSearch && matchesTopic && matchesDifficulty;
    });
  }, [questions, searchTerm, selectedDifficulty, selectedTopic]);

  const handleSubmitQuestion = async () => {
    if (!isFormValid(formValues)) return;

    setIsSubmitting(true);
    setError('');

    try {
      const savedQuestion = editingQuestion
        ? await updateQuestion(editingQuestion.id, formValues)
        : await createQuestion(formValues);

      setQuestions((currentQuestions) => {
        if (!editingQuestion) return [savedQuestion, ...currentQuestions];
        return currentQuestions.map((question) => question.id === editingQuestion.id ? savedQuestion : question);
      });
      
      setToastMessage(editingQuestion ? 'Questão atualizada com sucesso!' : 'Questão cadastrada com sucesso!');
      closeQuestionModal();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Não foi possível salvar a questão.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!questionToDelete) return;

    setIsDeleting(true);
    setError('');

    try {
      await deleteQuestion(questionToDelete.id);
      setQuestions((currentQuestions) => (
        currentQuestions.filter((question) => question.id !== questionToDelete.id)
      ));
      setQuestionToDelete(null);
      setToastMessage('Questão excluída com sucesso!');
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Nao foi possivel excluir a questão.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#f3f6fb]">
      <PageHeader />
      <main className="flex w-full flex-1 flex-col gap-4 overflow-auto px-5 py-4">
        {toastMessage ? (
          <div role="status" className="rounded-lg border border-[#b7ead6] bg-[#effaf5] px-4 py-3 text-sm font-bold text-[#0b6b5a]">
            {toastMessage}
          </div>
        ) : null}
        {error ? (
          <div role="alert" className="rounded-lg border border-[#f7c1c1] bg-[#fef0f0] px-4 py-3 text-sm font-bold text-[#a32d2d]">
            {error}
          </div>
        ) : null}
        <QuestionsSummary total={questions.length} onCreate={openCreateQuestion} />
        {isLoading ? (
          <section className="flex min-h-[338px] items-center justify-center rounded-xl border border-[#e0e5ef] bg-white text-sm font-bold text-[#4a5578]">
            Carregando questões...
          </section>
        ) : questions.length > 0 ? (
          <>
            <QuestionsFilters
              resultCount={filteredQuestions.length}
              searchTerm={searchTerm}
              selectedDifficulty={selectedDifficulty}
              selectedTopic={selectedTopic}
              selectedBloom={selectedBloom}
              topicOptions={topicOptions}
              onDifficultyChange={setSelectedDifficulty}
              onSearchTermChange={setSearchTerm}
              onTopicChange={setSelectedTopic}
              onBloomChange={setSelectedBloom}
            />
            {filteredQuestions.length > 0 ? (
              <QuestionsTable items={filteredQuestions} onEdit={openEditQuestion} onDelete={setQuestionToDelete} />
            ) : (
              <EmptyQuestionsState onCreate={openCreateQuestion} />
            )}
          </>
        ) : (
          <EmptyQuestionsState onCreate={openCreateQuestion} />
        )}
      </main>

      {isQuestionModalOpen ? (
        <QuestionModal
          values={formValues}
          step={modalStep}
          isSubmitting={isSubmitting}
          editingQuestion={editingQuestion}
          onChange={setFormValues}
          onClose={closeQuestionModal}
          onNext={() => setModalStep((currentStep) => Math.min(currentStep + 1, 3))}
          onBack={() => setModalStep((currentStep) => Math.max(currentStep - 1, 1))}
          onSubmit={() => void handleSubmitQuestion()}
        />
      ) : null}

      {questionToDelete ? (
        <DeleteConfirmationModal
          question={questionToDelete}
          isDeleting={isDeleting}
          onCancel={() => setQuestionToDelete(null)}
          onConfirm={() => void handleDeleteQuestion()}
        />
      ) : null}
    </div>
  );
};
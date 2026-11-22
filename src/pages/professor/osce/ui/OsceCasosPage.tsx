import { Check, Edit2, Loader2, Plus, Stethoscope, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  atualizarCasoOsce,
  criarCasoOsce,
  excluirCasoOsce,
  listarCasosOsce,
} from '../../../../features/manage-casos-osce/model/casoOsceService';
import type {
  CasoOsce,
  CasoOsceDificuldade,
  CasoOsceFormValues,
  ExameCasoOsce,
} from '../../../../features/manage-casos-osce/model/types';

// Pagina "Casos OSCE" do professor (US26): lista os casos cadastrados e abre um
// editor em 3 passos (padrao do modal "Nova questão") pra criar/continuar um
// rascunho. Cada passo salva automaticamente (autosave) no Quiz-Service.

const DIFICULDADES: { valor: CasoOsceDificuldade; rotulo: string }[] = [
  { valor: 'FACIL', rotulo: 'Fácil' },
  { valor: 'MEDIA', rotulo: 'Médio' },
  { valor: 'DIFICIL', rotulo: 'Difícil' },
];

const emptyFormValues: CasoOsceFormValues = {
  titulo: '',
  especialidade: '',
  dificuldade: '',
  diagnosticoEsperado: '',
  local: '',
  papelEstudante: '',
  idadePaciente: '',
  sexoPaciente: '',
  queixaPaciente: '',
  perfilPaciente: '',
  historiaSintomas: '',
  exameFisico: '',
  exames: [],
};

const dificuldadeStyles: Record<CasoOsceDificuldade, string> = {
  FACIL: 'bg-[#e1f5ee] text-[#0b6b5a]',
  MEDIA: 'bg-[#f7ecd8] text-[#633806]',
  DIFICIL: 'bg-[#fef0f0] text-[#a32d2d]',
};

const dificuldadeRotulo: Record<CasoOsceDificuldade, string> = {
  FACIL: 'Fácil',
  MEDIA: 'Médio',
  DIFICIL: 'Difícil',
};

// Converte o caso (vindo da API, com nulls) nos valores do formulario.
const casoParaFormValues = (caso: CasoOsce): CasoOsceFormValues => ({
  titulo: caso.titulo ?? '',
  especialidade: caso.especialidade ?? '',
  dificuldade: caso.dificuldade ?? '',
  diagnosticoEsperado: caso.diagnosticoEsperado ?? '',
  local: caso.local ?? '',
  papelEstudante: caso.papelEstudante ?? '',
  idadePaciente: caso.idadePaciente != null ? String(caso.idadePaciente) : '',
  sexoPaciente: caso.sexoPaciente ?? '',
  queixaPaciente: caso.queixaPaciente ?? '',
  perfilPaciente: caso.perfilPaciente ?? '',
  historiaSintomas: caso.historiaSintomas ?? '',
  exameFisico: caso.exameFisico ?? '',
  exames: caso.exames,
});

// Payload de cada passo: so os campos daquele passo (autosave parcial).
const payloadDoPasso = (values: CasoOsceFormValues, passo: number) => {
  if (passo === 1) {
    return {
      titulo: values.titulo,
      especialidade: values.especialidade,
      dificuldade: values.dificuldade || undefined,
      diagnosticoEsperado: values.diagnosticoEsperado,
    };
  }

  if (passo === 2) {
    return {
      local: values.local,
      papelEstudante: values.papelEstudante,
      idadePaciente: values.idadePaciente ? Number(values.idadePaciente) : undefined,
      sexoPaciente: values.sexoPaciente,
      queixaPaciente: values.queixaPaciente,
    };
  }

  return {
    perfilPaciente: values.perfilPaciente,
    historiaSintomas: values.historiaSintomas,
    exameFisico: values.exameFisico,
    exames: values.exames,
  };
};

const FieldLabel = ({ children, required = false }: { children: string; required?: boolean }) => (
  <span className="mb-1 flex text-xs font-bold text-[#334155]">
    {children}
    {required ? <span className="ml-1 text-[#e14b4b]">*</span> : null}
  </span>
);

const Hint = ({ children }: { children: string }) => (
  <span className="mt-1 block text-[10px] text-[#8a9ab8]">{children}</span>
);

const inputClassName =
  'h-8 w-full rounded-md border border-[#d8dee9] bg-white px-3 text-xs text-[#0b1840] outline-none transition-colors focus:border-[#00e5cc]';
const textareaClassName =
  'w-full resize-none rounded-md border border-[#d8dee9] px-3 py-3 text-xs leading-5 text-[#0b1840] outline-none transition-colors focus:border-[#00e5cc]';

// Indicador dos 3 passos (mesmo padrao visual do Stepper de questoes).
const Stepper = ({ currentStep }: { currentStep: number }) => {
  const steps = ['Dados gerais', 'Contextualização', 'Roteiro do paciente'];

  return (
    <div className="flex items-center justify-center gap-2 border-y border-[#e5e9f0] bg-[#f8f9fc] px-5 py-3">
      {steps.map((title, index) => {
        const step = index + 1;
        const isComplete = currentStep > step;
        const isCurrent = currentStep === step;

        return (
          <div key={title} className="flex items-center gap-2">
            <div className="flex items-center gap-[7px]">
              <span
                className={
                  'flex size-[22px] shrink-0 items-center justify-center rounded-full text-[10px] font-bold leading-none ' +
                  (isComplete
                    ? 'bg-[#00e5cc] text-[#0b1840]'
                    : isCurrent
                      ? 'border-2 border-[#00e5cc] bg-[#0b1840] text-white'
                      : 'bg-[#e5e9f0] text-[#aaaabb]')
                }
              >
                {isComplete ? <Check size={12} aria-hidden="true" /> : step}
              </span>
              <span
                className={`hidden text-[11px] font-bold sm:inline ${isCurrent || isComplete ? 'text-[#0b1840]' : 'text-[#aaaabb]'}`}
              >
                {title}
              </span>
            </div>
            {step < steps.length ? (
              <span className="h-[1.5px] w-6 rounded-full bg-[#e0e5ef]" aria-hidden="true" />
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

type CasoOsceModalProps = {
  values: CasoOsceFormValues;
  step: number;
  isSaving: boolean;
  onChange: (values: CasoOsceFormValues) => void;
  onClose: () => void;
  onAdvance: () => void;
  onBack: () => void;
  onFinish: () => void;
};

// Editor em 3 passos. Cada mudanca de passo (ou o fechamento) dispara o autosave
// do passo que acabou de ser preenchido.
const CasoOsceModal = ({
  values,
  step,
  isSaving,
  onChange,
  onClose,
  onAdvance,
  onBack,
  onFinish,
}: CasoOsceModalProps) => {
  const updateValue = <K extends keyof CasoOsceFormValues>(key: K, value: CasoOsceFormValues[K]) => {
    onChange({ ...values, [key]: value });
  };

  const atualizarExame = (index: number, campo: keyof ExameCasoOsce, valor: string) => {
    const exames = values.exames.map((exame, i) => (i === index ? { ...exame, [campo]: valor } : exame));
    onChange({ ...values, exames });
  };

  const removerExame = (index: number) => {
    onChange({ ...values, exames: values.exames.filter((_, i) => i !== index) });
  };

  const adicionarExame = () => {
    onChange({ ...values, exames: [...values.exames, { nome: '', resultado: '' }] });
  };

  // Texto exatamente como o aluno vai ler na tela de cenario (US24).
  const previewContextualizacao = [
    values.local && `Local: ${values.local}.`,
    values.papelEstudante && `Seu papel: ${values.papelEstudante}.`,
    (values.idadePaciente || values.sexoPaciente || values.queixaPaciente) &&
      `Paciente: ${values.idadePaciente || '?'} anos, ${values.sexoPaciente || '?'}, com queixa de "${values.queixaPaciente || '?'}".`,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1840]/40 px-4 py-6">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="caso-osce-modal-title"
        className="flex max-h-[92vh] w-full max-w-[660px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between gap-3 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-lg border border-[#c8d6f8] bg-[#f8f9fc] text-[#185fa5]">
              <Stethoscope size={16} aria-hidden="true" />
            </span>
            <h2 id="caso-osce-modal-title" className="text-base font-bold text-[#0b1840]">
              {values.titulo || 'Novo caso OSCE'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-7 cursor-pointer items-center justify-center rounded-lg text-[#64748b] hover:bg-[#f1f5f9]"
            aria-label="Fechar e salvar rascunho"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </header>

        <Stepper currentStep={step} />

        <div className="overflow-y-auto">
          {step === 1 ? (
            <div className="grid gap-4 px-5 py-5 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <FieldLabel required>Título (queixa principal)</FieldLabel>
                <input
                  value={values.titulo}
                  onChange={(event) => updateValue('titulo', event.target.value)}
                  placeholder="ex: Dor torácica no pronto-socorro"
                  className={inputClassName}
                />
                <Hint>Não cite o diagnóstico aqui — o aluno vai ler este título.</Hint>
              </label>
              <label>
                <FieldLabel required>Especialidade</FieldLabel>
                <input
                  value={values.especialidade}
                  onChange={(event) => updateValue('especialidade', event.target.value)}
                  placeholder="ex: Cardiologia"
                  className={inputClassName}
                />
              </label>
              <label>
                <FieldLabel required>Dificuldade</FieldLabel>
                <select
                  value={values.dificuldade}
                  onChange={(event) => updateValue('dificuldade', event.target.value as CasoOsceDificuldade)}
                  className={inputClassName}
                >
                  <option value="">Selecione</option>
                  {DIFICULDADES.map((dificuldade) => (
                    <option key={dificuldade.valor} value={dificuldade.valor}>
                      {dificuldade.rotulo}
                    </option>
                  ))}
                </select>
              </label>
              <label className="sm:col-span-2">
                <FieldLabel required>Diagnóstico esperado</FieldLabel>
                <input
                  value={values.diagnosticoEsperado}
                  onChange={(event) => updateValue('diagnosticoEsperado', event.target.value)}
                  placeholder="ex: Infarto agudo do miocárdio"
                  className={inputClassName}
                />
                <Hint>Fica oculto para o estudante até o fim do atendimento.</Hint>
              </label>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-4 px-5 py-5">
              <label className="block">
                <FieldLabel required>Local</FieldLabel>
                <input
                  value={values.local}
                  onChange={(event) => updateValue('local', event.target.value)}
                  placeholder="ex: Pronto-socorro de um hospital geral"
                  className={inputClassName}
                />
              </label>
              <label className="block">
                <FieldLabel required>Papel do estudante</FieldLabel>
                <input
                  value={values.papelEstudante}
                  onChange={(event) => updateValue('papelEstudante', event.target.value)}
                  placeholder="ex: Médico(a) responsável pelo primeiro atendimento"
                  className={inputClassName}
                />
              </label>
              <div className="grid grid-cols-3 gap-3">
                <label>
                  <FieldLabel required>Idade</FieldLabel>
                  <input
                    type="number"
                    min={0}
                    value={values.idadePaciente}
                    onChange={(event) => updateValue('idadePaciente', event.target.value)}
                    className={inputClassName}
                  />
                </label>
                <label>
                  <FieldLabel required>Sexo</FieldLabel>
                  <input
                    value={values.sexoPaciente}
                    onChange={(event) => updateValue('sexoPaciente', event.target.value)}
                    placeholder="ex: Feminino"
                    className={inputClassName}
                  />
                </label>
                <label>
                  <FieldLabel required>Queixa</FieldLabel>
                  <input
                    value={values.queixaPaciente}
                    onChange={(event) => updateValue('queixaPaciente', event.target.value)}
                    placeholder="ex: Dor no peito"
                    className={inputClassName}
                  />
                </label>
              </div>

              <div>
                <FieldLabel>Pré-visualização (o que o aluno vai ler)</FieldLabel>
                <p className="rounded-lg bg-[#f8f9fc] p-3 text-xs leading-5 text-[#4a5578]">
                  {previewContextualizacao || 'Preencha os campos acima para ver o texto do cenário.'}
                </p>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-4 px-5 py-5">
              <label className="block">
                <FieldLabel required>Perfil do paciente</FieldLabel>
                <textarea
                  value={values.perfilPaciente}
                  onChange={(event) => updateValue('perfilPaciente', event.target.value)}
                  placeholder="Jeito de falar, profissão, contexto..."
                  rows={2}
                  className={textareaClassName}
                />
              </label>
              <label className="block">
                <FieldLabel required>História e sintomas</FieldLabel>
                <textarea
                  value={values.historiaSintomas}
                  onChange={(event) => updateValue('historiaSintomas', event.target.value)}
                  rows={3}
                  className={textareaClassName}
                />
              </label>
              <label className="block">
                <FieldLabel required>Exame físico</FieldLabel>
                <textarea
                  value={values.exameFisico}
                  onChange={(event) => updateValue('exameFisico', event.target.value)}
                  rows={2}
                  className={textareaClassName}
                />
              </label>

              <div>
                <FieldLabel>Exames complementares</FieldLabel>
                <div className="space-y-2">
                  {values.exames.map((exame, index) => (
                    <div key={index} className="grid grid-cols-[1fr_1fr_auto] items-start gap-2">
                      <input
                        value={exame.nome}
                        onChange={(event) => atualizarExame(index, 'nome', event.target.value)}
                        placeholder="Nome do exame"
                        aria-label={`Nome do exame ${index + 1}`}
                        className={inputClassName}
                      />
                      <input
                        value={exame.resultado}
                        onChange={(event) => atualizarExame(index, 'resultado', event.target.value)}
                        placeholder="Resultado"
                        aria-label={`Resultado do exame ${index + 1}`}
                        className={inputClassName}
                      />
                      <button
                        type="button"
                        onClick={() => removerExame(index)}
                        aria-label={`Remover exame ${index + 1}`}
                        className="flex size-8 items-center justify-center rounded-md border border-[#f7c1c1] text-[#a32d2d]"
                      >
                        <X size={13} aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={adicionarExame}
                  className="mt-3 flex h-8 w-full items-center justify-center gap-1 rounded-md border border-dashed border-[#c8d6f8] text-[11px] font-bold text-[#185fa5]"
                >
                  <Plus size={13} aria-hidden="true" />
                  Adicionar exame
                </button>
                <Hint>Exames fora desta lista aparecem pro aluno como "não disponível neste caso".</Hint>
              </div>
            </div>
          ) : null}
        </div>

        <footer className="flex items-center justify-between border-t border-[#e8eaf2] px-5 py-4">
          <span className="text-[11px] font-bold text-[#8a9ab8]">
            {isSaving ? 'Salvando rascunho...' : `Passo ${step} de 3 — salvo automaticamente`}
          </span>
          <div className="flex items-center gap-2">
            {step > 1 ? (
              <button
                type="button"
                onClick={onBack}
                className="h-8 rounded-md border border-[#d8dee9] px-4 text-xs font-bold text-[#4a5578]"
              >
                Voltar
              </button>
            ) : null}
            {step < 3 ? (
              <button
                type="button"
                onClick={onAdvance}
                className="h-8 rounded-md bg-[#0b1840] px-5 text-xs font-bold text-white"
              >
                Próximo
              </button>
            ) : (
              <button
                type="button"
                disabled={isSaving}
                onClick={onFinish}
                className="inline-flex h-8 items-center gap-2 rounded-md bg-[#00e5cc] px-5 text-xs font-bold text-[#0b1840] disabled:cursor-not-allowed disabled:bg-[#cbd5e1]"
              >
                {isSaving ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : <Check size={14} aria-hidden="true" />}
                Concluir rascunho
              </button>
            )}
          </div>
        </footer>
      </section>
    </div>
  );
};

type ModalExcluirCasoOsceProps = {
  caso: CasoOsce;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

// Confirmacao de exclusao: tentativas dos alunos nao sao apagadas (soft delete no Quiz-Service).
const ModalExcluirCasoOsce = ({ caso, isDeleting, onCancel, onConfirm }: ModalExcluirCasoOsceProps) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1840]/40 px-4 py-6">
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby="excluir-caso-osce-title"
      className="w-full max-w-[420px] rounded-xl bg-white p-6 shadow-2xl"
    >
      <h2 id="excluir-caso-osce-title" className="text-base font-bold text-[#0b1840]">
        Excluir o caso &quot;{caso.titulo || 'Sem título'}&quot;?
      </h2>
      <p className="mt-2 text-xs leading-5 text-[#64748b]">
        As tentativas dos alunos são preservadas. Esta ação não pode ser desfeita.
      </p>
      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isDeleting}
          className="h-8 rounded-md border border-[#d8dee9] px-4 text-xs font-bold text-[#4a5578] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isDeleting}
          className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[#a32d2d] px-4 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isDeleting ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : <Trash2 size={13} aria-hidden="true" />}
          {isDeleting ? 'Excluindo...' : 'Excluir'}
        </button>
      </div>
    </section>
  </div>
);

export const OsceCasosPage = () => {
  const [casos, setCasos] = useState<CasoOsce[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [formValues, setFormValues] = useState<CasoOsceFormValues>(emptyFormValues);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [casoParaExcluir, setCasoParaExcluir] = useState<CasoOsce | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const hasLoaded = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const loadCasos = async () => {
      try {
        const loadedCasos = await listarCasosOsce();
        if (isMounted) setCasos(loadedCasos);
      } catch (loadError) {
        if (isMounted) setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar os casos.');
      } finally {
        if (isMounted) {
          hasLoaded.current = true;
          setIsLoading(false);
        }
      }
    };

    void loadCasos();

    return () => {
      isMounted = false;
    };
  }, []);

  const upsertCasoNaLista = (caso: CasoOsce) => {
    setCasos((currentCasos) => {
      const existe = currentCasos.some((item) => item.id === caso.id);
      return existe
        ? currentCasos.map((item) => (item.id === caso.id ? caso : item))
        : [caso, ...currentCasos];
    });
  };

  // Abre o editor em branco e ja cria o rascunho (pra ter um id desde o passo 1).
  const abrirNovoCaso = async () => {
    setFormValues(emptyFormValues);
    setEditingId(null);
    setStep(1);
    setIsModalOpen(true);
    setIsSaving(true);

    try {
      const caso = await criarCasoOsce({});
      setEditingId(caso.id);
      upsertCasoNaLista(caso);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Não foi possível criar o rascunho.');
      setIsModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const abrirCasoExistente = (caso: CasoOsce) => {
    setFormValues(casoParaFormValues(caso));
    setEditingId(caso.id);
    setStep(1);
    setIsModalOpen(true);
  };

  // Autosave do passo atual; devolve o caso atualizado (ou null se falhar).
  const salvarPassoAtual = async (passo: number) => {
    if (!editingId) return;

    setIsSaving(true);
    setError('');

    try {
      const caso = await atualizarCasoOsce(editingId, payloadDoPasso(formValues, passo));
      upsertCasoNaLista(caso);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Não foi possível salvar o rascunho.');
    } finally {
      setIsSaving(false);
    }
  };

  const avancarPasso = () => {
    void salvarPassoAtual(step);
    setStep((currentStep) => Math.min(currentStep + 1, 3));
  };

  const fecharModal = () => {
    void salvarPassoAtual(step);
    setIsModalOpen(false);
  };

  const concluirRascunho = async () => {
    await salvarPassoAtual(3);
    setIsModalOpen(false);
  };

  const confirmarExclusao = async () => {
    if (!casoParaExcluir) return;

    setIsDeleting(true);
    setError('');

    try {
      await excluirCasoOsce(casoParaExcluir.id);
      setCasos((currentCasos) => currentCasos.filter((item) => item.id !== casoParaExcluir.id));
      setCasoParaExcluir(null);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Não foi possível excluir o caso.');
    } finally {
      setIsDeleting(false);
    }
  };

  const publicados = casos.filter((caso) => caso.status === 'PUBLICADO').length;

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#f3f6fb]">
      <header className="flex items-center justify-between gap-4 border-b border-[#e1f5ee] bg-white px-5 py-3">
        <div>
          <h1 className="text-base font-bold text-[#0b1840]">Casos OSCE</h1>
          <p className="text-[11px] text-[#8a9ab8]">Cadastre os casos clínicos da simulação OSCE</p>
        </div>
      </header>

      <main className="flex w-full flex-1 flex-col gap-4 overflow-auto px-5 py-4">
        {error ? (
          <div role="alert" className="rounded-lg border border-[#f7c1c1] bg-[#fef0f0] px-4 py-3 text-sm font-bold text-[#a32d2d]">
            {error}
          </div>
        ) : null}

        <section className="flex w-full flex-col gap-4 rounded-xl border border-[#e0e5ef] bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-[#0b1840]">Seus casos</h2>
            <p className="text-xs text-[#8a9ab8]">
              {casos.length > 0
                ? `${casos.length} caso(s) · ${publicados} publicado(s)`
                : 'Nenhum caso cadastrado ainda'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void abrirNovoCaso()}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#00e5cc] px-5 py-3 text-xs font-bold text-[#0b1840] transition-colors hover:brightness-95"
          >
            <Plus size={15} aria-hidden="true" />
            Novo caso
          </button>
        </section>

        {isLoading ? (
          <section className="flex min-h-[338px] items-center justify-center rounded-xl border border-[#e0e5ef] bg-white text-sm font-bold text-[#4a5578]">
            Carregando casos...
          </section>
        ) : casos.length === 0 ? (
          <section className="flex min-h-[338px] w-full items-center justify-center rounded-xl border border-[#e0e5ef] bg-white px-6 py-10 text-center">
            <div className="flex max-w-[300px] flex-col items-center">
              <Stethoscope size={34} className="mb-4 text-[#0b1840]" aria-hidden="true" />
              <h2 className="text-base font-bold text-[#0b1840]">Nenhum caso cadastrado</h2>
              <p className="mt-3 text-xs leading-5 text-[#8a9ab8]">
                Cadastre o primeiro caso clínico da simulação OSCE.
              </p>
            </div>
          </section>
        ) : (
          <section className="w-full overflow-hidden rounded-xl border border-[#e0e5ef] bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left">
                <thead className="bg-[#f8f9fc]">
                  <tr className="border-b border-[#e8eaf2]">
                    {['Título', 'Especialidade', 'Dificuldade', 'Status', 'Ações'].map((heading) => (
                      <th key={heading} scope="col" className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.06em] text-[#8a9ab8]">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {casos.map((caso) => (
                    <tr key={caso.id} className="border-b border-[#f2f4f8] last:border-b-0">
                      <td className="max-w-[260px] px-4 py-4 text-xs text-[#4a5578]">
                        {caso.titulo || <span className="italic text-[#aaaabb]">Sem título</span>}
                      </td>
                      <td className="px-4 py-4 text-[11px] text-[#4a5578]">{caso.especialidade || '—'}</td>
                      <td className="px-4 py-4 align-top">
                        {caso.dificuldade ? (
                          <span className={`inline-flex w-fit items-center rounded px-2 py-1 text-[10px] font-bold ${dificuldadeStyles[caso.dificuldade]}`}>
                            {dificuldadeRotulo[caso.dificuldade]}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 py-4 text-[11px] text-[#8a9ab8]">
                        {caso.status === 'PUBLICADO' ? 'Publicado' : 'Rascunho'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => abrirCasoExistente(caso)}
                            className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-[#c8d6f8] bg-[#f8f9fc] px-3 py-2 text-[11px] font-bold text-[#185fa5] transition-colors hover:bg-[#e0e8ff]"
                          >
                            <Edit2 size={12} aria-hidden="true" />
                            {caso.status === 'PUBLICADO' ? 'Ver' : 'Continuar'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setCasoParaExcluir(caso)}
                            aria-label={`Excluir caso ${caso.titulo || 'sem título'}`}
                            title="Excluir"
                            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md border border-[#f7c1c1] text-[#a32d2d] transition-colors hover:bg-[#fef0f0]"
                          >
                            <Trash2 size={13} aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      {isModalOpen ? (
        <CasoOsceModal
          values={formValues}
          step={step}
          isSaving={isSaving}
          onChange={setFormValues}
          onClose={fecharModal}
          onAdvance={avancarPasso}
          onBack={() => setStep((currentStep) => Math.max(currentStep - 1, 1))}
          onFinish={() => void concluirRascunho()}
        />
      ) : null}

      {casoParaExcluir ? (
        <ModalExcluirCasoOsce
          caso={casoParaExcluir}
          isDeleting={isDeleting}
          onCancel={() => setCasoParaExcluir(null)}
          onConfirm={() => void confirmarExclusao()}
        />
      ) : null}
    </div>
  );
};

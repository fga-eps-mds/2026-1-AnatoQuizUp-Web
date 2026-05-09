import { useMemo, useState } from 'react';
import { ArrowLeft, LockKeyhole } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  RegisterProfessorError,
  registerProfessor,
} from '../model/registerProfessorService';
import {
  PROFESSOR_INSTITUTION,
  type RegisterProfessorField,
  type RegisterProfessorFieldErrors,
  type RegisterProfessorFormValues,
} from '../model/types';

const INITIAL_VALUES: RegisterProfessorFormValues = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  institution: PROFESSOR_INSTITUTION,
  siape: '',
  department: '',
  course: '',
};

const STEP_FIELDS: Record<number, RegisterProfessorField[]> = {
  1: ['fullName', 'email', 'password', 'confirmPassword'],
  2: ['institution', 'siape', 'department', 'course'],
};

const INPUT_CLASS =
  'h-10 w-full rounded-[7px] border px-3.5 text-sm text-[#0A1128] outline-none transition-colors ' +
  'placeholder:text-[#0A1128]/45 focus:border-[#14D5C2] bg-white';

const EMAIL_UNB_REGEX = /^[^\s@]+@unb\.br$/i;
const SIAPE_REGEX = /^\d{7}$/;

type TextFieldProps = {
  label: string;
  name: RegisterProfessorField;
  value: string;
  type?: 'text' | 'email' | 'password';
  inputMode?: 'numeric';
  error?: string;
  maxLength?: number;
  onBlur: (name: RegisterProfessorField) => void;
  onChange: (name: RegisterProfessorField, value: string) => void;
};

const TextField = ({
  label,
  name,
  value,
  type = 'text',
  inputMode,
  error,
  maxLength,
  onBlur,
  onChange,
}: TextFieldProps) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={name} className="text-xs font-medium text-[#0A1128]">
      {label}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      inputMode={inputMode}
      value={value}
      maxLength={maxLength}
      aria-invalid={!!error}
      className={`${INPUT_CLASS} ${error ? 'border-red-400' : 'border-[#14D5C2]'}`}
      onBlur={() => onBlur(name)}
      onChange={(event) => onChange(name, event.target.value)}
    />
    {error ? <span className="text-xs font-medium text-red-500">{error}</span> : null}
  </div>
);

type LockedInstitutionFieldProps = {
  value: string;
  error?: string;
};

const LockedInstitutionField = ({ value, error }: LockedInstitutionFieldProps) => (
  <div className="flex flex-col gap-1.5">
    <div className="flex items-center gap-1.5">
      <label htmlFor="institution" className="text-xs font-medium text-[#0A1128]">
        Instituição
      </label>
      <span className="inline-flex items-center gap-1 rounded-[4px] border border-[#BBD7D3] bg-[#F3F6FA] px-1.5 py-0.5 text-[10px] font-medium text-[#0A1128]/65">
        <LockKeyhole className="h-2.5 w-2.5" aria-hidden="true" />
        UnB
      </span>
    </div>
    <div
      className={`flex h-10 w-full items-center gap-2 rounded-[7px] border bg-[#F3F6FA] px-3.5 text-sm text-[#0A1128]/65 ${
        error ? 'border-red-400' : 'border-[#BBD7D3]'
      }`}
    >
      <LockKeyhole className="h-3.5 w-3.5 text-[#0A1128]/45" aria-hidden="true" />
      <input
        id="institution"
        name="institution"
        value={value}
        disabled
        readOnly
        className="w-full bg-transparent outline-none disabled:cursor-not-allowed"
      />
    </div>
    {error ? <span className="text-xs font-medium text-red-500">{error}</span> : null}
  </div>
);

const validateField = (
  values: RegisterProfessorFormValues,
  field: RegisterProfessorField,
): string | undefined => {
  const value = values[field];
  const trimmedValue = value.trim();

  switch (field) {
    case 'fullName':
      if (!trimmedValue) return 'Nome completo é obrigatório.';
      return undefined;
    case 'email':
      if (!trimmedValue) return 'Email institucional é obrigatório.';
      if (!EMAIL_UNB_REGEX.test(trimmedValue)) {
        return 'Use um email institucional @unb.br.';
      }
      return undefined;
    case 'password':
      if (!value) return 'Senha é obrigatória.';
      if (value.length < 8) return 'A senha deve ter no mínimo 8 caracteres.';
      return undefined;
    case 'confirmPassword':
      if (!value) return 'Confirmação de senha é obrigatória.';
      if (value !== values.password) return 'As senhas não coincidem.';
      return undefined;
    case 'institution':
      if (value !== PROFESSOR_INSTITUTION) return 'Instituição inválida.';
      return undefined;
    case 'siape':
      if (!trimmedValue) return 'SIAPE é obrigatório.';
      if (!SIAPE_REGEX.test(trimmedValue)) return 'SIAPE deve conter exatamente 7 dígitos.';
      return undefined;
    case 'department':
      if (!trimmedValue) return 'Departamento é obrigatório.';
      return undefined;
    case 'course':
      if (!trimmedValue) return 'Curso é obrigatório.';
      return undefined;
    default:
      return undefined;
  }
};

const validateFields = (
  values: RegisterProfessorFormValues,
  fields: RegisterProfessorField[],
): RegisterProfessorFieldErrors =>
  fields.reduce<RegisterProfessorFieldErrors>((fieldErrors, field) => {
    const error = validateField(values, field);
    if (error) fieldErrors[field] = error;
    return fieldErrors;
  }, {});

const touchedFieldsFrom = (fields: RegisterProfessorField[]) =>
  fields.reduce<Partial<Record<RegisterProfessorField, boolean>>>((touched, field) => {
    touched[field] = true;
    return touched;
  }, {});

const mergeFieldErrors = (
  previous: RegisterProfessorFieldErrors,
  fields: RegisterProfessorField[],
  nextErrors: RegisterProfessorFieldErrors,
) => {
  const updated = { ...previous };

  fields.forEach((field) => {
    if (nextErrors[field]) {
      updated[field] = nextErrors[field];
    } else {
      delete updated[field];
    }
  });

  return updated;
};

const getStepByField = (field: RegisterProfessorField): number => (
  STEP_FIELDS[1].includes(field) ? 1 : 2
);

type StepperProps = {
  step: number;
};

const Stepper = ({ step }: StepperProps) => (
  <div className="mb-6 flex w-full items-center [@media(max-height:760px)]:mb-4">
    {[1, 2, 3].map((marker, index) => (
      <div key={`professor-step-${marker}`} className="flex flex-1 items-center last:flex-none">
        <div
          className={[
            'z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
            marker === step ? 'border-2 border-[#14D5C2] bg-[#0A1128] text-white' : '',
            marker < step ? 'bg-[#14D5C2] text-[#0A1128]' : '',
            marker > step ? 'bg-[#D6EEEA] text-[#73A69F]' : '',
          ].join(' ')}
        >
          {marker}
        </div>
        {index < 2 ? (
          <span
            className={`mx-3 h-px flex-1 ${marker < step ? 'bg-[#14D5C2]' : 'bg-[#D6EEEA]'}`}
          />
        ) : null}
      </div>
    ))}
  </div>
);

export const RegisterProfessorForm = () => {
  const [values, setValues] = useState<RegisterProfessorFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<RegisterProfessorFieldErrors>({});
  const [touchedFields, setTouchedFields] = useState<
    Partial<Record<RegisterProfessorField, boolean>>
  >({});
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  const currentStepErrors = useMemo(
    () => validateFields(values, STEP_FIELDS[step]),
    [step, values],
  );
  const hasVisibleStepError = STEP_FIELDS[step].some((field) => !!errors[field]);
  const isCurrentStepValid =
    Object.keys(currentStepErrors).length === 0 && !hasVisibleStepError && !isLoading;

  const updateFieldError = (
    field: RegisterProfessorField,
    nextValues: RegisterProfessorFormValues,
  ) => {
    const error = validateField(nextValues, field);
    setErrors((previous) => {
      const updated = { ...previous };
      if (error) {
        updated[field] = error;
      } else {
        delete updated[field];
      }
      return updated;
    });
  };

  const markTouchedAndValidate = (field: RegisterProfessorField) => {
    setTouchedFields((previous) => ({ ...previous, [field]: true }));
    updateFieldError(field, values);
  };

  const handleTextChange = (field: RegisterProfessorField, value: string) => {
    const nextValues = { ...values, [field]: value };
    setValues(nextValues);
    if (formError) setFormError('');

    if (touchedFields[field] || errors[field]) updateFieldError(field, nextValues);
    if (field === 'password' && (touchedFields.confirmPassword || errors.confirmPassword)) {
      updateFieldError('confirmPassword', nextValues);
    }
  };

  const goToNextStep = () => {
    const stepFields = STEP_FIELDS[step];
    const stepErrors = validateFields(values, stepFields);

    setTouchedFields((previous) => ({ ...previous, ...touchedFieldsFrom(stepFields) }));
    setErrors((previous) => mergeFieldErrors(previous, stepFields, stepErrors));

    if (Object.keys(stepErrors).length > 0) return;

    setFormError('');
    setStep((current) => Math.min(current + 1, 2));
  };

  const goToPreviousStep = () => {
    setFormError('');
    setStep((current) => Math.max(current - 1, 1));
  };

  const handleSubmit = async () => {
    const allFields = [...STEP_FIELDS[1], ...STEP_FIELDS[2]];
    const validationErrors = validateFields(values, allFields);

    setTouchedFields((previous) => ({ ...previous, ...touchedFieldsFrom(allFields) }));

    if (Object.keys(validationErrors).length > 0) {
      setErrors((previous) => mergeFieldErrors(previous, allFields, validationErrors));
      const firstErrorField = Object.keys(validationErrors)[0] as RegisterProfessorField;
      setStep(getStepByField(firstErrorField));
      return;
    }

    setErrors({});
    setFormError('');
    setIsLoading(true);

    try {
      await registerProfessor(values);
      setIsSuccess(true);
    } catch (error) {
      if (error instanceof RegisterProfessorError) {
        const fieldErrors = error.fieldErrors;

        if (fieldErrors) {
          setErrors((previous) => ({ ...previous, ...fieldErrors }));
          setTouchedFields((previous) => ({
            ...previous,
            ...touchedFieldsFrom(Object.keys(fieldErrors) as RegisterProfessorField[]),
          }));
          const firstField = Object.keys(fieldErrors)[0] as RegisterProfessorField | undefined;
          if (firstField) setStep(getStepByField(firstField));
          setFormError('');
        } else {
          setFormError(error.message);
        }
      } else {
        setFormError('Não foi possível concluir o cadastro. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <section className="w-full max-w-[470px]">
        <Stepper step={3} />
        <div className="rounded-[7px] border border-[#14D5C2] bg-[#EFF3FB] p-4 text-sm text-[#0A1128]">
          <h2 className="text-2xl font-bold text-[#0A1128]">Cadastro completo!</h2>
          <div className="mt-3 flex w-full items-start gap-3 rounded-[7px] border border-[#F5A623] bg-[#E6E4FC] px-3 py-3 text-[#7A4F00]">
          <span className="text-lg" aria-hidden="true">
            ⏳
          </span>
          <p className="text-xs font-semibold leading-5">
            <strong>Cadastro realizado!</strong>
            <br />
            Seu cadastro está em análise pelo administrador. Você poderá acessar a plataforma após
            aprovação.
          </p>
        </div>
          <Link to="/professor/login" className="mt-3 inline-block text-[#00AFA0] underline">
            Voltar para login
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full max-w-[470px]">
      <Stepper step={step} />

      <div className="mb-6 [@media(max-height:760px)]:mb-4">
        <h2 className="text-xl font-bold leading-tight text-[#0A1128]">Complete seu perfil</h2>
        <p className="mt-2 max-w-[440px] text-xs leading-5 text-[#0A1128]/65">
          para continuar preencha o formulário — Acesso para professores
        </p>
      </div>

      <form
        aria-label="register professor form"
        onSubmit={(event) => {
          event.preventDefault();
          if (step < 2) {
            goToNextStep();
            return;
          }
          void handleSubmit();
        }}
        noValidate
        className="flex flex-col gap-4 [@media(max-height:760px)]:gap-3"
      >
        {step === 1 ? (
          <>
            <TextField
              label="Nome Completo"
              name="fullName"
              value={values.fullName}
              onBlur={markTouchedAndValidate}
              onChange={handleTextChange}
              error={errors.fullName}
            />
            <TextField
              label="Email Institucional"
              name="email"
              value={values.email}
              type="email"
              onBlur={markTouchedAndValidate}
              onChange={handleTextChange}
              error={errors.email}
            />
            <TextField
              label="Senha"
              name="password"
              value={values.password}
              type="password"
              onBlur={markTouchedAndValidate}
              onChange={handleTextChange}
              error={errors.password}
            />
            <TextField
              label="Confirmação de senha"
              name="confirmPassword"
              value={values.confirmPassword}
              type="password"
              onBlur={markTouchedAndValidate}
              onChange={handleTextChange}
              error={errors.confirmPassword}
            />
          </>
        ) : null}

        {step === 2 ? (
          <>
            <LockedInstitutionField value={values.institution} error={errors.institution} />
            <TextField
              label="SIAPE"
              name="siape"
              value={values.siape}
              inputMode="numeric"
              maxLength={7}
              onBlur={markTouchedAndValidate}
              onChange={(field, value) => handleTextChange(field, value.replace(/\D/g, ''))}
              error={errors.siape}
            />
            <TextField
              label="Departamento"
              name="department"
              value={values.department}
              onBlur={markTouchedAndValidate}
              onChange={handleTextChange}
              error={errors.department}
            />
            <TextField
              label="Curso"
              name="course"
              value={values.course}
              onBlur={markTouchedAndValidate}
              onChange={handleTextChange}
              error={errors.course}
            />
          </>
        ) : null}

        {formError ? <span className="text-xs font-medium text-red-500">{formError}</span> : null}

        {step > 1 ? (
          <button
            type="button"
            onClick={goToPreviousStep}
            className="h-10 w-full cursor-pointer rounded-[7px] border border-[#14D5C2] bg-white px-4 text-sm font-bold text-[#0A1128] transition-colors hover:bg-[#E8FAF8]"
          >
            Voltar etapa
          </button>
        ) : null}

        <button
          type="submit"
          disabled={!isCurrentStepValid}
          className="mt-1 h-10 w-full cursor-pointer rounded-[7px] bg-[#14D5C2] px-4 text-sm font-bold text-[#0A1128] transition-colors hover:brightness-95 disabled:cursor-not-allowed disabled:bg-[#9FE7DF] disabled:text-[#0A1128]/55"
        >
          {isLoading ? 'Finalizando...' : 'Completar cadastro'}
        </button>

        <Link
          to="/professor/login"
          className="mt-3 inline-flex items-center justify-center gap-1.5 text-sm font-bold text-[#00AFA0] transition-colors hover:text-[#0A1128]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Voltar para o login
        </Link>
      </form>
    </section>
  );
};

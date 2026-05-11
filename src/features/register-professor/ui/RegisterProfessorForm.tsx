import { useMemo, useState } from 'react';
import { ArrowLeft, Clock3, LockKeyhole } from 'lucide-react';
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

const PROFESSOR_LOGIN_ROUTE = '/professor/login';
const SUBMIT_LABEL = 'Completar cadastro';
const GENERIC_REGISTER_ERROR = 'Não foi possível concluir o cadastro. Tente novamente.';
const EMAIL_UNB_REGEX = /^[^\s@]+@(?:[a-z0-9-]+\.)*unb\.br$/i;
const SIAPE_REGEX = /^\d{7}$/;

type FieldValidator = (values: RegisterProfessorFormValues) => string | undefined;

const requiredText = (value: string, message: string) => (value.trim() ? undefined : message);

const FIELD_VALIDATORS: Record<RegisterProfessorField, FieldValidator> = {
  fullName: (values) => requiredText(values.fullName, 'Nome completo é obrigatório.'),
  email: (values) => {
    const email = values.email.trim();
    if (!email) return 'Email institucional é obrigatório.';
    return EMAIL_UNB_REGEX.test(email) ? undefined : 'Use um email institucional UnB.';
  },
  password: (values) => {
    if (!values.password) return 'Senha é obrigatória.';
    return values.password.length >= 8 ? undefined : 'A senha deve ter no mínimo 8 caracteres.';
  },
  confirmPassword: (values) => {
    if (!values.confirmPassword) return 'Confirmação de senha é obrigatória.';
    return values.confirmPassword === values.password ? undefined : 'As senhas não coincidem.';
  },
  institution: (values) =>
    values.institution === PROFESSOR_INSTITUTION ? undefined : 'Instituição inválida.',
  siape: (values) => {
    const siape = values.siape.trim();
    if (!siape) return 'SIAPE é obrigatório.';
    return SIAPE_REGEX.test(siape) ? undefined : 'SIAPE deve conter exatamente 7 dígitos.';
  },
  department: (values) => requiredText(values.department, 'Departamento é obrigatório.'),
  course: (values) => requiredText(values.course, 'Curso é obrigatório.'),
};

const validateField = (
  values: RegisterProfessorFormValues,
  field: RegisterProfessorField,
): string | undefined => FIELD_VALIDATORS[field](values);

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

const getStepByField = (field: RegisterProfessorField): number =>
  STEP_FIELDS[1].includes(field) ? 1 : 2;

type TextFieldConfig = {
  label: string;
  name: RegisterProfessorField;
  type?: 'text' | 'email' | 'password';
  inputMode?: 'numeric';
  maxLength?: number;
  normalize?: (value: string) => string;
};

const STEP_ONE_TEXT_FIELDS: TextFieldConfig[] = [
  { label: 'Nome Completo', name: 'fullName' },
  { label: 'Email Institucional', name: 'email', type: 'email' },
  { label: 'Senha', name: 'password', type: 'password' },
  { label: 'Confirmação de senha', name: 'confirmPassword', type: 'password' },
];

const STEP_TWO_TEXT_FIELDS: TextFieldConfig[] = [
  { label: 'SIAPE', name: 'siape', inputMode: 'numeric', maxLength: 7, normalize: onlyDigits },
  { label: 'Departamento', name: 'department' },
  { label: 'Curso', name: 'course' },
];

function onlyDigits(value: string) {
  return value.replace(/\D/g, '');
}

type ProfessorTextFieldProps = TextFieldConfig & {
  value: string;
  error?: string;
  onBlur: (name: RegisterProfessorField) => void;
  onChange: (name: RegisterProfessorField, value: string) => void;
};

const inputClassName = (hasError: boolean) =>
  [
    'h-10 w-full rounded-[7px] border px-3.5 text-sm text-[#0A1128] outline-none',
    'transition-colors placeholder:text-[#0A1128]/45 focus:border-[#14D5C2] bg-white',
    hasError ? 'border-red-400' : 'border-[#14D5C2]',
  ].join(' ');

const ProfessorTextField = ({
  label,
  name,
  value,
  type = 'text',
  inputMode,
  error,
  maxLength,
  normalize,
  onBlur,
  onChange,
}: ProfessorTextFieldProps) => (
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
      className={inputClassName(!!error)}
      onBlur={() => onBlur(name)}
      onChange={(event) => onChange(name, normalize?.(event.target.value) ?? event.target.value)}
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

type StepperProps = {
  step: number;
};

const ProfessorStepper = ({ step }: StepperProps) => (
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
        setFormError(GENERIC_REGISTER_ERROR);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderTextField = (config: TextFieldConfig) => (
    <ProfessorTextField
      key={config.name}
      {...config}
      value={values[config.name]}
      onBlur={markTouchedAndValidate}
      onChange={handleTextChange}
      error={errors[config.name]}
    />
  );

  if (isSuccess) {
    return (
      <section className="w-full max-w-[470px]">
        <ProfessorStepper step={3} />
        <div className="rounded-[7px] border border-[#14D5C2] bg-[#EFF3FB] p-4 text-sm text-[#0A1128]">
          <h2 className="text-2xl font-bold text-[#0A1128]">Cadastro completo!</h2>
          <div className="mt-3 flex w-full items-start gap-3 rounded-[7px] border border-[#F5A623] bg-[#E6E4FC] px-3 py-3 text-[#7A4F00]">
            <Clock3 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p className="text-xs font-semibold leading-5">
              <strong>Cadastro realizado!</strong>
              <br />
              Seu cadastro está em análise pelo administrador. Você poderá acessar a plataforma
              após aprovação.
            </p>
          </div>
          <Link to={PROFESSOR_LOGIN_ROUTE} className="mt-3 inline-block text-[#00AFA0] underline">
            Voltar para login
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full max-w-[470px]">
      <ProfessorStepper step={step} />

      <div className="mb-6 [@media(max-height:760px)]:mb-4">
        <h2 className="text-xl font-bold leading-tight text-[#0A1128]">Complete seu perfil</h2>
        <p className="mt-2 max-w-[440px] text-xs leading-5 text-[#0A1128]/65">
          Para continuar, preencha o formulário de acesso para professores.
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
        {step === 1 ? <>{STEP_ONE_TEXT_FIELDS.map(renderTextField)}</> : null}

        {step === 2 ? (
          <>
            <LockedInstitutionField value={values.institution} error={errors.institution} />
            {STEP_TWO_TEXT_FIELDS.map(renderTextField)}
          </>
        ) : null}

        {formError ? (
          <span aria-live="polite" className="text-xs font-medium text-red-500">
            {formError}
          </span>
        ) : null}

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
          {isLoading ? 'Finalizando...' : SUBMIT_LABEL}
        </button>

        <Link
          to={PROFESSOR_LOGIN_ROUTE}
          className="mt-3 inline-flex items-center justify-center gap-1.5 text-sm font-bold text-[#00AFA0] transition-colors hover:text-[#0A1128]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Voltar para o login
        </Link>
      </form>
    </section>
  );
};

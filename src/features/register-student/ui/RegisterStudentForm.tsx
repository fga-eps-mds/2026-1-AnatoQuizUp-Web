import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { listarCidadesPorUf, listarEstados } from '../../../shared/api/localidadesService';
import { listarNacionalidades } from '../../../shared/api/nacionalidadesService';
import {
  listarOpcoesAcademicas,
  type OpcoesAcademicas,
} from '../../../shared/api/opcoesAcademicasService';
import type { Cidade } from '../../../shared/constants/cidades';
import type { Estado } from '../../../shared/constants/estados';
import { DatePicker } from '../../../shared/ui/date-picker';
import { Select } from '../../../shared/ui/select';
import {
  RegisterStudentError,
  registerStudent,
  validateRegisterStudentIdentity,
} from '../model/registerStudentService';
import type {
  RegisterStudentField,
  RegisterStudentFieldErrors,
  RegisterStudentFormValues,
} from '../model/types';

const INITIAL_VALUES: RegisterStudentFormValues = {
  fullName: '',
  nickname: '',
  email: '',
  password: '',
  confirmPassword: '',
  birthDate: '',
  nationality: '',
  state: '',
  city: '',
  education: '',
  institution: '',
  course: '',
  period: '',
};

const INPUT_CLASS =
  'h-10 w-full rounded-[7px] border px-3.5 text-sm text-[#0A1128] outline-none transition-colors ' +
  'placeholder:text-[#0A1128]/45 focus:border-[#14D5C2] bg-white';

type TextFieldProps = {
  label: string;
  name: RegisterStudentField;
  value: string;
  type?: 'text' | 'email' | 'password';
  error?: string;
  onBlur: (name: RegisterStudentField) => void;
  onChange: (name: RegisterStudentField, value: string) => void;
};

const TextField = ({
  label,
  name,
  value,
  type = 'text',
  error,
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
      value={value}
      aria-invalid={!!error}
      className={`${INPUT_CLASS} ${error ? 'border-red-400' : 'border-[#14D5C2]'}`}
      onBlur={() => onBlur(name)}
      onChange={(event) => onChange(name, event.target.value)}
    />
    {error ? <span className="text-xs font-medium text-red-500">{error}</span> : null}
  </div>
);

const STEP_FIELDS: Record<number, RegisterStudentField[]> = {
  1: ['fullName', 'nickname', 'email', 'password', 'confirmPassword'],
  2: ['birthDate', 'nationality', 'state', 'city'],
  3: ['education', 'institution', 'course', 'period'],
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NICKNAME_REGEX = /^[a-z][a-z0-9_]*$/;

const EMPTY_ACADEMIC_OPTIONS: OpcoesAcademicas = {
  escolaridades: [],
  instituicoes: [],
  cursos: [],
  periodos: [],
  naoSeAplica: '',
};

type RegisterStudentValidationContext = {
  availableNationalities?: string[];
  availableStates?: string[];
  availableCities?: string[];
  academicOptions?: OpcoesAcademicas;
};

const getStepByField = (field: RegisterStudentField): number => {
  if (STEP_FIELDS[1].includes(field)) return 1;
  if (STEP_FIELDS[2].includes(field)) return 2;
  return 3;
};

const isValidDateValue = (value: string): boolean => {
  if (!value) return false;
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

const isFutureDate = (value: string): boolean => {
  const selected = new Date(`${value}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selected.getTime() > today.getTime();
};

const validateField = (
  values: RegisterStudentFormValues,
  field: RegisterStudentField,
  context: RegisterStudentValidationContext = {},
): string | undefined => {
  const value = values[field];
  const trimmedValue = value.trim();
  const academicOptions = context.academicOptions ?? EMPTY_ACADEMIC_OPTIONS;

  switch (field) {
    case 'fullName':
      if (!trimmedValue) return 'Nome completo é obrigatório.';
      if (trimmedValue.length < 3 || trimmedValue.length > 120) {
        return 'Nome completo deve ter entre 3 e 120 caracteres.';
      }
      return undefined;
    case 'nickname':
      if (!trimmedValue) return 'Nickname é obrigatório.';
      if (trimmedValue.length < 3 || trimmedValue.length > 20) {
        return 'Nickname deve ter entre 3 e 20 caracteres.';
      }
      if (!NICKNAME_REGEX.test(trimmedValue)) {
        return 'Nickname deve começar com letra minúscula e conter apenas letras minúsculas, números ou underscore.';
      }
      return undefined;
    case 'email':
      if (!trimmedValue) return 'Email é obrigatório.';
      if (!EMAIL_REGEX.test(trimmedValue)) return 'Informe um email válido.';
      return undefined;
    case 'password':
      if (!value) return 'Senha é obrigatória.';
      if (value.length < 8 || value.length > 64) {
        return 'A senha deve ter entre 8 e 64 caracteres.';
      }
      return undefined;
    case 'confirmPassword':
      if (!value) return 'Confirmação de senha é obrigatória.';
      if (value !== values.password) return 'As senhas não coincidem';
      return undefined;
    case 'birthDate':
      if (!value) return 'Data de nascimento é obrigatória.';
      if (!isValidDateValue(value)) return 'Data de nascimento inválida.';
      if (isFutureDate(value)) return 'Data de nascimento não pode ser futura.';
      return undefined;
    case 'nationality':
      if (!value) return 'Nacionalidade é obrigatória.';
      if (!context.availableNationalities?.includes(value)) {
        return 'Selecione uma nacionalidade válida.';
      }
      return undefined;
    case 'state':
      if (!value) return 'Estado é obrigatório.';
      if (!context.availableStates?.includes(value)) return 'Selecione um estado válido.';
      return undefined;
    case 'city':
      if (!trimmedValue) return 'Cidade é obrigatória.';
      if (trimmedValue.length < 2 || trimmedValue.length > 100) {
        return 'Cidade deve ter entre 2 e 100 caracteres.';
      }
      if (!context.availableCities?.includes(trimmedValue)) return 'Selecione uma cidade válida.';
      return undefined;
    case 'education':
      if (!value || !academicOptions.escolaridades.includes(value)) {
        return 'Escolaridade é obrigatória.';
      }
      return undefined;
    case 'institution':
      if (!value || !academicOptions.instituicoes.includes(value)) {
        return 'Instituição é obrigatória.';
      }
      return undefined;
    case 'course':
      if (!value || !academicOptions.cursos.includes(value)) return 'Curso é obrigatório.';
      return undefined;
    case 'period':
      if (!value || !academicOptions.periodos.includes(value)) return 'Período é obrigatório.';
      return undefined;
    default:
      return undefined;
  }
};

const validateFields = (
  values: RegisterStudentFormValues,
  targetFields: RegisterStudentField[],
  context: RegisterStudentValidationContext = {},
): RegisterStudentFieldErrors =>
  targetFields.reduce<RegisterStudentFieldErrors>((fieldErrors, field) => {
    const error = validateField(values, field, context);
    if (error) fieldErrors[field] = error;
    return fieldErrors;
  }, {});

const touchedFieldsFrom = (fields: RegisterStudentField[]) =>
  fields.reduce<Partial<Record<RegisterStudentField, boolean>>>((touched, field) => {
    touched[field] = true;
    return touched;
  }, {});

const mergeFieldErrors = (
  previous: RegisterStudentFieldErrors,
  fields: RegisterStudentField[],
  nextErrors: RegisterStudentFieldErrors,
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

export const RegisterStudentForm = () => {
  const navigate = useNavigate();

  const [values, setValues] = useState<RegisterStudentFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<RegisterStudentFieldErrors>({});
  const [touchedFields, setTouchedFields] = useState<Partial<Record<RegisterStudentField, boolean>>>(
    {},
  );
  const [formError, setFormError] = useState('');
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingIdentity, setIsCheckingIdentity] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [availableNationalities, setAvailableNationalities] = useState<string[]>([]);
  const [availableStates, setAvailableStates] = useState<Estado[]>([]);
  const [availableCities, setAvailableCities] = useState<Cidade[]>([]);
  const [isNationalitiesLoading, setIsNationalitiesLoading] = useState(false);
  const [isStatesLoading, setIsStatesLoading] = useState(false);
  const [isCitiesLoading, setIsCitiesLoading] = useState(false);
  const [nationalitiesError, setNationalitiesError] = useState('');
  const [statesError, setStatesError] = useState('');
  const [citiesError, setCitiesError] = useState('');
  const [academicOptions, setAcademicOptions] = useState<OpcoesAcademicas>(EMPTY_ACADEMIC_OPTIONS);
  const [isAcademicOptionsLoading, setIsAcademicOptionsLoading] = useState(false);
  const [academicOptionsError, setAcademicOptionsError] = useState('');

  const nationalityOptions = useMemo(
    () => availableNationalities.map((value) => ({ value, label: value })),
    [availableNationalities],
  );
  const statesOptions = useMemo(
    () => availableStates.map((estado) => ({ value: estado.sigla, label: estado.sigla })),
    [availableStates],
  );
  const cityOptions = useMemo(
    () => availableCities.map((cidade) => ({ value: cidade.nome, label: cidade.nome })),
    [availableCities],
  );
  const educationOptions = useMemo(
    () => academicOptions.escolaridades.map((value) => ({ value, label: value })),
    [academicOptions.escolaridades],
  );
  const institutionOptions = useMemo(
    () => academicOptions.instituicoes.map((value) => ({ value, label: value })),
    [academicOptions.instituicoes],
  );
  const courseOptions = useMemo(
    () => academicOptions.cursos.map((value) => ({ value, label: value })),
    [academicOptions.cursos],
  );
  const periodOptions = useMemo(
    () => academicOptions.periodos.map((value) => ({ value, label: value })),
    [academicOptions.periodos],
  );
  const validationContext = useMemo(
    () => ({
      availableNationalities,
      availableStates: availableStates.map((estado) => estado.sigla),
      availableCities: availableCities.map((cidade) => cidade.nome),
      academicOptions,
    }),
    [academicOptions, availableCities, availableNationalities, availableStates],
  );
  const currentStepErrors = useMemo(
    () => validateFields(values, STEP_FIELDS[step], validationContext),
    [step, validationContext, values],
  );
  const hasVisibleStepError = STEP_FIELDS[step].some((field) => !!errors[field]);
  const isCurrentStepValid =
    Object.keys(currentStepErrors).length === 0 &&
    !hasVisibleStepError &&
    !isCheckingIdentity &&
    !(
      step === 2 &&
      (isNationalitiesLoading ||
        isStatesLoading ||
        isCitiesLoading ||
        !!nationalitiesError ||
        !!statesError ||
        !!citiesError)
    ) &&
    !(step === 3 && (isAcademicOptionsLoading || !!academicOptionsError));
  const isNationalitySelectDisabled = isNationalitiesLoading || !!nationalitiesError;
  const isStateSelectDisabled = isStatesLoading || !!statesError;
  const isCitySelectDisabled = !values.state || isCitiesLoading || !!citiesError;
  const nationalityPlaceholder = isNationalitiesLoading
    ? 'Carregando nacionalidades...'
    : 'Selecione sua nacionalidade...';
  const statePlaceholder = isStatesLoading ? 'Carregando UFs...' : 'UF';
  const cityPlaceholder = !values.state
    ? 'Selecione a UF primeiro'
    : isCitiesLoading
      ? 'Carregando cidades...'
      : 'Selecione sua cidade...';

  useEffect(() => {
    let isMounted = true;

    setIsNationalitiesLoading(true);
    setNationalitiesError('');

    void listarNacionalidades()
      .then((nacionalidades) => {
        if (!isMounted) return;

        setAvailableNationalities(nacionalidades);
        if (nacionalidades.length === 0) {
          setNationalitiesError('Nenhuma nacionalidade encontrada.');
        }
      })
      .catch(() => {
        if (isMounted) {
          setNationalitiesError('Nao foi possivel carregar a lista de nacionalidades.');
        }
      })
      .finally(() => {
        if (isMounted) setIsNationalitiesLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    setIsStatesLoading(true);
    setStatesError('');

    void listarEstados()
      .then((estados) => {
        if (!isMounted) return;

        setAvailableStates(estados);
        if (estados.length === 0) {
          setStatesError('Nenhum estado encontrado.');
        }
      })
      .catch(() => {
        if (isMounted) setStatesError('Nao foi possivel carregar a lista de estados.');
      })
      .finally(() => {
        if (isMounted) setIsStatesLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    setIsAcademicOptionsLoading(true);
    setAcademicOptionsError('');

    void listarOpcoesAcademicas()
      .then((opcoes) => {
        if (isMounted) setAcademicOptions(opcoes);
      })
      .catch(() => {
        if (isMounted) {
          setAcademicOptionsError('Nao foi possivel carregar as opcoes academicas.');
        }
      })
      .finally(() => {
        if (isMounted) setIsAcademicOptionsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    setAvailableCities([]);
    if (!values.state) {
      setCitiesError('');
      return () => {
        isMounted = false;
      };
    }

    setIsCitiesLoading(true);
    setCitiesError('');

    void listarCidadesPorUf(values.state)
      .then((cidades) => {
        if (!isMounted) return;
        setAvailableCities(cidades);
        if (cidades.length === 0) {
          setCitiesError('Nenhuma cidade encontrada para a UF selecionada.');
        }
      })
      .catch(() => {
        if (isMounted) setCitiesError('Nao foi possivel carregar a lista de cidades.');
      })
      .finally(() => {
        if (isMounted) setIsCitiesLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [values.state]);

  useEffect(() => {
    if (!isSuccess) return undefined;

    const timeout = setTimeout(() => {
      navigate('/login', { replace: true });
    }, 1800);

    return () => clearTimeout(timeout);
  }, [isSuccess, navigate]);

  const updateFieldError = (field: RegisterStudentField, nextValues: RegisterStudentFormValues) => {
    const error = validateField(nextValues, field, validationContext);
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

  const markTouchedAndValidate = (field: RegisterStudentField) => {
    setTouchedFields((previous) => ({ ...previous, [field]: true }));
    updateFieldError(field, values);
  };

  const handleTextChange = (field: RegisterStudentField, value: string) => {
    const nextValues = { ...values, [field]: value };
    setValues(nextValues);
    if (formError) setFormError('');

    if (touchedFields[field] || errors[field]) updateFieldError(field, nextValues);
    if (field === 'password' && (touchedFields.confirmPassword || errors.confirmPassword)) {
      updateFieldError('confirmPassword', nextValues);
    }
  };

  const handleStateChange = (value: string) => {
    const nextValues = { ...values, state: value, city: '' };
    setValues(nextValues);
    setAvailableCities([]);
    if (formError) setFormError('');

    if (touchedFields.state || errors.state) updateFieldError('state', nextValues);
    if (touchedFields.city || errors.city) updateFieldError('city', nextValues);
  };

  const setAcademicConsistency = (field: 'institution' | 'course' | 'period', value: string) => {
    const nextValues = { ...values, [field]: value };

    if (value === academicOptions.naoSeAplica) {
      nextValues.institution = academicOptions.naoSeAplica;
      nextValues.course = academicOptions.naoSeAplica;
      nextValues.period = academicOptions.naoSeAplica;
    }

    setValues(nextValues);
    if (formError) setFormError('');

    (['institution', 'course', 'period'] as RegisterStudentField[]).forEach((fieldName) => {
      if (touchedFields[fieldName] || errors[fieldName] || value === academicOptions.naoSeAplica) {
        updateFieldError(fieldName, nextValues);
      }
    });
  };

  const goToNextStep = async () => {
    const stepFields = STEP_FIELDS[step];
    const stepErrors = validateFields(values, stepFields, validationContext);

    setTouchedFields((previous) => ({ ...previous, ...touchedFieldsFrom(stepFields) }));
    setErrors((previous) => mergeFieldErrors(previous, stepFields, stepErrors));

    if (Object.keys(stepErrors).length > 0) return;

    if (step === 1) {
      setFormError('');
      setIsCheckingIdentity(true);

      try {
        await validateRegisterStudentIdentity(values);
      } catch (error) {
        if (error instanceof RegisterStudentError) {
          if (error.fieldErrors) {
            const fieldErrorKeys = Object.keys(error.fieldErrors) as RegisterStudentField[];
            setErrors((previous) => ({ ...previous, ...error.fieldErrors }));
            setTouchedFields((previous) => ({
              ...previous,
              ...touchedFieldsFrom(fieldErrorKeys),
            }));
          } else {
            setFormError(error.message);
          }
        } else {
          setFormError('Nao foi possivel validar email e nickname. Tente novamente.');
        }

        setIsCheckingIdentity(false);
        return;
      }

      setIsCheckingIdentity(false);
    }

    setStep((current) => Math.min(current + 1, 3));
  };

  const goToPreviousStep = () => {
    setFormError('');
    setStep((current) => Math.max(current - 1, 1));
  };

  const handleSubmit = async () => {
    const allFields: RegisterStudentField[] = [
      ...STEP_FIELDS[1],
      ...STEP_FIELDS[2],
      ...STEP_FIELDS[3],
    ];
    const validationErrors = validateFields(values, allFields, validationContext);

    setTouchedFields((previous) => ({ ...previous, ...touchedFieldsFrom(allFields) }));

    if (Object.keys(validationErrors).length > 0) {
      setErrors((previous) => mergeFieldErrors(previous, allFields, validationErrors));
      const firstErrorField = Object.keys(validationErrors)[0] as RegisterStudentField;
      setStep(getStepByField(firstErrorField));
      return;
    }

    setErrors({});
    setFormError('');
    setIsLoading(true);

    try {
      await registerStudent(values);
      setIsSuccess(true);
    } catch (error) {
      if (error instanceof RegisterStudentError) {
        if (error.fieldErrors) {
          setErrors((previous) => ({ ...previous, ...error.fieldErrors }));
          setTouchedFields((previous) => ({
            ...previous,
            ...touchedFieldsFrom(Object.keys(error.fieldErrors ?? {}) as RegisterStudentField[]),
          }));
          const firstField = Object.keys(error.fieldErrors)[0] as RegisterStudentField | undefined;
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

  const renderStepper = () => (
    <div className="mb-6 flex w-full items-center [@media(max-height:760px)]:mb-4">
      {[1, 2, 3].map((marker, index) => (
        <div key={`step-${marker}`} className="flex flex-1 items-center last:flex-none">
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

  if (isSuccess) {
    return (
      <section className="w-full max-w-[470px]">
        {renderStepper()}
        <div className="rounded-[7px] border border-[#14D5C2] bg-[#EFF3FB] p-4 text-sm text-[#0A1128]">
          <h2 className="text-2xl font-bold text-[#0A1128]">Cadastro completo!</h2>
          <p className="mt-2">Perfil configurado com sucesso. Redirecionando para o login...</p>
          <p className="mt-2 font-semibold">Usuário {values.nickname.trim()} criado.</p>
          <Link to="/login" className="mt-3 inline-block text-[#00AFA0] underline">
            Ir para o login
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full max-w-[470px]">
      {renderStepper()}

      <div className="mb-6 [@media(max-height:760px)]:mb-4">
        <h2 className="text-xl font-bold leading-tight text-[#0A1128]">Complete seu perfil</h2>
        <p className="mt-2 max-w-[440px] text-xs leading-5 text-[#0A1128]/65">
          para continuar preencha o formulário — estas informações ajudam a personalizar sua
          experiência
        </p>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (step < 3) {
            void goToNextStep();
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
              label="Nickname"
              name="nickname"
              value={values.nickname}
              onBlur={markTouchedAndValidate}
              onChange={handleTextChange}
              error={errors.nickname}
            />
            <TextField
              label="Email"
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
            <DatePicker
              label="Data de nascimento"
              name="birthDate"
              value={values.birthDate}
              onBlur={() => markTouchedAndValidate('birthDate')}
              onChange={(event) => handleTextChange('birthDate', event.target.value)}
              error={errors.birthDate}
            />
            <Select
              label="Nacionalidade"
              name="nationality"
              value={values.nationality}
              placeholder={nationalityPlaceholder}
              options={nationalityOptions}
              disabled={isNationalitySelectDisabled}
              onBlur={() => markTouchedAndValidate('nationality')}
              onChange={(event) => handleTextChange('nationality', event.target.value)}
              error={errors.nationality}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_2fr]">
              <Select
                label="Estado"
                name="state"
                value={values.state}
                placeholder={statePlaceholder}
                options={statesOptions}
                disabled={isStateSelectDisabled}
                onBlur={() => markTouchedAndValidate('state')}
                onChange={(event) => handleStateChange(event.target.value)}
                error={errors.state}
              />
              <Select
                label="Cidade"
                name="city"
                value={values.city}
                placeholder={cityPlaceholder}
                options={cityOptions}
                disabled={isCitySelectDisabled}
                onBlur={() => markTouchedAndValidate('city')}
                onChange={(event) => handleTextChange('city', event.target.value)}
                error={errors.city}
              />
            </div>
            {nationalitiesError || statesError || citiesError ? (
              <span className="text-xs font-medium text-red-500">
                {nationalitiesError || statesError || citiesError}
              </span>
            ) : null}
          </>
        ) : null}

        {step === 3 ? (
          <>
            <Select
              label="Escolaridade"
              name="education"
              value={values.education}
              placeholder="Selecione sua escolaridade..."
              options={educationOptions}
              onBlur={() => markTouchedAndValidate('education')}
              onChange={(event) => handleTextChange('education', event.target.value)}
              error={errors.education}
            />
            <Select
              label="Instituição"
              name="institution"
              value={values.institution}
              placeholder="Selecione sua instituição..."
              options={institutionOptions}
              onBlur={() => markTouchedAndValidate('institution')}
              onChange={(event) => setAcademicConsistency('institution', event.target.value)}
              error={errors.institution}
            />
            <Select
              label="Curso"
              name="course"
              value={values.course}
              placeholder="Selecione seu curso..."
              options={courseOptions}
              onBlur={() => markTouchedAndValidate('course')}
              onChange={(event) => setAcademicConsistency('course', event.target.value)}
              error={errors.course}
            />
            <Select
              label="Período"
              name="period"
              value={values.period}
              placeholder="Selecione seu período..."
              options={periodOptions}
              onBlur={() => markTouchedAndValidate('period')}
              onChange={(event) => setAcademicConsistency('period', event.target.value)}
              error={errors.period}
            />
            {isAcademicOptionsLoading ? (
              <span className="text-xs font-medium text-[#0A1128]/65">
                Carregando opcoes academicas...
              </span>
            ) : null}
            {academicOptionsError ? (
              <span className="text-xs font-medium text-red-500">{academicOptionsError}</span>
            ) : null}
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
          disabled={isLoading || isCheckingIdentity || !isCurrentStepValid}
          className="mt-1 h-10 w-full cursor-pointer rounded-[7px] bg-[#14D5C2] px-4 text-sm font-bold text-[#0A1128] transition-colors hover:brightness-95 disabled:cursor-not-allowed disabled:bg-[#9FE7DF] disabled:text-[#0A1128]/55"
        >
          {isCheckingIdentity ? 'Validando...' : isLoading ? 'Finalizando...' : 'Completar cadastro'}
        </button>

        <Link
          to="/login"
          className="mt-3 inline-flex items-center justify-center gap-1.5 text-sm font-bold text-[#00AFA0] transition-colors hover:text-[#0A1128]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Já tem conta? Faça login
        </Link>
      </form>
    </section>
  );
};

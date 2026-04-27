const DEFAULT_API_BASE_URL = 'http://localhost:3333/api/v1';

const parseBooleanEnv = (value: string | undefined, defaultValue: boolean) => {
  if (value === undefined || value === '') return defaultValue;

  return ['true', '1', 'yes', 'on'].includes(value.trim().toLowerCase());
};

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const apiBaseUrlFromEnv = import.meta.env?.VITE_API_URL as string | undefined;

export const API_BASE_URL: string = trimTrailingSlash(
  apiBaseUrlFromEnv && apiBaseUrlFromEnv.trim() !== ''
    ? apiBaseUrlFromEnv
    : DEFAULT_API_BASE_URL,
);

export const USE_MOCKS: boolean = parseBooleanEnv(
  import.meta.env?.VITE_USE_MOCKS as string | undefined,
  false,
);
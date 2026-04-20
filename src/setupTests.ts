import '@testing-library/jest-dom';
// @ts-expect-error: O util e nativo do Node e e necessario para o ambiente do Jest
import { TextEncoder, TextDecoder } from 'util';

Object.assign(globalThis, { TextEncoder, TextDecoder });
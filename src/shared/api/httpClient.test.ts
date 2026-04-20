jest.mock('./config', () => ({
  API_CONFIG: {
    baseURL: 'http://localhost:3000',
  },
}));

import { httpClient } from './httpClient';

describe('Shared/API/httpClient', () => {
  const originalAdapter = httpClient.defaults.adapter;

  beforeEach(() => {
    window.localStorage.clear();
    // Falsificamos a resposta do Axios para ele não tentar acessar a internet
    httpClient.defaults.adapter = jest.fn().mockResolvedValue({
      data: 'ok',
      status: 200,
    });
  });

  afterAll(() => {
    httpClient.defaults.adapter = originalAdapter;
  });

  it('deve ter a baseURL correta e o header de Content-Type padrão', () => {
    expect(httpClient.defaults.baseURL).toBe('http://localhost:3000');
    expect(httpClient.defaults.headers['Content-Type']).toBe('application/json');
  });

  it('deve adicionar o header de Authorization se o token existir no localStorage', async () => {
    window.localStorage.setItem('access_token', 'meu-token-secreto');
    await httpClient.get('/teste-de-rota');

    const mockAdapter = httpClient.defaults.adapter as jest.Mock;
    const requestConfig = mockAdapter.mock.calls[0][0];

    expect(requestConfig.headers?.Authorization).toBe('Bearer meu-token-secreto');
  });

  it('NÃO deve adicionar o header de Authorization se não houver token', async () => {
    await httpClient.get('/teste-de-rota');

    const mockAdapter = httpClient.defaults.adapter as jest.Mock;
    const requestConfig = mockAdapter.mock.calls[0][0];

    expect(requestConfig.headers?.Authorization).toBeUndefined();
  });
});
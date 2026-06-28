import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './test/tests-e2e',
  fullyParallel: false, // Em ambientes com microsserviços e banco compartilhado, rodar em série evita que um teste limpe o banco do outro
  retries: 0,
  workers: 1, // Mantido em 1 para garantir estabilidade nos estados do banco/seed locais
  reporter: 'html',
  
  use: {
    // URL base que o Playwright usará para resolver caminhos relativos (ex: page.goto('/'))
    baseURL: 'http://localhost:15173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  /* Configura os navegadores para testes */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
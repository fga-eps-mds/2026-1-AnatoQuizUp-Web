import { test, expect } from '@playwright/test';

test.describe('Fluxo de Autenticação', () => {
  
  test('Deve realizar login com sucesso e redirecionar para a Dashboard', async ({ page }) => {

    await page.goto('/login');

    await page.locator('input[type="email"]').fill('clara@seed.com');
    await page.getByPlaceholder('••••••••••••').fill('123456');

    await page.getByRole('button', { name: 'Continuar' }).click();

    const errorMessage = page.getByText('Erro ao entrar. Tente novamente.');
    await expect(errorMessage).not.toBeVisible({ timeout: 3000 });

    await expect(page).toHaveURL(/\/aluno/);
    

    const welcomeMessage = page.getByText(/Universidade de Brasília/i);
    await expect(welcomeMessage).toBeVisible();
  });

  test('Deve exibir mensagem de erro com credenciais inválidas', async ({ page }) => {
    await page.goto('/login');

    await page.getByPlaceholder('Email').fill('errado@anatoquizup.local');
    await page.getByPlaceholder('••••••••••••').fill('SenhaIncorreta');
    await page.getByRole('button', { name: 'Continuar' }).click();

    const errorMessage = page.getByText(/Email ou senha invalidos./i);
    await expect(errorMessage).toBeVisible();
  });
});
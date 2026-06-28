import { test, expect } from '@playwright/test';

test.describe('Fluxo de Cadastro de Aluno', () => {

  test('Deve cadastrar um novo aluno com sucesso e conseguir fazer login', async ({ page }) => {
    // 1. Entra na tela de login e vai para a página de cadastro
    await page.goto('/login');
    await page.getByRole('link', { name: 'Cadastrar-se como aluno' }).click();
    await expect(page).toHaveURL(/\/cadastro/);

    // --- ETAPA 1: Dados Pessoais (Exemplo genérico - ajuste conforme seus inputs reais) ---
    await page.locator('input[name="fullName"]').fill('Test Student');
    await page.locator('input[name="nickname"]').fill('test_student');
    await page.locator('input[name="email"]').fill('test.student@email.com');
    await page.locator('input[name="password"]').fill('password123');
    await page.locator('input[name="confirmPassword"]').fill('password123');
    
    await page.getByRole('button', { name: 'Completar cadastro' }).click();

    await page.locator('input[name="birthDate"]').fill('2001-01-01');
    await page.locator('select[name="nationality"]').selectOption('Brasileiro(a)');
    await page.locator('select[name="state"]').selectOption('AC');
    await page.locator('select[name="city"]').selectOption('Rio Branco');

    await page.getByRole('button', { name: 'Completar cadastro' }).click();

    await page.locator('select[name="education"]').selectOption('Graduação');
    await page.locator('select[name="institution"]').selectOption('Universidade de Brasilia');
    await page.locator('select[name="course"]').selectOption('Medicina');
    await page.locator('select[name="period"]').selectOption('3o Periodo');

    await page.getByRole('button', { name: 'Completar cadastro' }).click();
    await expect(page).toHaveURL(/\/login/);

    await page.getByPlaceholder('Email').fill('test.student@email.com');
    await page.getByPlaceholder('••••••••••••').fill('password123');

    await page.getByRole('button', { name: 'Continuar' }).click();

    await expect(page).toHaveURL(/\/aluno|\/home/);

    const welcomeMessage = page.getByText(/Universidade de Brasília/i);
    await expect(welcomeMessage).toBeVisible();
  });

    test('Deve cadastrar um novo professor com sucesso e conseguir fazer login', async ({ page }) => {
    // 1. Entra na tela de login e vai para a página de cadastro
    await page.goto('/login');
    await page.getByRole('link', { name: 'Cadastrar-se como professor' }).click();
    await expect(page).toHaveURL(/\/professor\/cadastro/);

    // --- ETAPA 1: Dados Pessoais (Exemplo genérico - ajuste conforme seus inputs reais) ---
    await page.locator('input[name="fullName"]').fill('Test Professor');
    await page.locator('input[name="email"]').fill('test.professor@unb.br');
    await page.locator('input[name="password"]').fill('password123');
    await page.locator('input[name="confirmPassword"]').fill('password123');
    
    await page.getByRole('button', { name: 'Completar cadastro' }).click();

    await page.locator('input[name="siape"]').fill('1234567');
    await page.locator('input[name="department"]').fill('Saúde');
    await page.locator('input[name="course"]').fill('Medicina');

    await page.getByRole('button', { name: 'Completar cadastro' }).click();
    
    await expect(page).toHaveURL(/\/professor|\/cadastro/);
    const cadastroRealizado = page.getByText(/Cadastro realizado!/i);
    await expect(cadastroRealizado).toBeVisible();
  });
});
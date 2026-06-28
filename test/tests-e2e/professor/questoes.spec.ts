import { testProfessor as test, expect } from '../../../playwright/login.fixtures';

test.describe('Fluxos de Questão do Professor', () => {
  
  test('Deve realizar login com sucesso e criar questão', async ({ page }) => {
    await page.goto('/professor/home');
    await expect(page.getByRole('button', { name: 'Questões' })).toBeVisible();
    const enunciado = `Enunciado questão ${Date.now()}`;
    await page.getByRole('button', { name: 'Questões' }).click();
    await page.getByRole('button', { name: 'Nova Questão' }).click();
    await page.getByLabel('Tipo*Selecione o tipoMúltipla').selectOption('Verdadeiro/Falso');
    await page.getByLabel('Origem*Elaborada por').selectOption('LIVRO');
    await page.getByRole('textbox', { name: 'Região anatômica *' }).click();
    await page.getByRole('textbox', { name: 'Região anatômica *' }).fill('Tórax');
    await page.getByRole('textbox', { name: 'Tags / palavras-chave *' }).click();
    await page.getByRole('textbox', { name: 'Tags / palavras-chave *' }).fill('tag-tórax');
    await page.getByLabel('Dificuldade*Selecione a').selectOption('Difícil');
    await page.getByLabel('Nível cognitivo (Bloom)*Não').selectOption('LEMBRAR');
    await page.getByRole('button', { name: 'Próximo' }).click();
    await page.getByRole('textbox', { name: 'Enunciado da questão *' }).click();
    await page.getByRole('textbox', { name: 'Enunciado da questão *' }).fill(enunciado);
    await page.getByRole('textbox', { name: 'Enunciado da questão *' }).press('Tab');
    await page.getByRole('textbox', { name: 'Explicação / justificativa *' }).fill('Explicação questão');
    await page.getByRole('button', { name: 'Próximo' }).click();
    await page.getByRole('button', { name: 'Salvar questão' }).click();
    const mensagemSucesso = page.getByText(/Questão cadastrada com sucesso!/i);
    await expect(mensagemSucesso).toBeVisible();
  });

  test('Deve realizar login com sucesso e excluir questão', async ({ page }) => {
    await page.goto('/professor/home');
    await expect(page.getByRole('button', { name: 'Questões' })).toBeVisible();

    await page.getByRole('button', { name: 'Questões' }).click();

    const linha = page.getByRole("row").filter({
      hasText: "Em uma fratura do colo cirúrgico do úmero, qual nervo corre maior risco de lesão?"
    });
    await linha.getByRole('button', {name: "Excluir"}).click();
    await page.locator('.inline-flex.h-9').click();
    const mensagemSucesso = page.getByText(/Questão excluída com sucesso!/i);
    await expect(mensagemSucesso).toBeVisible();
  });

  test('Deve realizar login com sucesso e atualizar questão', async ({ page }) => {
    await page.goto('/professor/home');
    await expect(page.getByRole('button', { name: 'Questões' })).toBeVisible();
    await page.getByRole('button', { name: 'Questões' }).click();

    const linha = page.getByRole("row").filter({
      hasText: "Qual célula óssea é primariamente responsável pela reabsorção da matriz óssea?"
    });
    await linha.getByRole('button', {name: "Editar"}).click();
    await page.getByRole('textbox', { name: 'Região anatômica *' }).click();
    await page.getByRole('textbox', { name: 'Região anatômica *' }).fill('Tórax');
    await page.getByLabel('Nível cognitivo (Bloom)*Não').selectOption('APLICAR');
    await page.getByRole('textbox', { name: 'Tags / palavras-chave *' }).click();
    await page.getByRole('textbox', { name: 'Tags / palavras-chave *' }).fill('caixa-toracica');
    await page.getByLabel('Tema*Selecione um temaTó').selectOption('Tórax');
    await page.getByLabel('Tipo*Selecione o tipoMúltipla').selectOption('Verdadeiro/Falso');
    await page.getByRole('button', { name: 'Próximo' }).click();
    await page.getByRole('button', { name: 'Próximo' }).click();
    await page.getByRole('button', { name: 'Salvar questão' }).click();
    const mensagemSucesso = page.getByText(/Questão atualizada com sucesso!/i);
    await expect(mensagemSucesso).toBeVisible();
  });

  test('Deve realizar login com sucesso e buscar questão', async ({ page }) => {
    await page.goto('/professor/home');
    await expect(page.getByRole('button', { name: 'Questões' })).toBeVisible();
    await page.getByRole('button', { name: 'Questões' }).click();

    await page.getByRole('textbox', { name: 'Buscar questão' }).click();
    await page.getByRole('textbox', { name: 'Buscar questão' }).fill('prim');

    expect(page.getByRole('cell').filter({
       hasText: 'Qual célula óssea é primariamente responsável pela reabsorção da matriz óssea?'
    })).toBeVisible();
  });
});
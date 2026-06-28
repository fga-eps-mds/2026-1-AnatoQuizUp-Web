import { testProfessor as test, expect } from '../../../playwright/login.fixtures';

test.describe('Fluxos de Listas do Professor', () => {

  test('Deve realizar login com sucesso e excluir lista', async ({ page }) => {
    const nome = "A ser excluída";
    await page.goto('/professor/home');
    await expect(page.getByRole('button', { name: 'Listas' })).toBeVisible();
    await page.getByRole('button', { name: 'Listas' }).click();
    const linha = page.getByRole("row").filter({
      hasText: nome
    });
    
    await linha.getByRole('button', { name: 'Excluir' }).click();
    
    const modal = page.getByText('Excluir lista?').locator('..');
    await modal.getByRole('button', { name: 'Excluir' }).click();
    await expect(page.getByRole('status')).toContainText('Lista excluída com sucesso.');
  });

  test('Deve realizar login com sucesso e criar lista', async ({ page }) => {
    await page.goto('/professor/home');
    await expect(page.getByRole('button', { name: 'Listas' })).toBeVisible();
    await page.getByRole('button', { name: 'Listas' }).click();
    await page.getByRole('button', { name: 'Nova lista' }).click();
    await page.getByRole('textbox', { name: 'Nome da lista' }).click();
    await page.getByRole('textbox', { name: 'Nome da lista' }).fill('Lista Teste 2');
    await page.getByRole('button', { name: 'Criar lista' }).click();
    await page.getByRole('button', { name: 'questões' }).nth(1).click();
    await page.getByLabel('Filtrar questoes por tema').selectOption('Sistema Esquelético');
    await page.getByRole('button', { name: 'Adicionar' }).nth(3).click();
    await page.getByRole('button', { name: 'Adicionar' }).nth(2).click();
    await page.getByRole('button', { name: 'Fechar modal de questoes' }).click();
    await expect(page.locator('tbody')).toContainText('2 questões');
  });

  test('Deve realizar login com sucesso e modificar nome da lista', async ({ page }) => {
    const nome = "A ser ter nome modificado";
    await page.goto('/professor/home');
    await expect(page.getByRole('button', { name: 'Listas' })).toBeVisible();
    await page.getByRole('button', { name: 'Listas' }).click();

    const linha = page.getByRole("row").filter({
      hasText: nome
    });
    await linha.getByRole('button', {name: "Editar"}).click();
    await page.getByRole('textbox', { name: 'Nome da lista' }).click();
    await page.getByRole('textbox', { name: 'Nome da lista' }).fill('Lista Teste Att');
    await page.getByRole('button', { name: 'Salvar alterações' }).click();
    await expect(page.getByRole('status')).toContainText('Lista atualizada com sucesso.');
  });


  test('Deve realizar login com sucesso e manipular questões da lista', async ({ page }) => {
    const nome = "A ser manipuladada";
    await page.goto('/professor/home');
    await expect(page.getByRole('button', { name: 'Listas' })).toBeVisible();
    await page.getByRole('button', { name: 'Listas' }).click();

    const linha = page.getByRole("row").filter({
      hasText: nome
    });
    
    await linha.getByRole('button', { name: ' questões' }).click();
    
    const questao1 = page.getByRole('listitem').filter({
      hasText: "9. Qual estrutura conecta os músculos aos ossos?"
    });
    await questao1.getByRole('button', {
      name: 'Remover questao'
    }).click();
    const questao2 = page.getByRole('listitem').filter({
      hasText: "8. Qual é o maior e mais pesado osso do corpo humano?"
    });
    await questao2.getByRole('button', {
      name: 'Remover questao'
    }).click();
    await expect(page.getByLabel('Questões da lista')).toContainText('7. Qual dos ossos abaixo faz parte exclusivamente do esqueleto axial?');
    await page.getByLabel('Filtrar questoes por tema').selectOption('Abdome Agudo');
    await page.getByRole('button', { name: 'Adicionar' }).click();
    const lista = page.getByRole('list').filter({
      hasText: 'A tríade de Rigler'
    });
    await expect(lista).toBeVisible();  
    await page.getByRole('button', { name: 'Fechar modal de questoes' }).click();
      await expect(page.locator('tbody')).toContainText('8 questões');
  });
  
});
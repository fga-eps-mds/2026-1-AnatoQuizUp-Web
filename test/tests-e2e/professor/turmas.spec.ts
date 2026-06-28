import { testProfessor as test, expect } from '../../../playwright/login.fixtures';

test.describe('Fluxos de Turmas do Professor', () => {
  
    test('Faz login com sucesso e cria uma turma', async ({ page }) => {
        const nomeTurma = `Nova Turma de ${Date.now()}`
        await page.goto('/professor/home');
        await expect(page.getByRole('button', { name: 'Turmas' })).toBeVisible();
        await page.getByRole('button', { name: 'Turmas' }).click();
        await page.getByRole('button', { name: 'Nova Turma' }).click();
        await page.getByRole('textbox', { name: 'Codigo' }).click();
        await page.getByRole('textbox', { name: 'Codigo' }).fill(nomeTurma);
        await page.getByRole('textbox', { name: 'Nome' }).click();
        await page.getByRole('textbox', { name: 'Nome' }).fill(nomeTurma);
        await page.getByRole('textbox', { name: 'Descricao' }).click();
        await page.getByRole('textbox', { name: 'Descricao' }).fill(nomeTurma);
        await page.getByRole('button', { name: 'Criar turma' }).click();
        await expect(page.getByRole('link', {name: nomeTurma})).toContainText(nomeTurma);
    });

    test('Faz login com sucesso e edita turma', async ({page}) => {
        const descricao = "Turma do terceiro semestre";
        const novaDescricao = "Turma do terceiro semestre de medicina";
        await page.goto('/professor/home');
        await expect(page.getByRole('button', { name: 'Turmas' })).toBeVisible();
        await page.getByRole('button', { name: 'Turmas' }).click();
        const linha = page.getByRole("row").filter({
            hasText: descricao
        });
        await linha.getByRole('button', {name: "Editar"}).click();
        await page.getByRole('textbox', { name: 'Descricao' }).click();
        await page.getByRole('textbox', { name: 'Descricao' }).fill(novaDescricao);
        await page.getByRole('button', { name: 'Salvar alteracoes' }).click();
        await expect(page.locator('html')).toContainText('Turma atualizada com sucesso.');
    });

    test('Faz login com sucesso e exclui turma', async ({page}) => {
        const nome = "Excluir turma";
        await page.goto('/professor/home');
        await expect(page.getByRole('button', { name: 'Turmas' })).toBeVisible();
        await page.getByRole('button', { name: 'Turmas' }).click();
        const linha = page.getByRole("row").filter({
            hasText: nome
        });
        await linha.getByRole('button', {name: "Excluir"}).click();

        await page.locator('.flex.items-center.gap-2.rounded-lg.bg-red-600').click();
        await expect(page.getByRole('status')).toContainText('Turma excluida com sucesso.');
        await expect(page.locator('html')).not.toContainText(nome);
    });

    test('Faz login com sucesso e adiciona um aluno à turma', async ({ page }) => {
        const descricao = "Turma de calouros";
        await page.goto('/professor/home');
        await expect(page.getByRole('button', { name: 'Turmas' })).toBeVisible();
        await page.getByRole('button', { name: 'Turmas' }).click();
        const linha = page.getByRole("row").filter({
            hasText: descricao
        });
        await linha.getByRole('button', { name: 'Alunos' }).click();
        await page.getByRole('textbox', { name: 'Buscar por nome ou email' }).click();
        await page.getByRole('textbox', { name: 'Buscar por nome ou email' }).fill('clara');
        await page.getByRole('button', { name: 'Adicionar' }).click();
        await expect(page.getByRole('status')).toContainText('Aluno vinculado com sucesso.');
    });

    test('Faz login com sucesso e libera o gabarito de uma lista', async ({ page }) => {
        const descricao = "Turma de calouros";
        await page.goto('/professor/home');
        await expect(page.getByRole('button', { name: 'Turmas' })).toBeVisible();
        await page.getByRole('button', { name: 'Turmas' }).click();
        const linha = page.getByRole("row").filter({
            hasText: descricao
        });
        await linha.getByRole('button', { name: 'Vincular lista' }).click();

        const lista = page.getByRole('listitem').filter({
            hasText: "Aquecimento Geral (Nível Fácil)"
        });
        await lista.getByRole('checkbox').check();
        await lista.getByRole('button', {
            name: 'Salvar configuracao'
        }).click();
        await expect(page.getByRole('status')).toContainText('Vinculo atualizado com sucesso.');
    });

    test('Faz login com sucesso e remove lista da turma', async ({ page }) => {
        const descricao = "Turma de calouros";
        await page.goto('/professor/home');
        await expect(page.getByRole('button', { name: 'Turmas' })).toBeVisible();
        await page.getByRole('button', { name: 'Turmas' }).click();
        const linha = page.getByRole("row").filter({
            hasText: descricao
        });
        await linha.getByRole('button', { name: 'Vincular lista' }).click();

        const lista = page.getByRole('listitem').filter({
            hasText: "Aquecimento Geral (Nível Fácil)"
        });
        await lista.getByRole('button', {
            name: 'Remover'
        }).click();
        await expect(page.getByRole('status')).toContainText('Lista desvinculada da turma.');
    });

    test('Faz login com sucesso e adiciona lista da turma', async ({ page }) => {
        const descricao = "Turma matutina de Anatomia Sistêmica";
        await page.goto('/professor/home');
        await expect(page.getByRole('button', { name: 'Turmas' })).toBeVisible();
        await page.getByRole('button', { name: 'Turmas' }).click();
        const linha = page.getByRole("row").filter({
            hasText: descricao
        });
        await linha.getByRole('button', { name: 'Vincular lista' }).click();

        const lista = page.getByRole('listitem').filter({
            hasText: "Aquecimento Geral (Nível Fácil)"
        });
        await lista.getByRole('button', {
            name: 'Vincular'
        }).click();
        await expect(page.getByRole('status')).toContainText('Lista vinculada com sucesso.');
    });


});
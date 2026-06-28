import { testAluno as test, expect } from '../../../playwright/login.fixtures';

test.describe('Fluxos de resposta de lista de questões', () => {

    test('Responde lista', async ({page}) => {
        await page.goto('/aluno/home');
        await expect(page.getByRole('button', { name: 'Minhas Turmas' })).toBeVisible();
        await page.getByRole('button', { name: 'Minhas Turmas' }).click();
        await page.getByRole('button', { name: 'Anatomia Humana I' }).click();
        await page.getByRole('button', { name: 'Responder' }).first().click();
        await page.getByRole('button', { name: 'A Hipotálamo' }).click();
        await page.getByRole('button', { name: 'Próxima' }).click();
        await page.getByRole('button', { name: 'A Occipital' }).click();
        await page.getByRole('button', { name: 'Próxima' }).click();
        await page.getByRole('button', { name: 'A Nervos e gânglios' }).click();
        await page.getByRole('button', { name: 'Próxima' }).click();
        await page.getByRole('button', { name: 'A Radiografia' }).click();
        await page.getByRole('button', { name: 'Próxima' }).click();
        await page.getByRole('button', { name: 'A Vesícula biliar' }).click();
        await page.getByRole('button', { name: 'Próxima' }).click();
        await page.getByRole('button', { name: 'A Gastroenterite' }).click();
        await page.getByRole('button', { name: 'Próxima' }).click();
        await page.getByRole('button', { name: 'A Esterno' }).click();
        await page.getByRole('button', { name: 'Próxima' }).click();
        await page.getByRole('button', { name: 'A Tíbia' }).click();
        await page.getByRole('button', { name: 'Próxima' }).click();
        await page.getByRole('button', { name: 'A Ligamentos' }).click();
        await page.getByRole('button', { name: 'Confirmar submissão' }).click();
        await expect(page.getByText('Tem a certeza que deseja')).toBeVisible();
        await page.getByRole('button', { name: 'Sim, submeter' }).click();
        await expect(page.getByRole('button', { name: 'Gabarito Bloqueado' })).toBeVisible();
    });
});
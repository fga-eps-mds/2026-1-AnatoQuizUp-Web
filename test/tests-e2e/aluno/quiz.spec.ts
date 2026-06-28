import { testAluno as test, expect } from '../../../playwright/login.fixtures';

test.describe('Fluxos de resposta de quiz', () => {

    test('Responde quiz corretamente', async ({page}) => {
        await page.goto('/aluno/home');
        await expect(page.getByRole('button', { name: 'Questões' })).toBeVisible();
        await page.getByRole('button', { name: 'Questões' }).click();
        await page.getByRole('button', { name: 'Sistema Esquelético'}).click();
        await page.getByRole('button', { name: 'Começar quiz'}).click();
        await expect(
            page.getByText(/Qual .*?\?/)
        ).toBeVisible();

        const enunciado = await page
            .getByText(/Qual .*?\?/)
            .textContent();
        switch (enunciado?.trim()) {
            case 'Qual dos ossos abaixo faz parte exclusivamente do esqueleto axial?':
                await page.getByRole('button', { name: /Esterno/i }).click();
                break;

            case 'Qual é o maior e mais pesado osso do corpo humano?':
                await page.getByRole('button', { name: /Fêmur/i }).click();
                break;

            case 'Qual estrutura conecta os músculos aos ossos?':
                await page.getByRole('button', { name: /Tendões/i }).click();
                break;

            default:
                throw new Error(`Questão não mapeada: ${enunciado}`);
        }
        await page.getByRole('button', { name: 'Confirmar' }).click();
        await expect(page.getByRole('main')).toContainText('Resposta Correta!');
        await expect(page.getByRole('main')).toContainText('+10 ATP');
        await page.getByRole('button', { name: 'Próxima' }).click();
        await expect(page.getByRole('main')).toContainText('2');
    });

    test('Responde quiz erroneamente', async ({page}) => {
        await page.goto('/aluno/home');
        await expect(page.getByRole('button', { name: 'Questões' })).toBeVisible();
        await page.getByRole('button', { name: 'Questões' }).click();
        await page.getByRole('button', { name: 'Sistema Esquelético'}).click();
        await page.getByRole('button', { name: 'Começar quiz'}).click();
        await expect(
            page.getByText(/Qual .*?\?/)
        ).toBeVisible();

        const enunciado = await page
            .getByText(/Qual .*?\?/)
            .textContent();
        switch (enunciado?.trim()) {
            case 'Qual dos ossos abaixo faz parte exclusivamente do esqueleto axial?':
                await page.getByRole('button', { name: /Clavícula/i }).click();
                break;

            case 'Qual é o maior e mais pesado osso do corpo humano?':
                await page.getByRole('button', { name: /Tíbia/i }).click();
                break;

            case 'Qual estrutura conecta os músculos aos ossos?':
                await page.getByRole('button', { name: /Ligamentos/i }).click();
                break;

            default:
                throw new Error(`Questão não mapeada: ${enunciado}`);
        }
        await page.getByRole('button', { name: 'Confirmar' }).click();
        await expect(page.getByRole('main')).toContainText('Resposta Incorreta!');
        await page.getByRole('button', { name: 'Próxima' }).click();
        await expect(page.getByRole('main')).toContainText('2');
    });
});
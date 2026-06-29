import { testAluno as test, expect } from '../../../playwright/login.fixtures';

test.describe('Fluxos de amizade do aluno', () => {

    test('Solicitar amizade', async ({page}) => {
        await page.goto('/aluno/home');
        await page.getByRole('button', { name: 'Amigos', exact: true }).click();
        await page.getByRole('textbox', { name: 'Buscar por nome ou nickname' }).click();
        await page.getByRole('textbox', { name: 'Buscar por nome ou nickname' }).fill('@pedrao');
        await page.getByRole('button', { name: 'Buscar', exact: true }).click();
        await expect(page.getByRole('link', { name: 'PS Pedro Santos @pedrao' })).toBeVisible();
        await page.getByRole('button', { name: 'Adicionar amigo' }).click();

        await expect(page.getByRole('button', { name: 'Solicitacao pendente' })).toBeVisible();
    });

    test('Aceitar convite', async ({page}) => {
        await page.goto('/aluno/home');
        await page.getByRole('button', { name: 'Amigos' }).click();
        await page.getByRole('button', { name: 'Convites' }).click();
        await page.getByRole('button', { name: 'Aceitar' }).click();
        await page.getByRole('button', { name: 'Meus amigos' }).click();
        await expect(page.getByRole('heading', { name: 'Clara Oscuro' })).toBeVisible();
    });

    test('Desfazer amizade', async ({page}) => {
        await page.goto('/aluno/home');
        await page.getByRole('button', { name: 'Amigos', exact: true }).click();
        await page.getByRole('button', { name: 'Meus amigos' }).click();
        const mariaCard = page.locator('article', {
            hasText: 'Maria Souza',
        });

        await mariaCard.getByRole('button', {
            name: 'Desfazer amizade',
        }).click();

        await expect(mariaCard).toHaveCount(0);
    });

    test('Toggle de visibilidade', async ({page}) => {
        await page.goto('/aluno/home');
        await page.getByRole('button', { name: 'Amigos', exact: true }).click();
        const privacySwitch = page.getByRole('switch', {
            name: 'Alternar privacidade da rede',
        });
        await expect(privacySwitch).toHaveAttribute('aria-checked', 'true');
        await privacySwitch.click();
        await expect(privacySwitch).toHaveAttribute('aria-checked', 'false');
    });

});
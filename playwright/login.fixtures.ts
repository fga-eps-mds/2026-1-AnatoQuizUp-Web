import { test as baseTest, expect, Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

type LoginFixtureOptions = {
  storageName: string;
  email: string;
  pass: string;
  expectedUrl: string;
  expectedText: RegExp | string;
};

export async function login(
  page: Page,
  email: string,
  pass: string,
  expectedUrl: string,
  expectedText: RegExp | string,
) {
  await page.goto('/login');

  await page.getByRole('textbox', { name: 'Email' })
    .fill(email);

  await page.getByRole('textbox', { name: '••••••••••••' })
    .fill(pass);

  await page.getByRole('button', { name: 'Continuar' }).click();

  await page.waitForURL(expectedUrl);

  await expect(page.getByText(expectedText)).toBeVisible();
}

export function createLoginFixture(options: LoginFixtureOptions) {
  return baseTest.extend<{}, { workerStorageState: string }>({
    storageState: ({ workerStorageState }, use) => use(workerStorageState),

    workerStorageState: [
      async ({ browser }, use) => {
        const id = baseTest.info().parallelIndex;

        const fileName = path.resolve(
          baseTest.info().project.outputDir,
          `.auth/${options.storageName}-${id}.json`,
        );

        if (fs.existsSync(fileName)) {
          await use(fileName);
          return;
        }

        const context = await browser.newContext({
          baseURL: 'http://localhost:15173',
          storageState: undefined,
        });

        const page = await context.newPage();

        await login(
            page, 
            options.email, 
            options.pass, 
            options.expectedUrl, 
            options.expectedText
        );

        await context.storageState({ path: fileName });

        await context.close();

        await use(fileName);
      },
      { scope: 'worker' },
    ],
  });
}

export const testProfessor = createLoginFixture({
  storageName: 'professor',
  email: 'professor@anatoquizup.com',
  pass: 'professor123',
  expectedUrl: '**/professor/home',
  expectedText: /Universidade de Brasília/i,
});

export const testAluno = createLoginFixture({
  storageName: 'aluno',
  email: 'joao@seed.com',
  pass: '123456',
  expectedUrl: '**/aluno/home',
  expectedText: /Universidade de Brasília/i,
});

export { expect } from '@playwright/test';
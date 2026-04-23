jest.mock('../../widgets/header', () => ({
  Header: () => <header>App header</header>,
}));

import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthenticatedLayout } from './AuthenticatedLayout';

describe('AuthenticatedLayout', () => {
  it('renders the header and nested route content', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<AuthenticatedLayout />}>
            <Route path="/" element={<section>Protected content</section>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('App header')).toBeInTheDocument();
    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });
});

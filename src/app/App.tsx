import { BrowserRouter } from 'react-router-dom';

import { ErrorBoundary } from './error-boundary';
import { AuthProvider } from './providers/AuthProvider';
import { AppRouter } from './router';
import './styles/global.css';

export const App = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
};
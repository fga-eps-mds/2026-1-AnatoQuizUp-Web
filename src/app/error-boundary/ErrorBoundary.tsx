import {
  Component,
  type ErrorInfo,
  type ReactNode,
} from 'react';

import { ErrorFallback } from './ErrorFallback';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

/**
 * Limite de erro (error boundary) da aplicacao: captura erros de renderizacao na
 * arvore filha e, em vez de quebrar a tela, exibe o ErrorFallback com opcao de retry.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  // Marca o estado de erro quando um filho lanca durante a renderizacao.
  static getDerivedStateFromError(): ErrorBoundaryState {
    return {
      hasError: true,
    };
  }

  // Loga o erro capturado (com a stack do React) para diagnostico.
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(
      'Erro de renderização capturado pelo ErrorBoundary:',
      error,
      errorInfo,
    );
  }

  // Limpa o estado de erro para tentar renderizar a arvore novamente.
  private handleRetry = () => {
    this.setState({
      hasError: false,
    });
  };

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onRetry={this.handleRetry} />;
    }

    return this.props.children;
  }
}
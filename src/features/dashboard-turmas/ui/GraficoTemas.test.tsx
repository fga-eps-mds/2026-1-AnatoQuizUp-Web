import { render, screen } from '@testing-library/react';
import { GraficoTemas } from './GraficoTemas';
import type { TemaDesempenho } from '../../../entities/dashboardTurma/model/types';

describe('GraficoTemas', () => {
  it('deve renderizar a lista de temas com suas respectivas taxas e status de cores', () => {
    const mockTemas: TemaDesempenho[] = [
      { nome: 'Neuroanatomia', totalRespondidas: 10, taxaAcerto: 80, status: 'Tranquilo' as const },
      { nome: 'Abdome Agudo', totalRespondidas: 5, taxaAcerto: 50, status: 'Atenção' as const },
      { nome: 'Esqueleto', totalRespondidas: 8, taxaAcerto: 20, status: 'Crítico' as const },
      { nome: 'Tema Desconhecido', totalRespondidas: 0, taxaAcerto: 0, status: 'Outro' as unknown as TemaDesempenho['status'] }, 
    ];

    render(<GraficoTemas temas={mockTemas} />);

    expect(screen.getByText('Neuroanatomia')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByText('Tranquilo')).toBeInTheDocument();

    expect(screen.getByText('Abdome Agudo')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('Atenção')).toBeInTheDocument();

    expect(screen.getByText('Esqueleto')).toBeInTheDocument();
    expect(screen.getByText('20%')).toBeInTheDocument();
    expect(screen.getByText('Crítico')).toBeInTheDocument();
    
    expect(screen.getByText('Tema Desconhecido')).toBeInTheDocument();
    expect(screen.getByText('Outro')).toBeInTheDocument();
  });
});
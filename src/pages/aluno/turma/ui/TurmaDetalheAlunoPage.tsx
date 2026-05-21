import { useParams } from 'react-router-dom';

import { DetalheTurma } from '../../../../features/minhas-turmas';

export const TurmaDetalheAlunoPage = () => {
  const { id } = useParams<{ id: string }>();
  // key={id} forca remontagem ao trocar de turma, evitando flash de dados antigos.
  return <DetalheTurma key={id} />;
};

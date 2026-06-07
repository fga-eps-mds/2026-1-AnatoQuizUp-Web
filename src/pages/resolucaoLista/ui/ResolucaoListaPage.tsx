import { useParams } from 'react-router-dom';
import { ResponderLista } from '../../../features/resolucaoLista/ui/ResponderLista';

export const ResponderListaPage = () => {
  const { listaId } = useParams<{ listaId: string }>();
  
  return <ResponderLista key={listaId} />;
};
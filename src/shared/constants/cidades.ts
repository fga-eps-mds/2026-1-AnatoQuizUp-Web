export type Cidade = {
  nome: string;
  uf: string;
};

export const CIDADES_POR_UF: Record<string, string[]> = {
  AC: ['Rio Branco'],
  AL: ['Maceio'],
  AP: ['Macapa'],
  AM: ['Manaus'],
  BA: ['Salvador'],
  CE: ['Fortaleza'],
  DF: ['Brasilia'],
  ES: ['Vitoria'],
  GO: ['Goiania'],
  MA: ['Sao Luis'],
  MT: ['Cuiaba'],
  MS: ['Campo Grande'],
  MG: ['Belo Horizonte'],
  PA: ['Belem'],
  PB: ['Joao Pessoa'],
  PR: ['Curitiba'],
  PE: ['Recife'],
  PI: ['Teresina'],
  RJ: ['Rio de Janeiro'],
  RN: ['Natal'],
  RS: ['Porto Alegre'],
  RO: ['Porto Velho'],
  RR: ['Boa Vista'],
  SC: ['Florianopolis'],
  SP: ['Sao Paulo'],
  SE: ['Aracaju'],
  TO: ['Palmas'],
};

export const listarCidadesLocaisPorUf = (uf: string): Cidade[] =>
  (CIDADES_POR_UF[uf.toUpperCase()] ?? []).map((nome) => ({ nome, uf: uf.toUpperCase() }));

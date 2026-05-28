# Feature Specification: Dashboard de Evolução do Aluno

**Feature Branch**: `001-dashboard-evolucao-aluno`

**Created**: 2026-05-28

**Status**: Draft

**Input**: User description: "Criar Tela de Dashboard de evolucao do Aluno.

Como aluno da plataforma
Quero visualizar um dashboard analítico com o histórico e as estatísticas das minhas resoluções
Para acompanhar minha evolução de aprendizado e identificar rapidamente quais temas preciso priorizar nos estudos"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visualizar métricas de evolução (Priority: P1)

Como aluno autenticado, quero ver indicadores de desempenho e histórico de resolução para acompanhar minha evolução.

**Why this priority**: Esta é a função principal do dashboard e entrega valor imediato ao aluno ao mostrar progresso e direções de estudo.

**Independent Test**: Acessar a página de evolução como aluno autenticado e verificar os indicadores, gráfico de distribuição e desempenho por tema.

**Acceptance Scenarios**:

1. **Given** o aluno está autenticado e tem histórico de respostas, **When** ele acessa a página de evolução, **Then** ele vê o total de questões respondidas e a porcentagem geral de acertos no topo.
2. **Given** há respostas registradas, **When** a página carrega, **Then** um gráfico de pizza/roda exibe a proporção de questões respondidas por tema.
3. **Given** há respostas registradas, **When** a página carrega, **Then** uma seção lista o desempenho por tema com taxa de acerto e taxa de erro para cada tema.

---

### User Story 2 - Acesso restrito para aluno (Priority: P2)

Como aluno, quero que somente usuários com perfil Aluno autenticados consigam acessar esta página.

**Why this priority**: Garante confidencialidade dos dados individuais e evita exposição de métrica de aluno para perfis errados.

**Independent Test**: Tentar acessar a rota sem autenticação ou com perfil diferente e confirmar o redirecionamento/negação.

**Acceptance Scenarios**:

1. **Given** nenhum usuário está autenticado, **When** ele tenta acessar a rota do dashboard, **Then** ele é redirecionado para a tela de login ou recebe acesso negado.
2. **Given** o usuário autenticado não é do perfil Aluno, **When** ele tenta acessar a rota, **Then** o acesso é bloqueado ou ele é redirecionado para o dashboard apropriado ao seu perfil.

---

### User Story 3 - Empty state amigável (Priority: P3)

Como aluno que ainda não respondeu questões, quero ver uma mensagem incentivadora no lugar dos gráficos, para entender que o dashboard ficará disponível quando eu começar a responder.

**Why this priority**: Melhora a experiência inicial do aluno e evita um layout quebrado quando não há dados.

**Independent Test**: Acessar a página com histórico vazio e verificar a ilustração e a mensagem de incentivo.

**Acceptance Scenarios**:

1. **Given** o aluno não respondeu nenhuma questão, **When** ele acessa a página, **Then** ele vê um estado vazio com ilustração amigável e texto convidando a fazer a primeira questão.
2. **Given** o aluno não respondeu questões, **When** ele navega na página, **Then** o layout permanece estável e acessível em tela móvel.

---

### Edge Cases

- Aluno autenticado com perfil diferente de Aluno tenta acessar a rota.
- Dados por tema incompletos ou temas sem questões respondidas aparecem como zero em gráficos e listas.
- O aluno possui apenas acertos ou apenas erros em um tema.
- Falha ao carregar dados do BFF ou endpoint indisponível.
- Tela em mobile com largura reduzida, cards empilhados e gráficos ajustados.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A página de dashboard deve ser acessível exclusivamente para usuários autenticados com perfil Aluno.
- **FR-002**: O topo da página deve exibir os indicadores globais: total de questões respondidas e porcentagem geral de acertos.
- **FR-003**: Deve exibir um gráfico de pizza ou rosca que mostre a proporção de questões resolvidas por tema.
- **FR-004**: Deve exibir uma seção de desempenho por tema com taxa de acertos e erros para cada tema específico.
- **FR-005**: Se o aluno não tiver respondido nenhuma questão, o dashboard deve apresentar um estado vazio com ilustração amigável e mensagem incentivadora.
- **FR-006**: A página deve ser responsiva e totalmente utilizável em dispositivos móveis e desktop.
- **FR-007**: Deve reutilizar o header existente e seguir o padrão visual atual do projeto usando Tailwind.
- **FR-008**: Caso o endpoint do BFF não esteja pronto, implementar uso de dados mockados para prover o estado da interface sem alterar componentes estáveis.
- **FR-009**: Não alterar componentes já estáveis sem necessidade; novos elementos visuais devem ser construídos com componentes utilitários existentes.

### Key Entities *(include if feature involves data)*

- **Aluno**: usuário autenticado do tipo aluno, com perfil e identificador únicos.
- **Estatísticas de Evolução**: conjunto de métricas do aluno, incluindo total de questões respondidas e porcentagem geral de acertos.
- **Tema**: categoria de conteúdo ou tópico, usada para agrupar questões respondidas.
- **Desempenho por Tema**: dados agregados por tema, com total de questões, acertos e erros.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Alunos autenticados com perfil Aluno conseguem acessar o dashboard e ver as métricas dentro de 2 segundos após o carregamento da página.
- **SC-002**: O topo da página mostra claramente o total de questões respondidas e a porcentagem geral de acertos.
- **SC-003**: O gráfico de distribuição por tema é exibido e reflete a proporção de questões respondidas por tema.
- **SC-004**: A seção de desempenho por tema exibe taxa de acerto e erro para cada tema, com pelo menos um valor legível por linha ou barra.
- **SC-005**: Quando não há respostas, o estado vazio é exibido com ilustração e texto, sem elementos de gráfico quebrados.
- **SC-006**: O dashboard se adapta a telas móveis sem causar overflow horizontal e mantém a usabilidade dos elementos interativos.
- **SC-007**: O header existente é reaproveitado e nenhuma alteração desnecessária é feita em componentes estáveis.

## Assumptions

- O BFF expõe um endpoint de histórico de desempenho do aluno, ou os dados podem ser simulados localmente se o endpoint não estiver disponível.
- O perfil do usuário está disponível no estado de autenticação atual e pode ser usado para validar o acesso ao dashboard.
- A navegação da aplicação permite adicionar uma rota protegida para o dashboard de evolução do aluno.
- O dashboard deve respeitar o design e os componentes atuais do projeto, usando Tailwind e recursos de layout existentes.
- A ilustração do estado vazio pode ser construída com SVG simples ou um componente visual leve sem novos pacotes.

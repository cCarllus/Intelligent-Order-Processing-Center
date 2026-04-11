# Smart Order Processing Center

Desafio técnico full-stack para transformar pedidos em texto livre em dados estruturados, armazená-los em SQLite e disponibilizá-los por meio de uma API simples e de uma interface React.

## Visão Geral

O sistema resolve um problema operacional comum: receber pedidos em linguagem natural e convertê-los para um formato consistente, que possa ser validado, persistido e consultado posteriormente.

Ele cobre o fluxo completo, da entrada em texto até o histórico salvo:

- criar um pedido a partir de texto livre
- extrair cliente, data de entrega e itens
- persistir pedidos e itens em SQLite
- listar pedidos já criados
- visualizar um pedido específico
- exibir imediatamente no frontend o resultado estruturado

Exemplo de entrada:

```text
Cliente: Maria Oliveira
Quero 10 caixas de leite e 5 pacotes de água para entrega amanhã
```

## Stack Tecnológica

### Backend

- Node.js
- Express
- TypeScript
- Zod
- better-sqlite3
- CORS / dotenv

### Frontend

- React
- Vite
- TypeScript

### Banco de Dados

- SQLite

### Validação e Ferramentas

- Zod para validação de requisições e domínio
- ESLint para lint do frontend
- TypeScript para tipagem estática
- tsx para fluxo de desenvolvimento do backend
- Vitest para testes automatizados

## Como Executar o Projeto

### Pré-requisitos

- Node.js 24+ recomendado
- npm
- Docker + Docker Compose (opcional, para execução simplificada)

### Backend

```bash
cd /Users/carllosintfpc/Documents/teste/backend
npm install
cp .env.example .env
npm run dev
```

O backend roda em:

- `http://localhost:3001`

Scripts disponíveis no backend:

```bash
npm run dev
npm run build
npm run start
npm run test
npm run test:watch
```

### Frontend

```bash
cd /Users/carllosintfpc/Documents/teste/frontend
npm install
cp .env.example .env
npm run dev
```

O frontend roda em:

- `http://localhost:5173`

Scripts disponíveis no frontend:

```bash
npm run dev
npm run build
npm run lint
npm run preview
npm run test
npm run test:watch
```

## Testes Automatizados

Foi adicionada uma camada de testes pequena, mas suficiente para fortalecer a entrega sem overengineering.

### Backend

- runner: `Vitest`
- testes de API: `Supertest`
- estratégia de banco: SQLite em memória para evitar acoplamento com o banco local de desenvolvimento

Cobertura atual:

- parser rule-based
  - múltiplos itens
  - unidades opcionais
  - datas relativas
  - entradas fracas/inválidas
  - extração de cliente
- endpoints
  - `POST /pedido` sucesso
  - `POST /pedido` payload inválido
  - `GET /pedidos`
  - `GET /pedido/:id`
  - `GET /pedido/:id` não encontrado

Executar:

```bash
cd /Users/carllosintfpc/Documents/teste/backend
npm test
```

### Frontend

- runner: `Vitest`
- renderização e interação: `@testing-library/react`
- interação do usuário: `@testing-library/user-event`
- ambiente DOM: `jsdom`

Cobertura atual:

- renderização do formulário principal
- envio de pedido em texto livre
- exibição do resultado estruturado
- listagem de pedidos carregados
- estados de loading e erro

Executar:

```bash
cd /Users/carllosintfpc/Documents/teste/frontend
npm test
```

### Variáveis de Ambiente

`.env` do backend:

- `PORT`
  Porta do backend. Padrão: `3001`
- `FRONTEND_URL`
  Origem permitida no CORS. Padrão: `http://localhost:5173`
- `DATABASE_PATH`
  Caminho do banco SQLite. Padrão: `./data/orders.db`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `USE_FAKE_AI`

Observação:

- As variáveis relacionadas à OpenAI existem na configuração, mas a solução atual usa um parser rule-based e não depende delas no fluxo principal.

`.env` do frontend:

- `VITE_API_URL`
  URL base do backend. Padrão: `http://localhost:3001`

### Exemplo Rápido de Execução

Terminal 1:

```bash
cd /Users/carllosintfpc/Documents/teste/backend
npm install
cp .env.example .env
npm run dev
```

Terminal 2:

```bash
cd /Users/carllosintfpc/Documents/teste/frontend
npm install
cp .env.example .env
npm run dev
```

Depois, abra [http://localhost:5173](http://localhost:5173).

### Execução com Docker

Para reviewers, a forma mais simples de subir tudo é:

```bash
cd /Users/carllosintfpc/Documents/teste
docker compose up --build
```

Serviços expostos:

- frontend: `http://localhost:5173`
- backend: `http://localhost:3001`

Comandos úteis:

```bash
docker compose up --build -d
docker compose down
```

Observações do setup Docker:

- o frontend roda com o servidor do Vite, exposto em `0.0.0.0`, para facilitar a avaliação
- o backend roda a API Express compilada em TypeScript
- o SQLite persiste em `backend/data`, montado no container para não perder dados entre reinicializações
- o frontend usa `VITE_API_URL=http://localhost:3001`, porque as chamadas saem do navegador do reviewer, não de dentro do container
- o backend mantém `FRONTEND_URL=http://localhost:5173` para o CORS funcionar corretamente

## Resumo da API

- `POST /pedido`
- `GET /pedidos`
- `GET /pedido/:id`

Formatos de sucesso:

- `POST /pedido` -> `{ data: Order }`
- `GET /pedido/:id` -> `{ data: Order }`
- `GET /pedidos` -> `{ data: Order[], meta: { total } }`

Formato de erro:

- `{ error: { message, details? } }`

## Resumo da Arquitetura

### Backend

O backend segue uma estrutura simples em camadas:

- `routes`
  Define os endpoints HTTP.
- `controller`
  Faz o fluxo de request/response.
- `service`
  Coordena parsing, validação e regras de negócio.
- `repository`
  Encapsula a persistência em SQLite.
- `parser`
  Extrai campos estruturados a partir do texto livre.

### Frontend

O frontend foi mantido intencionalmente como uma interface de página única:

- `App.tsx` coordena carregamento, envio, seleção e estados de feedback
- componentes pequenos renderizam formulário, último resultado, lista de pedidos e detalhes
- uma camada leve de API isola as chamadas ao backend

### Fluxo de Dados em Alto Nível

1. O usuário envia um texto livre pelo frontend.
2. O frontend faz `POST /pedido`.
3. O backend valida a requisição e executa o parser.
4. Os dados parseados são normalizados e validados.
5. O repositório persiste o pedido e os itens em SQLite.
6. O pedido criado é retornado ao frontend.
7. O frontend atualiza o resultado mais recente e o histórico.

Para a descrição completa de pastas e arquivos, consulte [PROJECT_STRUCTURE.md](/Users/carllosintfpc/Documents/teste/PROJECT_STRUCTURE.md).

## Notas Para Revisão

Pontos que vale documentar e explicar rapidamente em entrevista:

- há um `docker-compose.yml` na raiz para subir frontend e backend com um único comando
- o `README.md` da raiz é a fonte principal de instruções; o `frontend/README.md` foi removido para evitar duplicação
- arquivos locais e temporários, como `.DS_Store`, `node_modules`, `dist`, `.env` e artefatos de WAL/SHM do SQLite, ficam ignorados no repositório
- o arquivo principal do banco (`backend/data/orders.db`) também fica fora do versionamento; apenas a pasta `data/` permanece disponível para persistência local

## Uso de IA

Esta seção deve permanecer factual. Substitua os placeholders entre colchetes pelas ferramentas que você realmente utilizou antes de entregar o projeto.

### Ferramentas Utilizadas

- `[ex.: ChatGPT]`
- `[ex.: GitHub Copilot]`
- `[remover qualquer ferramenta que não tenha sido usada]`

### Onde a IA Foi Utilizada

- Desenho de arquitetura
  Usada para comparar uma estrutura simples em camadas no backend com uma abordagem de frontend de página única.
- Desenvolvimento do parser
  Usada para explorar padrões de regex, regras de normalização e exemplos de edge cases para pedidos em texto livre.
- Setup do backend
  Usada para acelerar boilerplate de rotas, validação, tratamento de erro e estrutura inicial do projeto.
- Setup do frontend
  Usada para orientar a estrutura de componentes, fluxo de estado local e organização da camada de API.

### Como os Prompts Evoluíram

- Os prompts iniciais eram mais amplos e focados em arquitetura e organização geral.
- Depois, ficaram mais específicos sobre:
  - contrato de respostas da API
  - edge cases do parser
  - modelagem de persistência em SQLite
  - responsabilidades dos componentes React
  - adequação da solução ao escopo de 6–8 horas

### Onde as Sugestões da IA Foram Incorretas ou Incompletas

Casos típicos encontrados durante a iteração:

- boilerplate que não correspondia exatamente ao contrato exigido pela API
- sugestões de parser genéricas demais para o formato esperado de entrada
- sugestões de frontend com complexidade desnecessária
- inconsistências de nomenclatura ou formato de resposta entre camadas

### O que Foi Revisado e Corrigido Manualmente

O código final foi revisado e ajustado manualmente. Isso incluiu:

- alinhar a implementação ao contrato esperado da API
- simplificar o frontend para uso de estado local
- refinar regras do parser para os padrões de pedido esperados
- padronizar nomenclaturas entre backend, frontend e persistência
- revisar tratamento de erros e consistência de respostas

Observação final:

- A IA foi utilizada como ferramenta de apoio para acelerar iteração e exploração, mas a versão final submetida foi validada e refinada manualmente.

## Decisões Técnicas

### Por que SQLite

- Rápido de configurar para um desafio técnico
- Não exige serviço externo
- É adequado para um conjunto pequeno de dados relacionais
- Facilita a avaliação, porque o projeto roda localmente sem infraestrutura adicional

### Por que um Parser Rule-based em vez de NLP

- As entradas esperadas são limitadas o suficiente para uma abordagem determinística
- Uma solução rule-based é mais fácil de explicar, depurar e validar
- Evita dependência de APIs externas ou saída probabilística
- Mantém o comportamento estável e reproduzível na demonstração

Trade-off:

- É menos flexível que uma solução baseada em NLP e exige tratamento explícito de novos padrões.

### Por que um Frontend Simples, de Página Única, com Estado Local

- O desafio possui um fluxo principal bem definido
- Gerenciamento global de estado adicionaria complexidade sem ganho claro
- Estado local mantém o código mais legível e fácil de explicar
- É suficiente para os fluxos de criar, listar e visualizar

### Trade-offs pelo Escopo de 6–8 Horas

- priorização de corretude end-to-end em vez de polimento visual avançado
- escolha de um parser determinístico em vez de uma solução mais ambiciosa
- ausência de roteamento e bibliotecas externas de estado
- foco em legibilidade, previsibilidade e facilidade de avaliação

## Edge Cases Tratados

- entrada inválida ou vazia
  a validação retorna erros estruturados
- quantidades ausentes
  itens sem quantidade válida são ignorados, e a requisição falha se nenhum item válido for encontrado
- unidades ausentes
  a unidade é opcional e é armazenada como `null` quando não detectada
- múltiplos itens em uma única frase
  o parser suporta vários itens iniciados por quantidade na mesma sentença
- datas relativas
  suporta termos como `today`, `tomorrow`, `day after tomorrow`, `hoje`, `amanhã` e `depois de amanhã`

## Checklist Final de Revisão

Antes da entrega, verificar:

- consistência das respostas da API em casos de sucesso e erro
- consistência de nomenclatura entre backend, frontend e persistência
- tratamento de erro claro e dentro do formato esperado
- remoção de logs temporários, código de debug e arquivos não usados
- `.gitignore` cobrindo `node_modules`, build, `.env`, arquivos do SQLite e também `-wal` / `-shm`
- backend e frontend iniciando corretamente a partir de um clone limpo
- fluxos de criar, listar e visualizar funcionando de ponta a ponta

## Observações Finais

- O projeto foi intencionalmente mantido fácil de revisar rapidamente.
- A implementação prioriza clareza, comportamento determinístico e estrutura legível, sem complexidade desnecessária.
- A documentação detalhada de pastas e arquivos está em [PROJECT_STRUCTURE.md](/Users/carllosintfpc/Documents/teste/PROJECT_STRUCTURE.md).

# Smart Order Processing Center

Aplicação full-stack que transforma pedidos em texto livre em dados estruturados, armazena essas informações em SQLite e as disponibiliza por meio de uma API simples e de uma interface React.

## Visão Geral do Projeto

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

## Como Executar

### Pré-requisitos

- Node.js 24+ recomendado
- npm
- Docker + Docker Compose (opcional, para execução simplificada)

### Backend

Na raiz do repositório:

```bash
cd backend
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

Na raiz do repositório:

```bash
cd frontend
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

Foi incluída uma camada pequena, mas suficiente, de testes automatizados para melhorar a confiabilidade sem adicionar complexidade desnecessária.

### Backend

- runner: `Vitest`
- testes de API: `Supertest`
- estratégia de banco: SQLite em memória para evitar acoplamento com o banco local de desenvolvimento

Cobertura atual:

- cobertura do parser: múltiplos itens, unidades opcionais, datas relativas, entradas fracas ou inválidas e extração de cliente
- cobertura dos endpoints: `POST /pedido` com sucesso, `POST /pedido` com payload inválido, `GET /pedidos`, `GET /pedido/:id` e `GET /pedido/:id` não encontrado

Executar:

```bash
cd backend
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
cd frontend
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

- As variáveis relacionadas à OpenAI estão disponíveis na configuração, mas a solução atual usa um parser rule-based e não depende delas no fluxo principal.

`.env` do frontend:

- `VITE_API_URL`
  URL base do backend. Padrão: `http://localhost:3001`

### Exemplo Rápido de Execução

Terminal 1:

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Terminal 2:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Depois, abra `http://localhost:5173`.

### Uso com Docker

Para avaliação local, a forma mais simples de subir a stack completa é:

```bash
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

Observações sobre o setup com Docker:

- o frontend roda com o servidor do Vite, exposto em `0.0.0.0`, para acesso local
- o backend roda a API Express compilada em TypeScript
- o SQLite persiste em `backend/data`, montado no container para manter os dados entre reinicializações
- o frontend usa `VITE_API_URL=http://localhost:3001`, porque as chamadas saem do navegador, não de dentro do container
- o backend mantém `FRONTEND_URL=http://localhost:5173` para que o CORS funcione corretamente

## Resumo da API

- `POST /pedido`
- `GET /pedidos`
- `GET /pedido/:id`

Formatos de sucesso:

- `POST /pedido` -> `{ data: Order }`
- `GET /pedido/:id` -> `{ data: Order }`
- `GET /pedidos` -> `{ data: Order[], meta: { total: number } }`

Formato de erro:

- `{ error: { message, details? } }`

## Arquitetura

### Backend

O backend segue uma estrutura simples em camadas:

- `routes`
  Define os endpoints HTTP.
- `controller`
  Controla o fluxo de request/response.
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
4. Os dados extraídos são normalizados e validados.
5. O repositório persiste o pedido e os itens em SQLite.
6. O pedido criado é retornado ao frontend.
7. O frontend atualiza o resultado mais recente e o histórico.

## Notas do Repositório

- o `docker-compose.yml` na raiz sobe frontend e backend com um único comando
- o `README.md` da raiz é a fonte principal das instruções de setup; o `frontend/README.md` foi removido para evitar duplicação
- arquivos locais e temporários, como `.DS_Store`, `node_modules`, `dist`, `.env` e artefatos WAL/SHM do SQLite, estão ignorados no repositório
- o arquivo principal do banco, `backend/data/orders.db`, fica fora do versionamento; a pasta `data/` permanece disponível para persistência local

## Uso de IA

Ferramentas de IA foram utilizadas como apoio de produtividade e exploração técnica. A implementação final foi revisada e refinada manualmente.

### Ferramentas Utilizadas

- `ChatGPT`
- `Grok`
- `Codex`

### Áreas de Uso

- Exploração de arquitetura
  Usada para comparar uma estrutura simples em camadas no backend com uma abordagem de frontend de página única.
- Desenvolvimento do parser
  Usada para explorar padrões de regex, regras de normalização e exemplos de edge cases para pedidos em texto livre.
- Setup do backend
  Usada para acelerar boilerplate de rotas, validação, tratamento de erro e estrutura inicial do projeto.
- Setup do frontend
  Usada para orientar a estrutura de componentes, fluxo de estado local e organização da camada de API.

### Evolução dos Prompts

- Os prompts iniciais foram mais amplos e focados em arquitetura e organização geral.
- Depois, passaram a focar mais especificamente em contratos de resposta da API, edge cases do parser, modelagem de persistência em SQLite, responsabilidades dos componentes React e adequação ao escopo de 6-8 horas.

### Limitações Observadas nas Sugestões de IA

Casos típicos identificados durante a iteração:

- boilerplate que não correspondia completamente ao contrato exigido pela API
- sugestões de parser genéricas demais para o formato esperado de entrada
- sugestões de frontend com complexidade desnecessária
- inconsistências de nomenclatura ou formato de resposta entre camadas

### Revisão e Refinamento Manual

O código final foi revisado e ajustado manualmente. Isso incluiu:

- alinhar a implementação ao contrato esperado da API
- simplificar o frontend com base em estado local
- refinar as regras do parser para os padrões de pedido esperados
- padronizar nomenclaturas entre backend, frontend e persistência
- revisar o tratamento de erros e a consistência das respostas

## Abordagem de Desenvolvimento

A implementação seguiu uma abordagem leve orientada por contrato. Os formatos esperados de entrada, os contratos de resposta da API e os fluxos principais do sistema serviram como referência para organizar backend, frontend, validações e testes sem introduzir overhead processual desnecessário.

## Decisões Técnicas

### Por que SQLite

- rápido de configurar para uma avaliação técnica
- não exige serviço externo
- adequado para um conjunto pequeno de dados relacionais
- facilita a execução local sem infraestrutura adicional

### Por que um Parser Rule-Based em vez de NLP

- as entradas esperadas são limitadas o suficiente para uma abordagem determinística
- uma solução rule-based é mais fácil de depurar, validar e compreender
- evita dependência de APIs externas e saídas probabilísticas
- mantém o comportamento estável e reproduzível

Trade-off:

- é menos flexível do que uma solução baseada em NLP e exige tratamento explícito para novos padrões

### Por que um Frontend Simples, de Página Única, com Estado Local

- o projeto tem um fluxo principal bem definido
- gerenciamento global de estado adicionaria complexidade sem ganho claro
- estado local mantém o código mais legível e fácil de manter
- é suficiente para os fluxos de criar, listar e visualizar

### Trade-Offs Dentro de um Escopo de 6-8 Horas

- priorizar corretude end-to-end em vez de polimento visual avançado
- escolher um parser determinístico em vez de uma solução mais ambiciosa
- evitar roteamento e bibliotecas externas de estado
- focar em legibilidade, previsibilidade e facilidade de avaliação

## Edge Cases Tratados

- entrada inválida ou vazia
  a validação retorna erros estruturados
- quantidades ausentes
  itens sem quantidade válida são ignorados, e a requisição falha se nenhum item válido for encontrado
- unidades ausentes
  a unidade é opcional e armazenada como `null` quando não detectada
- múltiplos itens em uma única frase
  o parser suporta vários itens baseados em quantidade na mesma sentença
- datas relativas
  suporta termos como `today`, `tomorrow`, `day after tomorrow`, `hoje`, `amanhã` e `depois de amanhã`

## Checklist Final

Antes da entrega, verificar:

- consistência das respostas da API em casos de sucesso e erro
- consistência de nomenclatura entre backend, frontend e persistência
- tratamento de erro claro e dentro do formato esperado
- remoção de logs temporários, código de debug e arquivos não usados
- `.gitignore` cobrindo `node_modules`, artefatos de build, `.env`, arquivos do SQLite e também `-wal` / `-shm`
- backend e frontend iniciando corretamente a partir de um clone limpo
- fluxos de criar, listar e visualizar funcionando de ponta a ponta

## Observações Finais

- o projeto foi mantido intencionalmente fácil de revisar rapidamente
- a implementação prioriza clareza, comportamento determinístico e estrutura legível, sem complexidade desnecessária

# Golden Raspberry Awards — Frontend

Interface web para análise dos indicados e vencedores da categoria **Pior Filme** do Golden Raspberry Awards, consumindo a API pública `https://challenge.outsera.tech/api/movies`.

---

## Visão Geral

O projeto expõe duas rotas principais:

- **Dashboard (`/`)** — quatro painéis analíticos com métricas sobre anos, estúdios, produtores e filmes vencedores.
- **Lista de filmes (`/movies`)** — tabela paginada com filtros por ano e status de vencedor, onde a URL é a fonte de verdade do estado.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16.2.6 (App Router) |
| Linguagem | TypeScript 5 — `strict: true` |
| UI | shadcn/ui (preset Vega, base Radix UI) |
| Estilos | Tailwind CSS v4 |
| Ícones | Lucide React |
| Data fetching | TanStack React Query v5 |
| Notificações | Sonner |
| Dark mode | next-themes |
| Testes | Vitest 4 + Testing Library + MSW 2 |

---

## Funcionalidades

### Dashboard (`/`)

Quatro painéis de análise:

| Painel | Descrição |
|---|---|
| Anos com múltiplos vencedores | Lista os anos em que mais de um filme ganhou o prêmio |
| Top 3 estúdios com vitórias | Exibe os três estúdios com mais prêmios, com badges de ranking |
| Intervalo entre vitórias — produtores | Mostra os produtores com menor e maior intervalo entre vitórias consecutivas (tabelas min/max) |
| Vencedores por ano | Campo de busca: informe um ano para ver os filmes vencedores |

### Lista de filmes (`/movies`)

Tabela paginada (15 itens por página) com todos os filmes indicados e vencedores, com dois filtros combinados:

- **Ano** — filtra pelo ano de lançamento.
- **Vencedor** — exibe todos, somente vencedores ou somente não-vencedores.

O estado de filtros e paginação é mantido na URL (`?page=2&year=1984&winner=true`), permitindo compartilhar links filtrados e navegar pelo histórico do navegador.

---

## Pré-requisitos

- Node.js 20 ou superior
- npm 10 ou superior

---

## Como Executar

```bash
# Instalar dependências
npm install

# Servidor de desenvolvimento em http://localhost:3000
npm run dev

# Build de produção
npm run build

# Iniciar o servidor após o build
npm start

# Verificar lint
npm run lint
```

---

## Como Testar

A suíte usa **Vitest** como runner, **Testing Library** para renderizar componentes React e **MSW 2** para interceptar chamadas HTTP na camada de rede — sem mock de módulo para o cliente HTTP.

```bash
# Testes em modo watch (desenvolvimento)
npm test

# Executar todos os testes uma única vez (CI)
npm run test:run

# Gerar relatório de cobertura
npm run test:coverage
```

### Cobertura de Testes

14 arquivos de teste cobrem os seguintes contextos:

| Arquivo | Contexto |
|---|---|
| `api.test.ts` | Todos os métodos da camada HTTP (URLs, filtros, tratamento de erro) |
| `utils.test.ts` | Helper `cn()` |
| `dashboard-card.test.tsx` | Componente de container dos painéis |
| `multiple-winners-panel.test.tsx` | Loading, erro, vazio e renderização de dados |
| `top-studios-panel.test.tsx` | Limite de 3 estúdios, ranking, erro |
| `producer-intervals-panel.test.tsx` | Seções min/max, dados, erro |
| `winners-by-year-panel.test.tsx` | Estado inicial, busca, vazio, erro, validação |
| `panel-status.test.tsx` | Estados de loading, erro e vazio |
| `navbar.test.tsx` | Navegação e links ativos |
| `movies-list.test.tsx` | Tabela, filtros, paginação, erro, vazio, limpar filtros |
| `use-dashboard.test.ts` | Hooks `useMultipleWinners`, `useTopStudios`, `useProducerIntervals`, `useWinnersByYear` |
| `use-movies.test.ts` | Hook `useMovies` com `keepPreviousData` |
| `dashboard-page.test.tsx` | Página `/` integrada |
| `movies-page.test.tsx` | Página `/movies` integrada |

A configuração de MSW usa `onUnhandledRequest: "error"`, o que garante que requisições não mapeadas falhem os testes explicitamente.

---

## Estrutura do Projeto

```
src/
├── app/
│   ├── layout.tsx              # Layout raiz (Server Component)
│   ├── page.tsx                # Rota / — Dashboard (Server Component)
│   └── movies/
│       └── page.tsx            # Rota /movies — Lista de filmes (Server Component + Suspense)
├── components/
│   ├── dashboard/
│   │   ├── dashboard-card.tsx          # Container reutilizável dos painéis
│   │   ├── multiple-winners-panel.tsx  # Painel anos com múltiplos vencedores
│   │   ├── panel-status.tsx            # Estado transversal: loading / erro / vazio
│   │   ├── producer-intervals-panel.tsx # Painel intervalos entre vitórias
│   │   ├── top-studios-panel.tsx       # Painel top 3 estúdios
│   │   └── winners-by-year-panel.tsx   # Painel vencedores por ano
│   ├── movies/
│   │   └── movies-list.tsx             # Tabela paginada com filtros
│   ├── layout/
│   │   └── navbar.tsx                  # Barra de navegação
│   └── ui/                             # Componentes shadcn/ui
├── hooks/
│   ├── use-dashboard.ts    # useMultipleWinners, useTopStudios, useProducerIntervals, useWinnersByYear
│   └── use-movies.ts       # useMovies (com keepPreviousData)
├── lib/
│   ├── api.ts              # Camada HTTP — request<T>() + moviesApi (contrato público)
│   ├── providers.tsx       # QueryClientProvider
│   └── utils.ts            # cn() (clsx + tailwind-merge)
└── test/
    ├── setup.ts            # Configuração jest-dom + MSW lifecycle
    ├── utils.tsx           # renderWithQuery, createQueryWrapper
    └── mocks/
        ├── server.ts       # MSW server (Node)
        └── handlers.ts     # Handlers para todos os 5 endpoints
```

---

## Arquitetura

### Fluxo de Dados

```
API REST (challenge.outsera.tech)
  ↓  fetch + URL builder
src/lib/api.ts  →  moviesApi.*()
  ↓  useQuery / useInfiniteQuery (TanStack Query)
src/hooks/use-dashboard.ts  |  src/hooks/use-movies.ts
  ↓  props
Client Components (painéis, lista)
  ↓  render
shadcn/ui (Card, Table, Badge, Select, Button, Input…)
```

---

## Decisões Técnicas

### Server vs Client Components

O layout raiz e as páginas (`page.tsx`) são Server Components — sem JavaScript de cliente, sem hidratação desnecessária. O marcador `"use client"` fica nos painéis do dashboard e na lista de filmes, que dependem de hooks React e TanStack Query.

### Camada de API Isolada

`src/lib/api.ts` concentra toda a lógica HTTP. A função `request<T>()` é privada; os métodos tipados de `moviesApi` compõem o contrato público. Essa separação simplifica o mock nos testes (MSW intercepta diretamente na rede) e permite trocar o cliente HTTP sem alterar componentes ou hooks.

### TanStack Query como Camada de Cache

O `QueryClient` é instanciado via `useState` no `Providers` para evitar cache compartilhado entre sessões SSR. `staleTime: 60_000` evita refetches desnecessários — os dados do acervo raramente mudam. A lista paginada usa `keepPreviousData` para manter o conteúdo visível durante a transição entre páginas.

### PanelStatus — Estado Transversal

Loading (skeleton), erro e lista vazia são tratados de forma uniforme pelo componente `PanelStatus`, eliminando lógica duplicada nos quatro painéis do dashboard e garantindo consistência visual entre os estados.

### URL como Fonte de Verdade nos Filtros

Na página `/movies`, o estado de filtro e paginação vive exclusivamente na URL (`?page=2&year=1984&winner=true`). Isso permite compartilhar links filtrados, navegar pelo histórico do browser e integrar com o sistema de cache do Next.js sem gerenciamento de estado adicional.

### Suspense Boundary para `useSearchParams`

A página `/movies/page.tsx` envolve `<MoviesList>` em `<Suspense>` para cumprir o requisito do Next.js 16: componentes que chamam `useSearchParams` precisam de uma boundary de Suspense para funcionar corretamente no modo de renderização estática.

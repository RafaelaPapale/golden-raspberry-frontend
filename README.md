# Golden Raspberry Awards

Interface para consultar os indicados e vencedores da categoria **Pior Filme** do Golden Raspberry Awards, consumindo a API pública `https://challenge.outsera.tech/api/movies`.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router) |
| Linguagem | TypeScript 5 — `strict: true` |
| UI | shadcn/ui (preset Vega, base Radix) |
| Estilos | Tailwind CSS v4 |
| Data fetching | TanStack Query v5 |
| Testes | Vitest 4 + Testing Library + MSW 2 |

## Funcionalidades

### Dashboard (`/`)

Quatro painéis de análise:

1. **Anos com múltiplos vencedores** — lista todos os anos em que mais de um filme ganhou o prêmio.
2. **Top 3 estúdios com vitórias** — exibe os três estúdios com mais prêmios.
3. **Intervalo entre vitórias — produtores** — mostra os produtores com menor e maior intervalo entre vitórias consecutivas.
4. **Vencedores por ano** — campo de busca: informe um ano para ver quais filmes venceram naquele ano.

### Lista de filmes (`/movies`)

Tabela paginada com todos os filmes (indicados e vencedores), com dois filtros:

- **Ano** — filtra por ano de lançamento.
- **Vencedor** — exibe todos, só vencedores ou só não-vencedores.

## Como rodar

```bash
npm install
npm run dev        # servidor de desenvolvimento em http://localhost:3000
npm run build      # build de produção
npm run test       # testes em modo watch
npm run test:run   # testes sem watch (CI)
npm run lint       # ESLint
```

## Arquitetura

### Fluxo de dados

```
API REST (challenge.outsera.tech)
  ↓  fetch + URL builder
src/lib/api.ts  →  moviesApi.*()
  ↓  useQuery (TanStack Query)
src/hooks/use-dashboard.ts  |  src/hooks/use-movies.ts
  ↓  props / context
Client Components (painéis, lista)
  ↓  render
shadcn/ui (Card, Table, Badge, Select, Button, Input…)
```

### Organização de pastas

```
src/
├── app/
│   ├── layout.tsx          # layout raiz (Server Component)
│   ├── page.tsx            # rota / → Dashboard (Server Component)
│   └── movies/
│       └── page.tsx        # rota /movies → Lista de filmes (Server Component)
├── components/
│   ├── dashboard/          # painéis do dashboard (Client Components)
│   ├── movies/             # lista de filmes (Client Component)
│   ├── layout/             # Navbar
│   └── ui/                 # componentes shadcn gerados
├── hooks/
│   ├── use-dashboard.ts    # hooks dos painéis (TanStack Query)
│   └── use-movies.ts       # hook da lista paginada (TanStack Query)
├── lib/
│   ├── api.ts              # camada HTTP — wrapper fetch + tipos
│   ├── providers.tsx       # QueryClientProvider
│   └── utils.ts            # cn() helper
└── test/
    ├── setup.ts            # jest-dom + MSW lifecycle
    ├── utils.tsx           # renderWithQuery helper
    └── mocks/
        ├── server.ts       # MSW server (Node)
        └── handlers.ts     # MSW handlers para todos os endpoints
```

### Decisões de arquitetura

**Server vs Client Components**
O layout raiz e as páginas (`page.tsx`) são Server Components — sem JavaScript de cliente, sem hidratação desnecessária. O marcador `"use client"` fica nos painéis e na lista, que precisam de hooks React e TanStack Query.

**Camada de API isolada**
`src/lib/api.ts` concentra toda lógica HTTP. A função `request<T>()` é privada; os métodos tipados de `moviesApi` são o contrato público. Isso simplifica o mock nos testes (MSW intercepta na rede) e facilita trocar o cliente HTTP sem tocar nos componentes.

**TanStack Query como cache**
`QueryClient` é instanciado via `useState` no `Providers` para evitar cache compartilhado entre sessões SSR. `staleTime: 60_000` evita refetches desnecessários (dados históricos raramente mudam). A lista paginada usa `keepPreviousData` para não piscar ao trocar de página.

**PanelStatus como componente de estado transversal**
Loading (skeleton), erro e lista vazia são tratados de forma uniforme pelo componente `PanelStatus`, eliminando duplicação nos quatro painéis do dashboard.

**URL como fonte de verdade nos filtros**
Na página de filmes, o estado de filtro e paginação vive na URL (`?page=2&year=1984&winner=true`). Isso permite compartilhar links filtrados e navegar pelo histórico do browser.

**Suspense para `useSearchParams`**
A página `/movies` envolve `<MoviesList>` em `<Suspense>` para cumprir o requisito do Next.js 16: componentes que usam `useSearchParams` precisam de uma boundary de Suspense para funcionar corretamente no modo estático.

## Testes

A suíte usa **Vitest** como runner, **Testing Library** para renderizar componentes React e **MSW** para interceptar as chamadas HTTP na camada de rede — sem nenhum mock de módulo para o cliente HTTP.

```bash
npm run test:run   # executa todos os testes uma vez
```

Cobertura:
- `src/lib/api.test.ts` — todos os métodos da API (URL, filtros, tratamento de erro)
- `multiple-winners-panel.test.tsx` — loading, erro, vazio, dados
- `top-studios-panel.test.tsx` — limite de 3, ranking, erro
- `producer-intervals-panel.test.tsx` — seções min/max, dados, erro
- `winners-by-year-panel.test.tsx` — estado inicial, busca, vazio, erro, validação
- `movies-list.test.tsx` — tabela, filtros, paginação, erro, vazio, limpar filtros

# Arquitetura Técnica — Golden Raspberry Awards Frontend

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Stack Tecnológica](#2-stack-tecnológica)
3. [Estrutura de Diretórios](#3-estrutura-de-diretórios)
4. [Arquitetura de Componentes](#4-arquitetura-de-componentes)
5. [Camada de Dados](#5-camada-de-dados)
6. [Gerenciamento de Estado](#6-gerenciamento-de-estado)
7. [Renderização e Performance](#7-renderização-e-performance)
8. [Design System](#8-design-system)
9. [Acessibilidade](#9-acessibilidade)
10. [Estratégia de Testes](#10-estratégia-de-testes)
11. [Decisões Arquiteturais](#11-decisões-arquiteturais)
12. [Escalabilidade e Extensibilidade](#12-escalabilidade-e-extensibilidade)

---

## 1. Visão Geral

O Golden Raspberry Awards Frontend é uma aplicação web que expõe uma interface de consulta para os dados históricos da categoria Pior Filme do Framboesa de Ouro. A aplicação consome exclusivamente a API pública `https://challenge.outsera.tech/api/movies` e apresenta dashboards analíticos e listagem paginada de filmes.

### Objetivos de Produto

- Exibir anos com múltiplos vencedores em forma de tabela
- Ranquear os três maiores estúdios por número de vitórias
- Calcular os produtores com maior e menor intervalo entre prêmios consecutivos
- Permitir busca de vencedores por ano específico
- Listar todos os filmes com filtros por ano, status de vitória e paginação

### Objetivos Técnicos

- Interface de alta performance com renderização otimizada no servidor
- Experiência de usuário fluida com estados de carregamento e erro bem definidos
- Código fortemente tipado e testável desde a origem
- Acessibilidade compatível com leitores de tela
- Manutenibilidade garantida por separação clara de responsabilidades

---

## 2. Stack Tecnológica

| Camada | Tecnologia | Versão | Responsabilidade |
|---|---|---|---|
| Framework | Next.js | 16.2.6 | Roteamento, SSR, App Router |
| UI Library | React | 19.2.4 | Árvore de componentes, estado local |
| Linguagem | TypeScript | 5.x (strict) | Tipagem estática em tempo de compilação |
| Estilos | Tailwind CSS | v4 | Utilitários CSS, design tokens via OkLCH |
| Componentes | shadcn/ui | — | Primitivos acessíveis baseados em Radix UI |
| Data Fetching | TanStack React Query | 5.100.14 | Cache, sincronização e estado assíncrono |
| Ícones | Lucide React | 1.17.0 | Biblioteca SVG coerente com design system |
| Temas | next-themes | 0.4.6 | Dark/light mode sem flash de FOUC |
| Notificações | Sonner | 2.0.7 | Toast acessível |
| Utilitários CSS | clsx, tailwind-merge, cva | — | Composição condicional e tipada de classes |
| Testes | Vitest + Testing Library + MSW | — | Unitários, integração, mocks de rede |

### Justificativa das Escolhas Principais

**Next.js App Router** foi escolhido em detrimento do Pages Router por oferecer suporte nativo a React Server Components, layouts aninhados sem rerenderização, streaming via Suspense e colocation de código por rota. Isso elimina a necessidade de `getServerSideProps` e reduz o JavaScript enviado ao cliente.

**TanStack React Query** foi preferido a soluções como SWR ou Redux Toolkit Query por seu modelo de `queryKey` tipado, suporte maduro a `keepPreviousData`, estado derivado (`isLoading`, `isError`, `isFetching`) e ecossistema de devtools — tudo sem introduzir um estado global mutável.

**Tailwind CSS v4** com espaço de cores OkLCH representa o padrão mais atual de design tokens CSS: cores perceptualmente uniformes, melhor manipulação de lightness/chroma e suporte nativo a variáveis CSS sem pré-processador.

---

## 3. Estrutura de Diretórios

```
golden-raspberry-frontend/
├── src/
│   ├── app/                        # Rotas Next.js (App Router)
│   │   ├── globals.css             # Design tokens + Tailwind v4 config
│   │   ├── layout.tsx              # RootLayout — Server Component
│   │   ├── page.tsx                # Dashboard — Server Component
│   │   └── movies/
│   │       └── page.tsx            # Lista de Filmes — Server Component + Suspense
│   ├── components/
│   │   ├── dashboard/              # Painéis do dashboard (Client Components)
│   │   │   ├── dashboard-card.tsx
│   │   │   ├── multiple-winners-panel.tsx
│   │   │   ├── panel-status.tsx
│   │   │   ├── producer-intervals-panel.tsx
│   │   │   ├── top-studios-panel.tsx
│   │   │   └── winners-by-year-panel.tsx
│   │   ├── movies/
│   │   │   └── movies-list.tsx     # Tabela paginada com filtros via URL
│   │   ├── layout/
│   │   │   └── navbar.tsx          # Header sticky com navegação
│   │   └── ui/                     # Primitivos shadcn/ui sem lógica de negócio
│   ├── hooks/
│   │   ├── use-dashboard.ts        # Hooks do dashboard (4 queries)
│   │   └── use-movies.ts           # Hook de listagem com paginação
│   ├── lib/
│   │   ├── api.ts                  # Contrato com a API REST
│   │   ├── providers.tsx           # QueryClientProvider (SSR-safe)
│   │   └── utils.ts                # Função cn() utilitária
│   └── test/                       # Setup do Vitest + MSW handlers
├── vitest.config.ts
├── tsconfig.json
└── components.json
```

### Princípio de Organização

A estrutura segue o padrão **feature-colocation**: arquivos relacionados ao dashboard vivem em `components/dashboard/`, hooks do dashboard em `hooks/use-dashboard.ts` e contratos de tipo em `lib/api.ts`. Isso minimiza o custo cognitivo de navegação e torna as dependências entre módulos explícitas.

A pasta `ui/` contém exclusivamente componentes shadcn/ui sem qualquer lógica de domínio — são primitivos visuais reutilizáveis em qualquer contexto. Componentes com lógica de negócio nunca residem em `ui/`.

---

## 4. Arquitetura de Componentes

### 4.1 Hierarquia de Renderização

```
RootLayout (Server)
├── Navbar (Client — usePathname)
├── Providers (Client — QueryClientProvider)
│   └── main
│       ├── DashboardPage (Server)
│       │   ├── DashboardCard
│       │   │   └── MultipleWinnersPanel (Client)
│       │   ├── DashboardCard
│       │   │   └── TopStudiosPanel (Client)
│       │   ├── DashboardCard
│       │   │   └── ProducerIntervalsPanel (Client)
│       │   └── DashboardCard
│       │       └── WinnersByYearPanel (Client)
│       └── MoviesPage (Server)
│           └── Suspense boundary
│               └── MoviesList (Client — useSearchParams)
```

### 4.2 Divisão Server / Client Components

A divisão entre Server e Client Components é uma decisão explícita e não acidental:

**Server Components** (`app/layout.tsx`, `app/page.tsx`, `app/movies/page.tsx`) não carregam JavaScript no bundle do cliente, não hidratam e não têm acesso a hooks. São usados nas páginas porque sua responsabilidade é apenas definir estrutura estática e compor Client Components como shells — nenhum dado dinâmico é buscado no servidor nesta aplicação.

**Client Components** (`"use client"`) são todos os painéis, a lista de filmes e a navbar. Eles precisam de hooks (`useQuery`, `usePathname`, `useSearchParams`) que só existem no ambiente do browser. A diretiva `"use client"` é adicionada no nível mais baixo possível da árvore, preservando o máximo de componentes como Server Components.

### 4.3 Componentes de Apresentação vs. Contêiner

A arquitetura segue o padrão de separação entre componentes contêiner (que buscam dados) e componentes de apresentação (que só renderizam):

```
Componente contêiner (painel)
  └── Invoca hook → obtém dados, isLoading, isError
  └── Passa estado para PanelStatus
      └── PanelStatus decide o que renderizar:
          ├── Skeletons (loading)
          ├── Mensagem de erro
          ├── Mensagem de vazio
          └── children (tabela com dados reais)
```

### 4.4 PanelStatus — Componente de Estado Transversal

`PanelStatus` é um componente utilitário que centraliza a lógica de renderização condicional de estados assíncronos, evitando que cada painel replique a mesma estrutura de `if (isLoading) ... else if (isError) ...`.

```
Props recebidas:
  isLoading: boolean
  isError:   boolean
  isEmpty?:  boolean
  rows?:     number      → quantos skeletons renderizar
  children:  ReactNode   → conteúdo real

Precedência de renderização:
  isLoading → aria-busy="true" + N <Skeleton />
  isError   → <AlertTriangle /> + mensagem
  isEmpty   → <Inbox /> + mensagem
  default   → children
```

Essa abordagem garante consistência visual e comportamental em todos os painéis sem acoplamento.

### 4.5 DashboardCard — Wrapper Visual

`DashboardCard` é um componente puramente visual que fornece o contêiner estilizado amber para cada painel do dashboard. Separa o estilo do card da lógica do painel, permitindo que ambos evoluam independentemente.

---

## 5. Camada de Dados

### 5.1 Módulo api.ts

O arquivo `src/lib/api.ts` é a única fronteira entre a aplicação e a API externa. Toda comunicação HTTP passa por este módulo.

#### Função request<T> (privada)

```typescript
// Contrato interno — não exposto diretamente
async function request<T>(path: string, params?: Record<string, string>): Promise<T>
```

Responsabilidades:
- Construção da URL com `URLSearchParams`
- Execução do `fetch` nativo
- Verificação de `response.ok` com lançamento de erro descritivo
- Parsing do JSON e retorno tipado via genérico `<T>`

A função é privada intencionalmente: o contrato público da camada de dados é o objeto `moviesApi`, não o mecanismo de transporte. Isso facilita a substituição do `fetch` por `axios` ou outro cliente HTTP sem afetar nenhum hook ou componente.

#### Objeto moviesApi (público)

| Método | Endpoint | Parâmetros | Retorno |
|---|---|---|---|
| `list(params)` | `GET /` | `page, size, winner, year` | `Page<Movie>` |
| `yearsWithMultipleWinners()` | `GET /yearsWithMultipleWinners` | — | `{years: YearWithWinners[]}` |
| `studiosWithWinCount()` | `GET /studiosWithWinCount` | — | `{studios: StudioWinCount[]}` |
| `maxMinWinIntervalForProducers()` | `GET /maxMinWinIntervalForProducers` | — | `MaxMinInterval` |
| `winnersByYear(year)` | `GET /winnersByYear` | `year` | `Movie[]` |

### 5.2 Tipos e Contratos

Todos os tipos são definidos em `api.ts` e exportados para consumo pelos hooks:

```typescript
Movie            // { id, year, title, studios, producers, winner }
Page<T>          // { content, pageable, totalElements, totalPages, ... }
YearWithWinners  // { year, winnerCount }
StudioWinCount   // { name, winCount }
ProducerInterval // { producer, interval, previousWin, followingWin }
MaxMinInterval   // { min: ProducerInterval[], max: ProducerInterval[] }
MovieQuery       // Parâmetros de listagem: page, size, winner, year
```

O uso de TypeScript strict com esses tipos garante que qualquer mudança no contrato da API quebre a compilação antes de chegar ao runtime.

### 5.3 Tratamento de Erros na API

Quando `response.ok` é `false`, a função `request<T>` lança um `Error` com a mensagem `HTTP ${status}`. Esse erro é capturado pelo TanStack Query, que popula `isError: true` e `error` no estado do hook. O componente `PanelStatus` converte esse estado em feedback visual adequado.

---

## 6. Gerenciamento de Estado

### 6.1 Filosofia de Estado

A aplicação não possui estado global mutável. O estado é categorizado em três tipos com estratégias distintas:

| Tipo de Estado | Estratégia | Localização |
|---|---|---|
| Estado do servidor (dados da API) | TanStack Query | Hooks em `src/hooks/` |
| Estado de UI derivado de URL (filtros, paginação) | `useSearchParams` + `useRouter` | `movies-list.tsx` |
| Estado de UI local efêmero (hover, focus) | `useState` local | Dentro do componente |

### 6.2 TanStack Query — Configuração

O `QueryClient` é instanciado dentro de um `useState` no componente `Providers`, não como uma variável de módulo:

```typescript
// src/lib/providers.tsx
const [queryClient] = useState(() => new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,          // 1 minuto de cache
      refetchOnWindowFocus: false, // dados históricos não mudam
      retry: 1,                    // uma retentativa em caso de falha
    },
  },
}))
```

**Por que `useState` e não variável de módulo?** Em Next.js com Server Components, variáveis de módulo são compartilhadas entre requisições no servidor. Instanciar o `QueryClient` via `useState` garante que cada sessão de browser receba sua própria instância, prevenindo vazamento de cache entre usuários diferentes.

**Por que `staleTime: 60_000`?** Os dados do Framboesa de Ouro são históricos e raramente atualizados. Um TTL de 60 segundos elimina refetches desnecessários em navegações rápidas enquanto mantém os dados razoavelmente frescos.

### 6.3 Hooks do Dashboard

```typescript
// src/hooks/use-dashboard.ts

useMultipleWinners()        // queryKey: ["dashboard", "multipleWinners"]
useTopStudios()             // queryKey: ["dashboard", "topStudios"]
useProducerIntervals()      // queryKey: ["dashboard", "producerIntervals"]
useWinnersByYear(year)      // queryKey: ["dashboard", "winnersByYear", year]
                            // enabled: year !== null  → lazy query
```

Os quatro primeiros hooks buscam dados imediatamente ao montar o componente. `useWinnersByYear` usa `enabled: year !== null` para postergar a busca até que o usuário informe um ano — padrão de "query condicional" do TanStack Query.

### 6.4 Hook de Filmes

```typescript
// src/hooks/use-movies.ts
useMovies(params: MovieQuery)
// placeholderData: keepPreviousData → evita flash de loading ao trocar página
```

`keepPreviousData` é crítico para a experiência de paginação: ao trocar de página, o usuário continua vendo os dados da página anterior enquanto os novos carregam, sem o elemento visuamente disruptivo de skeletons em cada troca de página.

### 6.5 URL como Fonte de Verdade

A lista de filmes não usa `useState` para os filtros. O estado vive na URL:

```
/movies?page=2&year=2020&winner=true
```

A função `navigate(updates)` em `movies-list.tsx` usa `URLSearchParams` para atualizar parâmetros individualmente sem destruir os demais:

```typescript
function navigate(updates: Record<string, string | null>) {
  const params = new URLSearchParams(searchParams.toString())
  Object.entries(updates).forEach(([key, value]) => {
    if (value === null) params.delete(key)
    else params.set(key, value)
  })
  router.push(`?${params.toString()}`)
}
```

**Benefícios dessa abordagem:**
- Links filtrados são compartilháveis e bookmarkáveis
- O botão "Voltar" do browser navega entre estados de filtro
- Sem `useEffect` de sincronização entre estado e URL
- Nenhum estado de UI que possa ficar dessincronizado com a URL

---

## 7. Renderização e Performance

### 7.1 Fluxo Completo de uma Requisição

```
Browser → Request HTTP
    ↓
Next.js Server (Edge/Node)
    ↓
Server Component (page.tsx)
  — Zero JS enviado ao cliente
  — Renderiza shell dos Client Components
    ↓
HTML inicial + referências a Client Components
    ↓
Browser hidrata Client Components
    ↓
TanStack Query dispara fetches paralelos
    ↓
API REST responde
    ↓
React re-renderiza painéis com dados reais
```

### 7.2 Suspense em /movies

A rota `/movies` envolve `MoviesList` em um `Suspense boundary`:

```typescript
// app/movies/page.tsx
<Suspense fallback={<MoviesListSkeleton />}>
  <MoviesList />
</Suspense>
```

`MoviesList` usa `useSearchParams`, que em Next.js 16 no modo de renderização estática requer um `Suspense boundary` para funcionar corretamente. Sem ele, o build falha com aviso de bailout de SSG. O skeleton de fallback garante que o usuário veja conteúdo imediatamente enquanto o componente hidrata.

### 7.3 Otimizações Implementadas

| Técnica | Localização | Impacto |
|---|---|---|
| Server Components nas páginas | `app/*.tsx` | Zero JS extra no bundle do cliente |
| `staleTime: 60_000` | `providers.tsx` | Elimina refetches redundantes |
| `keepPreviousData` | `use-movies.ts` | Sem flash de loading em paginação |
| `refetchOnWindowFocus: false` | `providers.tsx` | Sem refetch ao alternar abas |
| Suspense boundary | `app/movies/page.tsx` | Streaming incremental |
| `backdrop-blur-sm` na navbar | `navbar.tsx` | CSS nativo, sem JS |

### 7.4 Paralelismo de Queries

Os quatro painéis do dashboard montam simultaneamente e cada um dispara sua query de forma independente e paralela. O TanStack Query não sequencializa queries a não ser que haja dependência explícita (como `enabled: year !== null` em `useWinnersByYear`).

```
Dashboard mount
├── useMultipleWinners()     → fetch paralelo
├── useTopStudios()          → fetch paralelo
├── useProducerIntervals()   → fetch paralelo
└── useWinnersByYear(null)   → não executa (year === null)
```

---

## 8. Design System

### 8.1 Tailwind CSS v4 e OkLCH

A aplicação usa Tailwind CSS v4 com o novo sistema de configuração via `@theme` inline em `globals.css`. Todos os tokens de design são variáveis CSS no espaço de cores OkLCH:

```css
@theme inline {
  --color-background: oklch(1 0 0);
  --color-foreground: oklch(0.145 0 0);
  --color-primary: oklch(0.205 0 0);
  /* ... */
}
```

**Por que OkLCH?** OkLCH (Oklab Lightness Chroma Hue) é perceptualmente uniforme: uma variação de `0.1` em lightness sempre representa a mesma diferença visual percebida pelo olho humano, independente do matiz. Isso não é verdade com HSL, onde amarelos e verdes parecem mais claros que azuis e roxos no mesmo valor de lightness.

**Dark mode** é implementado via classe `.dark` no elemento `html`, controlada pelo `next-themes`. As variáveis CSS são redefinidas no escopo `.dark`, garantindo transição sem FOUC.

### 8.2 shadcn/ui com Preset Vega

O shadcn/ui é configurado com o preset `radix-vega` (`components.json`), que usa `cssVariables: true`. Isso significa que todos os componentes referenciam as variáveis CSS do design system em vez de valores hardcoded, tornando a personalização de tema centralizada.

### 8.3 Tema Amber do Dashboard

Os painéis do dashboard usam a paleta amber para criar identidade visual:
- `DashboardCard`: `border-t-amber-400`, container de ícone com `bg-amber-100`
- Badges de ranking em `TopStudiosPanel`: amber para 1º lugar, variações para 2º e 3º
- `Navbar`: fundo amber com navegação responsiva

Essa escolha de cor é consistente com a temática do "Framboesa de Ouro" e diferencia visualmente a aplicação de interfaces genéricas.

### 8.4 Componentes UI Puros

A pasta `src/components/ui/` contém exclusivamente os primitivos shadcn/ui:

```
badge, button, card, input, pagination,
select, skeleton, sonner, table
```

Nenhum desses componentes conhece o domínio de filmes ou prêmios. Eles são configurados via props (variantes, tamanhos) e nunca fazem fetch de dados. Essa separação garante que possam ser reutilizados em qualquer parte da aplicação ou até extraídos para um pacote compartilhado.

---

## 9. Acessibilidade

A aplicação implementa acessibilidade como requisito funcional, não como adorno.

### 9.1 Semântica HTML

```
<header>   → contém <nav> da Navbar
<nav>      → links de navegação principal
<main>     → conteúdo principal de cada página
```

Elementos semânticos corretos permitem que leitores de tela naveguem pela página usando atalhos de landmark (`H` para header, `N` para nav, `M` para main).

### 9.2 Atributos ARIA

| Atributo | Localização | Função |
|---|---|---|
| `aria-current="page"` | Link ativo na Navbar | Informa ao leitor de tela qual página está ativa |
| `aria-busy="true"` | Container de loading | Sinaliza estado de carregamento ao leitor de tela |
| `aria-label` | Botões de filtro e paginação | Descreve ação para elementos sem texto visível |
| `aria-hidden="true"` | Ícones decorativos | Evita que ícones sejam lidos desnecessariamente |
| `role="alert"` | Mensagem de erro na lista de filmes | Lê automaticamente quando aparece (live region) |

### 9.3 Estados de Loading Acessíveis

O `PanelStatus` aplica `aria-busy="true"` no container quando `isLoading` é `true`. Leitores de tela como NVDA e VoiceOver interpretam isso como indicação de que o conteúdo está sendo atualizado, sem necessidade de anunciar cada skeleton individualmente.

---

## 10. Estratégia de Testes

### 10.1 Configuração do Vitest

```typescript
// vitest.config.ts
{
  environment: "jsdom",    // simula DOM do browser
  globals: true,           // describe/it/expect sem import
  setupFiles: "setup.ts",  // configura MSW e matchers
  resolve: {
    alias: { "@": "<projectRoot>" }  // espelha o tsconfig
  }
}
```

O alias `@` é duplicado no Vitest para garantir que os imports do código de produção resolvam corretamente nos testes sem alteração de paths.

### 10.2 MSW para Mocks de Rede

A escolha do **Mock Service Worker (MSW)** em vez de mocks de módulo (`jest.mock`, `vi.mock`) é uma decisão deliberada de qualidade de teste.

**Mocks de módulo** interceptam a importação de um módulo e substituem sua implementação. Isso quebra o contrato real da camada de dados: o teste não exercita o código de `api.ts`, apenas verifica se o componente chama a função mockada.

**MSW** intercepta a requisição na rede real (nível de `fetch`/`XMLHttpRequest`). O fluxo completo `componente → hook → api.ts → fetch → rede` é exercitado, e apenas a resposta da rede é mockada. Isso detecta bugs em `api.ts` que mocks de módulo não detectariam.

```
Teste com MSW:
  Component → useQuery → api.ts → fetch → [MSW intercepta] → resposta mock
  ↑ Tudo exercitado exceto o servidor real
```

### 10.3 Estrutura de Testes

Os testes vivem em `src/test/` seguindo o padrão de co-localização com setup centralizado. O arquivo `setup.ts` inicializa o MSW server com `beforeAll/afterEach/afterAll` para garantir isolamento entre testes.

---

## 11. Decisões Arquiteturais

Esta seção documenta as principais decisões de design e a justificativa por trás de cada uma.

### ADR-001: App Router em vez de Pages Router

**Contexto:** Next.js oferece dois sistemas de roteamento: Pages Router (legado) e App Router (atual).

**Decisão:** Usar App Router.

**Justificativa:** O App Router permite Server Components nativos, eliminando hidratação desnecessária nas páginas. Layouts aninhados sem rerenderização reduzem o custo de navegação. Streaming via Suspense melhora o Time to First Byte. O Pages Router exigiria `getServerSideProps` ou `getStaticProps` para qualquer otimização de servidor, enquanto o App Router oferece esses benefícios por padrão.

### ADR-002: TanStack Query como Camada de Estado de Servidor

**Contexto:** Múltiplos componentes buscam dados de APIs diferentes e precisam de estados de loading/error/cache.

**Decisão:** Usar TanStack Query para todo estado de servidor.

**Justificativa:** `useState + useEffect + fetch` manual replica implementações frágeis de cache, debounce e estado de erro. TanStack Query fornece cache automático com invalidação por `queryKey`, deduplicação de requests idênticos, retry configurável, `keepPreviousData` e devtools. Alternativas como SWR têm API mais simples mas menos controle sobre cache e estado derivado.

### ADR-003: QueryClient via useState (não variável de módulo)

**Contexto:** `QueryClient` precisa ser acessível em todos os componentes via `QueryClientProvider`.

**Decisão:** Instanciar `QueryClient` dentro de `useState` no componente `Providers`.

**Justificativa:** Variáveis de módulo em Next.js são compartilhadas entre requisições no servidor. Um `QueryClient` como variável de módulo causaria vazamento do cache de um usuário para outro em ambiente multi-usuário. `useState` garante instância única por sessão de browser.

### ADR-004: URL como Fonte de Verdade para Filtros

**Contexto:** A lista de filmes possui filtros de ano, status de vitória e número de página.

**Decisão:** Armazenar filtros na URL via `useSearchParams`, sem `useState` local.

**Justificativa:** `useState` para filtros cria estado duplicado que precisa ser sincronizado com a URL se quisermos links compartilháveis. A URL é naturalmente persistente, compartilhável e integra com o histórico do browser. O padrão `useSearchParams + router.push` elimina essa sincronização e torna o estado do filtro serializado por design.

### ADR-005: Função request<T> Privada

**Contexto:** A comunicação HTTP precisa de tratamento de erros, construção de URL e parsing consistentes.

**Decisão:** Implementar `request<T>` como função privada em `api.ts`, expondo apenas `moviesApi`.

**Justificativa:** O mecanismo de transporte HTTP é um detalhe de implementação que não deve vazar para os consumidores. Ao expor apenas `moviesApi`, o código cliente depende de uma interface estável. Substituir `fetch` por `axios`, adicionar headers de autenticação ou interceptors é uma mudança local em `request<T>` sem impacto em nenhum hook ou componente.

### ADR-006: TypeScript strict: true

**Contexto:** Projetos TypeScript permitem configuração permissiva ou rigorosa.

**Decisão:** `strict: true` no `tsconfig.json`.

**Justificativa:** O modo strict habilita `strictNullChecks`, `noImplicitAny`, `strictFunctionTypes` e outros. `strictNullChecks` por si só elimina uma classe inteira de bugs de runtime (`Cannot read property of undefined/null`). O custo de anotar tipos explicitamente é compensado pela detecção precoce de erros e pelo melhor suporte de IntelliSense.

### ADR-007: MSW para Testes em vez de Mocks de Módulo

**Contexto:** Testes de componentes precisam de dados mockados sem acesso à API real.

**Decisão:** Usar MSW para interceptar requisições HTTP nos testes.

**Justificativa:** Mocks de módulo (`vi.mock('~/lib/api')`) não exercitam o código de `api.ts` e não detectam regressões nessa camada. MSW intercepta no nível de rede, fazendo o fluxo real `componente → hook → api.ts → fetch` ser exercitado em cada teste. O resultado é cobertura mais realista com o mesmo nível de isolamento.

### ADR-008: PanelStatus como Componente de Estado Transversal

**Contexto:** Quatro painéis do dashboard têm os mesmos três estados: loading, error, empty.

**Decisão:** Criar `PanelStatus` como componente reutilizável.

**Justificativa:** Sem `PanelStatus`, cada painel duplicaria a estrutura `if (isLoading) ... else if (isError) ...`. Qualquer mudança no visual do estado de loading precisaria ser replicada em quatro lugares. `PanelStatus` centraliza essa lógica e garante consistência visual e comportamental por construção.

---

## 12. Escalabilidade e Extensibilidade

### 12.1 Adicionando uma Nova Página

1. Criar `src/app/[rota]/page.tsx` como Server Component
2. Se a página usar `useSearchParams`, envolver o componente cliente em `<Suspense>`
3. Adicionar link na `Navbar` com `aria-current` condicional

### 12.2 Adicionando um Novo Endpoint da API

1. Adicionar a função ao objeto `moviesApi` em `src/lib/api.ts`
2. Definir o tipo de retorno em `api.ts`
3. Criar um novo hook em `src/hooks/` (ou adicionar a um arquivo existente)
4. Consumir o hook no componente

### 12.3 Adicionando um Novo Painel no Dashboard

1. Criar `src/components/dashboard/meu-painel.tsx` com `"use client"`
2. Invocar o hook relevante para obter `data`, `isLoading`, `isError`
3. Envolver o conteúdo em `<PanelStatus isLoading={...} isError={...}>`
4. Envolver o painel em `<DashboardCard titulo="..." icon={...}>` em `app/page.tsx`

### 12.4 Internacionalização

A aplicação está estruturada de forma compatível com internacionalização via `next-intl` ou `i18next`. Textos visíveis estão concentrados nos componentes de painel, `PanelStatus` e `Navbar`. Uma migração para i18n exigiria substituir strings literais por chamadas de tradução sem alterar lógica de dados ou estrutura de componentes.

### 12.5 Autenticação

Caso a API passe a exigir autenticação, o ponto de inserção é a função `request<T>` em `api.ts`. Headers de `Authorization` adicionados nessa função propagam automaticamente para todas as chamadas sem alteração nos hooks ou componentes.


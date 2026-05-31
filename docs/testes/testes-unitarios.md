# Estratégia de Testes — Golden Raspberry Awards Frontend

## Sumário

1. [Visão Geral](#visão-geral)
2. [Stack de Ferramentas](#stack-de-ferramentas)
3. [Arquitetura da Suíte de Testes](#arquitetura-da-suíte-de-testes)
4. [Configuração e Setup Global](#configuração-e-setup-global)
5. [Infraestrutura de Mock de Rede (MSW)](#infraestrutura-de-mock-de-rede-msw)
6. [Helpers e Utilitários de Teste](#helpers-e-utilitários-de-teste)
7. [Cobertura por Camada](#cobertura-por-camada)
   - [Camada de API — `src/lib/api.ts`](#camada-de-api--srclibapits)
   - [Camada de Utilitários — `src/lib/utils.ts`](#camada-de-utilitários--srclibutils-ts)
   - [Hooks — `use-dashboard` e `use-movies`](#hooks--use-dashboard-e-use-movies)
   - [Componentes de Dashboard](#componentes-de-dashboard)
   - [Componente de Layout — `Navbar`](#componente-de-layout--navbar)
   - [Componente de Listagem — `MoviesList`](#componente-de-listagem--movieslist)
   - [Páginas](#páginas)
8. [Padrões e Estratégias Especiais](#padrões-e-estratégias-especiais)
9. [Métricas da Suíte](#métricas-da-suíte)
10. [Pontos Fortes](#pontos-fortes)
11. [Lacunas Identificadas](#lacunas-identificadas)
12. [Recomendações para Escalar a Suíte](#recomendações-para-escalar-a-suíte)

---

## Visão Geral

O projeto Golden Raspberry Awards Frontend adota uma estratégia de testes centrada em **testes unitários e de integração de componentes**, priorizando o comportamento observável pelo usuário em detrimento de detalhes de implementação interna. Essa abordagem está alinhada com os princípios do Testing Library: testar o que o usuário vê e faz, não como o componente está implementado internamente.

A suíte cobre quatro camadas distintas da aplicação — API, utilitários, hooks e componentes/páginas — com um total de **14 arquivos de teste** e aproximadamente **116 casos de teste**. Toda a comunicação de rede é interceptada via Mock Service Worker (MSW), eliminando dependência de servidores externos durante a execução dos testes.

---

## Stack de Ferramentas

| Ferramenta | Versão | Função |
|---|---|---|
| **Vitest** | 4.1.7 | Test runner, substituindo Jest com compatibilidade total de API e performance superior via Vite |
| **@testing-library/react** | 16.3.2 | Renderização de componentes React em ambiente de teste com foco em acessibilidade |
| **@testing-library/user-event** | 14.6.1 | Simulação realista de interações do usuário (digitação, clique, navegação) |
| **@testing-library/jest-dom** | 6.9.1 | Matchers DOM adicionais (`toBeInTheDocument`, `toBeDisabled`, `toHaveAttribute`, etc.) |
| **MSW** | 2.14.6 | Interceptação de requisições HTTP no nível de Service Worker/node, sem monkey-patching |
| **jsdom** | 29.1.1 | Implementação de DOM no Node.js, provendo o ambiente de navegador para os testes |

### Por que Vitest em vez de Jest?

O Vitest compartilha a API do Jest (`describe`, `it`, `expect`, `vi`) mas executa dentro do ecossistema Vite. Isso oferece três vantagens concretas para este projeto:

1. **Reutilização da configuração Vite**: os mesmos plugins, aliases (`@/`) e resolução de módulos configurados em `next.config.ts` e `vitest.config.ts` são respeitados nos testes, eliminando discrepâncias de transpilação.
2. **Performance**: o Vite executa transformações incrementais, acelerando o ciclo de feedback em repositórios grandes.
3. **Globals opcionais**: com `globals: true` na configuração, não é necessário importar `describe`/`it`/`expect` em cada arquivo, mantendo os arquivos de teste concisos.

### Por que MSW em vez de mocks manuais (`fetch` ou `axios`)?

MSW intercepta as requisições no nível da rede, após o código de produção já ter construído a URL, adicionado os headers e chamado `fetch`. Isso significa que os testes exercem o código real de `src/lib/api.ts` — incluindo a construção de query strings, o tratamento de resposta e o lançamento de erros — sem nenhuma substituição de módulo. A alternativa (mockar `fetch` diretamente) esconderia esses detalhes e reduziria a fidelidade dos testes.

---

## Arquitetura da Suíte de Testes

```
src/test/
├── setup.ts                          # Setup global executado antes de todos os testes
├── utils.tsx                         # Helpers renderWithQuery e createQueryWrapper
├── mocks/
│   ├── handlers.ts                   # Definição dos handlers MSW com dados fixos
│   └── server.ts                     # Instância do servidor MSW para Node
├── lib/
│   ├── api.test.ts                   # Testes da camada de API (15 casos)
│   └── utils.test.ts                 # Testes do utilitário cn() (8 casos)
├── hooks/
│   ├── use-dashboard.test.tsx        # Testes dos hooks do dashboard (11 casos)
│   └── use-movies.test.tsx           # Testes do hook useMovies (8 casos)
├── components/
│   ├── dashboard/
│   │   ├── dashboard-card.test.tsx         # (4 casos)
│   │   ├── panel-status.test.tsx           # (10 casos)
│   │   ├── multiple-winners-panel.test.tsx # (6 casos)
│   │   ├── top-studios-panel.test.tsx      # (7 casos)
│   │   ├── producer-intervals-panel.test.tsx # (7 casos)
│   │   └── winners-by-year-panel.test.tsx  # (10 casos)
│   ├── layout/
│   │   └── navbar.test.tsx                 # (8 casos)
│   └── movies/
│       └── movies-list.test.tsx            # (16 casos)
└── app/
    ├── dashboard-page.test.tsx             # (7 casos)
    └── movies-page.test.tsx               # (5 casos)
```

A organização espelha exatamente a estrutura de `src/`, tornando trivial localizar o arquivo de teste correspondente a qualquer módulo de produção.

---

## Configuração e Setup Global

### `vitest.config.ts`

```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    globals: true,
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
```

**Decisões relevantes:**

- `environment: "jsdom"`: configura o jsdom como ambiente DOM global, provendo `document`, `window`, `navigator` e o restante da Web API para todos os testes.
- `setupFiles`: aponta para o arquivo de setup que é executado uma única vez antes de qualquer suite, inicializando o servidor MSW e os matchers do jest-dom.
- `globals: true`: torna `describe`, `it`, `expect`, `vi`, `beforeEach`, etc. globalmente disponíveis, sem necessidade de importações explícitas em cada arquivo.
- `alias @/`: garante que o mesmo caminho absoluto usado no código de produção (`@/src/lib/api`) funcione identicamente nos testes.

### `src/test/setup.ts`

```typescript
import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "./mocks/server";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  cleanup();
});
afterAll(() => server.close());
```

Três comportamentos críticos são estabelecidos aqui:

1. **`server.listen({ onUnhandledRequest: "error" }`**: qualquer requisição HTTP que não corresponda a um handler registrado faz o teste falhar imediatamente com um erro descritivo. Isso atua como uma rede de segurança — se um componente fizer uma chamada inesperada à API (por exemplo, por um bug ou por acesso a um endpoint não documentado), o teste quebra em vez de silenciosamente receber `undefined`.

2. **`server.resetHandlers()`**: após cada teste, os handlers sobrescritos via `server.use()` são removidos, restaurando o conjunto padrão. Isso garante isolamento total entre testes que injetam erros ou respostas customizadas.

3. **`cleanup()`**: desmonta os componentes renderizados pelo Testing Library após cada teste, prevenindo vazamento de estado entre testes que compartilham o mesmo DOM virtual.

---

## Infraestrutura de Mock de Rede (MSW)

### Dataset fixo

O arquivo `src/test/mocks/handlers.ts` define um dataset canônico de três filmes:

| ID | Título | Ano | Vencedor |
|---|---|---|---|
| 1 | Bolero | 1984 | `true` |
| 2 | Rambo: First Blood Part II | 1985 | `false` |
| 3 | Howard the Duck | 1986 | `true` |

Esse conjunto mínimo foi projetado para exercitar todos os cenários relevantes:
- Pelo menos dois vencedores (para testar contagem de badges).
- Pelo menos um não-vencedor (para testar ausência de badge).
- Anos distintos (para testar filtros por ano).
- Uma mistura de `winner: true` e `winner: false` (para testar filtros booleanos).

### Endpoints mapeados

```
GET /movies                            → filtragem por winner e year, resposta paginada
GET /movies/yearsWithMultipleWinners   → [{year: 1986, winnerCount: 2}, {year: 1990, winnerCount: 3}]
GET /movies/studiosWithWinCount        → 4 estúdios em ordem decrescente de vitórias
GET /movies/maxMinWinIntervalForProducers → Joel Silver (min:1) e Matthew Vaughn (max:13)
GET /movies/winnersByYear              → Bolero para year=1984, [] para outros anos
```

O handler de `/movies/studiosWithWinCount` retorna intencionalmente **4** estúdios (Columbia, Paramount, Warner, Universal), embora o componente `TopStudiosPanel` exiba no máximo 3. Esse dado extra é essencial para o teste que valida o limite `TOP_COUNT=3` — sem o 4º estúdio no mock, não seria possível verificar que Universal Pictures é corretamente excluído da renderização.

### Override de handlers em testes individuais

Testes que precisam simular falhas ou respostas especiais utilizam `server.use()` dentro do próprio caso de teste:

```typescript
// Simula falha de rede
server.use(
  http.get("https://challenge.outsera.tech/api/movies/studiosWithWinCount",
    () => HttpResponse.error()
  )
);

// Simula lista vazia
server.use(
  http.get("https://challenge.outsera.tech/api/movies/yearsWithMultipleWinners",
    () => HttpResponse.json({ years: [] })
  )
);

// Simula latência para capturar estado intermediário
server.use(
  http.get("https://challenge.outsera.tech/api/movies/winnersByYear",
    async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
      return HttpResponse.json([]);
    }
  )
);
```

Como o `afterEach` chama `server.resetHandlers()`, esses overrides são automaticamente descartados após o teste, sem risco de contaminar testes subsequentes.

---

## Helpers e Utilitários de Teste

### `renderWithQuery(ui: ReactElement): RenderResult`

Encapsula o componente testado dentro de um `QueryClientProvider` com configurações otimizadas para testes:

```typescript
const client = new QueryClient({
  defaultOptions: {
    queries: { retry: false, gcTime: 0 },
  },
});
```

- **`retry: false`**: o React Query não tenta repetir requisições falhas, tornando os testes de erro determinísticos e rápidos.
- **`gcTime: 0`**: o cache é descartado imediatamente, evitando que dados de um teste vazem para outro através do cache do React Query.

Usado em todos os testes de componentes que consomem hooks de dados (`MultipleWinnersPanel`, `TopStudiosPanel`, `MoviesList`, etc.) e nas páginas completas.

### `createQueryWrapper(): ComponentType`

Equivalente funcional de `renderWithQuery`, mas retorna um componente wrapper em vez de chamar `render` diretamente. Projetado para uso com `renderHook` do Testing Library:

```typescript
const { result } = renderHook(() => useMovies({ page: 0 }), {
  wrapper: createQueryWrapper(),
});
```

A separação entre `renderWithQuery` (para componentes) e `createQueryWrapper` (para hooks) segue a distinção da API do Testing Library e evita conflitos de instância do `QueryClient`.

---

## Cobertura por Camada

### Camada de API — `src/lib/api.ts`

**Arquivo:** `src/test/lib/api.test.ts` | **15 casos de teste**

A camada de API contém a função `request()` (genérica) e o objeto `moviesApi` com cinco métodos especializados. Os testes validam o contrato da API sem mockar `fetch` — as requisições reais passam pelo MSW e as respostas são processadas pelo código de produção.

#### Casos cobertos

**`moviesApi.list`** (6 casos):
- Presença de todos os campos obrigatórios da estrutura `Page<Movie>` (`content`, `totalElements`, `totalPages`, `number`, `size`, `first`, `last`).
- Presença de todos os campos obrigatórios de cada `Movie` (`id`, `year`, `title`, `studios`, `producers`, `winner`).
- Filtragem por `winner=true`: todos os filmes retornados devem ter `winner === true`.
- Filtragem por `winner=false`: todos os filmes retornados devem ter `winner === false`.
- Filtragem por `year=1984`: todos os filmes retornados devem ter `year === 1984`.
- Lista vazia para `year=1800` (ano inexistente no dataset).

**`moviesApi.yearsWithMultipleWinners`** (2 casos):
- Retorno de ao menos um ano.
- Cada entrada contém `year` (number) e `winnerCount` (number > 1).

**`moviesApi.studiosWithWinCount`** (3 casos):
- Retorno de ao menos um estúdio.
- Cada entrada contém `name` (string) e `winCount` (number).
- Estúdios em ordem decrescente de `winCount` — validado comparando o array retornado com sua versão ordenada.

**`moviesApi.maxMinWinIntervalForProducers`** (4 casos):
- Retorno de arrays `min` e `max`.
- Cada entrada contém `producer`, `interval`, `previousWin` e `followingWin`.
- **Invariante matemática**: `followingWin - previousWin === interval` para cada entrada. Esse teste é especialmente valioso por detectar inconsistências nos dados da API.
- `min[0].interval <= max[0].interval`.

**`moviesApi.winnersByYear`** (3 casos):
- Retorno de vencedores para `year=1984`.
- Array vazio para `year=2099`.
- Verificação específica: `result[0].title === "Bolero"` e `result[0].year === 1984`.

---

### Camada de Utilitários — `src/lib/utils.ts`

**Arquivo:** `src/test/lib/utils.test.ts` | **8 casos de teste**

A função `cn()` combina `clsx` (processamento de argumentos condicionais) com `tailwind-merge` (resolução de conflitos entre classes Tailwind). Os testes cobrem o comportamento completo dessa composição.

#### Casos cobertos

| Caso | Entrada | Saída esperada |
|---|---|---|
| Concatenação básica | `cn("foo", "bar")` | `"foo bar"` |
| Valores falsy | `cn("foo", false && "bar", undefined, null, "baz")` | `"foo baz"` |
| Conflito Tailwind — última vence | `cn("px-2", "px-4")` | `"px-4"` |
| Variantes não conflitantes preservadas | `cn("px-2 py-1", "px-4")` | contém `py-1` e `px-4`, não contém `px-2` |
| Array de classes | `cn(["foo", "bar"])` | `"foo bar"` |
| Objeto condicional | `cn({ foo: true, bar: false, baz: true })` | `"foo baz"` |
| Sem argumentos | `cn()` | `""` |
| Variantes arbitrárias | `cn("text-[14px]", "text-[16px]")` | `"text-[16px]"` |

O teste de variantes arbitrárias (`text-[14px]` vs `text-[16px]`) é particularmente relevante: o `tailwind-merge` deve ser capaz de reconhecer e resolver conflitos mesmo em valores que não fazem parte do sistema de design padrão do Tailwind.

---

### Hooks — `use-dashboard` e `use-movies`

#### `src/test/hooks/use-dashboard.test.tsx` | 11 casos

Todos os hooks são testados com `renderHook` + `createQueryWrapper()`. Esse padrão garante que o hook execute dentro de um `QueryClientProvider` real, exercitando o ciclo de vida completo do React Query (loading → fetching → success/error).

**`useMultipleWinners`** (3 casos):
- Estado inicial: `isLoading === true` e `data === undefined` antes da resposta.
- Sucesso: `data.years` não vazio, com campos `year` e `winnerCount`.
- Falha: `isError === true` e `data === undefined` quando o MSW retorna erro.

**`useTopStudios`** (2 casos):
- Sucesso: `data.studios` não vazio.
- Falha: `isError === true`.

**`useProducerIntervals`** (2 casos):
- `data.min` e `data.max` são arrays.
- Cada entrada do array `min` contém `producer`, `interval`, `previousWin`, `followingWin`.

**`useWinnersByYear`** (4 casos):
- `year=null`: `fetchStatus === "idle"`, `isLoading === false`, `data === undefined` — confirma que a prop `enabled: year !== null` funciona corretamente.
- `year=1984` (válido): `fetchStatus === "fetching"` imediatamente após montagem, seguido de `isSuccess === true` com dados.
- `year=2099` (sem resultados): `isSuccess === true` com `data.length === 0`.
- Falha: `isError === true`.

#### `src/test/hooks/use-movies.test.tsx` | 8 casos

**`useMovies`** (8 casos):
- Estado inicial de loading.
- Dados paginados: `content.length > 0` e `totalPages >= 1`.
- **Isolamento de cache por parâmetros**: duas instâncias do hook com parâmetros distintos (`winner: true` e `winner: false`) em `QueryClient`s separados retornam dados coerentes com seus filtros. Esse teste documenta e valida que a `queryKey` inclui os parâmetros, garantindo que mudanças de filtro não reutilizem erroneamente o cache de uma consulta anterior.
- Filtro `winner=true`: todos os filmes têm `winner === true`.
- Filtro `winner=false`: todos os filmes têm `winner === false`.
- Filtro por ano.
- **`keepPreviousData`**: ao mudar de `page=0` para `page=99`, `result.current.data` permanece definido (com os dados da página anterior) durante o carregamento. Esse comportamento evita flickering na UI durante a troca de página.
- Falha de rede: `isError === true` e `data === undefined`.

---

### Componentes de Dashboard

#### `DashboardCard` — `src/test/components/dashboard/dashboard-card.test.tsx` | 4 casos

`DashboardCard` é um componente de apresentação que envolve um card com título, ícone e conteúdo. Por não ter lógica de negócio ou chamadas assíncronas, os testes são síncronos e focam em:

- Renderização do título.
- Renderização dos `children`.
- Ícone com `aria-hidden="true"` (boa prática de acessibilidade: ícones decorativos não devem ser lidos por leitores de tela).
- Co-localização de título e ícone no mesmo elemento pai (`CardHeader`).

O teste de `aria-hidden` é significativo: valida que a implementação segue a convenção de acessibilidade, e se o atributo for removido no futuro, o teste detecta a regressão.

#### `PanelStatus` — `src/test/components/dashboard/panel-status.test.tsx` | 10 casos

`PanelStatus` é o componente de estado compartilhado por todos os painéis do dashboard. Ele exibe skeletons durante loading, mensagens de erro, mensagens de lista vazia ou o conteúdo real. Por ser reutilizado em todos os painéis, sua suíte de testes é a mais detalhada entre os componentes de apresentação.

**Estado de loading** (4 casos):
- Container com `aria-busy="true"` presente — permite que tecnologias assistivas saibam que o conteúdo está carregando.
- `children` não renderizados durante loading.
- 3 skeletons por padrão (valor de `rows` padrão).
- N skeletons quando `rows={5}` é passado.

**Estado de erro** (2 casos):
- Mensagem "No data could be loaded" presente.
- `children` não renderizados no estado de erro.

**Estado vazio** (2 casos):
- Mensagem "No data available" presente.
- `children` não renderizados no estado vazio.

**Estado de sucesso e precedência** (2 casos):
- `children` renderizados quando `isLoading=false`, `isError=false` e `isEmpty` não passado.
- `isLoading` tem precedência sobre `isError` — quando ambos são `true`, o skeleton é exibido, não a mensagem de erro.
- `isError` tem precedência sobre `isEmpty` — quando ambos são `true`, a mensagem de erro é exibida, não a mensagem de vazio.

Os dois casos de precedência são particularmente importantes porque o React Query pode momentaneamente expor combinações de estados que parecem contraditórias (por exemplo, `isError=true` e `isEmpty=true` se o componente foi montado com dados em cache que foram invalidados).

#### `MultipleWinnersPanel` — `src/test/components/dashboard/multiple-winners-panel.test.tsx` | 6 casos

Testa o painel que exibe anos com múltiplos vencedores. Por ser um componente com dados assíncronos, todos os testes de conteúdo usam `waitFor`.

- Skeleton durante carregamento.
- Anos `1986` e `1990` visíveis após carregamento.
- Contagens `2` e `3` visíveis após carregamento.
- Cabeçalhos de tabela `Year` e `Win Count`.
- Erro de API: mensagem "No data could be loaded" via `server.use()`.
- Lista vazia: mensagem "No data available" quando API retorna `{ years: [] }`.

#### `TopStudiosPanel` — `src/test/components/dashboard/top-studios-panel.test.tsx` | 7 casos

O aspecto mais crítico testado neste painel é o **limite de exibição de 3 estúdios**.

```typescript
it("renderiza no máximo 3 estúdios mesmo com mais na API", async () => {
  renderWithQuery(<TopStudiosPanel />);
  await waitFor(() =>
    expect(screen.getByText("Columbia Pictures")).toBeInTheDocument()
  );
  expect(screen.getByText("Paramount Pictures")).toBeInTheDocument();
  expect(screen.getByText("Warner Bros.")).toBeInTheDocument();
  // O 4º estúdio do handler não deve aparecer
  expect(screen.queryByText("Universal Pictures")).not.toBeInTheDocument();
});
```

O handler MSW retorna 4 estúdios deliberadamente para que este teste possa verificar que `Universal Pictures` (4º) é excluído. A linha `.slice(0, TOP_COUNT)` em `top-studios-panel.tsx` é o que passa nesse teste — se `TOP_COUNT` for alterado ou o slice for removido, o teste falha.

Outros casos: badges de ranking `1`, `2`, `3`; contagem de vitórias (`7` para Columbia); cabeçalhos `Name` e `Win Count`; erro de API; lista vazia.

#### `ProducerIntervalsPanel` — `src/test/components/dashboard/producer-intervals-panel.test.tsx` | 7 casos

Este painel exibe duas tabelas — mínimo e máximo de intervalos entre vitórias de produtores. Os testes verificam as duas seções independentemente, usando os dados específicos configurados no handler (`Joel Silver` com intervalo 1 e `Matthew Vaughn` com intervalo 13).

- Skeleton durante carregamento.
- Seções `Minimum` e `Maximum` presentes.
- Cabeçalhos de tabela (`Producer`, `Interval`, `Previous Year`, `Following Year`) — verificados com `getAllByText` pois os cabeçalhos aparecem em ambas as tabelas.
- Dados do menor intervalo: `Joel Silver`, `1990`, `1991`, `1`.
- Dados do maior intervalo: `Matthew Vaughn`, `2002`, `2015`, `13`.
- Erro de API.
- Lista vazia (`{ min: [], max: [] }`).

#### `WinnersByYearPanel` — `src/test/components/dashboard/winners-by-year-panel.test.tsx` | 10 casos

Este é o painel de maior complexidade comportamental, pois envolve entrada do usuário, validação e múltiplos estados dependentes de ação.

**Estado inicial** (3 casos):
- Mensagem "Search by year" visível antes de qualquer busca.
- Input com `type="number"` (acessível via `aria-label="Year"`).
- Botão `Search` presente.

**Busca** (4 casos):
- Resultado exibido para `1984` (Bolero visível).
- Colunas `ID` e `Title` na tabela de resultados.
- Mensagem "No winners in 2099" para ano sem resultados.
- Mensagem "Unable to fetch winners" quando API falha.

**Validação de entrada** (3 casos):
- Ano `0` não dispara busca — mensagem inicial permanece.
- Campo vazio não dispara busca.
- Botão `Search` desabilitado durante o fetching:

```typescript
it("botão fica desabilitado enquanto está buscando", async () => {
  server.use(
    http.get("https://challenge.outsera.tech/api/movies/winnersByYear",
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 150));
        return HttpResponse.json([]);
      }
    )
  );
  const user = userEvent.setup();
  renderWithQuery(<WinnersByYearPanel />);
  await user.type(screen.getByLabelText("Year"), "1984");
  // Inicia o click mas não aguarda — precisamos checar antes da resposta
  user.click(screen.getByRole("button", { name: "Search" }));
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "Search" })).toBeDisabled()
  );
});
```

O delay de 150ms cria uma janela de tempo durante a qual `isFetching=true` pode ser observado. O `user.click()` é chamado sem `await` para que o estado intermediário seja verificado antes de a resposta chegar. Esse padrão é necessário porque o comportamento de desabilitar o botão durante o fetching é uma funcionalidade crítica de UX que não seria visível em um teste que aguarda a resolução completa.

---

### Componente de Layout — `Navbar`

**Arquivo:** `src/test/components/layout/navbar.test.tsx` | 8 casos

O `Navbar` usa `usePathname` e `Link` do `next/navigation`, que não funcionam no ambiente jsdom. A solução é mockar esses módulos do Next.js:

```typescript
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/"),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));
```

O mock de `usePathname` retorna um `vi.fn()`, permitindo que cada teste altere o valor retornado via `vi.mocked(usePathname).mockReturnValue("/movies")`, sem precisar re-renderizar com configurações diferentes.

#### Casos cobertos

- Nome da aplicação ("Golden Raspberry Awards") renderizado.
- Dois links de navegação (`Dashboard` e `Movies List`) presentes.
- `href` correto para cada link (`/` e `/movies`).
- `aria-current="page"` no link Dashboard quando `pathname === "/"`.
- `aria-current="page"` no link Movies List quando `pathname === "/movies"`.
- Nenhum link com `aria-current` em rota desconhecida.
- Elemento `<nav>` acessível (verificado via `getByRole("navigation")`).

O teste de `aria-current` documenta a convenção de acessibilidade de indicar a página ativa para leitores de tela e valida a lógica de comparação de `pathname` — incluindo o caso especial onde o Dashboard usa `pathname === "/"` (correspondência exata) enquanto Movies List usa `pathname.startsWith("/movies")` (correspondência de prefixo).

---

### Componente de Listagem — `MoviesList`

**Arquivo:** `src/test/components/movies/movies-list.test.tsx` | 16 casos

`MoviesList` é o componente mais complexo da aplicação: gerencia filtros via URL (`useSearchParams`), navegação programática (`useRouter`), paginação, estados de loading/erro/vazio e renderização condicional de badges. Consequentemente, possui a maior suíte de testes.

Como `useSearchParams` e `useRouter` não funcionam em jsdom, eles são mockados com funções controladas:

```typescript
const mockPush = vi.fn();
const mockSearchParamsGet = vi.fn((_key: string): string | null => null);

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: mockSearchParamsGet,
    toString: () => "",
  }),
  useRouter: () => ({ push: mockPush }),
}));

beforeEach(() => {
  mockPush.mockClear();
  mockSearchParamsGet.mockReset().mockReturnValue(null);
});
```

O `mockSearchParamsGet` permite simular diferentes estados da URL por teste:

```typescript
// Simula ?winner=true na URL
mockSearchParamsGet.mockImplementation((key: string) =>
  key === "winner" ? "true" : null
);
```

#### Grupos de casos

**Carregamento** (3 casos): skeleton durante loading; filmes visíveis após carregamento; cabeçalhos `Year`, `Title`, `Winner`.

**Vencedores** (2 casos): 2 badges `Yes` para os 2 filmes vencedores do dataset; nenhum badge para não-vencedores.

**Erro e vazio** (2 casos): `role="alert"` com mensagem de erro; mensagem "No movies found" para lista vazia.

**Filtros** (6 casos):
- Presença dos controles de filtro.
- `mockPush` chamado com URL contendo `year=1984` ao submeter o filtro.
- `mockPush` não inclui `year=` para ano inválido (zero).
- Ausência do botão `Clear filters` sem filtros ativos.
- Presença do botão `Clear filters` quando `winner=true` está na URL.
- `mockPush("?")` ao clicar em `Clear filters`.

**Paginação** (5 casos):
- Controles de paginação (`Página anterior` e `Next page`) presentes.
- Botão anterior desabilitado na página 1.
- Botão próxima desabilitado quando `last=true` (única página).
- Navegação para `page=2` ao clicar em próxima (com handler sobrescrito retornando `totalPages=2, last=false`).
- Contagem de filmes exibida (texto contendo "filmes").

---

### Páginas

#### `DashboardPage` — `src/test/app/dashboard-page.test.tsx` | 7 casos

Testa a página `/` (`src/app/page.tsx`) como um todo integrado. Como a página renderiza diretamente os quatro painéis do dashboard, os testes verificam tanto a estrutura estática quanto os dados carregados assincronamente.

- Heading `Dashboard` presente.
- Descrição "Nominees and Winners of the Worst Picture Category" presente.
- Quatro painéis identificados pelos seus títulos: `List year with multiple winners`, `Top 3 studios with winners`, `Producers with longest and shortest intervals`, `List movie winners by year`.
- Verificação integrada de dados: após carregamento, `1986` (anos múltiplos vencedores), `Columbia Pictures` (top estúdios) e `Joel Silver` (intervalos) são visíveis simultaneamente.

#### `MoviesPage` — `src/test/app/movies-page.test.tsx` | 5 casos

Testa a página `/movies` (`src/app/movies/page.tsx`). Requer mock de `next/navigation` pois a página renderiza `MoviesList` que usa `useSearchParams`.

- Heading `Movies List` presente.
- Descrição "All nominees and winners" presente.
- Controles de filtro (`Year` e `Filter by winner`) visíveis.
- Tabela de filmes com `Bolero` visível após carregamento.
- Controles de paginação presentes.

---

## Padrões e Estratégias Especiais

### 1. Testes assíncronos com `waitFor`

Componentes que consomem hooks de dados são sempre testados com `waitFor` para aguardar a resolução das promessas:

```typescript
it("renderiza anos com múltiplos vencedores após carregar", async () => {
  renderWithQuery(<MultipleWinnersPanel />);
  await waitFor(() => expect(screen.getByText("1986")).toBeInTheDocument());
  expect(screen.getByText("1990")).toBeInTheDocument();
});
```

O `waitFor` aguarda até que a asserção passe (com timeout configurável) ou lança o último erro recebido. As asserções subsequentes ao `await waitFor(...)` não precisam ser envolvidas individualmente porque o estado já foi estabilizado.

### 2. Interceptação de estado transitório com delay

Para testar estados intermediários (como `isFetching=true`), um handler com delay artificial é injetado:

```typescript
server.use(
  http.get("...", async () => {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return HttpResponse.json([]);
  })
);
user.click(button); // sem await
await waitFor(() => expect(button).toBeDisabled());
```

### 3. Mock de módulos do Next.js

`usePathname`, `useSearchParams`, `useRouter` e `Link` do pacote `next/navigation` são mockados via `vi.mock()`, pois dependem de contexto de roteamento (App Router) que não existe no jsdom.

A estratégia preferida é criar mocks funcionais suficientemente próximos do comportamento real para que o teste seja significativo, mas sem a complexidade de instanciar um roteador completo.

### 4. Validação de invariantes de dados

O teste `followingWin = previousWin + interval` em `api.test.ts` vai além da verificação de tipos e valida uma relação matemática entre campos:

```typescript
it("followingWin = previousWin + interval", async () => {
  const result = await moviesApi.maxMinWinIntervalForProducers();
  for (const entry of [...result.min, ...result.max]) {
    expect(entry.followingWin - entry.previousWin).toBe(entry.interval);
  }
});
```

Esse padrão detecta inconsistências que passariam desapercebidas em testes de tipo puro.

### 5. Verificação negativa de presença no DOM

Testes que validam **ausência** de elementos usam `queryBy*` (que retorna `null` em vez de lançar erro) combinado com `.not.toBeInTheDocument()`:

```typescript
expect(screen.queryByText("Universal Pictures")).not.toBeInTheDocument();
expect(screen.queryByTestId("child")).not.toBeInTheDocument();
```

Usar `getBy*` para verificar ausência lançaria um erro antes da asserção, com mensagem confusa.

---

## Métricas da Suíte

| Dimensão | Valor |
|---|---|
| Arquivos de teste | 14 |
| Casos de teste | ~116 |
| Camadas cobertas | API, Utilitários, Hooks, Componentes, Páginas |
| Endpoints mockados | 5 |
| Componentes testados | 10 |
| Hooks testados | 5 |

**Distribuição por tipo de teste:**

| Tipo | Arquivos | Casos |
|---|---|---|
| Testes de camada de API/utilitários | 2 | 23 |
| Testes de hooks | 2 | 19 |
| Testes de componentes | 8 | 62 |
| Testes de páginas | 2 | 12 |

---

## Pontos Fortes

1. **Isolamento de rede completo**: nenhum teste faz chamadas HTTP reais. O MSW intercepta tudo na camada de rede, sem modificar o código de produção ou substituir `fetch`.

2. **Testes orientados ao comportamento**: os testes consultam o DOM via seletores semânticos (`getByRole`, `getByLabelText`, `getByText`) em vez de seletores de implementação (classes CSS, IDs internos). Isso torna a suíte resiliente a refatorações de estilo.

3. **Cobertura de estados extremos**: cada componente assíncrono tem casos para loading, sucesso, erro e vazio. A cobertura de precedência de estados em `PanelStatus` garante que o componente base seja confiável para todos os painéis que o utilizam.

4. **Isolamento entre testes**: a combinação de `cleanup()`, `server.resetHandlers()` e `QueryClient` por render garante que o estado não vaze entre testes, mesmo quando executados em paralelo.

5. **Validação de acessibilidade inline**: os testes verificam `aria-busy`, `aria-current`, `aria-hidden` e `role="navigation"` como parte dos testes funcionais, sem ferramentas adicionais.

6. **Documentação de contratos**: os testes de API e hooks documentam explicitamente a forma dos dados esperados, servindo como especificação executável do contrato entre frontend e backend.

---

## Lacunas Identificadas

1. **Cobertura de código não medida por padrão**: o comando `test:coverage` existe no `package.json`, mas não há configuração de threshold mínimo de cobertura no `vitest.config.ts`. Sem esse gate, é possível que código não coberto seja introduzido sem alerta no pipeline de CI.

2. **Ausência de testes de acessibilidade automatizados**: embora os testes verifiquem atributos ARIA manualmente, a suíte não utiliza ferramentas como `axe-core` (via `@axe-core/react` ou `vitest-axe`) para auditorias automáticas de acessibilidade. Isso significa que regressões em contraste de cor, ordem de foco ou estrutura de landmarks não seriam capturadas.

3. **Componentes UI primitivos sem testes**: os componentes de `src/components/ui/` (Badge, Button, Input, Skeleton, Table, etc.) não possuem testes próprios. São componentes derivados de Radix UI e shadcn/ui — o risco é baixo, mas customizações futuras podem introduzir regressões não detectadas.

4. **Ausência de testes E2E (ponta a ponta)**: a suíte cobre componentes em isolamento e integração parcial (componentes + hooks + MSW), mas não há testes que exercitem a aplicação real em um navegador contra a API de produção ou staging. Ferramentas como Playwright ou Cypress cobririam fluxos completos, incluindo navegação entre páginas, hidratação do Next.js e comportamento de SSR.

5. **Testes de responsividade ausentes**: nenhum teste verifica o comportamento do layout em viewports mobile. `jsdom` não implementa CSS Layout, então breakpoints responsivos não podem ser verificados via Testing Library puro.

6. **Cenários de concorrência de requisições**: o comportamento de `keepPreviousData` é testado, mas cenários mais complexos — como múltiplas requisições paralelas chegando fora de ordem (race conditions) — não são cobertos.

---

## Recomendações para Escalar a Suíte

### Curto prazo

**1. Configurar threshold de cobertura**

Adicionar ao `vitest.config.ts`:
```typescript
coverage: {
  provider: "v8",
  thresholds: {
    statements: 80,
    branches: 75,
    functions: 80,
    lines: 80,
  },
  exclude: ["src/components/ui/**", "src/test/**"],
}
```

**2. Executar testes no pipeline de CI**

Garantir que `vitest run` (modo não-interativo) e `vitest run --coverage` façam parte do pipeline de integração contínua, bloqueando merges quando testes falham.

**3. Adicionar testes de acessibilidade com axe**

Instalar `vitest-axe` e adicionar verificações nas páginas e componentes críticos:
```typescript
import { axe } from "vitest-axe";

it("página não tem violações de acessibilidade", async () => {
  const { container } = renderWithQuery(<DashboardPage />);
  await waitFor(() => expect(screen.getByText("1986")).toBeInTheDocument());
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Médio prazo

**4. Testes dos componentes UI primitivos**

Criar testes para variantes customizadas em `src/components/ui/badge.tsx` e `src/components/ui/pagination.tsx` — os únicos que possuem lógica própria além das configurações base do shadcn/ui.

**5. Ampliar testes de filtros com múltiplos parâmetros combinados**

Atualmente, os testes de filtro em `MoviesList` verificam cada filtro isoladamente. Adicionar casos com `year + winner` combinados (por exemplo, `?year=1984&winner=true`) para validar o comportamento correto da URL gerada.

**6. Testes de página de erro (404, 500)**

Se o projeto implementar páginas de erro do Next.js (`not-found.tsx`, `error.tsx`), adicionar testes para garantir que a experiência de falha é tratada adequadamente.

### Longo prazo

**7. Suíte E2E com Playwright**

Para cobrir o ciclo completo — roteamento do Next.js, hidratação, comportamento real do browser — implementar uma suíte E2E com Playwright contra um ambiente de staging com a API real. Os testes E2E devem focar nos fluxos críticos do usuário: carregar o dashboard, filtrar filmes, paginar resultados.

**8. Testes de contrato (contract testing)**

Se a API do backend evoluir independentemente, implementar contract tests (por exemplo, com Pact) para detectar automaticamente quando uma alteração no backend quebraria o frontend, sem necessidade de testes de integração completos.

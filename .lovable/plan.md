## Objetivo

Melhorar a responsividade em telas muito pequenas (≤360px) nas páginas **Clientes**, **PagamentosHosting** e **Gastos**, mantendo um layout profissional com melhor aproveitamento de espaço.

## 1. `src/pages/Clientes.tsx`

**Header (botão "Novo Cliente" ampliando o espaço):**
- Trocar `flex items-center justify-between` por `flex flex-col sm:flex-row sm:items-center justify-between gap-3`.
- Título: `text-2xl sm:text-3xl`.
- Botão "Novo Cliente": `w-full sm:w-auto` (no mobile vira full-width abaixo do título em vez de empurrar o layout).
- DialogContent: `w-[calc(100vw-1rem)] sm:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6`.

**Grid de clientes (2 lado a lado no mobile):**
- Trocar `grid gap-4 md:grid-cols-2 lg:grid-cols-3` por `grid gap-3 grid-cols-2 lg:grid-cols-3`.

**Cards mais compactos (blocos menores):**
- `CardHeader`: padding reduzido `p-3 sm:p-4`.
- Avatar: `h-10 w-10 sm:h-12 sm:w-12`.
- `CardTitle`: `text-sm sm:text-base` com `line-clamp-1` para nomes longos.
- `CardContent`: `p-3 sm:p-4 pt-0 space-y-2`.
- Textos de telefone/email/endereço: `text-xs sm:text-sm`, com `truncate` em todos.
- Ações: empilhar verticalmente no mobile — botão "Ver Detalhes" em linha própria (`w-full`), e Editar + Eliminar lado a lado abaixo (`grid grid-cols-2 gap-2`). Em `sm:` voltar ao layout horizontal atual.
- Reduzir tamanho dos ícones e usar `size="sm"` consistentemente.

## 2. `src/pages/Gastos.tsx`

**Cards de estatísticas:** `grid gap-3 grid-cols-1 sm:grid-cols-3` (atualmente `md:grid-cols-3` deixa empilhado em telas médias-baixas).

**Lista de gastos (item atual estoura no mobile pois usa `flex items-center justify-between` com muito conteúdo):**
- Trocar wrapper do item por `flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4`.
- Cabeçalho do item: permitir quebra — `flex flex-wrap items-center gap-2`, título com `text-sm sm:text-base`, badge com `text-xs`.
- Metadados: `flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm`.
- Bloco de valor + ações: alinhar com `flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto`. Valor `text-base sm:text-lg`.
- Botões de ação: `size="sm"` (em vez de `size="icon"` h-10), `h-8 w-8`.

**Card "Filtros":** `CardContent` com `p-4`; já está OK no grid.

## 3. `src/pages/PagamentosHosting.tsx`

**Filtro de status:** `w-[200px]` → `w-full sm:w-[200px]`.

**Cards de pagamento (grid interno estoura em telas pequenas):**
- `CardHeader` em mobile: já tem `flex items-start justify-between`, OK; reduzir padding `p-4`.
- Grid de detalhes: `grid grid-cols-2 md:grid-cols-4 gap-4` → `grid grid-cols-2 md:grid-cols-4 gap-3` com `text-xs` consistente nos labels, valores `text-sm`.
- Botões de ação: `flex flex-wrap gap-2` (já existe) — garantir que cada Button use `size="sm"` e `flex-1 sm:flex-initial` para preencher quando quebrar linha.
- Lista de pagamentos: passar wrapper externo de `grid gap-4` para `grid gap-3`.

**Form Dialog (já em popper z-[100]):** confirmar `w-[calc(100vw-1rem)] sm:max-w-lg` já aplicado; nada a mudar.

## Notas

- Mudanças puramente de layout/CSS Tailwind. Sem alterar lógica de dados, queries ou handlers.
- Sem mexer em PDFs, schema ou business logic.
- Sem mexer no `ServiceForm`, `GastoForm` interno (já refeitos antes), apenas containers das páginas.

## Plano: Destravar formulários (Gastos, Pagamentos Hosting) e reforçar responsividade mobile

### Problema
Nos diálogos de **Novo Gasto** e **Registar Pagamento de Domínio/Hospedagem**, os campos Select (Cliente, Categoria, Tipo, Forma de Pagamento, Período) ficam travados e não abrem/selecionam — exatamente o mesmo bug que já corrigimos no `ServiceForm` (Radix Select dentro de Dialog sem `position="popper"` e sem controle explícito de `value`/`onValueChange`).

Em telas pequenas, alguns diálogos extrapolam a largura e os botões/labels ficam cortados.

### Correções

**1. `src/components/gastos/GastoForm.tsx`**
- Adicionar `position="popper"` e `className="z-[60] bg-popover"` em todos os `SelectContent` (Categoria, Forma de Pagamento).
- Trocar `defaultValue={field.value}` por `value={field.value}` no `<Select>` controlado pelo `FormField` (garante sincronia com react-hook-form e evita o estado travado).

**2. `src/pages/PagamentosHosting.tsx`** (form inline no Dialog)
- Adicionar `position="popper"` + `className="z-[60] bg-popover"` em todos os `SelectContent` do form (Cliente, Tipo, Período).
- Manter `value=` controlado (já está), apenas garantir que o `Select` tenha `key` quando o diálogo reabrir em modo edição/criação, para resetar corretamente.
- Ao fechar o `Dialog`, garantir limpeza de `document.body.style.pointerEvents` (workaround conhecido do Radix Dialog que às vezes deixa o body com `pointer-events:none`, travando tudo). Implementar via `onOpenChange` chamando `setTimeout(() => { document.body.style.pointerEvents = ''; }, 0)`.

**3. Varredura preventiva nos demais formulários em Dialog**
Aplicar o mesmo padrão (`position="popper"` + `value` controlado) nos Selects de:
- `src/pages/Servicos.tsx` (filtros/seletor de status)
- `src/pages/Gastos.tsx` (filtros)
- `src/pages/admin/GerenciarUsuarios.tsx` (seleção de role/status)
- `src/components/services/PropostaContratoForm.tsx`

E o mesmo workaround de `pointer-events` em qualquer `Dialog` que aninhe Select/Popover/AlertDialog.

**4. Responsividade rigorosa para celulares pequenos (≤360px)**

Padrão a aplicar em todos os `DialogContent` críticos:
- `className="w-[calc(100vw-1rem)] max-w-lg sm:max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6"`
- Trocar grids `md:grid-cols-2` por `grid-cols-1 sm:grid-cols-2` onde ainda houver `md:`.
- Botões de ação: `flex-col sm:flex-row gap-2 w-full` (botão principal `w-full sm:w-auto`).
- Tabelas que hoje quebram no mobile: envolver em `<div className="overflow-x-auto -mx-4 px-4">` ou substituir por cards empilhados em `<640px` (Gastos, PagamentosHosting, Servicos, Clientes).
- Tipografia de títulos: `text-2xl sm:text-3xl` no lugar de `text-3xl` fixo.
- Cards de KPI (Total Pendente etc.): `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3`.

Páginas revisadas para responsividade:
- `Dashboard`, `AdminDashboard`
- `Servicos`, `Gastos`, `PagamentosHosting`
- `Clientes`, `GerenciarUsuarios`
- `MinhaEmpresa` / formulários de perfil

### Detalhes técnicos
- O bug raiz é uma incompatibilidade do `Radix Select` (shadcn) dentro de `Dialog` quando `SelectContent` usa o portal padrão sem `position="popper"`: o overlay do Dialog intercepta cliques e o trigger fica visualmente "travado".
- O workaround `document.body.style.pointerEvents = ''` no `onOpenChange(false)` resolve o caso em que o Radix Dialog não limpa o estilo ao fechar via overlay/ESC enquanto um Select estava aberto.
- Nenhuma migração de banco. Apenas frontend (UI/controle de form). Sem mudança de regras de negócio.

### Fora de escopo
- Não mexer nos PDFs nem na lógica de cálculo.
- Não alterar schema do banco.
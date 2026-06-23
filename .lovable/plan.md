## Plano: Corrigir Selects "presos" no formulário de Cadastro de Serviço

### Problema
No modal "Cadastrar Novo Serviço" os selects **Cliente** e **Categoria do Serviço** não respondem ao clique (ficam "presos"). O erro `React #419` no console é apenas do editor da Lovable e não afeta o app.

A causa real está em `src/components/services/ServiceForm.tsx`:

1. Os componentes `<Select>` são usados de forma **não-controlada** (`onValueChange={(v) => setValue(...)}` sem `value`). Como o `react-hook-form` não recebe o registro do campo via `Controller`, o estado interno do Radix Select fica dessincronizado — ao reabrir o dialog (após editar/cancelar) ele não reabre o popover.
2. `<SelectContent>` não declara `position="popper"`. Dentro de um `DialogContent` com `overflow-y-auto` e `max-h-[90vh]`, o conteúdo do Select pode ser cortado/posicionado fora da viewport, dando a impressão de que o campo não abre.
3. O `RadioGroup` (Tipo de Pagamento) tem o mesmo padrão e deve ser corrigido junto, por consistência.

### Mudanças

**Arquivo: `src/components/services/ServiceForm.tsx`**

- Importar `Controller` de `react-hook-form`.
- Trocar os `<Select>` de **Cliente**, **Categoria do Serviço** e **Status de Pagamento** para usar `<Controller>`, passando `value` e `onValueChange` corretamente conectados ao form.
- Adicionar `position="popper"` em todos os `<SelectContent>` para garantir que o popover apareça por cima do Dialog mesmo com scroll.
- Converter o `<RadioGroup>` de Tipo de Pagamento para usar `<Controller>` também (com `value` controlado), removendo o `defaultValue` solto.
- Garantir que ao editar um serviço existente os Selects mostrem o valor selecionado (hoje só o `setValue` no `useEffect` não reflete visualmente no Radix Select sem `value`).

Nenhuma mudança em banco de dados, PDFs ou outras telas. A correção é puramente no formulário.

### Resultado esperado
- Clicar em **Cliente** abre a lista; clicar em **Categoria** abre a lista e dispara os campos condicionais (Website / Tráfego Pago).
- O Select mantém o item selecionado visível e funciona corretamente tanto em "Cadastrar" quanto em "Editar".
## Objetivo

Permitir emitir Recibos, Faturas, Cotações, Propostas (pontual e contrato mensal), Plano de Vendas e Fatura de Pagamentos Parcelados para destinatários **que não estão cadastrados** no sistema, sem obrigar a criar um cliente fixo. Opcionalmente, o utilizador pode marcar "Salvar como cliente" para registar na base no momento da emissão.

## Como vai funcionar (visão do utilizador)

Em cada formulário de documento haverá um seletor no topo:

```
Destinatário do documento
( ) Cliente cadastrado    (•) Cliente avulso
```

- **Cliente cadastrado** — comportamento atual (escolhe da lista).
- **Cliente avulso** — aparecem campos manuais: Nome / Empresa*, Telefone, Email, Endereço, NUIT (opcional). Esses dados vão direto para o PDF e **não** são gravados em lado nenhum, a menos que…
- Checkbox **"Salvar este cliente na minha base"** — ao emitir/preparar o documento, cria também o registo em `clients` (vinculado ao `user_id` atual).

Validação mínima no modo avulso: Nome obrigatório; Telefone obrigatório; Email se preenchido tem de ser válido. Limites de tamanho aplicados via zod.

## Escopo dos documentos

Aplicar a mesma mecânica em:

1. Recibo (`ReciboPDF` + formulário emissor)
2. Fatura (`FaturaPDF` + formulário emissor)
3. Cotação (`CotacaoPDF` + formulário emissor)
4. Proposta pontual (`PropostaPDF`)
5. Proposta de Contrato Mensal (`PropostaContratoForm` + `PropostaContratoMensalPDF`)
6. **Plano de Vendas** (novo) — documento que lista itens/serviços previstos com valores e totais.
7. **Fatura de Pagamentos Parcelados** (novo) — fatura que mostra o valor total dividido em N parcelas, cada uma com data de vencimento e valor; reaproveita o layout institucional usado nos outros PDFs.

## Mudanças técnicas

### 1. Componente partilhado `RecipientPicker`

Novo `src/components/shared/RecipientPicker.tsx`:

- Props: `clients`, `value: { mode: 'registered' | 'manual', clientId?, manual?: {nome,telefone,email,endereco,nuit}, saveToBase: boolean }`, `onChange`.
- Renderiza Tabs/RadioGroup + Select de cliente OU campos manuais + checkbox "Salvar na base".
- Validação zod local exposta como `validate()` / helper `resolveRecipient()` que devolve sempre um objeto normalizado `{ nome, telefone, email, endereco, nuit? }` pronto para os PDFs.

### 2. Helper `useResolveRecipient`

`src/hooks/useResolveRecipient.ts`:

- Recebe o estado do `RecipientPicker`.
- Se `mode === 'manual'` e `saveToBase`, faz `insert` em `clients` no momento de emitir e devolve o `client` recém criado.
- Caso contrário devolve apenas o objeto em memória.
- Centraliza a lógica para todos os formulários não duplicarem código.

### 3. Atualizar os formulários existentes

Em cada um destes ficheiros, substituir o atual `<Select>` de cliente pelo `<RecipientPicker>` e usar `useResolveRecipient` antes de gerar o PDF:

- `src/components/services/PropostaContratoForm.tsx`
- formulário de emissão de Recibo (atualmente acoplado a `Servicos.tsx` / `ServiceForm.tsx`)
- formulário de Fatura
- formulário de Cotação
- formulário de Proposta pontual

Os componentes PDF (`ReciboPDF`, `FaturaPDF`, `CotacaoPDF`, `PropostaPDF`, `PropostaContratoMensalPDF`) **não precisam de mudar a assinatura** — já aceitam um objeto `cliente`. Só garantimos que o objeto enviado tem os mesmos campos quer venha de `clients` quer do modo avulso.

### 4. Novos documentos

#### Plano de Vendas
- Novo PDF `src/components/pdf/PlanoVendasPDF.tsx` reutilizando `_invoiceLayout` (mesmo cabeçalho com logo).
- Novo formulário `src/components/documents/PlanoVendasForm.tsx`: usa `RecipientPicker`, lista dinâmica de itens (descrição, qtd, preço unit., subtotal), total geral, validade, observações.

#### Fatura de Pagamentos Parcelados
- Novo PDF `src/components/pdf/FaturaParceladaPDF.tsx` reutilizando `_invoiceLayout`.
- Novo formulário `src/components/documents/FaturaParceladaForm.tsx`: usa `RecipientPicker`, descrição do serviço/produto, valor total, número de parcelas (input numérico), data da 1ª parcela, intervalo (mensal/quinzenal). O formulário calcula automaticamente a tabela de parcelas (Parcela 1 — data — valor; Parcela 2 — data — valor; …) e mostra preview antes de gerar. A tabela vai impressa no PDF com totais e saldo.

#### Onde aparecem
Acrescentar pontos de entrada (botões/abas) na página `Servicos.tsx` (e/ou criar `src/pages/Documentos.tsx` com tabs: Recibo / Fatura / Cotação / Proposta / Plano de Vendas / Fatura Parcelada) — a decidir no momento da implementação consoante o que ficar mais limpo na navegação atual.

### 5. Sem alterações de schema

- A tabela `clients` já tem todos os campos necessários (`nome`, `telefone`, `email`, `endereco`). Cliente avulso simplesmente não é inserido. Se "Salvar na base" estiver ligado, faz-se um `insert` normal.
- **Nenhuma migração de base de dados é necessária.**

### 6. Validação e segurança

- zod schema partilhado para o destinatário avulso (limites de caracteres, email válido, telefone não vazio).
- Sanitização básica antes de passar para os PDFs.
- Inserção em `clients` continua a respeitar RLS existente (`user_id = auth.uid()`).

## Fora do escopo

- Não vamos criar uma tabela separada de "destinatários avulsos" / histórico de documentos emitidos a não-clientes (pode ser proposto depois se quiser rastreio).
- Não vamos alterar layout/design dos PDFs já existentes — apenas a origem dos dados do destinatário.
- Não alteramos lógica financeira, gastos, hospedagem, nem business rules.

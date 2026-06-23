## Plano: Redesign profissional dos documentos PDF

Aplicar um layout único e profissional — inspirado na fatura clássica enviada — para **Fatura, Recibo e Cotação**, mantendo a logo da empresa em destaque e organização consistente.

### Estrutura visual (igual à imagem de referência)

```text
┌─────────────────────────────────────────────────────┐
│ [LOGO]                                     FATURA   │
│ NOME DA EMPRESA                       Nº: ......    │
│ Endereço / NUIT / Contato             Data: ......  │
├─────────────────────────────────────────────────────┤
│  FATURAR PARA:              ENVIAR PARA:            │
│  Nome cliente               (mesmo / endereço)      │
│  Endereço                                           │
│  Telefone / Email                                   │
├─────────────────────────────────────────────────────┤
│ VENDEDOR │ Nº PEDIDO │ DATA ENVIO │ ENVIADO │ TERMOS│
│  ......  │  ......   │  ......    │ ......  │ ......│
├─────────────────────────────────────────────────────┤
│ QTD │ DESCRIÇÃO              │ PREÇO UNIT. │ TOTAL  │
│  1  │ Serviço + detalhes...  │   ......    │ ...... │
│  1  │ Domínio (se aplicável) │   ......    │ ...... │
│  1  │ Hospedagem             │   ......    │ ...... │
│                                                     │
│                              SUBTOTAL: ............ │
│                              IMPOSTO:  ............ │
│                              TOTAL:    ............ │
├─────────────────────────────────────────────────────┤
│ Observações / Termos de pagamento                   │
│              OBRIGADO PELO SEU NEGÓCIO              │
└─────────────────────────────────────────────────────┘
```

### Alterações por arquivo

1. **`src/components/pdf/_invoiceStyles.ts`** (novo) — folha de estilos compartilhada (`@react-pdf/renderer`) com paleta sóbria (cinza/preto + accent da marca), tipografia Helvetica, tabela com cabeçalho preenchido, linhas zebradas e bloco de totais alinhado à direita.

2. **`src/components/pdf/FaturaPDF.tsx`** — reescrito no novo layout. Título "FATURA", numeração `FAT-AAAAMMDD-XXXXXX`, blocos "Faturar para" e "Enviar para" (mesmo cliente), meta-tabela (Vendedor = empresa, Nº pedido = id curto, Data, Enviado por, Termos = forma de pagamento), tabela de itens gerada a partir de `servico` + `detalhes_servico` (linhas extras para domínio, hospedagem, hospedagem gratuita marcada como "Cortesia — X meses", orçamento de tráfego, etc.), bloco de totais à direita.

3. **`src/components/pdf/ReciboPDF.tsx`** — mesma estrutura visual; título "RECIBO" e linha de declaração ("Recebi de … a quantia de …") logo abaixo do cabeçalho; tabela de itens igual; totais marcados como **PAGO**.

4. **`src/components/pdf/CotacaoPDF.tsx`** — título "COTAÇÃO / PROPOSTA"; meta-tabela com Validade da proposta em vez de Data envio; mesma tabela de itens e totais; rodapé com termos de aceite.

### Detalhes técnicos

- A logo continua sendo carregada de `src/assets/logo.png` e renderizada à esquerda do cabeçalho (mantém o upload do usuário já existente).
- Itens da tabela são montados dinamicamente: serviço principal + linhas adicionais conforme `detalhes_servico` (domínio, hospedagem paga, hospedagem cortesia, orçamento de anúncios, plataformas, campos "outros").
- Paleta: fundo branco, cabeçalho de tabela `#1f2937` com texto branco, linhas alternadas `#f9fafb`, accent da marca apenas no título e linha do total.
- Sem alterações em formulários, banco de dados, regras de negócio ou outras telas — apenas os 3 componentes PDF e a folha de estilos compartilhada.
- `PropostaPDF.tsx`, `AvisoPagamentoPDF.tsx` e `PropostaContratoMensalPDF.tsx` ficam inalterados (não foram pedidos).

import { InvoiceDocument } from './_invoiceLayout';

interface FaturaProps {
  servico: any;
  cliente: any;
  empresa: any;
  numeroFatura?: string;
}

export function FaturaPDF({ servico, cliente, empresa, numeroFatura }: FaturaProps) {
  const now = new Date();
  const faturaNum =
    numeroFatura ||
    `FAT-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
      now.getDate()
    ).padStart(2, '0')}-${servico.id?.substring(0, 6)?.toUpperCase() || '000000'}`;

  const termos =
    servico.tipo_pagamento === 'com_investimento' ? 'Com Investimento' : 'Pagamento Integral';

  return (
    <InvoiceDocument
      docTitle="FATURA"
      docNumberLabel="Nº Fatura"
      docNumber={faturaNum}
      docDateLabel="Data"
      docDate={now.toLocaleDateString('pt-MZ')}
      extraMetaLabel="Vencimento"
      extraMetaValue={new Date(servico.data_servico).toLocaleDateString('pt-MZ')}
      servico={servico}
      cliente={cliente}
      empresa={empresa}
      metaColumns={[
        { head: 'Vendedor', value: empresa?.nome || 'LG TecServ' },
        { head: 'Nº Pedido', value: servico.id?.substring(0, 8)?.toUpperCase() || '—' },
        { head: 'Data Envio', value: now.toLocaleDateString('pt-MZ') },
        { head: 'Enviado por', value: empresa?.nome || 'LG TecServ' },
        { head: 'Termos', value: termos },
      ]}
      notes={[
        {
          heading: 'Formas de pagamento aceites',
          text: 'M-Pesa / e-Mola · Transferência Bancária · Depósito Direto · Numerário',
        },
        ...(servico.observacoes
          ? [{ heading: 'Observações', text: String(servico.observacoes) }]
          : []),
      ]}
      thanksText="Obrigado pelo seu negócio"
    />
  );
}

import { InvoiceDocument } from './_invoiceLayout';

interface CotacaoProps {
  servico: any;
  cliente: any;
  empresa: any;
  validade?: number;
}

export function CotacaoPDF({ servico, cliente, empresa, validade = 30 }: CotacaoProps) {
  const now = new Date();
  const dataValidade = new Date();
  dataValidade.setDate(dataValidade.getDate() + validade);

  const cotacaoNum = `COT-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
    now.getDate()
  ).padStart(2, '0')}-${servico.id?.substring(0, 6)?.toUpperCase() || '000000'}`;

  const termos =
    servico.tipo_pagamento === 'com_investimento' ? 'Com Investimento' : 'Pagamento Integral';

  return (
    <InvoiceDocument
      docTitle="COTAÇÃO"
      docNumberLabel="Nº Cotação"
      docNumber={cotacaoNum}
      docDateLabel="Emitida em"
      docDate={now.toLocaleDateString('pt-MZ')}
      extraMetaLabel="Válida até"
      extraMetaValue={`${dataValidade.toLocaleDateString('pt-MZ')} (${validade} dias)`}
      servico={servico}
      cliente={cliente}
      empresa={empresa}
      metaColumns={[
        { head: 'Vendedor', value: empresa?.nome || 'LG TecServ' },
        { head: 'Nº Proposta', value: servico.id?.substring(0, 8)?.toUpperCase() || '—' },
        { head: 'Validade', value: `${validade} dias` },
        { head: 'Termos', value: termos },
      ]}
      notes={[
        {
          heading: 'Condições',
          text: `Cotação válida até ${dataValidade.toLocaleDateString(
            'pt-MZ'
          )}. Valores sujeitos a alteração após o prazo de validade.`,
        },
        ...(servico.observacoes
          ? [{ heading: 'Observações', text: String(servico.observacoes) }]
          : []),
      ]}
      thanksText="Aguardamos a sua aprovação"
    />
  );
}

import { View, Text } from '@react-pdf/renderer';
import { InvoiceDocument, styles } from './_invoiceLayout';

interface ReciboProps {
  servico: any;
  cliente: any;
  empresa: any;
}

export function ReciboPDF({ servico, cliente, empresa }: ReciboProps) {
  const now = new Date();
  const reciboNum = `REC-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
    now.getDate()
  ).padStart(2, '0')}-${servico.id?.substring(0, 6)?.toUpperCase() || '000000'}`;

  const valor = Number(servico.valor_total).toFixed(2);
  const isPago = servico.status_pagamento === 'pago';

  const preamble = (
    <View style={styles.declaracao}>
      <Text style={styles.declaracaoText}>
        Recebemos de <Text style={styles.declaracaoBold}>{cliente?.nome || 'N/A'}</Text> a quantia
        de <Text style={styles.declaracaoBold}>{valor} MT</Text> (Meticais), referente ao serviço
        de <Text style={styles.declaracaoBold}>{servico.nome_servico}</Text>, prestado em{' '}
        <Text style={styles.declaracaoBold}>
          {new Date(servico.data_servico).toLocaleDateString('pt-MZ')}
        </Text>
        .
      </Text>
    </View>
  );

  return (
    <InvoiceDocument
      docTitle="RECIBO"
      docNumberLabel="Nº Recibo"
      docNumber={reciboNum}
      docDateLabel="Data"
      docDate={now.toLocaleDateString('pt-MZ')}
      servico={servico}
      cliente={cliente}
      empresa={empresa}
      metaColumns={[
        { head: 'Vendedor', value: empresa?.nome || 'LG TecServ' },
        { head: 'Nº Pedido', value: servico.id?.substring(0, 8)?.toUpperCase() || '—' },
        { head: 'Data do Serviço', value: new Date(servico.data_servico).toLocaleDateString('pt-MZ') },
        { head: 'Status', value: (servico.status_pagamento || '').toUpperCase() },
      ]}
      preamble={preamble}
      showPaidStamp={isPago}
      notes={
        servico.observacoes
          ? [{ heading: 'Observações', text: String(servico.observacoes) }]
          : []
      }
      thanksText="Obrigado pela preferência"
    />
  );
}

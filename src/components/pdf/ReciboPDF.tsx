import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import logoImg from '@/assets/logo.png';

const CATEGORY_LABELS: Record<string, string> = {
  website: 'Criação de Website',
  aplicativo: 'Criação de Aplicativo',
  sistema: 'Criação de Sistema',
  trafego_pago: 'Gestão de Tráfego Pago',
  redes_sociais: 'Gestão de Redes Sociais',
  outro: 'Outro',
};

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottom: '1pt solid #e2e8f0',
  },
  logo: {
    width: 100,
    height: 50,
    objectFit: 'contain',
  },
  companyInfo: {
    textAlign: 'right',
    flex: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4c1d95',
    marginBottom: 4,
  },
  companyDetails: {
    fontSize: 8,
    color: '#64748b',
    marginBottom: 2,
  },
  reciboHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f766e',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  reciboNumero: {
    textAlign: 'right',
  },
  reciboNumeroLabel: {
    fontSize: 8,
    color: '#64748b',
    textTransform: 'uppercase',
  },
  reciboNumeroValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#4c1d95',
  },
  reciboData: {
    fontSize: 8,
    color: '#64748b',
    marginTop: 4,
  },
  declaracao: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f0fdfa',
    borderLeft: '3pt solid #0f766e',
    borderRadius: 4,
  },
  declaracaoText: {
    fontSize: 10,
    color: '#115e59',
    lineHeight: 1.5,
  },
  declaracaoBold: {
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 16,
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    border: '0.5pt solid #e2e8f0',
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#4c1d95',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    paddingBottom: 4,
    borderBottom: '0.5pt solid #e2e8f0',
  },
  label: {
    fontWeight: 'bold',
    width: '40%',
    color: '#64748b',
    fontSize: 9,
  },
  value: {
    width: '60%',
    color: '#1e293b',
    fontSize: 9,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTop: '1pt solid #0f766e',
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f766e',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f766e',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  statusPago: { backgroundColor: '#dcfce7', color: '#166534' },
  statusPendente: { backgroundColor: '#fef3c7', color: '#92400e' },
  statusDevendo: { backgroundColor: '#fee2e2', color: '#991b1b' },
  detailsSection: {
    marginBottom: 16,
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    border: '0.5pt solid #e2e8f0',
  },
  pagamentoSection: {
    marginBottom: 16,
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    border: '0.5pt solid #e2e8f0',
  },
  pagamentoItem: {
    fontSize: 8,
    color: '#334155',
    marginBottom: 2,
  },
  observacoes: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f8fafc',
    borderLeft: '2pt solid #e2e8f0',
    fontSize: 9,
    color: '#475569',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 12,
    borderTop: '0.5pt solid #e2e8f0',
    textAlign: 'center',
    fontSize: 7,
    color: '#94a3b8',
  },
});

interface ReciboProps {
  servico: any;
  cliente: any;
  empresa: any;
}

export function ReciboPDF({ servico, cliente, empresa }: ReciboProps) {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pago': return styles.statusPago;
      case 'pendente': return styles.statusPendente;
      case 'devendo': return styles.statusDevendo;
      default: return styles.statusPendente;
    }
  };

  const detalhes = servico.detalhes_servico || {};
  const categoria = detalhes.categoria;

  // Generate receipt number
  const reciboNum = `REC-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${servico.id?.substring(0, 6)?.toUpperCase() || '000000'}`;

  const valorPorExtenso = Number(servico.valor_total).toFixed(2);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Image src={logoImg} style={styles.logo} />
          <View style={styles.companyInfo}>
            {/* Removido o Texto LG TecServ para evitar duplicação com o logo */}
            {empresa?.nuit && <Text style={styles.companyDetails}>NUIT: {empresa.nuit}</Text>}
            {empresa?.endereco && <Text style={styles.companyDetails}>{empresa.endereco}</Text>}
            {empresa?.contato && <Text style={styles.companyDetails}>{empresa.contato}</Text>}
          </View>
        </View>

        {/* Recibo Title + Number */}
        <View style={styles.reciboHeader}>
          <Text style={styles.title}>Recibo</Text>
          <View style={styles.reciboNumero}>
            <Text style={styles.reciboNumeroLabel}>Nº do Recibo</Text>
            <Text style={styles.reciboNumeroValue}>{reciboNum}</Text>
            <Text style={styles.reciboData}>Data: {new Date().toLocaleDateString('pt-MZ')}</Text>
          </View>
        </View>

        {/* Declaração formal */}
        <View style={styles.declaracao}>
          <Text style={styles.declaracaoText}>
            Recebi do(a) <Text style={styles.declaracaoBold}>{cliente?.nome || 'N/A'}</Text> a quantia de{' '}
            <Text style={styles.declaracaoBold}>{valorPorExtenso} MT</Text> (Meticais), referente ao serviço de{' '}
            <Text style={styles.declaracaoBold}>{servico.nome_servico}</Text>, prestado na data de{' '}
            <Text style={styles.declaracaoBold}>{new Date(servico.data_servico).toLocaleDateString('pt-MZ')}</Text>.
          </Text>
        </View>

        {/* Dados do Cliente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados do Cliente</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nome:</Text>
            <Text style={styles.value}>{cliente?.nome || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Telefone:</Text>
            <Text style={styles.value}>{cliente?.telefone || 'N/A'}</Text>
          </View>
          {cliente?.email && (
            <View style={styles.row}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{cliente.email}</Text>
            </View>
          )}
          {cliente?.endereco && (
            <View style={styles.row}>
              <Text style={styles.label}>Endereço:</Text>
              <Text style={styles.value}>{cliente.endereco}</Text>
            </View>
          )}
        </View>

        {/* Detalhes do Serviço */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalhes do Serviço</Text>
          {categoria && (
            <View style={styles.row}>
              <Text style={styles.label}>Categoria:</Text>
              <Text style={styles.value}>{CATEGORY_LABELS[categoria] || categoria}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Serviço:</Text>
            <Text style={styles.value}>{servico.nome_servico}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Data:</Text>
            <Text style={styles.value}>{new Date(servico.data_servico).toLocaleDateString('pt-MZ')}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <View style={[styles.statusBadge, getStatusStyle(servico.status_pagamento)]}>
              <Text>{servico.status_pagamento.toUpperCase()}</Text>
            </View>
          </View>

          {servico.tem_investimento && servico.valor_investimento > 0 && (
            <>
              <View style={styles.row}>
                <Text style={styles.label}>Investimento:</Text>
                <Text style={styles.value}>{Number(servico.valor_investimento).toFixed(2)} MT</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Lucro:</Text>
                <Text style={styles.value}>{Number(servico.valor_lucro).toFixed(2)} MT</Text>
              </View>
            </>
          )}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>VALOR TOTAL:</Text>
            <Text style={styles.totalValue}>{Number(servico.valor_total).toFixed(2)} MT</Text>
          </View>
        </View>

        {/* Detalhes específicos por categoria */}
        {categoria === 'website' && (
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Detalhes do Website</Text>
            {detalhes.valor_dominio > 0 && (
              <View style={styles.row}>
                <Text style={styles.label}>Domínio:</Text>
                <Text style={styles.value}>{Number(detalhes.valor_dominio).toFixed(2)} MT</Text>
              </View>
            )}
            {detalhes.valor_hospedagem > 0 && (
              <View style={styles.row}>
                <Text style={styles.label}>Hospedagem:</Text>
                <Text style={styles.value}>{Number(detalhes.valor_hospedagem).toFixed(2)} MT</Text>
              </View>
            )}
            {detalhes.hospedagem_gratuita && (
              <View style={styles.row}>
                <Text style={styles.label}>Hospedagem Gratuita:</Text>
                <Text style={styles.value}>{detalhes.periodo_hospedagem_gratuita} meses</Text>
              </View>
            )}
          </View>
        )}

        {categoria === 'trafego_pago' && (
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Detalhes de Tráfego Pago</Text>
            {detalhes.orcamento_anuncios > 0 && (
              <View style={styles.row}>
                <Text style={styles.label}>Orçamento Anúncios:</Text>
                <Text style={styles.value}>{Number(detalhes.orcamento_anuncios).toFixed(2)} MT</Text>
              </View>
            )}
            {detalhes.plataformas && (
              <View style={styles.row}>
                <Text style={styles.label}>Plataformas:</Text>
                <Text style={styles.value}>{detalhes.plataformas}</Text>
              </View>
            )}
          </View>
        )}

        {/* Formas de Pagamento */}
        <View style={styles.pagamentoSection}>
          <Text style={styles.sectionTitle}>Formas de Pagamento Aceites</Text>
          <Text style={styles.pagamentoItem}>- M-Pesa / e-Mola</Text>
          <Text style={styles.pagamentoItem}>- Transferência Bancária</Text>
          <Text style={styles.pagamentoItem}>- Depósito Directo</Text>
          <Text style={styles.pagamentoItem}>- Numerário (Dinheiro)</Text>
        </View>

        {servico.observacoes && (
          <View style={styles.observacoes}>
            <Text style={{ fontWeight: 'bold', marginBottom: 6 }}>Observações:</Text>
            <Text>{servico.observacoes}</Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text>Recibo gerado em {new Date().toLocaleDateString('pt-MZ')} às {new Date().toLocaleTimeString('pt-MZ')}</Text>
          <Text style={{ marginTop: 4 }}>Este é um documento eletrónico válido - {empresa?.nome || 'LG TecServ'}</Text>
        </View>
      </Page>
    </Document>
  );
}

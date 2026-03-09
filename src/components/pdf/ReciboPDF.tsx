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
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottom: '2pt solid #2563eb',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 4,
  },
  companyDetails: {
    fontSize: 9,
    color: '#64748b',
    marginBottom: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 25,
    color: '#1e293b',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  section: {
    marginBottom: 16,
    padding: 14,
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    border: '1pt solid #e2e8f0',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingBottom: 6,
    borderBottom: '0.5pt solid #e2e8f0',
  },
  label: {
    fontWeight: 'bold',
    width: '40%',
    color: '#475569',
    fontSize: 10,
  },
  value: {
    width: '60%',
    color: '#1e293b',
    fontSize: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTop: '2pt solid #2563eb',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  observacoes: {
    marginTop: 8,
    padding: 10,
    backgroundColor: '#fff7ed',
    borderLeft: '3pt solid #f59e0b',
    fontSize: 10,
    color: '#78350f',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 20,
    borderTop: '1pt solid #cbd5e1',
    textAlign: 'center',
    fontSize: 8,
    color: '#94a3b8',
  },
  statusBadge: {
    padding: '4 8',
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
    padding: 14,
    backgroundColor: '#eff6ff',
    borderRadius: 6,
    border: '1pt solid #bfdbfe',
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

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Image src={logoImg} style={styles.logo} />
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{empresa?.nome || 'Empresa'}</Text>
            {empresa?.endereco && <Text style={styles.companyDetails}>{empresa.endereco}</Text>}
            {empresa?.contato && <Text style={styles.companyDetails}>{empresa.contato}</Text>}
          </View>
        </View>

        <Text style={styles.title}>Recibo de Pagamento</Text>

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

        {servico.observacoes && (
          <View style={styles.observacoes}>
            <Text style={{ fontWeight: 'bold', marginBottom: 6 }}>Observações:</Text>
            <Text>{servico.observacoes}</Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text>Documento gerado em {new Date().toLocaleDateString('pt-MZ')} às {new Date().toLocaleTimeString('pt-MZ')}</Text>
          <Text style={{ marginTop: 4 }}>Este é um documento eletrônico válido</Text>
        </View>
      </Page>
    </Document>
  );
}

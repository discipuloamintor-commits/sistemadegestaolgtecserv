import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

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
    marginBottom: 30,
    paddingBottom: 20,
    borderBottom: '2pt solid #2563eb',
  },
  logo: {
    width: 120,
    height: 60,
    objectFit: 'contain',
  },
  companyInfo: {
    textAlign: 'right',
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
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#1e293b',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  section: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    border: '1pt solid #e2e8f0',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottom: '0.5pt solid #e2e8f0',
  },
  label: {
    fontWeight: 'bold',
    width: '40%',
    color: '#475569',
  },
  value: {
    width: '60%',
    color: '#1e293b',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingTop: 15,
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
    marginTop: 10,
    padding: 12,
    backgroundColor: '#fff7ed',
    borderLeft: '3pt solid #f59e0b',
    fontSize: 10,
    color: '#78350f',
  },
  footer: {
    marginTop: 40,
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
  statusPago: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  statusPendente: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  statusDevendo: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
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
      case 'pago':
        return styles.statusPago;
      case 'pendente':
        return styles.statusPendente;
      case 'devendo':
        return styles.statusDevendo;
      default:
        return styles.statusPendente;
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header com logo */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            {empresa?.logotipo_url && (
              <Image src={empresa.logotipo_url} style={styles.logo} />
            )}
          </View>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{empresa?.nome || 'Empresa'}</Text>
            {empresa?.endereco && (
              <Text style={styles.companyDetails}>{empresa.endereco}</Text>
            )}
            {empresa?.contato && (
              <Text style={styles.companyDetails}>{empresa.contato}</Text>
            )}
          </View>
        </View>

        {/* Título */}
        <Text style={styles.title}>Recibo de Pagamento</Text>

        {/* Informações do Cliente */}
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
        </View>

        {/* Informações do Serviço */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalhes do Serviço</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Serviço:</Text>
            <Text style={styles.value}>{servico.nome_servico}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Data:</Text>
            <Text style={styles.value}>
              {new Date(servico.data_servico).toLocaleDateString('pt-MZ')}
            </Text>
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

        {/* Observações */}
        {servico.observacoes && (
          <View style={styles.observacoes}>
            <Text style={{ fontWeight: 'bold', marginBottom: 6 }}>Observações:</Text>
            <Text>{servico.observacoes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Documento gerado em {new Date().toLocaleDateString('pt-MZ')} às{' '}
            {new Date().toLocaleTimeString('pt-MZ')}
          </Text>
          <Text style={{ marginTop: 4 }}>Este é um documento eletrônico válido</Text>
        </View>
      </Page>
    </Document>
  );
}

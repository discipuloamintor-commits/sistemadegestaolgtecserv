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
    borderBottom: '2pt solid #7c3aed',
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
    color: '#6d28d9',
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
    backgroundColor: '#faf5ff',
    borderRadius: 8,
    border: '1pt solid #e9d5ff',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#6d28d9',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottom: '0.5pt solid #e9d5ff',
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
    borderTop: '2pt solid #7c3aed',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6d28d9',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6d28d9',
  },
  validadeBox: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#fef3c7',
    borderLeft: '3pt solid #f59e0b',
    fontSize: 10,
  },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTop: '1pt solid #cbd5e1',
    textAlign: 'center',
    fontSize: 8,
    color: '#94a3b8',
  },
});

interface CotacaoProps {
  servico: any;
  cliente: any;
  empresa: any;
  validade?: number; // dias de validade
}

export function CotacaoPDF({ servico, cliente, empresa, validade = 30 }: CotacaoProps) {
  const dataValidade = new Date();
  dataValidade.setDate(dataValidade.getDate() + validade);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
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
        <Text style={styles.title}>Cotação de Serviço</Text>

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

        {/* Detalhes da Cotação */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalhes da Cotação</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Serviço:</Text>
            <Text style={styles.value}>{servico.nome_servico}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Data da Cotação:</Text>
            <Text style={styles.value}>
              {new Date().toLocaleDateString('pt-MZ')}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tipo de Pagamento:</Text>
            <Text style={styles.value}>
              {servico.tipo_pagamento === 'com_investimento' ? 'Com Investimento' : 'Fixo'}
            </Text>
          </View>
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>VALOR ESTIMADO:</Text>
            <Text style={styles.totalValue}>{Number(servico.valor_total).toFixed(2)} MT</Text>
          </View>
        </View>

        {/* Observações */}
        {servico.observacoes && (
          <View style={{ ...styles.section, backgroundColor: '#f0fdf4', border: '1pt solid #bbf7d0' }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 6, color: '#166534' }}>Detalhes Adicionais:</Text>
            <Text style={{ color: '#15803d' }}>{servico.observacoes}</Text>
          </View>
        )}

        {/* Validade */}
        <View style={styles.validadeBox}>
          <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>⚠️ Validade da Cotação</Text>
          <Text>
            Esta cotação é válida até {dataValidade.toLocaleDateString('pt-MZ')} ({validade} dias)
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Cotação gerada em {new Date().toLocaleDateString('pt-MZ')} às{' '}
            {new Date().toLocaleTimeString('pt-MZ')}
          </Text>
          <Text style={{ marginTop: 4 }}>Valores sujeitos a alteração sem aviso prévio após o prazo de validade</Text>
        </View>
      </Page>
    </Document>
  );
}

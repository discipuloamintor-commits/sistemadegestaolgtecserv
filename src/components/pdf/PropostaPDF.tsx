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
    borderBottom: '2pt solid #059669',
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
    color: '#047857',
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
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    border: '1pt solid #bbf7d0',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#047857',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottom: '0.5pt solid #bbf7d0',
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
  objetivoBox: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#eff6ff',
    borderLeft: '4pt solid #3b82f6',
  },
  objetivoTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1e40af',
  },
  objetivoText: {
    fontSize: 10,
    color: '#1e40af',
    lineHeight: 1.5,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingTop: 15,
    borderTop: '2pt solid #059669',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#047857',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#047857',
  },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTop: '1pt solid #cbd5e1',
    textAlign: 'center',
    fontSize: 8,
    color: '#94a3b8',
  },
  assinaturaBox: {
    marginTop: 40,
    paddingTop: 40,
    borderTop: '1pt solid #cbd5e1',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  assinatura: {
    width: '45%',
    textAlign: 'center',
  },
  assinaturaLine: {
    borderTop: '1pt solid #1e293b',
    marginBottom: 8,
    paddingTop: 8,
  },
});

interface PropostaProps {
  servico: any;
  cliente: any;
  empresa: any;
  objetivo?: string;
}

export function PropostaPDF({ servico, cliente, empresa, objetivo }: PropostaProps) {
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
        <Text style={styles.title}>Proposta Comercial</Text>

        {/* Objetivo */}
        <View style={styles.objetivoBox}>
          <Text style={styles.objetivoTitle}>📋 Objetivo da Proposta</Text>
          <Text style={styles.objetivoText}>
            {objetivo || 
              `Apresentamos esta proposta comercial para prestação de serviços de ${servico.nome_servico}, 
              com o objetivo de atender as necessidades do cliente com excelência e profissionalismo.`
            }
          </Text>
        </View>

        {/* Informações do Cliente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cliente</Text>
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

        {/* Escopo do Serviço */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Escopo do Serviço</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Serviço:</Text>
            <Text style={styles.value}>{servico.nome_servico}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Data Prevista:</Text>
            <Text style={styles.value}>
              {new Date(servico.data_servico).toLocaleDateString('pt-MZ')}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tipo de Pagamento:</Text>
            <Text style={styles.value}>
              {servico.tipo_pagamento === 'com_investimento' ? 'Parcelado/Com Investimento' : 'Pagamento Único'}
            </Text>
          </View>
        </View>

        {/* Valores */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Valores</Text>
          {servico.tem_investimento && servico.valor_investimento > 0 && (
            <>
              <View style={styles.row}>
                <Text style={styles.label}>Investimento Inicial:</Text>
                <Text style={styles.value}>{Number(servico.valor_investimento).toFixed(2)} MT</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Saldo Restante:</Text>
                <Text style={styles.value}>
                  {(Number(servico.valor_total) - Number(servico.valor_investimento)).toFixed(2)} MT
                </Text>
              </View>
            </>
          )}
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>VALOR TOTAL:</Text>
            <Text style={styles.totalValue}>{Number(servico.valor_total).toFixed(2)} MT</Text>
          </View>
        </View>

        {/* Observações/Termos */}
        {servico.observacoes && (
          <View style={{ ...styles.section, backgroundColor: '#fef3c7', border: '1pt solid #fde047' }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 6, color: '#854d0e' }}>Observações e Termos:</Text>
            <Text style={{ color: '#92400e' }}>{servico.observacoes}</Text>
          </View>
        )}

        {/* Assinaturas */}
        <View style={styles.assinaturaBox}>
          <View style={styles.assinatura}>
            <View style={styles.assinaturaLine}>
              <Text style={{ fontSize: 9, fontWeight: 'bold' }}>{empresa?.nome || 'Prestador'}</Text>
            </View>
            <Text style={{ fontSize: 8, color: '#64748b' }}>Assinatura do Prestador</Text>
          </View>
          <View style={styles.assinatura}>
            <View style={styles.assinaturaLine}>
              <Text style={{ fontSize: 9, fontWeight: 'bold' }}>{cliente?.nome || 'Cliente'}</Text>
            </View>
            <Text style={{ fontSize: 8, color: '#64748b' }}>Assinatura do Cliente</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Proposta gerada em {new Date().toLocaleDateString('pt-MZ')} às{' '}
            {new Date().toLocaleTimeString('pt-MZ')}
          </Text>
          <Text style={{ marginTop: 4 }}>Este documento tem validade de 30 dias a partir da data de emissão</Text>
        </View>
      </Page>
    </Document>
  );
}

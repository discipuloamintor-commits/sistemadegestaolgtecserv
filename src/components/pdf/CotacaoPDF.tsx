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
    borderBottom: '2pt solid #7c3aed',
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
    color: '#6d28d9',
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
    backgroundColor: '#faf5ff',
    borderRadius: 6,
    border: '1pt solid #e9d5ff',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#6d28d9',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingBottom: 6,
    borderBottom: '0.5pt solid #e9d5ff',
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
    marginTop: 16,
    padding: 12,
    backgroundColor: '#fef3c7',
    borderLeft: '3pt solid #f59e0b',
    fontSize: 10,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 20,
    borderTop: '1pt solid #cbd5e1',
    textAlign: 'center',
    fontSize: 8,
    color: '#94a3b8',
  },
  detailsSection: {
    marginBottom: 16,
    padding: 14,
    backgroundColor: '#eff6ff',
    borderRadius: 6,
    border: '1pt solid #bfdbfe',
  },
});

interface CotacaoProps {
  servico: any;
  cliente: any;
  empresa: any;
  validade?: number;
}

export function CotacaoPDF({ servico, cliente, empresa, validade = 30 }: CotacaoProps) {
  const dataValidade = new Date();
  dataValidade.setDate(dataValidade.getDate() + validade);

  const detalhes = servico.detalhes_servico || {};
  const categoria = detalhes.categoria;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image src={logoImg} style={styles.logo} />
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{empresa?.nome || 'Empresa'}</Text>
            {empresa?.endereco && <Text style={styles.companyDetails}>{empresa.endereco}</Text>}
            {empresa?.contato && <Text style={styles.companyDetails}>{empresa.contato}</Text>}
          </View>
        </View>

        <Text style={styles.title}>Cotação de Serviço</Text>

        {/* Cliente */}
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

        {/* Cotação */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalhes da Cotação</Text>
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
            <Text style={styles.label}>Data da Cotação:</Text>
            <Text style={styles.value}>{new Date().toLocaleDateString('pt-MZ')}</Text>
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

        {/* Detalhes por categoria */}
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
          <View style={{ ...styles.section, backgroundColor: '#f0fdf4', border: '1pt solid #bbf7d0' }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 6, color: '#166534' }}>Detalhes Adicionais:</Text>
            <Text style={{ color: '#15803d' }}>{servico.observacoes}</Text>
          </View>
        )}

        <View style={styles.validadeBox}>
          <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Validade da Cotação</Text>
          <Text>Esta cotação é válida até {dataValidade.toLocaleDateString('pt-MZ')} ({validade} dias)</Text>
        </View>

        <View style={styles.footer}>
          <Text>Cotação gerada em {new Date().toLocaleDateString('pt-MZ')} às {new Date().toLocaleTimeString('pt-MZ')}</Text>
          <Text style={{ marginTop: 4 }}>Valores sujeitos a alteração sem aviso prévio após o prazo de validade</Text>
        </View>
      </Page>
    </Document>
  );
}

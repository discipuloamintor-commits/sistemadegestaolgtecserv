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
    borderBottom: '2pt solid #059669',
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
    color: '#047857',
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
    backgroundColor: '#f0fdf4',
    borderRadius: 6,
    border: '1pt solid #bbf7d0',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#047857',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingBottom: 6,
    borderBottom: '0.5pt solid #bbf7d0',
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
  objetivoBox: {
    marginBottom: 16,
    padding: 14,
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
    marginTop: 12,
    paddingTop: 12,
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
    marginTop: 'auto',
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
  detailsSection: {
    marginBottom: 16,
    padding: 14,
    backgroundColor: '#eff6ff',
    borderRadius: 6,
    border: '1pt solid #bfdbfe',
  },
});

interface PropostaProps {
  servico: any;
  cliente: any;
  empresa: any;
  objetivo?: string;
}

export function PropostaPDF({ servico, cliente, empresa, objetivo }: PropostaProps) {
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

        <Text style={styles.title}>Proposta Comercial</Text>

        {/* Objetivo */}
        <View style={styles.objetivoBox}>
          <Text style={styles.objetivoTitle}>Objetivo da Proposta</Text>
          <Text style={styles.objetivoText}>
            {objetivo ||
              `Apresentamos esta proposta comercial para prestação de serviços de ${servico.nome_servico}, com o objetivo de atender as necessidades do cliente com excelência e profissionalismo.`}
          </Text>
        </View>

        {/* Cliente */}
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

        {/* Escopo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Escopo do Serviço</Text>
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
            <Text style={styles.label}>Data Prevista:</Text>
            <Text style={styles.value}>{new Date(servico.data_servico).toLocaleDateString('pt-MZ')}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tipo de Pagamento:</Text>
            <Text style={styles.value}>
              {servico.tipo_pagamento === 'com_investimento' ? 'Parcelado/Com Investimento' : 'Pagamento Único'}
            </Text>
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

        <View style={styles.footer}>
          <Text>Proposta gerada em {new Date().toLocaleDateString('pt-MZ')} às {new Date().toLocaleTimeString('pt-MZ')}</Text>
          <Text style={{ marginTop: 4 }}>Este documento tem validade de 30 dias a partir da data de emissão</Text>
        </View>
      </Page>
    </Document>
  );
}

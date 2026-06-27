import { Document, Page, Text, View, Image } from '@react-pdf/renderer';
import { styles } from './_invoiceLayout';
import logoImg from '@/assets/logo.png';

export interface Parcela {
  numero: number;
  data: string; // ISO date or formatted
  valor: number;
  status?: 'pendente' | 'pago';
}

interface FaturaParceladaPDFProps {
  numero: string;
  data: string;
  cliente: any;
  empresa: any;
  descricao: string;
  valorTotal: number;
  parcelas: Parcela[];
  observacoes?: string;
}

const fmt = (n: number) => n.toFixed(2);

export function FaturaParceladaPDF({
  numero, data, cliente, empresa, descricao, valorTotal, parcelas, observacoes,
}: FaturaParceladaPDFProps) {
  const totalParcelas = parcelas.reduce((s, p) => s + p.valor, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.topRow}>
          <View style={styles.brandBlock}>
            <Image src={logoImg} style={styles.logo} />
            <View style={styles.brandText}>
              <Text style={styles.companyName}>{empresa?.nome || 'LG TecServ'}</Text>
              {empresa?.endereco && <Text style={styles.companyLine}>{empresa.endereco}</Text>}
              {empresa?.contato && <Text style={styles.companyLine}>Tel: {empresa.contato}</Text>}
              {empresa?.email && <Text style={styles.companyLine}>{empresa.email}</Text>}
              {empresa?.nuit && <Text style={styles.companyLine}>NUIT: {empresa.nuit}</Text>}
            </View>
          </View>
          <View style={styles.docTitleBlock}>
            <Text style={[styles.docTitle, { fontSize: 24 }]}>FATURA PARCELADA</Text>
            <Text style={styles.docMeta}>
              <Text style={styles.docMetaLabel}>Nº Fatura: </Text>{numero}
            </Text>
            <Text style={styles.docMeta}>
              <Text style={styles.docMetaLabel}>Emissão: </Text>{data}
            </Text>
            <Text style={styles.docMeta}>
              <Text style={styles.docMetaLabel}>Parcelas: </Text>{parcelas.length}x
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.twoCol}>
          <View style={styles.partyCol}>
            <Text style={styles.partyHeading}>Faturar para</Text>
            <Text style={styles.partyName}>{cliente?.nome || 'N/A'}</Text>
            {cliente?.endereco && <Text style={styles.partyLine}>{cliente.endereco}</Text>}
            {cliente?.telefone && <Text style={styles.partyLine}>Tel: {cliente.telefone}</Text>}
            {cliente?.email && <Text style={styles.partyLine}>{cliente.email}</Text>}
            {cliente?.nuit && <Text style={styles.partyLine}>NUIT: {cliente.nuit}</Text>}
          </View>
          <View style={styles.partyCol}>
            <Text style={styles.partyHeading}>Resumo</Text>
            <Text style={styles.partyLine}>Valor total: <Text style={{ fontFamily: 'Helvetica-Bold' }}>{fmt(valorTotal)} MT</Text></Text>
            <Text style={styles.partyLine}>Nº de parcelas: {parcelas.length}</Text>
            <Text style={styles.partyLine}>1ª parcela: {parcelas[0]?.data || '—'}</Text>
            <Text style={styles.partyLine}>Última: {parcelas[parcelas.length - 1]?.data || '—'}</Text>
          </View>
        </View>

        {/* Descrição do serviço */}
        <View style={styles.declaracao}>
          <Text style={styles.declaracaoText}>
            <Text style={styles.declaracaoBold}>Descrição: </Text>
            {descricao}
          </Text>
        </View>

        {/* Tabela de parcelas */}
        <View>
          <View style={styles.itemsHeader}>
            <Text style={[styles.itemsHeaderText, { width: '15%', textAlign: 'center' }]}>Parcela</Text>
            <Text style={[styles.itemsHeaderText, { width: '40%' }]}>Vencimento</Text>
            <Text style={[styles.itemsHeaderText, { width: '20%', textAlign: 'center' }]}>Estado</Text>
            <Text style={[styles.itemsHeaderText, { width: '25%', textAlign: 'right' }]}>Valor</Text>
          </View>
          {parcelas.map((p, idx) => (
            <View key={idx} style={[styles.itemRow, idx % 2 === 1 ? styles.itemRowAlt : {}]}>
              <Text style={[styles.itemCell, { width: '15%', textAlign: 'center' }]}>{p.numero}/{parcelas.length}</Text>
              <Text style={[styles.itemCell, { width: '40%' }]}>{p.data}</Text>
              <Text style={[styles.itemCell, { width: '20%', textAlign: 'center', color: p.status === 'pago' ? '#047857' : '#b45309' }]}>
                {(p.status || 'pendente').toUpperCase()}
              </Text>
              <Text style={[styles.itemCell, { width: '25%', textAlign: 'right', fontFamily: 'Helvetica-Bold' }]}>{fmt(p.valor)} MT</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsWrap}>
          <View style={styles.totalsBox}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Soma das parcelas</Text>
              <Text style={styles.totalsValue}>{fmt(totalParcelas)} MT</Text>
            </View>
            <View style={styles.grandRow}>
              <Text style={styles.grandLabel}>TOTAL</Text>
              <Text style={styles.grandValue}>{fmt(valorTotal)} MT</Text>
            </View>
          </View>
        </View>

        {observacoes && (
          <View style={styles.notesWrap}>
            <Text style={styles.notesHeading}>Observações</Text>
            <Text style={styles.notesText}>{observacoes}</Text>
          </View>
        )}

        <Text style={styles.thanks}>Obrigado pela confiança</Text>

        <View style={styles.footer}>
          <Text>Documento gerado em {new Date().toLocaleDateString('pt-MZ')} — {empresa?.nome || 'LG TecServ'}</Text>
        </View>
      </Page>
    </Document>
  );
}

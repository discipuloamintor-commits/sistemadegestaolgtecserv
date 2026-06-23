import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import logoImg from '@/assets/logo.png';

export const CATEGORY_LABELS: Record<string, string> = {
  website: 'Criação de Website',
  aplicativo: 'Criação de Aplicativo',
  sistema: 'Criação de Sistema',
  trafego_pago: 'Gestão de Tráfego Pago',
  redes_sociais: 'Gestão de Redes Sociais',
  outro: 'Outro',
};

export const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
    color: '#111827',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  brandBlock: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 70, height: 70, objectFit: 'contain', marginRight: 14 },
  brandText: { maxWidth: 260 },
  companyName: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  companyLine: { fontSize: 8.5, color: '#6b7280', marginBottom: 1.5 },
  docTitleBlock: { alignItems: 'flex-end' },
  docTitle: {
    fontSize: 32,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    letterSpacing: 1,
  },
  docMeta: { fontSize: 9, color: '#374151', marginTop: 6 },
  docMetaLabel: { fontFamily: 'Helvetica-Bold', color: '#6b7280' },
  divider: { borderBottom: '1pt solid #111827', marginBottom: 14 },
  twoCol: { flexDirection: 'row', gap: 24, marginBottom: 18 },
  partyCol: { flex: 1 },
  partyHeading: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
    paddingBottom: 3,
    borderBottom: '0.5pt solid #d1d5db',
  },
  partyName: { fontSize: 10.5, fontFamily: 'Helvetica-Bold', color: '#111827', marginBottom: 2 },
  partyLine: { fontSize: 9, color: '#374151', marginBottom: 1.5 },
  metaTable: { marginBottom: 18, border: '0.5pt solid #d1d5db' },
  metaRow: { flexDirection: 'row' },
  metaCell: {
    flex: 1,
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderRight: '0.5pt solid #d1d5db',
  },
  metaCellLast: { flex: 1, paddingVertical: 5, paddingHorizontal: 6 },
  metaHead: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaHeadBg: { backgroundColor: '#111827' },
  metaValue: { fontSize: 9, color: '#111827' },
  itemsHeader: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  itemsHeaderText: {
    color: '#ffffff',
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemRow: {
    flexDirection: 'row',
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderBottom: '0.5pt solid #e5e7eb',
  },
  itemRowAlt: { backgroundColor: '#f9fafb' },
  colQty: { width: '10%', textAlign: 'center' },
  colDesc: { width: '60%', paddingRight: 6 },
  colUnit: { width: '15%', textAlign: 'right' },
  colTotal: { width: '15%', textAlign: 'right' },
  itemCell: { fontSize: 9, color: '#111827' },
  itemDescMain: { fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: '#111827' },
  itemDescSub: { fontSize: 8, color: '#6b7280', marginTop: 1 },
  totalsWrap: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  totalsBox: { width: '45%' },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  totalsLabel: { fontSize: 9.5, color: '#374151' },
  totalsValue: { fontSize: 9.5, color: '#111827', fontFamily: 'Helvetica-Bold' },
  grandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: '#111827',
    marginTop: 4,
  },
  grandLabel: { fontSize: 11, color: '#ffffff', fontFamily: 'Helvetica-Bold', letterSpacing: 1 },
  grandValue: { fontSize: 13, color: '#ffffff', fontFamily: 'Helvetica-Bold' },
  notesWrap: { marginTop: 22 },
  notesHeading: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  notesText: { fontSize: 9, color: '#374151', lineHeight: 1.5 },
  declaracao: {
    marginBottom: 16,
    padding: 10,
    borderLeft: '2pt solid #111827',
    backgroundColor: '#f9fafb',
  },
  declaracaoText: { fontSize: 10, color: '#111827', lineHeight: 1.5 },
  declaracaoBold: { fontFamily: 'Helvetica-Bold' },
  paidStamp: {
    position: 'absolute',
    top: 180,
    right: 60,
    border: '3pt solid #047857',
    color: '#047857',
    fontFamily: 'Helvetica-Bold',
    fontSize: 28,
    paddingHorizontal: 18,
    paddingVertical: 6,
    transform: 'rotate(-12deg)',
    letterSpacing: 3,
  },
  thanks: {
    marginTop: 18,
    textAlign: 'center',
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 10,
    borderTop: '0.5pt solid #e5e7eb',
    textAlign: 'center',
    fontSize: 7.5,
    color: '#9ca3af',
  },
});

export type LineItem = { qtd: number; descricao: string; detalhe?: string; unit: number };

export function buildItems(servico: any): LineItem[] {
  const detalhes = servico.detalhes_servico || {};
  const categoria = detalhes.categoria;
  const items: LineItem[] = [];

  // Main service – uses base value when category-specific line items exist,
  // otherwise the full valor_total
  const dominio = Number(detalhes.valor_dominio) || 0;
  const hospedagem = detalhes.hospedagem_gratuita ? 0 : Number(detalhes.valor_hospedagem) || 0;
  const trafego = Number(detalhes.orcamento_anuncios) || 0;
  const extras = dominio + hospedagem + trafego;
  const total = Number(servico.valor_total) || 0;
  const base = Math.max(total - extras, 0);

  items.push({
    qtd: 1,
    descricao: servico.nome_servico || 'Serviço',
    detalhe: CATEGORY_LABELS[categoria] || undefined,
    unit: base,
  });

  if (categoria === 'website') {
    if (dominio > 0) {
      items.push({
        qtd: 1,
        descricao: 'Registo de Domínio',
        detalhe: detalhes.nome_dominio || 'Anual',
        unit: dominio,
      });
    }
    if (Number(detalhes.valor_hospedagem) > 0 && !detalhes.hospedagem_gratuita) {
      items.push({
        qtd: 1,
        descricao: 'Hospedagem Web',
        detalhe: 'Plano contratado',
        unit: hospedagem,
      });
    }
    if (detalhes.hospedagem_gratuita) {
      items.push({
        qtd: 1,
        descricao: 'Hospedagem Web — Cortesia',
        detalhe: `${detalhes.periodo_hospedagem_gratuita || 0} meses gratuitos`,
        unit: 0,
      });
    }
  }

  if (categoria === 'trafego_pago' && trafego > 0) {
    items.push({
      qtd: 1,
      descricao: 'Orçamento de Anúncios',
      detalhe: detalhes.plataformas || 'Plataformas digitais',
      unit: trafego,
    });
  }

  return items;
}

const fmt = (n: number) => n.toFixed(2);

interface DocumentLayoutProps {
  docTitle: string;
  docNumberLabel: string;
  docNumber: string;
  docDateLabel?: string;
  docDate?: string;
  extraMetaLabel?: string;
  extraMetaValue?: string;
  servico: any;
  cliente: any;
  empresa: any;
  metaColumns: { head: string; value: string }[];
  notes?: { heading: string; text: string }[];
  showPaidStamp?: boolean;
  preamble?: React.ReactNode;
  thanksText?: string;
}

export function InvoiceDocument({
  docTitle,
  docNumberLabel,
  docNumber,
  docDateLabel = 'Data',
  docDate,
  extraMetaLabel,
  extraMetaValue,
  servico,
  cliente,
  empresa,
  metaColumns,
  notes = [],
  showPaidStamp,
  preamble,
  thanksText,
}: DocumentLayoutProps) {
  const items = buildItems(servico);
  const subtotal = items.reduce((s, i) => s + i.qtd * i.unit, 0);
  const total = Number(servico.valor_total) || subtotal;
  const desconto = Math.max(subtotal - total, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {showPaidStamp && <Text style={styles.paidStamp}>PAGO</Text>}

        {/* Top: Logo + Empresa | Título do Documento */}
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
            <Text style={styles.docTitle}>{docTitle}</Text>
            <Text style={styles.docMeta}>
              <Text style={styles.docMetaLabel}>{docNumberLabel}: </Text>
              {docNumber}
            </Text>
            {docDate && (
              <Text style={styles.docMeta}>
                <Text style={styles.docMetaLabel}>{docDateLabel}: </Text>
                {docDate}
              </Text>
            )}
            {extraMetaLabel && extraMetaValue && (
              <Text style={styles.docMeta}>
                <Text style={styles.docMetaLabel}>{extraMetaLabel}: </Text>
                {extraMetaValue}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        {preamble}

        {/* Faturar para / Enviar para */}
        <View style={styles.twoCol}>
          <View style={styles.partyCol}>
            <Text style={styles.partyHeading}>Faturar para</Text>
            <Text style={styles.partyName}>{cliente?.nome || 'N/A'}</Text>
            {cliente?.endereco && <Text style={styles.partyLine}>{cliente.endereco}</Text>}
            {cliente?.telefone && <Text style={styles.partyLine}>Tel: {cliente.telefone}</Text>}
            {cliente?.email && <Text style={styles.partyLine}>{cliente.email}</Text>}
          </View>
          <View style={styles.partyCol}>
            <Text style={styles.partyHeading}>Enviar para</Text>
            <Text style={styles.partyName}>{cliente?.nome || 'N/A'}</Text>
            {cliente?.endereco ? (
              <Text style={styles.partyLine}>{cliente.endereco}</Text>
            ) : (
              <Text style={styles.partyLine}>—</Text>
            )}
            {cliente?.telefone && <Text style={styles.partyLine}>Tel: {cliente.telefone}</Text>}
          </View>
        </View>

        {/* Meta-tabela (Vendedor, Nº pedido, etc.) */}
        <View style={styles.metaTable}>
          <View style={[styles.metaRow, styles.metaHeadBg]}>
            {metaColumns.map((c, i) => (
              <View
                key={`h-${i}`}
                style={i === metaColumns.length - 1 ? styles.metaCellLast : styles.metaCell}
              >
                <Text style={styles.metaHead}>{c.head}</Text>
              </View>
            ))}
          </View>
          <View style={styles.metaRow}>
            {metaColumns.map((c, i) => (
              <View
                key={`v-${i}`}
                style={i === metaColumns.length - 1 ? styles.metaCellLast : styles.metaCell}
              >
                <Text style={styles.metaValue}>{c.value || '—'}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tabela de itens */}
        <View>
          <View style={styles.itemsHeader}>
            <Text style={[styles.itemsHeaderText, styles.colQty]}>Qtd</Text>
            <Text style={[styles.itemsHeaderText, styles.colDesc]}>Descrição</Text>
            <Text style={[styles.itemsHeaderText, styles.colUnit]}>Preço Unit.</Text>
            <Text style={[styles.itemsHeaderText, styles.colTotal]}>Total</Text>
          </View>
          {items.map((it, idx) => (
            <View
              key={idx}
              style={[styles.itemRow, idx % 2 === 1 ? styles.itemRowAlt : {}]}
            >
              <Text style={[styles.itemCell, styles.colQty]}>{it.qtd}</Text>
              <View style={styles.colDesc}>
                <Text style={styles.itemDescMain}>{it.descricao}</Text>
                {it.detalhe && <Text style={styles.itemDescSub}>{it.detalhe}</Text>}
              </View>
              <Text style={[styles.itemCell, styles.colUnit]}>{fmt(it.unit)}</Text>
              <Text style={[styles.itemCell, styles.colTotal]}>{fmt(it.qtd * it.unit)}</Text>
            </View>
          ))}
        </View>

        {/* Totais */}
        <View style={styles.totalsWrap}>
          <View style={styles.totalsBox}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Subtotal</Text>
              <Text style={styles.totalsValue}>{fmt(subtotal)} MT</Text>
            </View>
            {desconto > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Desconto</Text>
                <Text style={styles.totalsValue}>- {fmt(desconto)} MT</Text>
              </View>
            )}
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Imposto</Text>
              <Text style={styles.totalsValue}>0.00 MT</Text>
            </View>
            <View style={styles.grandRow}>
              <Text style={styles.grandLabel}>TOTAL</Text>
              <Text style={styles.grandValue}>{fmt(total)} MT</Text>
            </View>
          </View>
        </View>

        {/* Notas */}
        {notes.length > 0 && (
          <View style={styles.notesWrap}>
            {notes.map((n, i) => (
              <View key={i} style={{ marginBottom: 8 }}>
                <Text style={styles.notesHeading}>{n.heading}</Text>
                <Text style={styles.notesText}>{n.text}</Text>
              </View>
            ))}
          </View>
        )}

        {thanksText && <Text style={styles.thanks}>{thanksText}</Text>}

        <View style={styles.footer}>
          <Text>
            Documento gerado em {new Date().toLocaleDateString('pt-MZ')} às{' '}
            {new Date().toLocaleTimeString('pt-MZ')} — {empresa?.nome || 'LG TecServ'}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

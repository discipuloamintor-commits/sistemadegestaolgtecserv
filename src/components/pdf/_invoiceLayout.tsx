import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import logoImg from '@/assets/logo.png';

export const CATEGORY_LABELS: Record<string, string> = {
  website: 'Criação de Website',
  aplicativo: 'Criação de Aplicativo',
  sistema: 'Criação de Sistema',
  trafego_pago: 'Gestão de Tráfego Pago',
  redes_sociais: 'Gestão de Redes Sociais',
  instalacao_eletrica: 'Instalação Elétrica',
  topografia: 'Levantamento Topográfico',
  outro: 'Outro',
};

export const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 10,
    fontFamily: 'Times-Roman',
    backgroundColor: '#ffffff',
    color: '#111827',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerLeft: { width: '60%', flexDirection: 'row', alignItems: 'center' },
  headerRight: { width: '40%', alignItems: 'flex-end' },
  logo: { width: 100, height: 60, objectFit: 'contain', marginRight: 14 },
  companyInfo: { flex: 1 },
  companyName: { fontSize: 16, fontFamily: 'Times-Bold', color: '#5932ea', marginBottom: 4, textTransform: 'uppercase' },
  companyText: { fontSize: 9, color: '#4b5563', marginBottom: 2 },
  docTitle: { fontSize: 22, fontFamily: 'Times-Bold', color: '#111827', textTransform: 'uppercase', marginBottom: 6 },
  docNumberBox: { borderWidth: 1, borderColor: '#ef4444', borderRadius: 4, padding: 6, paddingHorizontal: 12, marginBottom: 6 },
  docNumberText: { fontSize: 12, fontFamily: 'Times-Bold', color: '#ef4444' },
  docDateLine: { fontSize: 10, color: '#374151', marginTop: 2, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingVertical: 2, paddingHorizontal: 8 },
  
  // Client Box
  clientBox: {
    borderWidth: 1,
    borderColor: '#5932ea',
    borderRadius: 4,
    padding: 10,
    marginBottom: 16,
    width: '100%',
  },
  clientLine: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'flex-end',
  },
  clientLabel: {
    fontFamily: 'Times-Bold',
    fontSize: 10,
    color: '#5932ea',
    width: 65,
  },
  clientValue: {
    fontSize: 10,
    color: '#111827',
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    borderBottomStyle: 'solid',
    paddingBottom: 2,
  },

  // Meta Table
  metaTable: { marginBottom: 16, borderWidth: 1, borderColor: '#5932ea', borderRadius: 2 },
  metaRow: { flexDirection: 'row' },
  metaCell: {
    flex: 1,
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderRightWidth: 1,
    borderRightColor: '#5932ea',
    textAlign: 'center',
  },
  metaCellLast: { flex: 1, paddingVertical: 5, paddingHorizontal: 6, textAlign: 'center' },
  metaHead: {
    fontSize: 8,
    fontFamily: 'Times-Bold',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  metaHeadBg: { backgroundColor: '#5932ea', borderBottomWidth: 1, borderBottomColor: '#5932ea' },
  metaValue: { fontSize: 9, color: '#111827' },

  // Main Table Grid
  tableContainer: {
    borderWidth: 1,
    borderColor: '#5932ea',
    borderRadius: 2,
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f0ff',
    borderBottomWidth: 1,
    borderBottomColor: '#5932ea',
  },
  tableHeaderCell: {
    paddingVertical: 6,
    paddingHorizontal: 4,
    fontSize: 9,
    fontFamily: 'Times-Bold',
    color: '#5932ea',
    textAlign: 'center',
    borderRightWidth: 1,
    borderRightColor: '#5932ea',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#5932ea',
  },
  tableRowLast: {
    flexDirection: 'row',
  },
  tableCell: {
    paddingVertical: 6,
    paddingHorizontal: 4,
    fontSize: 9,
    color: '#111827',
    borderRightWidth: 1,
    borderRightColor: '#5932ea',
    display: 'flex',
    justifyContent: 'center',
    minHeight: 24,
  },
  tableCellCompact: {
    paddingVertical: 4,
    minHeight: 18,
  },
  tableCellLast: {
    borderRightWidth: 0,
  },
  
  col1: { width: '10%', textAlign: 'center' },
  col2: { width: '60%', textAlign: 'left', paddingHorizontal: 8 },
  col3: { width: '15%', textAlign: 'right', paddingHorizontal: 6 },
  col4: { width: '15%', textAlign: 'right', paddingHorizontal: 6 },

  itemDescMain: { fontSize: 9.5, fontFamily: 'Times-Bold', color: '#111827' },
  itemDescMainCompact: { fontSize: 8.5 },
  itemDescSub: { fontSize: 8, color: '#6b7280', marginTop: 1 },
  itemDescSubCompact: { fontSize: 7, marginTop: 0 },

  // Totals Area
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  paymentBox: {
    width: '55%',
    padding: 8,
  },
  paymentLabel: { fontSize: 9, fontFamily: 'Times-Bold', color: '#5932ea', marginBottom: 6 },
  paymentRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  checkbox: { width: 10, height: 10, borderWidth: 1, borderColor: '#5932ea', marginRight: 6 },
  paymentText: { fontSize: 9, color: '#374151' },
  
  notesHeading: {
    fontSize: 8,
    fontFamily: 'Times-Bold',
    color: '#5932ea',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  notesText: { fontSize: 9, color: '#374151', lineHeight: 1.5 },
  
  totalsBox: {
    width: '40%',
    borderWidth: 1,
    borderColor: '#5932ea',
    borderRadius: 2,
    alignSelf: 'flex-start',
  },
  totalsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#5932ea',
  },
  totalsRowLast: {
    flexDirection: 'row',
  },
  totalsLabelBox: {
    width: '50%',
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderRightWidth: 1,
    borderRightColor: '#5932ea',
    backgroundColor: '#f3f0ff',
  },
  totalsLabel: {
    fontSize: 9,
    fontFamily: 'Times-Bold',
    color: '#5932ea',
    textAlign: 'right',
  },
  totalsValueBox: {
    width: '50%',
    paddingVertical: 5,
    paddingHorizontal: 6,
    justifyContent: 'center',
  },
  totalsValue: {
    fontSize: 10,
    fontFamily: 'Times-Bold',
    color: '#111827',
    textAlign: 'right',
  },
  
  // Signature Area
  signatureArea: {
    marginTop: 60,
    alignItems: 'flex-end',
    paddingRight: 20,
  },
  signatureLine: {
    width: 200,
    borderBottomWidth: 1,
    borderBottomColor: '#111827',
    marginBottom: 6,
  },
  signatureText: {
    fontSize: 9,
    fontFamily: 'Times-Bold',
    color: '#5932ea',
    textAlign: 'center',
    width: 200,
  },
  
  paidStamp: {
    position: 'absolute',
    top: 250,
    right: 60,
    border: '3pt solid #047857',
    color: '#047857',
    fontFamily: 'Times-Bold',
    fontSize: 32,
    paddingHorizontal: 20,
    paddingVertical: 8,
    transform: 'rotate(-15deg)',
    letterSpacing: 4,
    opacity: 0.8,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 36,
    right: 36,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
    textAlign: 'center',
    fontSize: 8,
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

  if (detalhes.itens_gerais && Array.isArray(detalhes.itens_gerais) && detalhes.itens_gerais.length > 0) {
    detalhes.itens_gerais.forEach((it: any) => {
      let detalhe = "";
      if (it.periodo === "mensal") detalhe = "Período: Mensal";
      if (it.periodo === "anual") detalhe = "Período: Anual (12 meses)";
      
      items.push({
        qtd: it.qtd,
        descricao: it.descricao,
        detalhe: detalhe || undefined,
        unit: Number(it.unitario) * (it.periodo === "anual" ? 12 : 1),
      });
    });
    return items;
  }

  if (categoria !== 'instalacao_eletrica' && categoria !== 'topografia') {
    items.push({
      qtd: 1,
      descricao: servico.nome_servico || 'Serviço',
      detalhe: CATEGORY_LABELS[categoria] || undefined,
      unit: base,
    });
  }

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

  if (categoria === 'instalacao_eletrica') {
    detalhes.itens_servico?.forEach((item: any) => {
      items.push({
        qtd: Number(item.quantidade) || 1,
        descricao: item.nome,
        detalhe: `${item.marca || ''} ${item.cor || ''}`.trim(),
        unit: Number(item.preco_unitario),
      });
    });
    if (detalhes.incluir_mao_de_obra) {
      items.push({
        qtd: 1,
        descricao: 'Mão de Obra / Serviço de Instalação',
        detalhe: 'Serviço Técnico',
        unit: Number(detalhes.valor_mao_de_obra) || 0,
      });
    }
  }

  if (categoria === 'topografia') {
    items.push({
      qtd: 1,
      descricao: 'Levantamento Topográfico',
      detalhe: `Área: ${detalhes.area_local} m²/ha`,
      unit: Number(detalhes.valor_mao_de_obra) || 0,
    });
    if (Number(detalhes.valor_transporte) > 0) {
      items.push({
        qtd: 1,
        descricao: 'Deslocação e Logística',
        detalhe: 'Transporte',
        unit: Number(detalhes.valor_transporte),
      });
    }
    if (!detalhes.equipamento_empresa && Number(detalhes.custo_aluguel) > 0) {
      items.push({
        qtd: 1,
        descricao: 'Aluguer de Equipamentos',
        detalhe: detalhes.instrumentos || 'Equipamento especializado',
        unit: Number(detalhes.custo_aluguel),
      });
    }
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
  const detalhes = servico.detalhes_servico || {};
  
  const subtotal = detalhes.subtotal !== undefined ? Number(detalhes.subtotal) : items.reduce((s, i) => s + i.qtd * i.unit, 0);
  const impostoIva = detalhes.imposto_iva !== undefined ? Number(detalhes.imposto_iva) : 0;
  const total = Number(servico.valor_total) || (subtotal + impostoIva);
  const desconto = Math.max((subtotal + impostoIva) - total, 0);

  const isCompact = items.length > 8;
  const numRows = Math.max(4, items.length);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {showPaidStamp && <Text style={styles.paidStamp}>PAGO</Text>}

        {/* Top: Logo + Empresa | Título do Documento */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Image src={logoImg} style={styles.logo} />
            <View style={styles.companyInfo}>
              {empresa?.endereco && <Text style={styles.companyText}>{empresa.endereco}</Text>}
              {empresa?.contato && <Text style={styles.companyText}>Tel: {empresa.contato}</Text>}
              {empresa?.email && <Text style={styles.companyText}>{empresa.email}</Text>}
              {empresa?.nuit && <Text style={styles.companyText}>NUIT: {empresa.nuit}</Text>}
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.docTitle}>{docTitle}</Text>
            <View style={styles.docNumberBox}>
              <Text style={styles.docNumberText}>{docNumberLabel}: {docNumber}</Text>
            </View>
            <Text style={styles.docDateLine}>{docDateLabel}: {docDate || new Date().toLocaleDateString('pt-MZ')}</Text>
          </View>
        </View>

        {preamble}

        {/* Client Box */}
        <View style={styles.clientBox}>
          <View style={styles.clientLine}>
            <Text style={styles.clientLabel}>Exmo. Sr(a):</Text>
            <Text style={styles.clientValue}>{cliente?.nome || ''}</Text>
          </View>
          <View style={styles.clientLine}>
            <Text style={styles.clientLabel}>Morada:</Text>
            <Text style={styles.clientValue}>{cliente?.endereco || ''}</Text>
          </View>
          <View style={styles.clientLine}>
            <Text style={styles.clientLabel}>NUIT:</Text>
            <Text style={styles.clientValue}>{(cliente as any)?.nuit || ''}</Text>
          </View>
        </View>

        {/* Meta-tabela (Vendedor, Nº pedido, etc.) */}
        {metaColumns && metaColumns.length > 0 && (
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
        )}

        {/* Main Table Grid */}
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.col1]}>Quant.</Text>
            <Text style={[styles.tableHeaderCell, styles.col2]}>Designação</Text>
            <Text style={[styles.tableHeaderCell, styles.col3]}>Preço Unit.</Text>
            <Text style={[styles.tableHeaderCell, styles.col4, styles.tableCellLast]}>Preço Total</Text>
          </View>
          
          {Array.from({ length: numRows }).map((_, idx) => {
            const it = items[idx];
            const isLast = idx === numRows - 1;
            
            if (it) {
              return (
                <View key={idx} style={isLast ? styles.tableRowLast : styles.tableRow}>
                  <Text style={[styles.tableCell, isCompact && styles.tableCellCompact, styles.col1]}>{it.qtd}</Text>
                  <View style={[styles.tableCell, isCompact && styles.tableCellCompact, styles.col2]}>
                    <Text style={[styles.itemDescMain, isCompact && styles.itemDescMainCompact]}>{it.descricao}</Text>
                    {it.detalhe && <Text style={[styles.itemDescSub, isCompact && styles.itemDescSubCompact]}>{it.detalhe}</Text>}
                  </View>
                  <Text style={[styles.tableCell, isCompact && styles.tableCellCompact, styles.col3]}>{fmt(it.unit)}</Text>
                  <Text style={[styles.tableCell, isCompact && styles.tableCellCompact, styles.col4, styles.tableCellLast]}>{fmt(it.qtd * it.unit)}</Text>
                </View>
              );
            }
            
            return (
              <View key={`empty-${idx}`} style={isLast ? styles.tableRowLast : styles.tableRow}>
                <Text style={[styles.tableCell, isCompact && styles.tableCellCompact, styles.col1]}> </Text>
                <Text style={[styles.tableCell, isCompact && styles.tableCellCompact, styles.col2]}> </Text>
                <Text style={[styles.tableCell, isCompact && styles.tableCellCompact, styles.col3]}> </Text>
                <Text style={[styles.tableCell, isCompact && styles.tableCellCompact, styles.col4, styles.tableCellLast]}> </Text>
              </View>
            );
          })}
        </View>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          <View style={styles.paymentBox}>
            <Text style={styles.paymentLabel}>Formas de Pagamento</Text>
            <View style={styles.paymentRow}>
              <View style={styles.checkbox} />
              <Text style={styles.paymentText}>Dinheiro</Text>
              <View style={[styles.checkbox, { marginLeft: 16 }]} />
              <Text style={styles.paymentText}>Cheque nº ____________</Text>
            </View>
            <View style={styles.paymentRow}>
              <View style={styles.checkbox} />
              <Text style={styles.paymentText}>Transferência Bancária / M-Pesa</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentText}>Requisição nº _________________________</Text>
            </View>
            
            {notes && notes.length > 0 && (
              <View style={{ marginTop: 12 }}>
                 {notes.map((n, i) => (
                  <View key={i} style={{ marginBottom: 6 }}>
                    <Text style={styles.notesHeading}>{n.heading}</Text>
                    <Text style={styles.notesText}>{n.text}</Text>
                  </View>
                ))}
              </View>
            )}
            
          </View>
          
          <View style={styles.totalsBox}>
            <View style={styles.totalsRow}>
              <View style={styles.totalsLabelBox}><Text style={styles.totalsLabel}>SUB-TOTAL</Text></View>
              <View style={styles.totalsValueBox}><Text style={styles.totalsValue}>{fmt(subtotal)}</Text></View>
            </View>
            {desconto > 0 && (
              <View style={styles.totalsRow}>
                <View style={styles.totalsLabelBox}><Text style={styles.totalsLabel}>DESCONTO</Text></View>
                <View style={styles.totalsValueBox}><Text style={styles.totalsValue}>- {fmt(desconto)}</Text></View>
              </View>
            )}
            <View style={styles.totalsRow}>
              <View style={styles.totalsLabelBox}><Text style={styles.totalsLabel}>IVA (16%)</Text></View>
              <View style={styles.totalsValueBox}><Text style={styles.totalsValue}>{fmt(impostoIva)}</Text></View>
            </View>
            <View style={styles.totalsRowLast}>
              <View style={styles.totalsLabelBox}><Text style={styles.totalsLabel}>TOTAL GLOBAL</Text></View>
              <View style={styles.totalsValueBox}><Text style={styles.totalsValue}>{fmt(total)} MT</Text></View>
            </View>
          </View>
        </View>

        {/* Signature Area */}
        <View style={styles.signatureArea}>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureText}>Assinatura e Carimbo</Text>
        </View>

        <View style={styles.footer}>
          <Text>
            Documento processado por computador em {new Date().toLocaleDateString('pt-MZ')} às{' '}
            {new Date().toLocaleTimeString('pt-MZ')} — {empresa?.nome || 'LG TecServ'}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

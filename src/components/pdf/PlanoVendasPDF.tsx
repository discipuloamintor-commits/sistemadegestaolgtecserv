import { Document, Page, Text, View } from '@react-pdf/renderer';
import { styles } from './_invoiceLayout';
import { Image } from '@react-pdf/renderer';
import logoImg from '@/assets/logo.png';

export interface PlanoVendasItem {
  descricao: string;
  qtd: number;
  preco: number;
}

interface PlanoVendasPDFProps {
  numero: string;
  data: string;
  validade?: string;
  cliente: any;
  empresa: any;
  itens: PlanoVendasItem[];
  observacoes?: string;
}

const fmt = (n: number) => n.toFixed(2);

export function PlanoVendasPDF({
  numero, data, validade, cliente, empresa, itens, observacoes,
}: PlanoVendasPDFProps) {
  const subtotal = itens.reduce((s, i) => s + i.qtd * i.preco, 0);

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
            <Text style={styles.docTitle}>PLANO DE VENDAS</Text>
            <Text style={styles.docMeta}>
              <Text style={styles.docMetaLabel}>Nº: </Text>{numero}
            </Text>
            <Text style={styles.docMeta}>
              <Text style={styles.docMetaLabel}>Data: </Text>{data}
            </Text>
            {validade && (
              <Text style={styles.docMeta}>
                <Text style={styles.docMetaLabel}>Válido até: </Text>{validade}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.twoCol}>
          <View style={styles.partyCol}>
            <Text style={styles.partyHeading}>Apresentado a</Text>
            <Text style={styles.partyName}>{cliente?.nome || 'N/A'}</Text>
            {cliente?.endereco && <Text style={styles.partyLine}>{cliente.endereco}</Text>}
            {cliente?.telefone && <Text style={styles.partyLine}>Tel: {cliente.telefone}</Text>}
            {cliente?.email && <Text style={styles.partyLine}>{cliente.email}</Text>}
            {cliente?.nuit && <Text style={styles.partyLine}>NUIT: {cliente.nuit}</Text>}
          </View>
          <View style={styles.partyCol}>
            <Text style={styles.partyHeading}>Emitido por</Text>
            <Text style={styles.partyName}>{empresa?.nome || 'LG TecServ'}</Text>
            {empresa?.endereco && <Text style={styles.partyLine}>{empresa.endereco}</Text>}
            {empresa?.contato && <Text style={styles.partyLine}>{empresa.contato}</Text>}
          </View>
        </View>

        <View>
          <View style={styles.itemsHeader}>
            <Text style={[styles.itemsHeaderText, styles.colQty]}>Qtd</Text>
            <Text style={[styles.itemsHeaderText, styles.colDesc]}>Descrição</Text>
            <Text style={[styles.itemsHeaderText, styles.colUnit]}>Preço Unit.</Text>
            <Text style={[styles.itemsHeaderText, styles.colTotal]}>Total</Text>
          </View>
          {itens.map((it, idx) => (
            <View key={idx} style={[styles.itemRow, idx % 2 === 1 ? styles.itemRowAlt : {}]}>
              <Text style={[styles.itemCell, styles.colQty]}>{it.qtd}</Text>
              <View style={styles.colDesc}>
                <Text style={styles.itemDescMain}>{it.descricao}</Text>
              </View>
              <Text style={[styles.itemCell, styles.colUnit]}>{fmt(it.preco)}</Text>
              <Text style={[styles.itemCell, styles.colTotal]}>{fmt(it.qtd * it.preco)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsWrap}>
          <View style={styles.totalsBox}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Subtotal</Text>
              <Text style={styles.totalsValue}>{fmt(subtotal)} MT</Text>
            </View>
            <View style={styles.grandRow}>
              <Text style={styles.grandLabel}>TOTAL</Text>
              <Text style={styles.grandValue}>{fmt(subtotal)} MT</Text>
            </View>
          </View>
        </View>

        {observacoes && (
          <View style={styles.notesWrap}>
            <Text style={styles.notesHeading}>Observações</Text>
            <Text style={styles.notesText}>{observacoes}</Text>
          </View>
        )}

        <Text style={styles.thanks}>Plano de Vendas — Sujeito a aprovação</Text>

        <View style={styles.footer}>
          <Text>Documento gerado em {new Date().toLocaleDateString('pt-MZ')} — {empresa?.nome || 'LG TecServ'}</Text>
        </View>
      </Page>
    </Document>
  );
}

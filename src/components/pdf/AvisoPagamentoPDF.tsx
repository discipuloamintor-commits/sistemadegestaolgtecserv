import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import logoImg from '@/assets/logo.png';

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 10,
        fontFamily: 'Helvetica',
        backgroundColor: '#ffffff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 12,
        borderBottom: '1pt solid #e2e8f0',
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
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4c1d95',
        marginBottom: 4,
    },
    companyDetails: {
        fontSize: 8,
        color: '#64748b',
        marginBottom: 2,
    },
    titleSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f766e',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    dateInfo: {
        textAlign: 'right',
    },
    dateLabel: {
        fontSize: 8,
        color: '#64748b',
    },
    dateValue: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#4c1d95',
    },
    alertBox: {
        marginBottom: 16,
        padding: 10,
        backgroundColor: '#f8fafc',
        borderLeft: '3pt solid #0f766e',
        borderRadius: 4,
    },
    alertTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#0f766e',
        marginBottom: 4,
    },
    alertText: {
        fontSize: 9,
        color: '#334155',
        lineHeight: 1.4,
    },
    alertBold: {
        fontWeight: 'bold',
        color: '#1e293b',
    },
    section: {
        marginBottom: 12,
        padding: 10,
        backgroundColor: '#f8fafc',
        borderRadius: 4,
        border: '0.5pt solid #e2e8f0',
    },
    sectionTitle: {
        fontSize: 9,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#4c1d95',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
        paddingBottom: 4,
        borderBottom: '0.5pt solid #e2e8f0',
    },
    label: {
        fontWeight: 'bold',
        width: '40%',
        color: '#64748b',
        fontSize: 9,
    },
    value: {
        width: '60%',
        color: '#1e293b',
        fontSize: 9,
    },
    tableContainer: {
        marginBottom: 16,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#4c1d95',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },
    tableHeaderText: {
        color: '#ffffff',
        fontSize: 8,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderBottom: '0.5pt solid #e2e8f0',
        backgroundColor: '#ffffff',
    },
    tableRowAlt: {
        flexDirection: 'row',
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderBottom: '0.5pt solid #e2e8f0',
        backgroundColor: '#f8fafc',
    },
    tableCell: {
        fontSize: 9,
        color: '#1e293b',
    },
    colItem: { width: '30%' },
    colDescricao: { width: '40%' },
    colValor: { width: '30%', textAlign: 'right' },
    totalSection: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 16,
    },
    totalBox: {
        width: '40%',
        padding: 10,
        backgroundColor: '#0f766e',
        borderRadius: 4,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    totalLabel: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    totalValue: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    vencimentoBox: {
        marginBottom: 16,
        padding: 12,
        backgroundColor: '#f0fdfa',
        border: '1pt solid #0f766e',
        borderRadius: 4,
        textAlign: 'center',
    },
    vencimentoTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#0f766e',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    vencimentoData: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#115e59',
    },
    pagamentoSection: {
        marginBottom: 16,
        padding: 10,
        backgroundColor: '#f8fafc',
        borderRadius: 4,
        border: '0.5pt solid #e2e8f0',
    },
    pagamentoTitle: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#4c1d95',
        marginBottom: 6,
        textTransform: 'uppercase',
    },
    pagamentoItem: {
        fontSize: 8,
        color: '#334155',
        marginBottom: 2,
    },
    observacoes: {
        marginBottom: 12,
        padding: 8,
        backgroundColor: '#f8fafc',
        borderLeft: '2pt solid #e2e8f0',
        fontSize: 9,
        color: '#475569',
    },
    footer: {
        marginTop: 'auto',
        paddingTop: 12,
        borderTop: '0.5pt solid #e2e8f0',
        textAlign: 'center',
        fontSize: 7,
        color: '#94a3b8',
    },
});

interface AvisoPagamentoProps {
    cliente: any;
    empresa: any;
    nomeDominio?: string;
    valorDominio?: number;
    valorHospedagem?: number;
    dataVencimento: string;
    dataVencimentoHospedagem?: string;
    periodoRenovacao?: string;
    observacoes?: string;
}

export function AvisoPagamentoPDF({
    cliente,
    empresa,
    nomeDominio,
    valorDominio = 0,
    valorHospedagem = 0,
    dataVencimento,
    dataVencimentoHospedagem,
    periodoRenovacao = 'anual',
    observacoes,
}: AvisoPagamentoProps) {
    const total = valorDominio + valorHospedagem;
    const periodoLabels: Record<string, string> = {
        anual: 'Anual',
        semestral: 'Semestral',
        mensal: 'Mensal',
    };

    const formatDate = (isoString?: string) => {
        if (!isoString) return '';
        return new Date(isoString).toLocaleDateString('pt-MZ');
    };

    const items: { item: string; descricao: string; valor: number }[] = [];
    if (valorDominio > 0) {
        items.push({
            item: 'Domínio',
            descricao: (nomeDominio || 'Registo/Renovação de domínio') + ` (Vence a ${formatDate(dataVencimento)})`,
            valor: valorDominio,
        });
    }
    if (valorHospedagem > 0) {
        let descricaoHospedagem = `Alojamento web — Plano ${periodoLabels[periodoRenovacao] || periodoRenovacao}`;

        if (periodoRenovacao === 'anual') {
            const valorMensal = valorHospedagem / 12;
            descricaoHospedagem += ` (Equivalente mensal: ${valorMensal.toFixed(2)} MT)`;
        } else if (periodoRenovacao === 'semestral') {
            const valorMensal = valorHospedagem / 6;
            descricaoHospedagem += ` (Equivalente mensal: ${valorMensal.toFixed(2)} MT)`;
        }

        const hospDate = dataVencimentoHospedagem || dataVencimento; // Fallback to dataVencimento if missing
        descricaoHospedagem += ` (Vence a ${formatDate(hospDate)})`;

        items.push({
            item: 'Hospedagem',
            descricao: descricaoHospedagem,
            valor: valorHospedagem,
        });
    }

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Image src={logoImg} style={styles.logo} />
                    <View style={styles.companyInfo}>
                        {/* Removido o Texto LG TecServ para evitar duplicação com o logo */}
                        {empresa?.nuit && <Text style={styles.companyDetails}>NUIT: {empresa.nuit}</Text>}
                        {empresa?.endereco && <Text style={styles.companyDetails}>{empresa.endereco}</Text>}
                        {empresa?.contato && <Text style={styles.companyDetails}>{empresa.contato}</Text>}
                    </View>
                </View>

                {/* Title */}
                <View style={styles.titleSection}>
                    <Text style={styles.title}>Aviso de Pagamento</Text>
                    <View style={styles.dateInfo}>
                        <Text style={styles.dateLabel}>Data de Emissão</Text>
                        <Text style={styles.dateValue}>{new Date().toLocaleDateString('pt-MZ')}</Text>
                    </View>
                </View>

                {/* Alert */}
                <View style={styles.alertBox}>
                    <Text style={styles.alertTitle}>Aviso de Renovação</Text>
                    <Text style={styles.alertText}>
                        Prezado(a) <Text style={styles.alertBold}>{cliente?.nome || 'Cliente'}</Text>, informamos que os serviços
                        abaixo indicados estão próximos da data de renovação. Para garantir a continuidade dos serviços,
                        solicitamos que efetue o pagamento até à data de vencimento.
                    </Text>
                </View>

                {/* Client Data */}
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

                {/* Items Table */}
                <View style={styles.tableContainer}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableHeaderText, styles.colItem]}>Item</Text>
                        <Text style={[styles.tableHeaderText, styles.colDescricao]}>Descrição</Text>
                        <Text style={[styles.tableHeaderText, styles.colValor]}>Valor (MT)</Text>
                    </View>
                    {items.map((item, index) => (
                        <View key={index} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                            <Text style={[styles.tableCell, styles.colItem, { fontWeight: 'bold' }]}>{item.item}</Text>
                            <Text style={[styles.tableCell, styles.colDescricao]}>{item.descricao}</Text>
                            <Text style={[styles.tableCell, styles.colValor]}>{item.valor.toFixed(2)}</Text>
                        </View>
                    ))}
                </View>

                {/* Total */}
                <View style={styles.totalSection}>
                    <View style={styles.totalBox}>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>TOTAL A PAGAR:</Text>
                            <Text style={styles.totalValue}>{total.toFixed(2)} MT</Text>
                        </View>
                    </View>
                </View>

                {/* Vencimento em destaque */}
                <View style={styles.vencimentoBox}>
                    <Text style={styles.vencimentoTitle}>Data de Vencimento Principal</Text>
                    <Text style={styles.vencimentoData}>
                        {new Date(dataVencimento).toLocaleDateString('pt-MZ', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </Text>
                </View>

                {/* Formas de Pagamento */}
                <View style={styles.pagamentoSection}>
                    <Text style={styles.pagamentoTitle}>Formas de Pagamento Aceites</Text>
                    <Text style={styles.pagamentoItem}>- M-Pesa / e-Mola</Text>
                    <Text style={styles.pagamentoItem}>- Transferência Bancária</Text>
                    <Text style={styles.pagamentoItem}>- Depósito Directo</Text>
                    <Text style={styles.pagamentoItem}>- Numerário (Dinheiro)</Text>
                </View>

                {/* Obs */}
                {observacoes && (
                    <View style={styles.observacoes}>
                        <Text style={{ fontWeight: 'bold', marginBottom: 6 }}>Observações:</Text>
                        <Text>{observacoes}</Text>
                    </View>
                )}

                <View style={styles.footer}>
                    <Text>Aviso gerado em {new Date().toLocaleDateString('pt-MZ')} às {new Date().toLocaleTimeString('pt-MZ')}</Text>
                    <Text style={{ marginTop: 4 }}>Após o vencimento, os serviços poderão ser suspensos - {empresa?.nome || 'LG TecServ'}</Text>
                </View>
            </Page>
        </Document>
    );
}

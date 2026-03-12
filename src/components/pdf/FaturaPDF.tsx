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
    faturaHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    faturaTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f766e',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    faturaNumero: {
        textAlign: 'right',
    },
    faturaNumeroLabel: {
        fontSize: 8,
        color: '#64748b',
        textTransform: 'uppercase',
    },
    faturaNumeroValue: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#4c1d95',
    },
    faturaData: {
        fontSize: 8,
        color: '#64748b',
        marginTop: 4,
    },
    twoColumn: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        gap: 20,
    },
    columnBox: {
        flex: 1,
        padding: 10,
        borderRadius: 4,
    },
    clienteBox: {
        backgroundColor: '#f8fafc',
        border: '0.5pt solid #e2e8f0',
    },
    empresaBox: {
        backgroundColor: '#f8fafc',
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
    infoRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    infoLabel: {
        fontSize: 9,
        color: '#64748b',
        width: '35%',
        fontWeight: 'bold',
    },
    infoValue: {
        fontSize: 9,
        color: '#1e293b',
        width: '65%',
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
    colDescricao: { width: '45%' },
    colDetalhes: { width: '25%' },
    colValor: { width: '30%', textAlign: 'right' },
    totalSection: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 8,
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
        marginBottom: 4,
    },
    totalLabel: {
        fontSize: 10,
        color: '#ccfbf1',
    },
    totalValue: {
        fontSize: 10,
        color: '#ffffff',
    },
    grandTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTop: '0.5pt solid #115e59',
        paddingTop: 6,
        marginTop: 4,
    },
    grandTotalLabel: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    grandTotalValue: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    statusBox: {
        marginBottom: 16,
        padding: 10,
        backgroundColor: '#f0fdfa',
        borderLeft: '3pt solid #0f766e',
        borderRadius: 4,
    },
    statusTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#0f766e',
        marginBottom: 4,
    },
    statusText: {
        fontSize: 9,
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

interface FaturaProps {
    servico: any;
    cliente: any;
    empresa: any;
    numeroFatura?: string;
}

export function FaturaPDF({ servico, cliente, empresa, numeroFatura }: FaturaProps) {
    const detalhes = servico.detalhes_servico || {};
    const categoria = detalhes.categoria;

    // Generate invoice number if not provided
    const faturaNum = numeroFatura || `FAT-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${servico.id?.substring(0, 6)?.toUpperCase() || '000000'}`;

    // Build line items
    const items: { descricao: string; detalhes: string; valor: number }[] = [];

    items.push({
        descricao: servico.nome_servico,
        detalhes: CATEGORY_LABELS[categoria] || categoria || 'Serviço',
        valor: Number(servico.valor_total),
    });

    if (categoria === 'website') {
        if (detalhes.valor_dominio > 0) {
            items.push({
                descricao: 'Registo de Domínio',
                detalhes: detalhes.nome_dominio || 'domínio web',
                valor: Number(detalhes.valor_dominio),
            });
        }
        if (detalhes.valor_hospedagem > 0) {
            items.push({
                descricao: 'Hospedagem Web',
                detalhes: detalhes.periodo_hospedagem_gratuita ? `${detalhes.periodo_hospedagem_gratuita} meses grátis` : 'Plano anual',
                valor: Number(detalhes.valor_hospedagem),
            });
        }
    }

    if (categoria === 'trafego_pago' && detalhes.orcamento_anuncios > 0) {
        items.push({
            descricao: 'Orçamento de Anúncios',
            detalhes: detalhes.plataformas || 'Plataformas digitais',
            valor: Number(detalhes.orcamento_anuncios),
        });
    }

    const subtotal = Number(servico.valor_total);
    const investimento = servico.tem_investimento ? Number(servico.valor_investimento || 0) : 0;

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

                {/* Fatura Title + Number */}
                <View style={styles.faturaHeader}>
                    <Text style={styles.faturaTitle}>Fatura</Text>
                    <View style={styles.faturaNumero}>
                        <Text style={styles.faturaNumeroLabel}>Nº da Fatura</Text>
                        <Text style={styles.faturaNumeroValue}>{faturaNum}</Text>
                        <Text style={styles.faturaData}>Emitida em: {new Date().toLocaleDateString('pt-MZ')}</Text>
                        <Text style={styles.faturaData}>Vencimento: {new Date(servico.data_servico).toLocaleDateString('pt-MZ')}</Text>
                    </View>
                </View>

                {/* Two-column: Empresa + Cliente */}
                <View style={styles.twoColumn}>
                    <View style={[styles.columnBox, styles.empresaBox]}>
                        <Text style={styles.sectionTitle}>Emitente</Text>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Empresa:</Text>
                            <Text style={styles.infoValue}>{empresa?.nome || 'LG TecServ'}</Text>
                        </View>
                        {empresa?.nuit && (
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>NUIT:</Text>
                                <Text style={styles.infoValue}>{empresa.nuit}</Text>
                            </View>
                        )}
                        {empresa?.endereco && (
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Endereço:</Text>
                                <Text style={styles.infoValue}>{empresa.endereco}</Text>
                            </View>
                        )}
                        {empresa?.contato && (
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Contato:</Text>
                                <Text style={styles.infoValue}>{empresa.contato}</Text>
                            </View>
                        )}
                    </View>

                    <View style={[styles.columnBox, styles.clienteBox]}>
                        <Text style={styles.sectionTitle}>Cobrado a</Text>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Nome:</Text>
                            <Text style={styles.infoValue}>{cliente?.nome || 'N/A'}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Telefone:</Text>
                            <Text style={styles.infoValue}>{cliente?.telefone || 'N/A'}</Text>
                        </View>
                        {cliente?.email && (
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Email:</Text>
                                <Text style={styles.infoValue}>{cliente.email}</Text>
                            </View>
                        )}
                        {cliente?.endereco && (
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Endereço:</Text>
                                <Text style={styles.infoValue}>{cliente.endereco}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Items Table */}
                <View style={styles.tableContainer}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableHeaderText, styles.colDescricao]}>Descrição</Text>
                        <Text style={[styles.tableHeaderText, styles.colDetalhes]}>Detalhes</Text>
                        <Text style={[styles.tableHeaderText, styles.colValor]}>Valor (MT)</Text>
                    </View>
                    {items.map((item, index) => (
                        <View key={index} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                            <Text style={[styles.tableCell, styles.colDescricao]}>{item.descricao}</Text>
                            <Text style={[styles.tableCell, styles.colDetalhes]}>{item.detalhes}</Text>
                            <Text style={[styles.tableCell, styles.colValor]}>{item.valor.toFixed(2)}</Text>
                        </View>
                    ))}
                </View>

                {/* Totals */}
                <View style={styles.totalSection}>
                    <View style={styles.totalBox}>
                        {investimento > 0 && (
                            <>
                                <View style={styles.totalRow}>
                                    <Text style={styles.totalLabel}>Investimento:</Text>
                                    <Text style={styles.totalValue}>{investimento.toFixed(2)} MT</Text>
                                </View>
                                <View style={styles.totalRow}>
                                    <Text style={styles.totalLabel}>Saldo Restante:</Text>
                                    <Text style={styles.totalValue}>{(subtotal - investimento).toFixed(2)} MT</Text>
                                </View>
                            </>
                        )}
                        <View style={styles.grandTotalRow}>
                            <Text style={styles.grandTotalLabel}>TOTAL:</Text>
                            <Text style={styles.grandTotalValue}>{subtotal.toFixed(2)} MT</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.statusBox}>
                    <Text style={styles.statusTitle}>! Estado: Pendente de Pagamento</Text>
                    <Text style={styles.statusText}>
                        Esta fatura encontra-se pendente. Por favor efetue o pagamento até à data de vencimento indicada.
                    </Text>
                </View>

                {/* Payment Info */}
                <View style={styles.pagamentoSection}>
                    <Text style={styles.pagamentoTitle}>Formas de Pagamento Aceites</Text>
                    <Text style={styles.pagamentoItem}>- M-Pesa / e-Mola</Text>
                    <Text style={styles.pagamentoItem}>- Transferência Bancária</Text>
                    <Text style={styles.pagamentoItem}>- Depósito Direto</Text>
                    <Text style={styles.pagamentoItem}>- Numerário (Dinheiro)</Text>
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
                    <Text>Fatura gerada em {new Date().toLocaleDateString('pt-MZ')} às {new Date().toLocaleTimeString('pt-MZ')}</Text>
                    <Text style={{ marginTop: 4 }}>Este é um documento eletrónico válido - {empresa?.nome || 'LG TecServ'}</Text>
                </View>
            </Page>
        </Document>
    );
}

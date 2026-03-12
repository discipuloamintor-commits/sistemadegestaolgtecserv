import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import logoImg from '@/assets/logo.png';

const SERVICOS_DISPONIVEIS = [
    { id: 'gestao_redes', label: 'Gestão de Páginas e Redes Sociais' },
    { id: 'consultoria_branding', label: 'Consultoria e Branding Completa' },
    { id: 'artes_publicitarias', label: 'Artes Publicitárias Semanais' },
    { id: 'trafego_pago', label: 'Campanha de Tráfego Pago Mensal' },
    { id: 'manutencao', label: 'Manutenção de Website / Sistemas' },
];

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
        marginBottom: 16,
        textAlign: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f766e',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 9,
        color: '#64748b',
    },
    dateInfo: {
        fontSize: 8,
        color: '#64748b',
        marginTop: 4,
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
        width: '35%',
        color: '#64748b',
        fontSize: 9,
    },
    value: {
        width: '65%',
        color: '#1e293b',
        fontSize: 9,
    },
    checklistContainer: {
        marginBottom: 16,
        padding: 12,
        backgroundColor: '#ffffff',
        borderRadius: 4,
        border: '1pt solid #0f766e',
    },
    checklistTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#0f766e',
        textTransform: 'uppercase',
        letterSpacing: 1,
        textAlign: 'center',
    },
    checklistItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        paddingBottom: 8,
        borderBottom: '0.5pt solid #e2e8f0',
    },
    checkboxChecked: {
        width: 14,
        height: 14,
        borderRadius: 2,
        backgroundColor: '#0f766e',
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxUnchecked: {
        width: 14,
        height: 14,
        borderRadius: 2,
        border: '1pt solid #94a3b8',
        backgroundColor: '#ffffff',
        marginRight: 8,
    },
    checkmark: {
        color: '#ffffff',
        fontSize: 8,
        fontWeight: 'bold',
    },
    checklistLabel: {
        fontSize: 9,
        color: '#1e293b',
        flex: 1,
    },
    checklistLabelInactive: {
        fontSize: 9,
        color: '#94a3b8',
        flex: 1,
    },
    valorBox: {
        marginBottom: 16,
        padding: 12,
        backgroundColor: '#0f766e',
        borderRadius: 4,
        textAlign: 'center',
    },
    valorTitle: {
        fontSize: 9,
        color: '#ccfbf1',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    valorAmount: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 2,
    },
    valorPeriodo: {
        fontSize: 9,
        color: '#ccfbf1',
    },
    condicoesSection: {
        marginBottom: 12,
        padding: 10,
        backgroundColor: '#f8fafc',
        borderRadius: 4,
        border: '0.5pt solid #e2e8f0',
    },
    condicoesTitle: {
        fontSize: 9,
        fontWeight: 'bold',
        marginBottom: 6,
        color: '#4c1d95',
        textTransform: 'uppercase',
    },
    condicoesItem: {
        fontSize: 8,
        color: '#334155',
        marginBottom: 3,
        lineHeight: 1.4,
    },
    observacoes: {
        marginBottom: 12,
        padding: 8,
        backgroundColor: '#f8fafc',
        borderLeft: '2pt solid #e2e8f0',
        borderRadius: 4,
    },
    assinaturaBox: {
        marginTop: 20,
        paddingTop: 20,
        borderTop: '0.5pt solid #e2e8f0',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    assinatura: {
        width: '45%',
        textAlign: 'center',
    },
    assinaturaLine: {
        borderTop: '0.5pt solid #1e293b',
        marginBottom: 6,
        paddingTop: 6,
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

interface PropostaContratoMensalProps {
    cliente: any;
    empresa: any;
    servicosSelecionados: string[];
    valorMensal: number;
    observacoes?: string;
    condicoesAdicionais?: string;
}

export function PropostaContratoMensalPDF({
    cliente,
    empresa,
    servicosSelecionados,
    valorMensal,
    observacoes,
    condicoesAdicionais,
}: PropostaContratoMensalProps) {
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
                    <Text style={styles.title}>Proposta de Contrato Mensal</Text>
                    <Text style={styles.subtitle}>Prestação de Serviços Contínuos de Marketing e Tecnologia</Text>
                    <Text style={styles.dateInfo}>Data de emissão: {new Date().toLocaleDateString('pt-MZ')}</Text>
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
                    {cliente?.endereco && (
                        <View style={styles.row}>
                            <Text style={styles.label}>Endereço:</Text>
                            <Text style={styles.value}>{cliente.endereco}</Text>
                        </View>
                    )}
                </View>

                {/* Checklist */}
                <View style={styles.checklistContainer}>
                    <Text style={styles.checklistTitle}>Serviços Incluídos no Contrato</Text>
                    {SERVICOS_DISPONIVEIS.map((servico) => {
                        const isSelected = servicosSelecionados.includes(servico.id);
                        return (
                            <View key={servico.id} style={styles.checklistItem}>
                                <View style={isSelected ? styles.checkboxChecked : styles.checkboxUnchecked}>
                                    {isSelected && <Text style={styles.checkmark}>X</Text>}
                                </View>
                                <Text style={isSelected ? styles.checklistLabel : styles.checklistLabelInactive}>
                                    {servico.label}
                                </Text>
                            </View>
                        );
                    })}
                </View>

                {/* Valor */}
                <View style={styles.valorBox}>
                    <Text style={styles.valorTitle}>Valor do Contrato</Text>
                    <Text style={styles.valorAmount}>{valorMensal.toFixed(2)} MT</Text>
                    <Text style={styles.valorPeriodo}>por mês</Text>
                </View>

                {/* Condições */}
                <View style={styles.condicoesSection}>
                    <Text style={styles.condicoesTitle}>Condições Gerais</Text>
                    <Text style={styles.condicoesItem}>- O contrato tem duração mínima de 3 (três) meses a partir da data de assinatura.</Text>
                    <Text style={styles.condicoesItem}>- O pagamento deverá ser efetuado até ao dia 5 (cinco) de cada mês.</Text>
                    <Text style={styles.condicoesItem}>- O cancelamento deve ser comunicado com antecedência mínima de 30 (trinta) dias.</Text>
                    <Text style={styles.condicoesItem}>- Os serviços não incluídos na checklist acima não fazem parte deste contrato.</Text>
                    <Text style={styles.condicoesItem}>- Serviços adicionais serão orçamentados separadamente mediante solicitação.</Text>
                    {condicoesAdicionais && (
                        <Text style={styles.condicoesItem}>- {condicoesAdicionais}</Text>
                    )}
                </View>

                {/* Observações */}
                {observacoes && (
                    <View style={styles.observacoes}>
                        <Text style={{ fontWeight: 'bold', marginBottom: 6, color: '#92400e' }}>Observações:</Text>
                        <Text style={{ color: '#92400e', fontSize: 10 }}>{observacoes}</Text>
                    </View>
                )}

                {/* Assinaturas */}
                <View style={styles.assinaturaBox}>
                    <View style={styles.assinatura}>
                        <View style={styles.assinaturaLine}>
                            <Text style={{ fontSize: 9, fontWeight: 'bold' }}>{empresa?.nome || 'LG TecServ'}</Text>
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
                    <Text>Proposta gerada em {new Date().toLocaleDateString('pt-MZ')} às {new Date().toLocaleTimeString('pt-MZ')}</Text>
                    <Text style={{ marginTop: 4 }}>Este documento tem validade de 15 dias a partir da data de emissão</Text>
                </View>
            </Page>
        </Document>
    );
}

export { SERVICOS_DISPONIVEIS };

import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf, Image } from '@react-pdf/renderer';

// ─── COLOR PALETTE ───────────────────────────────────────────────────────────
const C = {
    black: '#111111',
    dark: '#1f2937',
    mid: '#6b7280',
    light: '#9ca3af',
    border: '#e5e7eb',
    bg: '#f9fafb',
    white: '#ffffff',
    rowAlt: '#f3f4f6',
};

const styles = StyleSheet.create({
    page: {
        paddingHorizontal: 36,
        paddingTop: 30,
        paddingBottom: 60,
        fontSize: 9,
        fontFamily: 'Helvetica',
        color: C.dark,
        backgroundColor: C.white,
    },

    // ─── HEADER ────────────────────────────────────────────────────────────────
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 18,
        paddingBottom: 16,
        borderBottom: `2px solid ${C.black}`,
    },
    logo: { width: 130, height: 'auto' },
    companyBlock: { marginTop: 6 },
    companySmall: { fontSize: 7, color: C.mid, marginBottom: 1 },
    invoiceBlock: { alignItems: 'flex-end' },
    invoiceBadge: {
        backgroundColor: C.black,
        borderRadius: 4,
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginBottom: 6,
    },
    invoiceBadgeText: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: C.white },
    invoiceIdText: { fontSize: 9, color: C.mid, marginBottom: 9, textAlign: 'right' },
    metaRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 2 },
    metaLabel: { fontSize: 7.5, color: C.mid, width: 88, textAlign: 'right' },
    metaValue: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: C.dark, width: 80, textAlign: 'right' },

    // ─── PARTIES ───────────────────────────────────────────────────────────────
    parties: { flexDirection: 'row', marginBottom: 14 },
    partyCard: {
        flex: 1,
        backgroundColor: C.bg,
        borderRadius: 5,
        padding: 10,
        border: `1px solid ${C.border}`,
        marginRight: 8,
    },
    partyCardLast: {
        flex: 1,
        backgroundColor: C.bg,
        borderRadius: 5,
        padding: 10,
        border: `1px solid ${C.border}`,
    },
    partyTitle: {
        fontSize: 7,
        fontFamily: 'Helvetica-Bold',
        color: C.mid,
        letterSpacing: 0.6,
        marginBottom: 7,
        paddingBottom: 4,
        borderBottom: `1px solid ${C.border}`,
    },
    partyRow: { flexDirection: 'row', marginBottom: 3 },
    partyLabel: { fontSize: 7.5, color: C.light, width: 70 },
    partyValue: { flex: 1, fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: C.dark },

    // ─── TABLE ─────────────────────────────────────────────────────────────────
    tableWrapper: { marginBottom: 0 },
    tableHead: {
        flexDirection: 'row',
        backgroundColor: C.black,
        borderRadius: 4,
        paddingVertical: 5,
        paddingHorizontal: 4,
        marginBottom: 2,
    },
    th: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: C.white, textAlign: 'center' },
    tableRow: { flexDirection: 'row', paddingVertical: 4, paddingHorizontal: 4, alignItems: 'center' },
    tableRowAlt: { backgroundColor: C.rowAlt, borderRadius: 3 },
    td: { fontSize: 7.5, textAlign: 'center', color: C.dark },
    tdLeft: { textAlign: 'left' },
    tdRight: { textAlign: 'right' },

    // Column widths
    cNo: { width: '5%' },
    cRef: { width: '11%' },
    cDesc: { width: '34%' },
    cQty: { width: '7%' },
    cUM: { width: '6%' },
    cPrice: { width: '12%' },
    cImp: { width: '9%' },
    cSub: { width: '16%' },

    // ─── BOTTOM SECTION ────────────────────────────────────────────────────────
    bottomSection: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14, alignItems: 'flex-start' },
    noteBox: { flex: 1, marginRight: 20 },
    noteText: { fontSize: 7.5, color: C.mid, marginBottom: 4 },

    totalsBox: {
        width: 200,
        border: `1px solid ${C.border}`,
        borderRadius: 6,
        overflow: 'hidden',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderBottom: `1px solid ${C.border}`,
    },
    totalLabel: { fontSize: 8, color: C.mid },
    totalValue: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.dark },
    grandRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 7,
        backgroundColor: C.black,
    },
    grandLabel: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.white },
    grandValue: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.white },

    // ─── SIGNATURE ─────────────────────────────────────────────────────────────
    sigSection: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 30,
        paddingTop: 8,
        borderTop: `1px solid ${C.border}`,
    },
    sigBox: { alignItems: 'center', width: 140 },
    sigLine: { width: '100%', borderTop: `1px solid ${C.dark}`, marginBottom: 4 },
    sigLabel: { fontSize: 7, color: C.mid, textAlign: 'center' },

    // ─── FOOTER ────────────────────────────────────────────────────────────────
    footer: {
        position: 'absolute',
        bottom: 20,
        left: 36,
        right: 36,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: `1px solid ${C.border}`,
        paddingTop: 6,
    },
    footerText: { fontSize: 6.5, color: C.light },
    footerPage: { fontSize: 6.5, color: C.light },
});

interface RowProps { label: string; value: string; }
const DataRow = ({ label, value }: RowProps) => (
    <View style={styles.partyRow}>
        <Text style={styles.partyLabel}>{label}</Text>
        <Text style={styles.partyValue}>{value}</Text>
    </View>
);

const InvoiceTemplate = ({ data }: { data: any }) => {
    const subtotal = Math.round(data.total / 1.19);
    const iva = data.total - subtotal;
    const dateStr = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
    const invoiceRef = data.invoiceId ? data.invoiceId.split('-')[0].toUpperCase() : '001';

    return (
        <Document>
            <Page size="LETTER" style={styles.page}>

                {/* ─── HEADER ─── */}
                <View style={styles.header}>
                    <View>
                        <Image style={styles.logo} src="/diamante.jpg" />
                        <View style={styles.companyBlock}>
                            <Text style={styles.companySmall}>NIT: 19096350 | Ibagué, Tolima</Text>
                            <Text style={styles.companySmall}>Tel: 302 2887219 | dislacasadelboligrafo@hotmail.com</Text>
                            <Text style={styles.companySmall}>CL 145 9 26 TO 2 AP 505 - Barrio El Salado</Text>
                            <Text style={styles.companySmall}>Actividad Económica: 4761 | Régimen Simple de Tributación</Text>
                        </View>
                    </View>

                    <View style={styles.invoiceBlock}>
                        <View style={styles.invoiceBadge}>
                            <Text style={styles.invoiceBadgeText}>FACTURA ELECTRÓNICA</Text>
                        </View>
                        <Text style={styles.invoiceIdText}>FE-{invoiceRef}</Text>
                        <View style={styles.metaRow}>
                            <Text style={styles.metaLabel}>Fecha de Emisión</Text>
                            <Text style={styles.metaValue}>{dateStr}</Text>
                        </View>
                        <View style={styles.metaRow}>
                            <Text style={styles.metaLabel}>Forma de Pago</Text>
                            <Text style={styles.metaValue}>Crédito 3 días</Text>
                        </View>
                        <View style={styles.metaRow}>
                            <Text style={styles.metaLabel}>Medio de Pago</Text>
                            <Text style={styles.metaValue}>Transferencia</Text>
                        </View>
                        <View style={styles.metaRow}>
                            <Text style={styles.metaLabel}>Moneda</Text>
                            <Text style={styles.metaValue}>COP</Text>
                        </View>
                    </View>
                </View>

                {/* ─── PARTIES ─── */}
                <View style={styles.parties}>
                    <View style={styles.partyCard}>
                        <Text style={styles.partyTitle}>VENDEDOR / EMISOR</Text>
                        <DataRow label="Razón Social" value="JOSE FRANCISCO ALVAREZ GARCIA" />
                        <DataRow label="Nombre Com." value="LA CASA DEL BOLÍGRAFO DIAMANT'S" />
                        <DataRow label="NIT" value="19096350" />
                        <DataRow label="Obligación" value="IVA" />
                        <DataRow label="Email" value="dislacasadelboligrafo@hotmail.com" />
                    </View>
                    <View style={styles.partyCardLast}>
                        <Text style={styles.partyTitle}>COMPRADOR / CLIENTE</Text>
                        <DataRow label="Razón Social" value={data.customerName?.toUpperCase() || 'CONSUMIDOR FINAL'} />
                        <DataRow label="NIT / CC" value={data.customerDoc || 'CONSUMIDOR FINAL'} />
                        {data.customerEmail ? <DataRow label="Email" value={data.customerEmail} /> : null}
                        {data.customerPhone ? <DataRow label="Teléfono" value={data.customerPhone} /> : null}
                        {data.customerAddress ? <DataRow label="Dirección" value={data.customerAddress} /> : null}
                        {data.customerCity ? <DataRow label="Ciudad" value={data.customerCity} /> : null}
                    </View>
                </View>

                {/* ─── TABLE ─── */}
                <View style={styles.tableWrapper}>
                    <View style={styles.tableHead}>
                        <Text style={[styles.th, styles.cNo]}>#</Text>
                        <Text style={[styles.th, styles.cRef]}>REF.</Text>
                        <Text style={[styles.th, styles.cDesc, styles.tdLeft]}>DESCRIPCIÓN</Text>
                        <Text style={[styles.th, styles.cQty]}>CANT.</Text>
                        <Text style={[styles.th, styles.cUM]}>U/M</Text>
                        <Text style={[styles.th, styles.cPrice]}>P. UNIT.</Text>
                        <Text style={[styles.th, styles.cImp]}>IMP.</Text>
                        <Text style={[styles.th, styles.cSub, styles.tdRight]}>TOTAL</Text>
                    </View>

                    {data.items?.map((item: any, i: number) => {
                        const unitBase = Math.round(item.unitPrice / 1.19);
                        const lineTotal = item.unitPrice * item.quantity;
                        return (
                            <View key={i} style={[styles.tableRow, i % 2 !== 0 ? styles.tableRowAlt : {}]}>
                                <Text style={[styles.td, styles.cNo]}>{i + 1}</Text>
                                <Text style={[styles.td, styles.cRef]}>{item.reference || '—'}</Text>
                                <Text style={[styles.td, styles.cDesc, styles.tdLeft]}>{item.name}</Text>
                                <Text style={[styles.td, styles.cQty]}>{item.quantity}</Text>
                                <Text style={[styles.td, styles.cUM]}>UND</Text>
                                <Text style={[styles.td, styles.cPrice, styles.tdRight]}>${unitBase.toLocaleString('es-CO')}</Text>
                                <Text style={[styles.td, styles.cImp]}>IVA 19%</Text>
                                <Text style={[styles.td, styles.cSub, styles.tdRight]}>${lineTotal.toLocaleString('es-CO')}</Text>
                            </View>
                        );
                    })}
                </View>

                {/* ─── BOTTOM ─── */}
                <View style={styles.bottomSection}>
                    <View style={styles.noteBox}>
                        <Text style={styles.noteText}>• Si paga de contado, descuente el 10% antes del IVA.</Text>
                        <Text style={styles.noteText}>• Unidades de medida: UND = Unidad.</Text>
                        <Text style={styles.noteText}>• Este documento es equivalente a una factura electrónica de venta.</Text>
                    </View>
                    <View style={styles.totalsBox}>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Subtotal (sin IVA)</Text>
                            <Text style={styles.totalValue}>${subtotal.toLocaleString('es-CO')}</Text>
                        </View>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>IVA 19%</Text>
                            <Text style={styles.totalValue}>${iva.toLocaleString('es-CO')}</Text>
                        </View>
                        <View style={styles.grandRow}>
                            <Text style={styles.grandLabel}>TOTAL A PAGAR</Text>
                            <Text style={styles.grandValue}>${data.total.toLocaleString('es-CO')}</Text>
                        </View>
                    </View>
                </View>

                {/* ─── SIGNATURES ─── */}
                <View style={styles.sigSection}>
                    <View style={styles.sigBox}>
                        <View style={styles.sigLine} />
                        <Text style={styles.sigLabel}>Firma Emisor / Vendedor</Text>
                        <Text style={styles.sigLabel}>LA CASA DEL BOLÍGRAFO DIAMANT'S</Text>
                    </View>
                    <View style={styles.sigBox}>
                        <View style={styles.sigLine} />
                        <Text style={styles.sigLabel}>Firma y Sello Cliente</Text>
                        <Text style={styles.sigLabel}>{data.customerName?.toUpperCase() || 'CONSUMIDOR FINAL'}</Text>
                    </View>
                </View>

                {/* ─── FOOTER ─── */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Generado por La Casa del Bolígrafo Diamant's | Software Interno</Text>
                    <Text style={styles.footerPage}>FE-{invoiceRef} — {new Date().toLocaleDateString('es-CO')}</Text>
                </View>

            </Page>
        </Document>
    );
};

export const generateInvoicePDF = async (invoiceData: any) => {
    try {
        const blob = await pdf(<InvoiceTemplate data={invoiceData} />).toBlob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Factura_FE-${invoiceData.invoiceId?.split('-')[0]?.toUpperCase() || 'NUEVA'}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error generando PDF:', error);
    }
};

import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf, Image } from '@react-pdf/renderer';

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const T = {
    // Core palette
    ink: '#0a0a0a',
    graphite: '#1e1e2d',
    slate: '#3a3a4a',
    muted: '#7b7b8e',
    subtle: '#a8a8b8',
    divider: '#e8e8f0',
    surface: '#f5f5fa',
    white: '#ffffff',
    // Accent strip
    accent: '#1e1e2d',
    accentAlt: '#2e2e45',
    // Gold highlight on totals
    gold: '#c8a84b',
};

const styles = StyleSheet.create({

    // ─── PAGE ────────────────────────────────────────────────────────────────
    page: {
        backgroundColor: T.white,
        fontFamily: 'Helvetica',
        fontSize: 9,
        color: T.ink,
    },

    // ─── TOP ACCENT BAR ──────────────────────────────────────────────────────
    topBar: {
        height: 5,
        backgroundColor: T.accent,
    },

    // ─── HEADER ──────────────────────────────────────────────────────────────
    header: {
        backgroundColor: T.graphite,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 36,
        paddingVertical: 22,
    },
    logoBlock: { flexDirection: 'column' },
    logo: { width: 120, height: 'auto', marginBottom: 8 },
    companyName: {
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        color: T.white,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
    companyTagline: { fontSize: 6.5, color: T.subtle, marginTop: 2 },

    invoiceBlock: { alignItems: 'flex-end' },
    invoiceTitle: {
        fontSize: 22,
        fontFamily: 'Helvetica-Bold',
        color: T.white,
        letterSpacing: 2,
        marginBottom: 4,
    },
    invoiceNumber: {
        fontSize: 9,
        color: T.subtle,
        letterSpacing: 0.5,
        marginBottom: 10,
    },
    statusBadge: {
        backgroundColor: T.gold,
        borderRadius: 3,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    statusText: {
        fontSize: 7,
        fontFamily: 'Helvetica-Bold',
        color: T.ink,
        letterSpacing: 0.8,
    },

    // ─── META ROW (date, payment) ─────────────────────────────────────────────
    metaBar: {
        flexDirection: 'row',
        backgroundColor: T.surface,
        borderBottom: `1px solid ${T.divider}`,
    },
    metaCell: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRight: `1px solid ${T.divider}`,
    },
    metaCellLast: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    metaKey: { fontSize: 6.5, color: T.muted, letterSpacing: 0.8, marginBottom: 3 },
    metaVal: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: T.ink },

    // ─── BODY LAYOUT ─────────────────────────────────────────────────────────
    body: { paddingHorizontal: 36, paddingTop: 18 },

    // ─── PARTIES ──────────────────────────────────────────────────────────────
    parties: { flexDirection: 'row', marginBottom: 20 },
    partyBox: { flex: 1, marginRight: 14 },
    partyBoxLast: { flex: 1 },
    partyHeader: {
        backgroundColor: T.graphite,
        borderRadius: 4,
        paddingHorizontal: 10,
        paddingVertical: 5,
        marginBottom: 8,
    },
    partyTitle: {
        fontSize: 7,
        fontFamily: 'Helvetica-Bold',
        color: T.white,
        letterSpacing: 1.2,
    },
    partyRow: { flexDirection: 'row', marginBottom: 4, alignItems: 'flex-start' },
    partyKey: { fontSize: 7, color: T.muted, width: 68 },
    partyVal: { flex: 1, fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: T.slate },

    // ─── SECTION DIVIDER ─────────────────────────────────────────────────────
    divider: {
        borderBottom: `1px solid ${T.divider}`,
        marginBottom: 14,
    },

    // ─── TABLE ───────────────────────────────────────────────────────────────
    tableHead: {
        flexDirection: 'row',
        borderBottom: `1.5px solid ${T.ink}`,
        paddingBottom: 6,
        marginBottom: 4,
    },
    th: {
        fontSize: 7,
        fontFamily: 'Helvetica-Bold',
        color: T.muted,
        letterSpacing: 0.8,
        textAlign: 'center',
    },
    thLeft: { textAlign: 'left' },
    thRight: { textAlign: 'right' },

    tableRow: {
        flexDirection: 'row',
        paddingVertical: 6,
        borderBottom: `1px solid ${T.divider}`,
        alignItems: 'center',
    },
    tableRowShaded: {
        flexDirection: 'row',
        paddingVertical: 6,
        borderBottom: `1px solid ${T.divider}`,
        alignItems: 'center',
        backgroundColor: T.surface,
    },
    td: { fontSize: 8, textAlign: 'center', color: T.slate },
    tdLeft: { textAlign: 'left', color: T.ink, fontFamily: 'Helvetica-Bold' },
    tdRight: { textAlign: 'right' },
    tdMuted: { color: T.muted },

    // Column widths
    cNo: { width: '4%' },
    cRef: { width: '12%' },
    cDesc: { width: '33%' },
    cQty: { width: '7%' },
    cUM: { width: '6%' },
    cPrice: { width: '13%' },
    cImp: { width: '9%' },
    cTotal: { width: '16%' },

    // ─── BOTTOM SECTION ──────────────────────────────────────────────────────
    bottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 18,
        alignItems: 'flex-start',
    },
    notesBox: { flex: 1, marginRight: 24 },
    notesTitle: {
        fontSize: 7,
        fontFamily: 'Helvetica-Bold',
        color: T.muted,
        letterSpacing: 1,
        marginBottom: 6,
    },
    noteItem: { fontSize: 7.5, color: T.muted, marginBottom: 4, lineHeight: 1.5 },

    // Totals card
    totalsCard: {
        width: 210,
        border: `1px solid ${T.divider}`,
        borderRadius: 8,
        overflow: 'hidden',
    },
    totalsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 7,
        borderBottom: `1px solid ${T.divider}`,
        backgroundColor: T.surface,
    },
    totalsLabel: { fontSize: 8, color: T.muted },
    totalsValue: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: T.slate },
    grandTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: T.graphite,
    },
    grandLabel: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: T.white, letterSpacing: 0.5 },
    grandValue: {
        fontSize: 14,
        fontFamily: 'Helvetica-Bold',
        color: T.gold,
    },

    // ─── SIGNATURES ──────────────────────────────────────────────────────────
    sigSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 36,
        marginHorizontal: 36,
    },
    sigBox: { alignItems: 'center', width: 160 },
    sigLineTop: {
        width: '100%',
        height: 1,
        backgroundColor: T.divider,
        marginBottom: 5,
    },
    sigName: {
        fontSize: 7.5,
        fontFamily: 'Helvetica-Bold',
        color: T.slate,
        textAlign: 'center',
        marginBottom: 2,
    },
    sigRole: { fontSize: 6.5, color: T.muted, textAlign: 'center' },

    // ─── FOOTER ──────────────────────────────────────────────────────────────
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    footerBar: {
        backgroundColor: T.graphite,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 36,
        paddingVertical: 9,
    },
    footerLeft: { fontSize: 6.5, color: T.subtle },
    footerRight: { fontSize: 6.5, color: T.subtle },
    footerAccent: { height: 3, backgroundColor: T.gold },
});

interface DRow { label: string; value: string; }
const DRow = ({ label, value }: DRow) => (
    <View style={styles.partyRow}>
        <Text style={styles.partyKey}>{label}</Text>
        <Text style={styles.partyVal}>{value}</Text>
    </View>
);

const InvoiceTemplate = ({ data }: { data: any }) => {
    const subtotal = Math.round(data.total / 1.19);
    const iva = data.total - subtotal;
    const invoiceRef = `FE-${data.invoiceId ? data.invoiceId.split('-')[0].toUpperCase() : '001'}`;
    const dateStr = new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });

    return (
        <Document>
            <Page size="LETTER" style={styles.page}>

                {/* ── TOP ACCENT ── */}
                <View style={styles.topBar} />

                {/* ── DARK HEADER ── */}
                <View style={styles.header}>
                    <View style={styles.logoBlock}>
                        <Image style={styles.logo} src="/diamante.jpg" />
                        <Text style={styles.companyName}>La Casa del Bolígrafo</Text>
                        <Text style={styles.companyTagline}>Distribución de artículos de escritura • NIT 19096350</Text>
                    </View>
                    <View style={styles.invoiceBlock}>
                        <Text style={styles.invoiceTitle}>FACTURA</Text>
                        <Text style={styles.invoiceNumber}>{invoiceRef}</Text>
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>ELECTRÓNICA DE VENTA</Text>
                        </View>
                    </View>
                </View>

                {/* ── META BAR ── */}
                <View style={styles.metaBar}>
                    <View style={styles.metaCell}>
                        <Text style={styles.metaKey}>FECHA DE EMISIÓN</Text>
                        <Text style={styles.metaVal}>{dateStr}</Text>
                    </View>
                    <View style={styles.metaCell}>
                        <Text style={styles.metaKey}>FORMA DE PAGO</Text>
                        <Text style={styles.metaVal}>Crédito 3 días</Text>
                    </View>
                    <View style={styles.metaCell}>
                        <Text style={styles.metaKey}>MEDIO DE PAGO</Text>
                        <Text style={styles.metaVal}>Transferencia bancaria</Text>
                    </View>
                    <View style={styles.metaCellLast}>
                        <Text style={styles.metaKey}>MONEDA</Text>
                        <Text style={styles.metaVal}>COP – Peso colombiano</Text>
                    </View>
                </View>

                {/* ── BODY ── */}
                <View style={styles.body}>

                    {/* ── PARTIES ── */}
                    <View style={styles.parties}>
                        <View style={styles.partyBox}>
                            <View style={styles.partyHeader}>
                                <Text style={styles.partyTitle}>EMISOR / VENDEDOR</Text>
                            </View>
                            <DRow label="Razón Social" value="JOSE FRANCISCO ALVAREZ GARCIA" />
                            <DRow label="Nombre Com." value="LA CASA DEL BOLÍGRAFO DIAMANT'S" />
                            <DRow label="NIT" value="19096350-0" />
                            <DRow label="Régimen" value="Simple de Tributación" />
                            <DRow label="Actividad" value="4761 – Artículos de escritura" />
                            <DRow label="Email" value="dislacasadelboligrafo@hotmail.com" />
                            <DRow label="Teléfono" value="302 2887219" />
                            <DRow label="Dirección" value="CL 145 9 26 TO 2 AP 505, Ibagué, Tolima" />
                        </View>
                        <View style={styles.partyBoxLast}>
                            <View style={styles.partyHeader}>
                                <Text style={styles.partyTitle}>FACTURADO A / CLIENTE</Text>
                            </View>
                            <DRow label="Razón Social" value={data.customerName?.toUpperCase() || 'CONSUMIDOR FINAL'} />
                            <DRow label="NIT / CC" value={data.customerDoc || 'CONSUMIDOR FINAL'} />
                            {data.customerEmail ? <DRow label="Email" value={data.customerEmail} /> : null}
                            {data.customerPhone ? <DRow label="Teléfono" value={data.customerPhone} /> : null}
                            {data.customerAddress ? <DRow label="Dirección" value={data.customerAddress} /> : null}
                            {data.customerCity ? <DRow label="Ciudad" value={data.customerCity} /> : null}
                        </View>
                    </View>

                    {/* ── TABLE ── */}
                    <View style={styles.tableHead}>
                        <Text style={[styles.th, styles.cNo]}>#</Text>
                        <Text style={[styles.th, styles.cRef]}>REFERENCIA</Text>
                        <Text style={[styles.th, styles.thLeft, styles.cDesc]}>DESCRIPCIÓN</Text>
                        <Text style={[styles.th, styles.cQty]}>CANT.</Text>
                        <Text style={[styles.th, styles.cUM]}>U/M</Text>
                        <Text style={[styles.th, styles.thRight, styles.cPrice]}>PRECIO BASE</Text>
                        <Text style={[styles.th, styles.cImp]}>IMPUESTO</Text>
                        <Text style={[styles.th, styles.thRight, styles.cTotal]}>TOTAL ÍTEM</Text>
                    </View>

                    {data.items?.map((item: any, i: number) => {
                        const unitBase = Math.round(item.unitPrice / 1.19);
                        const lineTotal = item.unitPrice * item.quantity;
                        const RowStyle = i % 2 === 0 ? styles.tableRow : styles.tableRowShaded;
                        return (
                            <View key={i} style={RowStyle}>
                                <Text style={[styles.td, styles.tdMuted, styles.cNo]}>{i + 1}</Text>
                                <Text style={[styles.td, styles.tdMuted, styles.cRef]}>{item.reference || '—'}</Text>
                                <Text style={[styles.td, styles.tdLeft, styles.cDesc]}>{item.name}</Text>
                                <Text style={[styles.td, styles.cQty]}>{item.quantity}</Text>
                                <Text style={[styles.td, styles.tdMuted, styles.cUM]}>UND</Text>
                                <Text style={[styles.td, styles.tdRight, styles.cPrice]}>${unitBase.toLocaleString('es-CO')}</Text>
                                <Text style={[styles.td, styles.tdMuted, styles.cImp]}>IVA 19%</Text>
                                <Text style={[styles.td, styles.tdRight, styles.cTotal]}>${lineTotal.toLocaleString('es-CO')}</Text>
                            </View>
                        );
                    })}

                    {/* ── BOTTOM ── */}
                    <View style={styles.bottom}>
                        <View style={styles.notesBox}>
                            <Text style={styles.notesTitle}>NOTAS Y CONDICIONES</Text>
                            <Text style={styles.noteItem}>• Descuento del 10% sobre el valor antes del IVA si paga de contado.</Text>
                            <Text style={styles.noteItem}>• Unidad de medida: UND = Unidad. Código DIAN: 94.</Text>
                            <Text style={styles.noteItem}>• Este documento es equivalente a una Factura Electrónica de Venta válida ante la DIAN.</Text>
                            <Text style={styles.noteItem}>• No somos Agente Retenedor de IVA ni Gran Contribuyente.</Text>
                        </View>

                        <View style={styles.totalsCard}>
                            <View style={styles.totalsRow}>
                                <Text style={styles.totalsLabel}>Subtotal (sin IVA)</Text>
                                <Text style={styles.totalsValue}>${subtotal.toLocaleString('es-CO')}</Text>
                            </View>
                            <View style={styles.totalsRow}>
                                <Text style={styles.totalsLabel}>IVA 19%</Text>
                                <Text style={styles.totalsValue}>${iva.toLocaleString('es-CO')}</Text>
                            </View>
                            <View style={styles.grandTotalRow}>
                                <View>
                                    <Text style={styles.grandLabel}>TOTAL A PAGAR</Text>
                                </View>
                                <Text style={styles.grandValue}>${data.total.toLocaleString('es-CO')}</Text>
                            </View>
                        </View>
                    </View>

                </View>

                {/* ── SIGNATURES ── */}
                <View style={styles.sigSection}>
                    <View style={styles.sigBox}>
                        <View style={styles.sigLineTop} />
                        <Text style={styles.sigName}>LA CASA DEL BOLÍGRAFO DIAMANT'S</Text>
                        <Text style={styles.sigRole}>Firma y Sello — Emisor</Text>
                    </View>
                    <View style={styles.sigBox}>
                        <View style={styles.sigLineTop} />
                        <Text style={styles.sigName}>{data.customerName?.toUpperCase() || 'CONSUMIDOR FINAL'}</Text>
                        <Text style={styles.sigRole}>Firma y Sello — Recibido a Satisfacción</Text>
                    </View>
                </View>

                {/* ── FOOTER ── */}
                <View style={styles.footer}>
                    <View style={styles.footerAccent} />
                    <View style={styles.footerBar}>
                        <Text style={styles.footerLeft}>La Casa del Bolígrafo Diamant's  •  NIT 19096350  •  Ibagué, Tolima</Text>
                        <Text style={styles.footerRight}>{invoiceRef}  •  {new Date().toLocaleDateString('es-CO')}</Text>
                    </View>
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

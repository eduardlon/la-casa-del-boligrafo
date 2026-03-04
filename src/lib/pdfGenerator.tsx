import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: { padding: 30, fontSize: 10, fontFamily: 'Helvetica', color: '#1a1a1a', backgroundColor: '#ffffff' },

    // Header
    headerWrapper: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    logoContainer: { width: '40%' },
    logo: { width: 140, height: 'auto', marginBottom: 5 },
    companyInfoSmall: { fontSize: 7, color: '#4a4a4a', marginTop: 2 },
    invoiceInfoContainer: { width: '50%', textAlign: 'right' },
    invoiceTitle: { fontSize: 16, fontFamily: 'Helvetica-Bold', marginBottom: 4 },
    invoiceInfoRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 2 },
    infoLabel: { fontSize: 8, color: '#4a4a4a', width: 90, textAlign: 'left' },
    infoValue: { fontSize: 8, width: 90, textAlign: 'right', fontFamily: 'Helvetica-Bold' },

    // Datos Emisor y Cliente
    dataSection: { flexDirection: 'row', borderTop: '1px solid #000', borderBottom: '1px solid #000', paddingVertical: 10, marginBottom: 15 },
    columnHalf: { width: '50%', paddingHorizontal: 10 },
    columnTitle: { fontSize: 12, fontFamily: 'Helvetica-Bold', textAlign: 'center', marginBottom: 8 },
    dataRow: { flexDirection: 'row', marginBottom: 2 },
    dataLabel: { width: 80, fontSize: 8, color: '#4a4a4a' },
    dataText: { flex: 1, fontSize: 8, fontFamily: 'Helvetica-Bold' },
    middleBorder: { borderLeft: '1px solid #d4d4d4' },

    // Table
    table: { width: '100%', marginBottom: 15 },
    tableHeaderRow: { flexDirection: 'row', borderTop: '1px solid #000', borderBottom: '1px solid #000', paddingVertical: 4, alignItems: 'center' },
    th: { fontSize: 8, fontFamily: 'Helvetica-Bold', textAlign: 'center' },

    tableRow: { flexDirection: 'row', borderBottom: '1px solid #f0f0f0', paddingVertical: 4, alignItems: 'center' },
    td: { fontSize: 8, textAlign: 'center' },

    // Column Widths
    colNum: { width: '5%' },
    colRef: { width: '10%' },
    colDesc: { width: '35%', textAlign: 'left', paddingLeft: 4 },
    colCant: { width: '7%' },
    colUM: { width: '5%' },
    colPrecio: { width: '12%', textAlign: 'right' },
    colImp: { width: '8%' },
    colSubtotal: { width: '12%', textAlign: 'right' },
    colTotalItem: { width: '12%', textAlign: 'right' },

    // Totales
    totalsContainer: { width: '100%', alignItems: 'flex-end', marginTop: 10, borderTop: '1px solid #000', paddingTop: 5 },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', width: 180, marginBottom: 4 },
    totalLabel: { fontSize: 9, fontFamily: 'Helvetica' },
    totalValue: { fontSize: 9, fontFamily: 'Helvetica-Bold', textAlign: 'right' },
    grandTotalRow: { flexDirection: 'row', justifyContent: 'space-between', width: 180, marginTop: 4, paddingTop: 4, borderTop: '1px solid #e0e0e0' },
    grandTotalLabel: { fontSize: 11, fontFamily: 'Helvetica-Bold' },
    grandTotalValue: { fontSize: 11, fontFamily: 'Helvetica-Bold', textAlign: 'right' },

    // Footer
    footer: { position: 'absolute', bottom: 30, left: 30, right: 30, textAlign: 'center', fontSize: 7, color: '#666' },
    signatures: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 40, borderTop: '1px solid #000', paddingTop: 5, marginHorizontal: 40 }
});

const InvoiceTemplate = ({ data }: { data: any }) => {
    return (
        <Document>
            <Page size="LETTER" style={styles.page}>

                {/* 1. HEADER */}
                <View style={styles.headerWrapper}>
                    <View style={styles.logoContainer}>
                        {/* Asegurarse de tener public/diamante.jpg en Astro */}
                        <Image style={styles.logo} src="/diamante.jpg" />
                        <Text style={styles.companyInfoSmall}>Actividad Económica Principal 4761</Text>
                        <Text style={styles.companyInfoSmall}>No somos Gran Contribuyente</Text>
                        <Text style={styles.companyInfoSmall}>No somos Agente Retenedor del Impuesto sobre las Ventas - IVA</Text>
                        <Text style={styles.companyInfoSmall}>No somos Autorretenedor del Impuesto sobre la Renta y Complementarios</Text>
                    </View>

                    <View style={styles.invoiceInfoContainer}>
                        <Text style={styles.invoiceTitle}>Factura Electrónica de Venta      FE - {data.invoiceId ? data.invoiceId.split('-')[0].toUpperCase() : '001'}</Text>

                        <View style={styles.invoiceInfoRow}>
                            <Text style={styles.infoLabel}>Tipo de Operación</Text>
                            <Text style={styles.infoValue}>Estandar</Text>
                        </View>
                        <View style={styles.invoiceInfoRow}>
                            <Text style={styles.infoLabel}>Fecha de Generación</Text>
                            <Text style={styles.infoValue}>{new Date().toLocaleDateString()}</Text>
                        </View>
                        <View style={styles.invoiceInfoRow}>
                            <Text style={styles.infoLabel}>Forma de Pago</Text>
                            <Text style={styles.infoValue}>Crédito 3 DÍAS</Text>
                        </View>
                        <View style={styles.invoiceInfoRow}>
                            <Text style={styles.infoLabel}>Medio de Pago</Text>
                            <Text style={styles.infoValue}>Transferencia Crédito</Text>
                        </View>
                        <View style={styles.invoiceInfoRow}>
                            <Text style={styles.infoLabel}>Moneda</Text>
                            <Text style={styles.infoValue}>COP</Text>
                        </View>
                    </View>
                </View>

                {/* 2. DATOS DEL EMISOR / CLIENTE */}
                <View style={styles.dataSection}>
                    <View style={styles.columnHalf}>
                        <Text style={styles.columnTitle}>DATOS DEL EMISOR</Text>
                        <View style={styles.dataRow}><Text style={styles.dataLabel}>Razón Social</Text><Text style={styles.dataText}>JOSE FRANCISCO ALVAREZ GARCIA</Text></View>
                        <View style={styles.dataRow}><Text style={styles.dataLabel}>Nombre Comercial</Text><Text style={styles.dataText}>LA CASA DEL BOLIGRAFO DIAMANT'S</Text></View>
                        <View style={styles.dataRow}><Text style={styles.dataLabel}>NIT</Text><Text style={styles.dataText}>19096350</Text></View>
                        <View style={styles.dataRow}><Text style={styles.dataLabel}>Obligación</Text><Text style={styles.dataText}>IVA</Text></View>
                        <View style={styles.dataRow}><Text style={styles.dataLabel}>Email</Text><Text style={styles.dataText}>dislacasadelboligrafo@hotmail.com</Text></View>
                        <View style={styles.dataRow}><Text style={styles.dataLabel}>Teléfono</Text><Text style={styles.dataText}>3022887219</Text></View>
                        <View style={styles.dataRow}><Text style={styles.dataLabel}>Dirección Fiscal</Text><Text style={styles.dataText}>CL 145 9 26 TO 2 AP 505 CON SANTELMO BRR SALADO, IBAGUE, TOLIMA</Text></View>
                    </View>
                    <View style={[styles.columnHalf, styles.middleBorder]}>
                        <Text style={styles.columnTitle}>DATOS DEL CLIENTE</Text>
                        <View style={styles.dataRow}><Text style={styles.dataLabel}>Razón Social</Text><Text style={styles.dataText}>{data.customerName?.toUpperCase()}</Text></View>
                        <View style={styles.dataRow}><Text style={styles.dataLabel}>NIT</Text><Text style={styles.dataText}>{data.customerDoc || 'CONSUMIDOR FINAL'}</Text></View>
                        <View style={styles.dataRow}><Text style={styles.dataLabel}>Obligación</Text><Text style={styles.dataText}>IVA</Text></View>
                        {data.customerEmail && <View style={styles.dataRow}><Text style={styles.dataLabel}>Email</Text><Text style={styles.dataText}>{data.customerEmail}</Text></View>}
                        {data.customerPhone && <View style={styles.dataRow}><Text style={styles.dataLabel}>Teléfono</Text><Text style={styles.dataText}>{data.customerPhone}</Text></View>}
                        {data.customerAddress && <View style={styles.dataRow}><Text style={styles.dataLabel}>Dirección</Text><Text style={styles.dataText}>{data.customerAddress}</Text></View>}
                        {data.customerCity && <View style={styles.dataRow}><Text style={styles.dataLabel}>Ciudad, Depart.</Text><Text style={styles.dataText}>{data.customerCity}</Text></View>}
                    </View>
                </View>

                {/* 3. TABLA DE ÍTEMS */}
                <View style={styles.table}>
                    <View style={styles.tableHeaderRow}>
                        <Text style={[styles.th, styles.colNum]}>No</Text>
                        <Text style={[styles.th, styles.colRef]}>REF</Text>
                        <Text style={[styles.th, styles.colDesc]}>DESCRIPCIÓN</Text>
                        <Text style={[styles.th, styles.colCant]}>CANT</Text>
                        <Text style={[styles.th, styles.colUM]}>U/M</Text>
                        <Text style={[styles.th, styles.colPrecio]}>PRECIO</Text>
                        <Text style={[styles.th, styles.colImp]}>IMP</Text>
                        <Text style={[styles.th, styles.colSubtotal]}>SUBTOTAL</Text>
                        <Text style={[styles.th, styles.colTotalItem]}>TOTAL ITEM</Text>
                    </View>

                    {data.items?.map((item: any, i: number) => {
                        const itemBruto = Math.round(item.unitPrice / 1.19);
                        const itemTotalBruto = itemBruto * item.quantity;
                        const itemTotalFinal = item.unitPrice * item.quantity;

                        return (
                            <View key={i} style={styles.tableRow}>
                                <Text style={[styles.td, styles.colNum]}>{i + 1}</Text>
                                <Text style={[styles.td, styles.colRef]}>{item.reference || 'N/A'}</Text>
                                <Text style={[styles.td, styles.colDesc]}>{item.name}</Text>
                                <Text style={[styles.td, styles.colCant]}>{item.quantity}</Text>
                                <Text style={[styles.td, styles.colUM]}>94</Text>
                                <Text style={[styles.td, styles.colPrecio]}>${itemBruto.toLocaleString()}</Text>
                                <Text style={[styles.td, styles.colImp]}>IVA 19%</Text>
                                <Text style={[styles.td, styles.colSubtotal]}>${itemTotalBruto.toLocaleString()}</Text>
                                <Text style={[styles.td, styles.colTotalItem]}>${itemTotalFinal.toLocaleString()}</Text>
                            </View>
                        );
                    })}
                </View>

                {/* 4. TOTALES */}
                <View style={styles.totalsContainer}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Subtotal</Text>
                        <Text style={styles.totalValue}>${Math.round(data.total / 1.19).toLocaleString()}</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>IVA 19%</Text>
                        <Text style={styles.totalValue}>${(data.total - Math.round(data.total / 1.19)).toLocaleString()}</Text>
                    </View>
                    <View style={styles.grandTotalRow}>
                        <Text style={styles.grandTotalLabel}>Total a Pagar</Text>
                        <Text style={styles.grandTotalValue}>${data.total.toLocaleString()}</Text>
                    </View>
                </View>

                <Text style={{ fontSize: 8, marginTop: 20 }}>Si paga de contado descuente el 10% antes del IVA</Text>
                <Text style={{ fontSize: 8, marginTop: 4 }}>Unidades de medida: 94 = unidad</Text>

                {/* FIRMAS Y FOOTER */}
                <View style={styles.signatures}>
                    <Text>FIRMA EMISOR</Text>
                    <Text>FIRMA CLIENTE</Text>
                </View>
                <Text style={styles.footer}>Software DATAICO fabricado por Proveedor Tecnológico DATAICO SAS 901223648 - Documento Generado Internamente</Text>
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
        link.download = `Factura_POS_${invoiceData.invoiceId || 'NUEVA'}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error generando PDF:', error);
    }
};

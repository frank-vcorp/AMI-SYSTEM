import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { CertificateData } from '../types';

// Registramos fuentes premium si es necesario, pero por ahora usamos las estándar
// para evitar problemas con paths de archivos en el build

const styles = StyleSheet.create({
    page: {
        padding: 40,
        backgroundColor: '#FFFFFF',
        fontFamily: 'Helvetica',
    },
    header: {
        marginBottom: 20,
        borderBottom: 2,
        borderBottomColor: '#00B5A5',
        paddingBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerLeft: {
        flexDirection: 'column',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 10,
        color: '#666666',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#00B5A5',
        textTransform: 'uppercase',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 10,
    },
    gridItem: {
        width: '50%',
        marginBottom: 10,
    },
    label: {
        fontSize: 9,
        color: '#999999',
        marginBottom: 2,
    },
    value: {
        fontSize: 11,
        color: '#333333',
        fontWeight: 'bold',
    },
    verdictBox: {
        marginTop: 20,
        padding: 20,
        borderRadius: 8,
        textAlign: 'center',
        border: 1,
    },
    verdictApproved: {
        backgroundColor: '#F0FDF4',
        borderColor: '#BBF7D0',
        color: '#166534',
    },
    verdictWarning: {
        backgroundColor: '#FFFBEB',
        borderColor: '#FEF3C7',
        color: '#92400E',
    },
    verdictError: {
        backgroundColor: '#FEF2F2',
        borderColor: '#FECACA',
        color: '#991B1B',
    },
    verdictTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    verdictDesc: {
        fontSize: 10,
    },
    findings: {
        fontSize: 10,
        color: '#444444',
        lineHeight: 1.5,
        backgroundColor: '#F9FAFB',
        padding: 10,
        borderRadius: 4,
    },
    signatureSection: {
        marginTop: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 20,
        borderTop: 1,
        borderTopColor: '#EEEEEE',
    },
    signatureBox: {
        width: '30%',
        textAlign: 'center',
    },
    signatureImage: {
        width: 100,
        height: 40,
        marginBottom: 5,
        alignSelf: 'center',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        borderTop: 1,
        borderTopColor: '#EEEEEE',
        paddingTop: 10,
    },
    footerText: {
        fontSize: 8,
        color: '#AAAAAA',
    }
});

interface AptitudePDFProps {
    data: CertificateData;
}

export const AptitudePDF: React.FC<AptitudePDFProps> = ({ data }) => {
    const isApproved = data.status === 'APPROVED';
    const isConditional = data.status === 'CONDITIONAL';

    return (
        <Document title={`Certificado_${data.folio}`}>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.title}>CERTIFICADO MÉDICO</Text>
                        <Text style={styles.subtitle}>RESIDENTE DIGITAL AMI-SYSTEM</Text>
                    </View>
                    <View style={{ textAlign: 'right' }}>
                        <Text style={styles.label}>FOLIO</Text>
                        <Text style={[styles.value, { color: '#00B5A5' }]}>{data.folio}</Text>
                    </View>
                </View>

                {/* Patient Data */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Identificación del Paciente</Text>
                    <View style={styles.grid}>
                        <View style={styles.gridItem}>
                            <Text style={styles.label}>NOMBRE COMPLETO</Text>
                            <Text style={styles.value}>{data.patientName}</Text>
                        </View>
                        <View style={styles.gridItem}>
                            <Text style={styles.label}>EMPRESA</Text>
                            <Text style={styles.value}>{data.companyName}</Text>
                        </View>
                        <View style={styles.gridItem}>
                            <Text style={styles.label}>FECHA DE NACIMIENTO</Text>
                            <Text style={styles.value}>{data.patientDOB}</Text>
                        </View>
                        <View style={styles.gridItem}>
                            <Text style={styles.label}>ID EXPEDIENTE</Text>
                            <Text style={styles.value}>{data.expedientId}</Text>
                        </View>
                    </View>
                </View>

                {/* Verdict Box */}
                <View style={[
                    styles.verdictBox,
                    isApproved ? styles.verdictApproved :
                        isConditional ? styles.verdictWarning : styles.verdictError
                ]}>
                    <Text style={styles.verdictTitle}>
                        {isApproved ? 'APTO' : isConditional ? 'APTO CON RESTRICCIONES' : 'NO APTO'}
                    </Text>
                    <Text style={styles.verdictDesc}>
                        Evaluación médica basada en protocolos de salud ocupacional de AMI.
                    </Text>
                </View>

                {/* Findings & Notes */}
                <View style={[styles.section, { marginTop: 20 }]}>
                    <Text style={styles.sectionTitle}>Hallazgos y Recomendaciones</Text>
                    <View style={styles.findings}>
                        <Text>{data.medicalFindings || "Sin hallazgos relevantes en la evaluación clínica."}</Text>
                    </View>
                </View>

                {/* Signature Section */}
                <View style={styles.signatureSection}>
                    <View style={styles.signatureBox}>
                        {data.signatureImageUrl && (
                            <Image src={data.signatureImageUrl} style={styles.signatureImage} />
                        )}
                        <View style={{ borderTop: 1, borderTopColor: '#333', marginTop: 5, paddingTop: 5 }}>
                            <Text style={styles.value}>{data.validatorName}</Text>
                            <Text style={[styles.label, { fontSize: 7 }]}>MÉDICO VALIDADOR</Text>
                        </View>
                    </View>

                    <View style={styles.signatureBox}>
                        <Text style={{ fontSize: 8, color: '#DDD', marginBottom: 10 }}>[ SELLO DIGITAL ]</Text>
                        <Text style={[styles.label, { fontSize: 7 }]}>AUDITORÍA AMI-SYSTEM</Text>
                        <Text style={[styles.label, { fontSize: 6 }]}>{data.stampDate}</Text>
                    </View>

                    <View style={styles.signatureBox}>
                        <View style={{ borderTop: 1, borderTopColor: '#333', marginTop: 45, paddingTop: 5 }}>
                            <Text style={styles.value}>AMI SALUD</Text>
                            <Text style={[styles.label, { fontSize: 7 }]}>CENTRO DE OPERACIONES</Text>
                        </View>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Este documento es un registro oficial de salud ocupacional generado por AMI-SYSTEM.
                        La autenticidad puede verificarse en amisalud.ai/verify/{data.folio}
                    </Text>
                    <Text style={[styles.footerText, { marginTop: 5 }]}>
                        AMI Salud Responsable S.A. de C.V. | {new Date().getFullYear()}
                    </Text>
                </View>
            </Page>
        </Document>
    );
};

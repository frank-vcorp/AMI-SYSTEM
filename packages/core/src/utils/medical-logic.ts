/**
 * 🩺 AMI MEDICAL LOGIC ENGINE
 * @ref context/Procedimiento Sistema AMI.md
 * 
 * Lógica centralizada para cálculos clínicos y semaforización.
 */

// --- IMC ---

export type IMCClassification =
    | 'BAJO_PESO'
    | 'NORMAL'
    | 'SOBREPESO'
    | 'OBESIDAD_G1'
    | 'OBESIDAD_G2'
    | 'OBESIDAD_G3'
    | 'OBESIDAD_G4';

export const IMC_ALERTS: Record<IMCClassification, { label: string; color: string }> = {
    BAJO_PESO: { label: 'Bajo Peso', color: 'text-amber-500' },
    NORMAL: { label: 'Normal', color: 'text-green-500' },
    SOBREPESO: { label: 'Sobrepeso', color: 'text-amber-500' },
    OBESIDAD_G1: { label: 'Obesidad Grado 1', color: 'text-orange-500' },
    OBESIDAD_G2: { label: 'Obesidad Grado 2', color: 'text-red-500' },
    OBESIDAD_G3: { label: 'Obesidad Grado 3', color: 'text-red-700' },
    OBESIDAD_G4: { label: 'Obesidad Grado 4', color: 'text-purple-900' },
};

export function calculateIMC(weightKg: number, heightCm: number): { value: number; classification: IMCClassification } {
    const heightM = heightCm / 100;
    const imc = weightKg / (heightM * heightM);

    let classification: IMCClassification = 'NORMAL';
    if (imc < 18.5) classification = 'BAJO_PESO';
    else if (imc < 25) classification = 'NORMAL';
    else if (imc < 30) classification = 'SOBREPESO';
    else if (imc < 35) classification = 'OBESIDAD_G1';
    else if (imc < 40) classification = 'OBESIDAD_G2';
    else if (imc < 50) classification = 'OBESIDAD_G3';
    else classification = 'OBESIDAD_G4';

    return { value: Number(imc.toFixed(2)), classification };
}

// --- TENSIÓN ARTERIAL ---

export type BPClassification =
    | 'BAJA'
    | 'NORMAL'
    | 'NORMAL_ALTA'
    | 'HIPERTENSION_G1'
    | 'HIPERTENSION_G2';

export const BP_ALERTS: Record<BPClassification, { label: string; color: string }> = {
    BAJA: { label: 'Baja', color: 'text-blue-500' },
    NORMAL: { label: 'Normal', color: 'text-green-500' },
    NORMAL_ALTA: { label: 'Normal-Alta', color: 'text-amber-500' },
    HIPERTENSION_G1: { label: 'Hipertensión G1', color: 'text-orange-600' },
    HIPERTENSION_G2: { label: 'Hipertensión G2', color: 'text-red-600' },
};

export function classifyBP(systolic: number, diastolic: number): BPClassification {
    if (systolic < 80 && diastolic < 50) return 'BAJA';
    if (systolic >= 140 || diastolic >= 90) return 'HIPERTENSION_G2';
    if (systolic >= 130 || (diastolic >= 80 && diastolic <= 89)) return 'HIPERTENSION_G1';
    if (systolic >= 120 && systolic <= 129 && diastolic < 80) return 'NORMAL_ALTA';
    return 'NORMAL';
}

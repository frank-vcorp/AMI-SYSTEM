/**
 * ReaderService - "El Cerebro"
 * Portado de context/RD/LECTOR/index-final.html
 * Lógica de detección de tipos de estudio y extracción de pistas (hints) mediante regex calibrados.
 */

export type StudyType =
    | "Biometría Hemática"
    | "Química Sanguínea"
    | "Examen General de Orina"
    | "Audiometría"
    | "Espirometría"
    | "Electrocardiograma"
    | "Campimetría"
    | "Riesgo Cardiovascular"
    | "Radiografía"
    | "Toxicológico"
    | "SIM (administrativo)"
    | "—";

export interface ExtractionHints {
    nombre?: string;
    empresa?: string;
    fecha?: string;
    edad?: string;
}

/**
 * Detecta el tipo de estudio basado en el contenido de texto.
 */
export function detectStudyType(text: string): StudyType {
    const t = text.toLowerCase();
    if (/(biometria hematica)/.test(t)) return "Biometría Hemática";
    if (/(quimica sanguinea)/.test(t)) return "Química Sanguínea";
    if (/(examen general de orina)/.test(t)) return "Examen General de Orina";
    if (/(audiometr[ií]a)/.test(t)) return "Audiometría";
    if (/(espirometr[ií]a)/.test(t)) return "Espirometría";
    if (/(electrocardiograma|ecg)/.test(t)) return "Electrocardiograma";
    if (/(campimetr[ií]a|examen visual)/.test(t)) return "Campimetría";
    if (/(riesgo cardiovascular)/.test(t)) return "Riesgo Cardiovascular";
    if (/(rayos x|radiograf[ií]a|rx)/.test(t)) return "Radiografía";
    if (/(toxicolog[ií]co|antidoping|5 elementos)/.test(t)) return "Toxicológico";
    if (/(sim|sistema integral m[eé]dico)/.test(t)) return "SIM (administrativo)";
    return "—";
}

const labHeaderMap = {
    nombre: (text: string) => text.match(/Paciente\s*([A-ZÁÉÍÓÚÑ ,]+)/i)?.[1],
    empresa: (text: string) => text.match(/Empresa\s*([A-ZÁÉÍÓÚÑ ]+)/i)?.[1],
    fecha: (text: string) => text.match(/Fecha de registro\s*([0-9\-]+)/i)?.[1],
    edad: (text: string) => {
        const match = text.match(/Edad\s*([0-9]+\s*A,\s*[0-9]+\s*M,\s*[0-9]+\s*D)/i)?.[1];
        if (match) return match;
        const dobMatch = text.match(/F\. de nacimiento\s*([0-9]{4}-[0-9]{2}-[0-9]{2})/i)?.[1];
        if (dobMatch) {
            const dob = new Date(dobMatch);
            const ageDifMs = Date.now() - dob.getTime();
            const ageDate = new Date(ageDifMs);
            return Math.abs(ageDate.getUTCFullYear() - 1970) + " Años";
        }
        return null;
    }
};

const EXTRACTION_MAPS: Record<string, any> = {
    "Biometría Hemática": labHeaderMap,
    "Química Sanguínea": labHeaderMap,
    "Examen General de Orina": labHeaderMap,
    "Espirometría": {
        nombre: (text: string) => text.match(/Nombre:\s*([A-ZÁÉÍÓÚÑ ]+)/i)?.[1],
        empresa: (text: string) => text.match(/Procedencia:\s*([A-ZÁÉÍÓÚÑ ]+)/i)?.[1],
        fecha: (text: string) => text.match(/Fecha:\s*([0-9\-]+)/i)?.[1],
        edad: (text: string) => text.match(/Edad\(a\):\s*([0-9]+)/i)?.[1]
    },
    "Audiometría": {
        nombre: (text: string) => text.match(/\b([A-ZÁÉÍÓÚÑ]+,\s[A-ZÁÉÍÓÚÑ]+\s[A-ZÁÉÍÓÚÑ]+)\b/i)?.[1],
        empresa: (text: string) => text.match(/(AMI)\s+NVO ING/i)?.[1],
        fecha: (text: string) => text.match(/Fecha de la acción:\s*([0-9\/]+)/i)?.[1],
        edad: (text: string) => {
            const dobMatch = text.match(/Fecha de Nacimiento:\s*([0-9]{2}\/[0-9]{2}\/[0-9]{4})/i)?.[1];
            if (dobMatch) {
                const parts = dobMatch.split('/');
                if (parts.length !== 3) return null;
                const dob = new Date(+parts[2], parseInt(parts[1]) - 1, +parts[0]);
                const studyDateMatch = text.match(/Fecha de la acción:\s*([0-9]{2}\/[0-9]{2}\/[0-9]{4})/i)?.[1];
                const studyDateParts = studyDateMatch ? studyDateMatch.split('/') : null;
                if (!studyDateParts || studyDateParts.length !== 3) return null;
                const studyDate = new Date(+studyDateParts[2], parseInt(studyDateParts[1]) - 1, +studyDateParts[0]);
                let age = studyDate.getFullYear() - dob.getFullYear();
                const m = studyDate.getMonth() - dob.getMonth();
                if (m < 0 || (m === 0 && studyDate.getDate() < dob.getDate())) {
                    age--;
                }
                return age + " Años";
            }
            return null;
        }
    },
    "Campimetría": {
        nombre: (text: string) => text.match(/NOMBRE:\s*([A-ZÁÉÍÓÚÑ ]+)/i)?.[1],
        empresa: (text: string) => text.match(/EMPRESA:\s*([A-ZÁÉÍÓÚÑ ]+)/i)?.[1],
        fecha: (text: string) => text.match(/FECHA:\s*([0-9\/]+)/i)?.[1],
        edad: (text: string) => text.match(/EDAD:\s*([0-9]+\s*AÑOS)/i)?.[1]
    },
    "Electrocardiograma": {
        nombre: (text: string) => text.match(/Paciente:\s*(.+?)\s*Sexo:/i)?.[1],
        empresa: (text: string) => text.match(/Empresa:\s*(.+?)\s*Tipo de Estudio/i)?.[1] || text.match(/AMI SALUD RESPONSABLE SA DE CV/i)?.[0],
        edad: (text: string) => text.match(/Edad:\s*([0-9]+)/i)?.[1]
    },
    "Riesgo Cardiovascular": {
        nombre: (text: string) => text.match(/Nombre paciente:\s*(.*?)\s*Empresa:/i)?.[1],
        fecha: (text: string) => text.match(/a,\s*([0-9]+\s*de\s*[a-z]+\s*de\s*[0-9]{4})/i)?.[1],
        edad: (text: string) => text.match(/Edad\s+([0-9.]+)/i)?.[1]
    }
};

/**
 * Extrae pistas calibradas del texto crudo basado en el tipo de estudio.
 */
export function extractCalibratedHints(text: string, tipo: StudyType): ExtractionHints {
    const map = EXTRACTION_MAPS[tipo];
    if (!map) return {};

    const hints: ExtractionHints = {};
    for (const key in map) {
        try {
            const result = map[key](text);
            if (result) {
                (hints as any)[key] = String(result).trim().replace(/\s+/g, ' ');
            }
        } catch (e) {
            console.error(`Error extracting hint '${key}' for type '${tipo}':`, e);
        }
    }
    return hints;
}

import { prisma } from '../index';

interface GenerateWorkerIdInput {
    tenantId: string;
    firstName: string;
    paternalLastName: string;
    maternalLastName?: string;
    birthDate: Date;
    gender: 'MALE' | 'FEMALE';
}

/**
 * 🆔 AMI-ID Generator
 * Format: AMI-[INITIALS]-[YYMMDD]-[GENDER]-[SEQ]
 * Handles homonyms and offensive word clipping (clipping 'CACA' to 'CACX')
 */
export async function generateWorkerId(input: GenerateWorkerIdInput): Promise<string> {
    const { firstName, paternalLastName, maternalLastName, birthDate, gender } = input;

    // 1. Extract Initials (2 from paternal, 1 from maternal, 1 from first name)
    let initials = [
        paternalLastName.substring(0, 2).toUpperCase(),
        (maternalLastName || 'X').substring(0, 1).toUpperCase(),
        firstName.substring(0, 1).toUpperCase(),
    ].join('');

    // 2. Censorship Filter (Offensive words)
    const offensiveWords = ['BUEY', 'CACA', 'COGE', 'COJO', 'COGE', 'COJO', 'COLO', 'CULO', 'FALO', 'FETO', 'GETA', 'GUEI', 'GUEY', 'JOTO', 'KACA', 'KACO', 'KAGO', 'KOGE', 'KOJO', 'KULO', 'MAME', 'MAMO', 'MEAR', 'MEAS', 'MEON', 'MION', 'MOCO', 'MULA', 'PEDA', 'PEDO', 'PENE', 'PIPI', 'PITO', 'POPO', 'PUTA', 'PUTO', 'QULO', 'RATA', 'ROBO', 'ROBA', 'SENO', 'TETA', 'VACA', 'VUEI', 'VUEY', 'WUEI', 'WUEY'];

    if (offensiveWords.includes(initials)) {
        initials = initials.substring(0, 3) + 'X';
    }

    // 3. Date segment (YYMMDD)
    const yy = birthDate.getFullYear().toString().substring(2);
    const mm = (birthDate.getMonth() + 1).toString().padStart(2, '0');
    const dd = birthDate.getDate().toString().padStart(2, '0');
    const dateSegment = `${yy}${mm}${dd}`;

    // 4. Gender segment
    const genderSegment = gender === 'MALE' ? 'M' : 'F';

    // 5. Sequence segment (Homonyms)
    const baseId = `AMI-${initials}-${dateSegment}-${genderSegment}`;

    // Count existing patients with this base ID pattern
    const count = await prisma.patient.count({
        where: {
            tenantId: input.tenantId,
            uniqueId: {
                startsWith: baseId
            }
        }
    });

    const sequence = count.toString().padStart(2, '0');

    return `${baseId}-${sequence}`;
}

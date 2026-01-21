import React, { useMemo } from "react";
import { ValidationTask, PatientSummary, ExtractedDataSet, LaboratoryData, SpirometryData, RadiographyData } from "../types";
import { PDFViewer } from "./PDFViewer";
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Badge } from "@ami/core-ui";
import { calculateSemaphoresFromLab } from "../utils/clinical-rules";

export interface ValidatorSideBySideProps {
  task: ValidationTask;
  patient?: PatientSummary;
  pdfUrls?: Record<string, string>;
  onSave?: (task: ValidationTask) => Promise<void>;
  isLoading?: boolean;
}

const LabCard: React.FC<{ data?: LaboratoryData }> = ({ data }) => {
  const semaphores = useMemo(() => data ? calculateSemaphoresFromLab(data) : [], [data]);
  const isRed = semaphores.some(s => s.priority === 'HIGH');
  const isYellow = semaphores.some(s => s.priority === 'MEDIUM');

  return (
    <Card>
      <CardHeader className="py-3 flex flex-row items-center justify-between">
        <CardTitle className="text-base">Laboratorio (BH)</CardTitle>
        {isRed && <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100 border-0">ROJO</Badge>}
        {!isRed && isYellow && <Badge variant="warning" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0">AMARILLO</Badge>}
        {!isRed && !isYellow && data && <Badge variant="success" className="bg-green-100 text-green-700 hover:bg-green-100 border-0">VERDE</Badge>}
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <Input label="Hemoglobina (g/dL)" defaultValue={data?.hemoglobina} />
        <Input label="Hematocrito (%)" defaultValue={data?.hematocrito} />
        <Input label="Glucosa (mg/dL)" defaultValue={data?.glucosa} />
        <Input label="Colesterol (mg/dL)" defaultValue={data?.colesterolTotal} />
      </CardContent>
    </Card>
  );
};

const SpiroCard: React.FC<{ data?: SpirometryData }> = ({ data }) => (
  <Card>
    <CardHeader className="py-3 flex flex-row items-center justify-between">
      <CardTitle className="text-base">Espirometría</CardTitle>
      {/* Mock semaphore logic for spiro as util might not exist or be complex */}
       <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-100 border-0">PENDIENTE</Badge>
    </CardHeader>
    <CardContent className="grid grid-cols-2 gap-4">
      <Input label="FVC (L)" defaultValue={data?.fvc} />
      <Input label="FEV1 (L)" defaultValue={data?.fev1} />
      <Input label="FEV1/FVC (%)" defaultValue={data?.fev1Fvc} />
    </CardContent>
  </Card>
);

const RadioCard: React.FC<{ data?: RadiographyData }> = ({ data }) => (
  <Card>
     <CardHeader className="py-3 flex flex-row items-center justify-between">
      <CardTitle className="text-base">Radiografía</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <Input label="Región" defaultValue={data?.location} />
      <div className="w-full">
         <label className="block text-xs font-medium text-gray-500 mb-1">Hallazgos</label>
        <textarea 
          className="flex min-h-[60px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00B5A5]"
          defaultValue={data?.findings} 
        />
      </div>
    </CardContent>
  </Card>
);


export const ValidatorSideBySide: React.FC<ValidatorSideBySideProps> = ({
  task,
  patient,
  pdfUrls,
  onSave,
  isLoading,
}) => {
  // --- State for PDF Selector (if multiple PDFs) ---
  const firstPdfKey = pdfUrls ? Object.keys(pdfUrls)[0] : null;
  const [activePdfUrl, setActivePdfUrl] = React.useState<string | null>(
    firstPdfKey && pdfUrls ? pdfUrls[firstPdfKey] : null
  );

  const { extractedData } = task;

  // --- Header ---
  const Header = () => (
    <header className="sticky top-0 z-10 w-full h-16 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-bold text-gray-800 tracking-tight">
          RD-AMI <span className="text-gray-400 font-light">| Validador</span>
        </h1>
        {patient && (
          <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Expediente
            </span>
            <span className="text-sm font-medium text-gray-900">
              {patient.id}
            </span>
          </div>
        )}
      </div>

      <nav className="flex items-center space-x-3">
        <Badge variant={task.status === 'COMPLETED' ? 'success' : 'secondary'} className="px-3 py-1 text-sm">
          {task.status}
        </Badge>
        
        <div className="h-6 w-px bg-gray-300 mx-2" />
        
        <Button variant="outline" size="sm" onClick={() => {}}>
          Guardar Borrador
        </Button>
        <Button size="sm" className="bg-[#00B5A5] hover:bg-[#009e90]" onClick={() => onSave?.(task)}>
          Terminar Validación
        </Button>
      </nav>
    </header>
  );

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden font-sans">
      <Header />

      <main className="flex-1 flex overflow-hidden">
        {/* --- Left Pane: PDF Viewer --- */}
        <section className="w-1/2 h-full border-r border-gray-200 bg-gray-100 flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Documento Fuente
            </h2>
          </div>
          <div className="flex-1 overflow-hidden relative">
            <PDFViewer
              study={task.studies[0] || null} 
              fileUrl={activePdfUrl}
              isLoading={isLoading}
            />
          </div>
        </section>

        {/* --- Right Pane: Data Extraction & Validation --- */}
        <section className="w-1/2 h-full flex flex-col bg-gray-50/50">
           <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Datos Extraídos
            </h2>
            <span className="text-xs text-gray-400">
              ID: {task.id.slice(0, 8)}...
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Identidad */}
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-base">Identidad</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input label="Paciente" defaultValue={patient?.fullName} />
                <Input label="Empresa" defaultValue="EMP-MOCK" /> 
                <Input label="Fecha Estudio" type="date" defaultValue={task.createdAt.split('T')[0]} />
              </CardContent>
            </Card>

            {/* Dynamic Sections based on Extracted Data */}
            {extractedData.laboratorio && <LabCard data={extractedData.laboratorio} />}
            {extractedData.spirometry && <SpiroCard data={extractedData.spirometry} />}
            {extractedData.radiografia && <RadioCard data={extractedData.radiografia} />}

            {/* Verdict / Dictamen */}
            <Card className="border-t-4 border-t-[#7B2D8E]">
              <CardHeader className="py-3">
                <CardTitle className="text-base text-[#7B2D8E]">Dictamen Médico</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="w-full">
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Conclusión
                    </label>
                    <select className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00B5A5]" defaultValue={task.verdict}>
                        <option value="APTO">Apto</option>
                        <option value="APTO_CON_RESTRICCIONES">Apto con restricciones</option>
                        <option value="NO_APTO">No Apto</option>
                    </select>
                 </div>
                 <div className="w-full">
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Comentarios / Recomendaciones
                    </label>
                    <textarea 
                        className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00B5A5]"
                        placeholder="Escriba aquí sus observaciones..."
                        defaultValue={task.medicalOpinion}
                    />
                 </div>
              </CardContent>
            </Card>

            <div className="h-12" />
          </div>
        </section>
      </main>
    </div>
  );
};

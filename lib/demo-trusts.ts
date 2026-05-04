export type TrustCountry = 'paraguay' | 'bolivia' | 'argentina';
export type TrustStage = 'draft' | 'compliance' | 'legal_review' | 'fiduciary_assigned' | 'signature' | 'active';

export type TrustChecklistItem = {
  id: string;
  label: string;
  detail: string;
  required: boolean;
};

export type DemoTrust = {
  id: string;
  name: string;
  country: TrustCountry;
  vehicle: string;
  status: TrustStage;
  project: string;
  fiduciary: string;
  targetAmount: number;
  fundedAmount: number;
  investors: number;
  riskLevel: 'Bajo' | 'Medio' | 'Alto';
  purpose: string;
  legalNote: string;
  nextStep: string;
  checklist: TrustChecklistItem[];
};

export const trustCountries: Record<TrustCountry, {
  label: string;
  regulator: string;
  fiduciaryRule: string;
  bestVehicle: string;
  caution: string;
}> = {
  paraguay: {
    label: 'Paraguay',
    regulator: 'Banco Central del Paraguay / fiduciario autorizado',
    fiduciaryRule: 'Usar banco, financiera o empresa fiduciaria autorizada. Separar bienes y contabilidad por negocio fiduciario.',
    bestVehicle: 'Fideicomiso inmobiliario o encargo fiduciario, segun transferencia de dominio.',
    caution: 'No ofrecer participaciones al publico sin revisar mercado de valores, publicidad y captacion.',
  },
  bolivia: {
    label: 'Bolivia',
    regulator: 'ASFI / mercado de valores segun estructura',
    fiduciaryRule: 'Validar si corresponde fideicomiso, patrimonio autonomo o titularizacion con entidad habilitada.',
    bestVehicle: 'Patrimonio autonomo / fideicomiso / titularizacion, segun si hay oferta colectiva.',
    caution: 'Si hay inversion colectiva o valores, revisar ASFI, oferta publica y autorizaciones antes de publicar.',
  },
  argentina: {
    label: 'Argentina',
    regulator: 'Codigo Civil y Comercial / CNV si es financiero',
    fiduciaryRule: 'Distinguir fideicomiso ordinario de fideicomiso financiero con fiduciario autorizado.',
    bestVehicle: 'Fideicomiso inmobiliario ordinario o financiero, segun colocacion y tipo de inversor.',
    caution: 'Si se emiten valores fiduciarios o hay oferta publica, entra CNV.',
  },
};

const baseChecklist: TrustChecklistItem[] = [
  {
    id: 'parties',
    label: 'Roles identificados',
    detail: 'Fiduciante, fiduciario, beneficiarios, fideicomisario y administrador operativo.',
    required: true,
  },
  {
    id: 'asset',
    label: 'Activo y titularidad',
    detail: 'Dominio, antecedentes, valuacion, restricciones y documentacion del inmueble.',
    required: true,
  },
  {
    id: 'purpose',
    label: 'Finalidad determinada',
    detail: 'Objeto, plazo, condicion de cierre, reglas de administracion y salida.',
    required: true,
  },
  {
    id: 'waterfall',
    label: 'Reglas economicas',
    detail: 'Aportes, comisiones, distribucion, prioridad de pagos y reintegros.',
    required: true,
  },
  {
    id: 'documents',
    label: 'Data room minimo',
    detail: 'Contrato, anexos, permisos, tasacion, flujo financiero, reportes y evidencias.',
    required: true,
  },
];

export const demoTrusts: DemoTrust[] = [
  {
    id: 'trust-py-asuncion-eje',
    name: 'Fideicomiso Torre Asuncion Eje',
    country: 'paraguay',
    vehicle: 'Fideicomiso inmobiliario',
    status: 'fiduciary_assigned',
    project: 'Torre Asuncion Eje',
    fiduciary: 'Fiduciaria autorizada BCP (demo)',
    targetAmount: 1800000,
    fundedAmount: 1296000,
    investors: 84,
    riskLevel: 'Bajo',
    purpose: 'Administrar aportes, documentacion y desembolsos por hitos de obra.',
    legalNote: 'Paraguay permite negocios fiduciarios bajo Ley 921. Requiere fiduciario habilitado para ejecutar la estructura real.',
    nextStep: 'Subir contrato final de fiduciaria y anexar cronograma de desembolsos.',
    checklist: [
      ...baseChecklist,
      {
        id: 'bcp-fiduciary',
        label: 'Fiduciario habilitado',
        detail: 'Confirmar banco, financiera o empresa fiduciaria autorizada por BCP.',
        required: true,
      },
      {
        id: 'separate-books',
        label: 'Contabilidad separada',
        detail: 'Preparar balance del negocio fiduciario y estados de resultado por patrimonio.',
        required: true,
      },
    ],
  },
  {
    id: 'trust-bo-patrimonio-santa-cruz',
    name: 'Patrimonio Autonomo Santa Cruz Renta',
    country: 'bolivia',
    vehicle: 'Patrimonio autonomo / titularizacion',
    status: 'legal_review',
    project: 'Residencias Santa Cruz Norte',
    fiduciary: 'Entidad supervisada ASFI (pendiente)',
    targetAmount: 1250000,
    fundedAmount: 410000,
    investors: 31,
    riskLevel: 'Medio',
    purpose: 'Separar activos y flujos para proyecto de renta residencial.',
    legalNote: 'En Bolivia hay que validar con asesor local si corresponde fideicomiso, patrimonio autonomo o titularizacion regulada.',
    nextStep: 'Definir si la captacion se limita a inversores privados o requiere estructura regulada por ASFI.',
    checklist: [
      ...baseChecklist,
      {
        id: 'asfi-scope',
        label: 'Alcance ASFI',
        detail: 'Determinar si hay oferta publica, valores o titularizacion.',
        required: true,
      },
      {
        id: 'local-counsel',
        label: 'Opinion legal local',
        detail: 'Adjuntar memo legal de abogado boliviano antes de publicar oportunidad.',
        required: true,
      },
    ],
  },
  {
    id: 'trust-ar-cordoba-renta',
    name: 'Fideicomiso Cordoba Norte Renta',
    country: 'argentina',
    vehicle: 'Fideicomiso inmobiliario ordinario',
    status: 'compliance',
    project: 'Edificio Cordoba Norte',
    fiduciary: 'Fiduciario privado (demo)',
    targetAmount: 920000,
    fundedAmount: 533600,
    investors: 57,
    riskLevel: 'Bajo',
    purpose: 'Administrar rentas, contratos y distribuciones mensuales.',
    legalNote: 'Si se emiten valores o se realiza oferta publica, evaluar fideicomiso financiero y CNV.',
    nextStep: 'Cerrar matriz fiscal y beneficiarios finales.',
    checklist: [
      ...baseChecklist,
      {
        id: 'tax',
        label: 'Matriz fiscal',
        detail: 'CUIT, beneficiarios finales, regimen informativo y tratamiento impositivo.',
        required: true,
      },
    ],
  },
];

export const trustSecurityTools = [
  {
    title: 'Data room verificable',
    detail: 'Cada documento clave tiene version, responsable, fecha, hash y estado de aprobacion.',
  },
  {
    title: 'Escrow y desembolsos por hitos',
    detail: 'El capital se libera por avance de obra, documentacion aprobada y autorizacion del fiduciario.',
  },
  {
    title: 'KYC / KYB completo',
    detail: 'Identidad de inversores, developer, beneficiarios finales y fiduciario antes de operar.',
  },
  {
    title: 'Scoring legal y documental',
    detail: 'Puntaje separado para inmueble, developer, permisos, contrato, flujo y riesgo pais.',
  },
  {
    title: 'Hash publico y QR',
    detail: 'Contratos, anexos y reportes importantes se pueden verificar publicamente.',
  },
  {
    title: 'Alertas de riesgo',
    detail: 'Cambios de contrato, retrasos, vencimientos, documentos faltantes y desvio presupuestario.',
  },
];

export const trustStages: { key: TrustStage; label: string; detail: string }[] = [
  { key: 'draft', label: 'Borrador', detail: 'Datos iniciales y estructura tentativa.' },
  { key: 'compliance', label: 'Compliance', detail: 'KYC, KYB, beneficiarios finales y riesgo.' },
  { key: 'legal_review', label: 'Revision legal', detail: 'Abogado/fiduciario valida estructura.' },
  { key: 'fiduciary_assigned', label: 'Fiduciario asignado', detail: 'Entidad fiduciaria confirmada.' },
  { key: 'signature', label: 'Firma', detail: 'Contrato final y anexos listos.' },
  { key: 'active', label: 'Activo', detail: 'Operando con reportes y desembolsos.' },
];

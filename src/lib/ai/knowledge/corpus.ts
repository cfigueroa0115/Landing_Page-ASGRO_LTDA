// ============================================================================
// ASGRO — Knowledge Base V2 · Safe Corpus inicial (Bloque 5B.1)
// ============================================================================
//
// Corpus seguro de conocimiento V2. FUENTE ÚNICA: contenido ya publicado en el
// sitio ASGRO en el commit actual. No usa Internet, no inventa productos,
// aseguradoras, coberturas, tarifas, tiempos de atención ni beneficios.
//
// Reglas aplicadas:
// - Atomicidad: cada entrada resuelve UNA idea.
// - Authority: solo `orientative` / `informational` (nada contractual en 5B.1).
// - sourceType: `website` (reformulación fiel de páginas publicadas) o
//   `institutional` (misión/visión/valores/alcance de la Asesora).
// - Contenido prohibido excluido: superlativos ("mejor cobertura"/"mejor
//   relación costo-beneficio"), SLA ("48 horas"/"mismo día"), multas, tarifas,
//   porcentajes regulatorios, primas, promesas de indemnización o de emisión.
// - reviewedBy = "ASGRO-web-approved-source" para reformulaciones fieles de la
//   web; null cuando requiera revisión manual (isApproved=false).
//
// Este corpus NO se conecta al chat en 5B.1.
// ============================================================================

import type {
  KbCategory,
  KbSubcategory,
  KbSourceType,
  KbAuthority,
} from './taxonomy';

/** Marca de contenido que requiere aprobación corporativa (no publicado hoy). */
export const PENDING_CONTENT_APPROVAL = 'PENDING_CONTENT_APPROVAL' as const;

export interface CorpusEntry {
  key: string;
  topic: string;
  category: KbCategory;
  subcategory: KbSubcategory;
  content: string;
  tags: string;
  source: string;
  sourceType: KbSourceType;
  authority: KbAuthority;
  version: number;
  priority: number;
  isApproved: boolean;
  isActive: boolean;
  reviewedBy: string | null;
  /** Nota interna de auditoría (no se inserta como contenido). */
  note?: string;
}

const APPROVED = 'ASGRO-web-approved-source';

// ----------------------------------------------------------------------------
// PERSONAS
// ----------------------------------------------------------------------------

const personas: CorpusEntry[] = [
  {
    key: 'personas-orientacion-general',
    topic: 'Seguros para personas',
    category: 'personas',
    subcategory: 'institucional_asgro',
    content:
      'ASGRO acompaña la protección de las personas y sus familias con soluciones de seguros para distintas etapas de la vida, con asesoría cercana para elegir alternativas acordes con el perfil y las necesidades de cada persona.',
    tags: 'personas,familia,proteccion,seguros,orientacion',
    source: 'website:/servicios',
    sourceType: 'website',
    authority: 'orientative',
    version: 1,
    priority: 10,
    isApproved: true,
    isActive: true,
    reviewedBy: APPROVED,
  },
  {
    key: 'personas-vida-orientacion-general',
    topic: 'Seguros de vida',
    category: 'personas',
    subcategory: 'vida',
    content:
      'Los seguros de vida buscan brindar respaldo económico a los beneficiarios ante el fallecimiento del asegurado. ASGRO orienta a las personas en la elección de una alternativa acorde con su situación; las condiciones específicas dependen de cada póliza y aseguradora.',
    tags: 'vida,fallecimiento,beneficiarios,personas',
    source: 'website:/servicios/bienestar-proteccion',
    sourceType: 'website',
    authority: 'orientative',
    version: 1,
    priority: 8,
    isApproved: true,
    isActive: true,
    reviewedBy: APPROVED,
  },
  {
    key: 'personas-salud-orientacion-general',
    topic: 'Salud y medicina prepagada',
    category: 'personas',
    subcategory: 'salud',
    content:
      'ASGRO orienta sobre planes de salud complementarios y medicina prepagada que amplían el acceso a servicios de salud. El alcance y las condiciones dependen de cada plan y de la entidad que lo ofrece.',
    tags: 'salud,medicina prepagada,planes complementarios,personas',
    source: 'website:/servicios/bienestar-proteccion',
    sourceType: 'website',
    authority: 'orientative',
    version: 1,
    priority: 7,
    isApproved: true,
    isActive: true,
    reviewedBy: APPROVED,
  },
  {
    key: 'personas-accidentes-personales-orientacion-general',
    topic: 'Accidentes personales',
    category: 'personas',
    subcategory: 'accidentes_personales',
    content:
      'Los seguros de accidentes personales cubren eventos inesperados dentro y fuera del ámbito laboral y pueden complementar la cobertura de la ARL. Las coberturas concretas dependen de cada póliza.',
    tags: 'accidentes personales,eventos,proteccion,personas',
    source: 'website:/servicios/bienestar-proteccion',
    sourceType: 'website',
    authority: 'orientative',
    version: 1,
    priority: 6,
    isApproved: true,
    isActive: true,
    reviewedBy: APPROVED,
  },
  {
    key: 'personas-hogar-orientacion-general',
    topic: 'Seguro de hogar',
    category: 'personas',
    subcategory: 'hogar',
    content:
      'ASGRO acompaña la protección del hogar como parte de las soluciones de seguros para personas. Le ayudamos a entender las alternativas disponibles según sus necesidades; las coberturas específicas dependen de cada póliza.',
    tags: 'hogar,vivienda,patrimonio,personas',
    source: 'website:/ (vitrina de protección: personas, hogar, vehículo)',
    sourceType: 'website',
    authority: 'orientative',
    version: 1,
    priority: 6,
    isApproved: true,
    isActive: true,
    reviewedBy: APPROVED,
  },
  {
    key: 'personas-vehiculos-orientacion-general',
    topic: 'Seguro de vehículo',
    category: 'personas',
    subcategory: 'vehiculos',
    content:
      'ASGRO orienta en la protección de vehículos y movilidad dentro de sus soluciones para personas. Le acompañamos a identificar alternativas acordes con su necesidad; las coberturas y condiciones dependen de cada póliza y aseguradora.',
    tags: 'vehiculo,automovil,movilidad,personas',
    source: 'website:/ (vitrina de protección: personas, hogar, vehículo)',
    sourceType: 'website',
    authority: 'orientative',
    version: 1,
    priority: 6,
    isApproved: true,
    isActive: true,
    reviewedBy: APPROVED,
  },
  {
    // Arrendamiento NO está presentado en el sitio actual -> requiere aprobación.
    key: 'personas-arrendamiento-orientacion-general',
    topic: 'Seguro de arrendamiento (pendiente de aprobación)',
    category: 'personas',
    subcategory: 'arrendamiento',
    content:
      'Contenido pendiente de aprobación corporativa. El sitio actual de ASGRO no presenta información específica sobre seguro de arrendamiento; no debe comunicarse como disponible hasta contar con fuente aprobada.',
    tags: 'arrendamiento,pendiente,personas',
    source: PENDING_CONTENT_APPROVAL,
    sourceType: 'institutional',
    authority: 'orientative',
    version: 1,
    priority: 0,
    isApproved: false,
    isActive: false,
    reviewedBy: null,
    note: 'PENDING_CONTENT_APPROVAL: no publicado en el sitio actual.',
  },
];

// ----------------------------------------------------------------------------
// EMPRESAS
// ----------------------------------------------------------------------------

const empresas: CorpusEntry[] = [
  {
    key: 'empresas-orientacion-general',
    topic: 'Seguros empresariales',
    category: 'empresas',
    subcategory: 'institucional_asgro',
    content:
      'ASGRO estructura soluciones de seguros empresariales según el perfil de riesgo, la actividad económica y las necesidades de cada empresa, con el objetivo de proteger sus activos, su patrimonio y la continuidad del negocio.',
    tags: 'empresas,pymes,negocio,patrimonio,coberturas',
    source: 'website:/servicios/seguros-empresariales',
    sourceType: 'website',
    authority: 'orientative',
    version: 1,
    priority: 10,
    isApproved: true,
    isActive: true,
    reviewedBy: APPROVED,
  },
  {
    key: 'empresas-multirriesgo-orientacion-general',
    topic: 'Multirriesgo empresarial',
    category: 'empresas',
    subcategory: 'multirriesgo',
    content:
      'La póliza multirriesgo empresarial reúne en una sola cobertura la protección de los activos de la empresa frente a eventos como incendio, explosión, fenómenos naturales y hurto, entre otros. El alcance concreto depende de cada póliza.',
    tags: 'multirriesgo,incendio,explosion,fenomenos naturales,hurto,empresas',
    source: 'website:/servicios/seguros-empresariales',
    sourceType: 'website',
    authority: 'orientative',
    version: 1,
    priority: 8,
    isApproved: true,
    isActive: true,
    reviewedBy: APPROVED,
  },
  {
    key: 'empresas-responsabilidad-civil-orientacion-general',
    topic: 'Responsabilidad civil',
    category: 'empresas',
    subcategory: 'responsabilidad_civil',
    content:
      'El seguro de responsabilidad civil ofrece cobertura ante reclamaciones de terceros por daños materiales o lesiones personales derivados de la operación de la empresa. Las modalidades y condiciones dependen de cada póliza.',
    tags: 'responsabilidad civil,rc,terceros,daños,empresas',
    source: 'website:/servicios/seguros-empresariales',
    sourceType: 'website',
    authority: 'orientative',
    version: 1,
    priority: 8,
    isApproved: true,
    isActive: true,
    reviewedBy: APPROVED,
  },
  {
    key: 'empresas-cumplimiento-orientacion-general',
    topic: 'Pólizas de cumplimiento',
    category: 'empresas',
    subcategory: 'cumplimiento',
    content:
      'Las pólizas de cumplimiento respaldan obligaciones contractuales frente a entidades públicas y privadas. ASGRO orienta sobre estas soluciones; el respaldo específico depende de cada contrato y póliza.',
    tags: 'cumplimiento,contratos,garantia,empresas',
    source: 'website:/servicios/seguros-empresariales',
    sourceType: 'website',
    authority: 'orientative',
    version: 1,
    priority: 8,
    isApproved: true,
    isActive: true,
    reviewedBy: APPROVED,
  },
  {
    key: 'empresas-manejo-orientacion-general',
    topic: 'Seguro de manejo',
    category: 'empresas',
    subcategory: 'manejo',
    content:
      'El seguro de manejo protege el patrimonio de la empresa ante actos deshonestos, abuso de confianza o fraude por parte de empleados que manejan bienes o recursos. El alcance depende de cada póliza.',
    tags: 'manejo,infidelidad,fraude,patrimonio,empresas',
    source: 'website:/servicios/seguros-empresariales',
    sourceType: 'website',
    authority: 'orientative',
    version: 1,
    priority: 6,
    isApproved: true,
    isActive: true,
    reviewedBy: APPROVED,
  },
  {
    key: 'empresas-vida-grupo-orientacion-general',
    topic: 'Vida grupo',
    category: 'empresas',
    subcategory: 'vida_grupo',
    content:
      'Los seguros de vida grupo brindan respaldo a los beneficiarios de los trabajadores ante eventos como fallecimiento o incapacidad total y permanente. Las coberturas dependen de cada póliza.',
    tags: 'vida grupo,trabajadores,beneficiarios,empresas',
    source: 'website:/servicios/bienestar-proteccion',
    sourceType: 'website',
    authority: 'orientative',
    version: 1,
    priority: 6,
    isApproved: true,
    isActive: true,
    reviewedBy: APPROVED,
  },
  {
    key: 'empresas-otros-riesgos-orientacion-general',
    topic: 'Otros riesgos empresariales',
    category: 'empresas',
    subcategory: 'otros_riesgos_empresariales',
    content:
      'ASGRO acompaña otras coberturas empresariales como transporte de mercancías, daños patrimoniales y todo riesgo constructor, estructuradas según la operación de cada empresa. El alcance concreto depende de cada póliza.',
    tags: 'transporte,daños patrimoniales,todo riesgo constructor,empresas',
    source: 'website:/servicios/seguros-empresariales',
    sourceType: 'website',
    authority: 'orientative',
    version: 1,
    priority: 5,
    isApproved: true,
    isActive: true,
    reviewedBy: APPROVED,
  },
];

// ----------------------------------------------------------------------------
// CAPACIDADES (ARL / SST)
// ----------------------------------------------------------------------------

const capacidades: CorpusEntry[] = [
  {
    key: 'capacidades-arl-acompanamiento-general',
    topic: 'Acompañamiento en ARL',
    category: 'capacidades',
    subcategory: 'arl',
    content:
      'Como capacidad complementaria, ASGRO acompaña a las empresas en la gestión con la Administradora de Riesgos Laborales: afiliación, traslado, clasificación de riesgo y gestión de eventos laborales, según la normatividad vigente.',
    tags: 'arl,afiliacion,traslado,clasificacion,riesgos laborales',
    source: 'website:/servicios/riesgos-laborales',
    sourceType: 'website',
    authority: 'orientative',
    version: 1,
    priority: 7,
    isApproved: true,
    isActive: true,
    reviewedBy: APPROVED,
  },
  {
    key: 'capacidades-arl-gestion-casos-general',
    topic: 'Gestión de casos laborales (ARL)',
    category: 'capacidades',
    subcategory: 'arl',
    content:
      'ASGRO acompaña la gestión de accidentes de trabajo y enfermedad laboral: reporte, investigación del evento y seguimiento del caso. El acompañamiento es orientativo y se ajusta a la normatividad aplicable.',
    tags: 'arl,accidente laboral,enfermedad laboral,gestion de casos',
    source: 'website:/servicios/riesgos-laborales',
    sourceType: 'website',
    authority: 'orientative',
    version: 1,
    priority: 5,
    isApproved: true,
    isActive: true,
    reviewedBy: APPROVED,
  },
  {
    key: 'capacidades-sst-acompanamiento-general',
    topic: 'Acompañamiento en SST (SG-SST)',
    category: 'capacidades',
    subcategory: 'sst',
    content:
      'ASGRO diseña, implementa y acompaña el Sistema de Gestión de Seguridad y Salud en el Trabajo (SG-SST) conforme a la normatividad colombiana vigente, abordando el ciclo de planear, hacer, verificar y actuar.',
    tags: 'sst,sg-sst,seguridad,salud,trabajo,phva',
    source: 'website:/servicios/seguridad-salud-trabajo',
    sourceType: 'website',
    authority: 'orientative',
    version: 1,
    priority: 7,
    isApproved: true,
    isActive: true,
    reviewedBy: APPROVED,
  },
  {
    key: 'capacidades-sst-componentes-general',
    topic: 'Componentes del servicio SST',
    category: 'capacidades',
    subcategory: 'sst',
    content:
      'El acompañamiento en SST incluye componentes como diagnóstico inicial, matriz de peligros y riesgos, diseño e implementación del sistema, auditorías, investigación de accidentes y mejora continua.',
    tags: 'sst,diagnostico,matriz de peligros,auditorias,investigacion',
    source: 'website:/servicios/seguridad-salud-trabajo',
    sourceType: 'website',
    authority: 'informational',
    version: 1,
    priority: 5,
    isApproved: true,
    isActive: true,
    reviewedBy: APPROVED,
  },
];

// ----------------------------------------------------------------------------
// TRANSVERSAL
// ----------------------------------------------------------------------------

const transversal: CorpusEntry[] = [
  {
    key: 'transversal-institucional-que-hace-asgro',
    topic: 'Qué hace ASGRO',
    category: 'transversal',
    subcategory: 'institucional_asgro',
    content:
      'ASGRO es una agencia de seguros y aliado integral en gestión del riesgo. Acompaña la protección de personas, patrimonio y empresas, y complementa con capacidades en ARL y SST, con un acompañamiento cercano antes, durante y después de la contratación.',
    tags: 'asgro,institucional,agencia de seguros,gestion del riesgo,quienes somos',
    source: 'website:/nosotros',
    sourceType: 'institutional',
    authority: 'informational',
    version: 1,
    priority: 9,
    isApproved: true,
    isActive: true,
    reviewedBy: APPROVED,
  },
  {
    key: 'transversal-institucional-valores',
    topic: 'Valores de ASGRO',
    category: 'transversal',
    subcategory: 'institucional_asgro',
    content:
      'Los valores corporativos de ASGRO son compromiso, transparencia, integridad y excelencia, y orientan su forma de acompañar a cada cliente.',
    tags: 'valores,compromiso,transparencia,integridad,excelencia',
    source: 'website:/nosotros',
    sourceType: 'institutional',
    authority: 'informational',
    version: 1,
    priority: 4,
    isApproved: true,
    isActive: true,
    reviewedBy: APPROVED,
  },
  {
    key: 'transversal-cotizacion-como-solicitar',
    topic: 'Cómo solicitar una cotización',
    category: 'transversal',
    subcategory: 'cotizacion',
    content:
      'Para solicitar una cotización puede usar el formulario de la página de cotización del sitio. Allí se recogen los datos necesarios para que el equipo de ASGRO prepare una propuesta acorde con su necesidad.',
    tags: 'cotizacion,cotizar,propuesta,formulario',
    source: 'website:/cotizar',
    sourceType: 'website',
    authority: 'orientative',
    version: 1,
    priority: 8,
    isApproved: true,
    isActive: true,
    reviewedBy: APPROVED,
  },
  {
    key: 'transversal-contacto-hablar-con-asesor',
    topic: 'Cómo hablar con un asesor',
    category: 'transversal',
    subcategory: 'contacto',
    content:
      'Puede ponerse en contacto con ASGRO mediante el formulario de contacto o por WhatsApp. El equipo se comunicará para acompañarle según su necesidad.',
    tags: 'contacto,asesor,whatsapp,formulario,hablar con humano',
    source: 'website:/contacto',
    sourceType: 'website',
    authority: 'orientative',
    version: 1,
    priority: 8,
    isApproved: true,
    isActive: true,
    reviewedBy: APPROVED,
  },
  {
    key: 'transversal-siniestros-orientacion-general',
    topic: 'Orientación ante siniestros',
    category: 'transversal',
    subcategory: 'siniestros',
    content:
      'ASGRO acompaña la gestión de siniestros con orientación sobre el reporte, la documentación del caso y el seguimiento con la aseguradora. El resultado de cada reclamación depende de las condiciones de la póliza y de la aseguradora.',
    tags: 'siniestros,reclamacion,reporte,seguimiento,aseguradora',
    source: 'website:/servicios/seguros-empresariales',
    sourceType: 'website',
    authority: 'orientative',
    version: 1,
    priority: 6,
    isApproved: true,
    isActive: true,
    reviewedBy: APPROVED,
  },
  {
    key: 'transversal-alcance-asesora-virtual',
    topic: 'Alcance de la Asesora Virtual',
    category: 'transversal',
    subcategory: 'institucional_asgro',
    content:
      'La Asesora Virtual de ASGRO brinda orientación general e información de referencia. No emite cotizaciones ni pólizas, no define valores ni condiciones económicas y no reemplaza la asesoría profesional. Para casos específicos, deriva a un asesor humano.',
    tags: 'asesora virtual,alcance,orientacion,limites,handoff',
    source: 'institutional:asesora-virtual-scope',
    sourceType: 'institutional',
    authority: 'informational',
    version: 1,
    priority: 9,
    isApproved: true,
    isActive: true,
    reviewedBy: APPROVED,
  },
];

/** Corpus completo (aprobado + pendiente). */
export const SAFE_CORPUS_V2: CorpusEntry[] = [
  ...personas,
  ...empresas,
  ...capacidades,
  ...transversal,
];

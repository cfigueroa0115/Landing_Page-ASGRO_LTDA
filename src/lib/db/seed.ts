// ============================================================================
// Database Seed Script - ASGRO LTDA Landing Page
// Ejecutar con: npx tsx src/lib/db/seed.ts
// ============================================================================

import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { faqs, metrics, knowledgeBase, siteSettings } from './schema';

async function seed() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL no está configurada.');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle(pool);

  console.log('🌱 Iniciando seed de la base de datos ASGRO LTDA...\n');

  // ==========================================================================
  // FAQs - Mínimo 8 preguntas, 2+ por categoría en español
  // Categorías: servicios, cotización, proceso, cumplimiento
  // ==========================================================================

  console.log('📋 Insertando preguntas frecuentes...');

  const faqData = [
    // Categoría: servicios
    {
      question: '¿Qué servicios de ARL ofrece ASGRO LTDA?',
      answer:
        'ASGRO LTDA ofrece asesoría integral en Administradoras de Riesgos Laborales, incluyendo clasificación de riesgos, afiliación y traslados de ARL, gestión de accidentes y enfermedades laborales, y acompañamiento en investigación de incidentes.',
      category: 'servicios',
      orderIndex: 1,
      isActive: true,
    },
    {
      question: '¿Qué incluye el servicio de Seguridad y Salud en el Trabajo (SST)?',
      answer:
        'Nuestro servicio de SST incluye diseño e implementación del Sistema de Gestión de Seguridad y Salud en el Trabajo (SG-SST), identificación de peligros, evaluación de riesgos, capacitaciones, inspecciones de seguridad, y preparación para auditorías de cumplimiento.',
      category: 'servicios',
      orderIndex: 2,
      isActive: true,
    },
    {
      question: '¿Qué tipo de seguros empresariales a la medida manejan?',
      answer:
        'Ofrecemos seguros empresariales a la medida adaptados a las necesidades específicas de cada organización: pólizas de responsabilidad civil, seguros de cumplimiento, seguros multirriesgo empresarial, seguros de transporte de mercancías y seguros de vida colectivos para empleados.',
      category: 'servicios',
      orderIndex: 3,
      isActive: true,
    },
    // Categoría: cotización
    {
      question: '¿Cómo puedo solicitar una cotización de servicios?',
      answer:
        'Puede solicitar una cotización a través del formulario de cotización en nuestra página web, por WhatsApp, o contactándonos por correo electrónico. Necesitamos información básica de su empresa, número de trabajadores y el tipo de servicio que requiere para generar una propuesta personalizada.',
      category: 'cotización',
      orderIndex: 4,
      isActive: true,
    },
    {
      question: '¿Cuánto tiempo tarda en llegar una cotización?',
      answer:
        'Una vez recibimos su solicitud completa, nuestro equipo genera la cotización en un plazo máximo de 48 horas hábiles. Para servicios de SST y ARL, puede recibir una cotización preliminar el mismo día si proporciona toda la información requerida.',
      category: 'cotización',
      orderIndex: 5,
      isActive: true,
    },
    // Categoría: proceso
    {
      question: '¿Cuál es el proceso para implementar el SG-SST con ASGRO?',
      answer:
        'Nuestro proceso consta de 5 etapas: Diagnóstico inicial del estado actual, Planeación con cronograma y responsables, Implementación de controles y programas, Seguimiento con indicadores de gestión, y Mejora continua basada en resultados de auditorías.',
      category: 'proceso',
      orderIndex: 6,
      isActive: true,
    },
    {
      question: '¿Cuánto tiempo toma la implementación completa del SG-SST?',
      answer:
        'El tiempo de implementación varía según el tamaño y complejidad de la empresa. Para empresas pequeñas (hasta 10 trabajadores) puede tomar entre 2 y 3 meses, mientras que para empresas medianas y grandes puede requerir de 4 a 6 meses, incluyendo capacitaciones y documentación completa.',
      category: 'proceso',
      orderIndex: 7,
      isActive: true,
    },
    // Categoría: cumplimiento
    {
      question: '¿Qué normatividad en SST debe cumplir mi empresa en Colombia?',
      answer:
        'Toda empresa en Colombia debe cumplir con el Decreto 1072 de 2015 (Decreto Único Reglamentario del Sector Trabajo), la Resolución 0312 de 2019 (Estándares Mínimos del SG-SST), y las directrices de la ARL asignada. El incumplimiento puede generar multas de hasta 500 SMMLV.',
      category: 'cumplimiento',
      orderIndex: 8,
      isActive: true,
    },
    {
      question: '¿Qué sanciones existen por no cumplir con el SG-SST?',
      answer:
        'Las sanciones por incumplimiento incluyen multas de hasta 500 SMMLV para la empresa, cierre temporal o definitivo del establecimiento, y responsabilidad penal para el empleador en caso de accidentes graves. Además, la ARL puede aplicar incrementos en la tasa de cotización por siniestralidad.',
      category: 'cumplimiento',
      orderIndex: 9,
      isActive: true,
    },
    {
      question: '¿Cómo me ayuda ASGRO a preparar las auditorías del Ministerio de Trabajo?',
      answer:
        'Realizamos un diagnóstico previo comparando su documentación y controles contra los estándares mínimos de la Resolución 0312 de 2019. Identificamos brechas, implementamos acciones correctivas y preparamos la evidencia documental necesaria para superar la auditoría satisfactoriamente.',
      category: 'cumplimiento',
      orderIndex: 10,
      isActive: true,
    },
  ];

  await db.insert(faqs).values(faqData);
  console.log(`  ✓ ${faqData.length} FAQs insertadas\n`);

  // ==========================================================================
  // Métricas - 4 a 8 métricas realistas para agencia de seguros
  // ==========================================================================

  console.log('📊 Insertando métricas...');

  const metricsData = [
    {
      label: 'Empresas asesoradas',
      value: 350,
      unit: 'empresas',
      icon: 'Building2',
      orderIndex: 1,
      isActive: true,
    },
    {
      label: 'Trabajadores cubiertos',
      value: 15000,
      unit: 'trabajadores',
      icon: 'Users',
      orderIndex: 2,
      isActive: true,
    },
    {
      label: 'Años de experiencia',
      value: 12,
      unit: 'años',
      icon: 'Award',
      orderIndex: 3,
      isActive: true,
    },
    {
      label: 'Reducción de accidentalidad',
      value: 40,
      unit: '%',
      icon: 'TrendingDown',
      orderIndex: 4,
      isActive: true,
    },
    {
      label: 'Auditorías aprobadas',
      value: 98,
      unit: '%',
      icon: 'CheckCircle',
      orderIndex: 5,
      isActive: true,
    },
    {
      label: 'Capacitaciones realizadas',
      value: 1200,
      unit: 'sesiones',
      icon: 'GraduationCap',
      orderIndex: 6,
      isActive: true,
    },
  ];

  await db.insert(metrics).values(metricsData);
  console.log(`  ✓ ${metricsData.length} métricas insertadas\n`);

  // ==========================================================================
  // Knowledge Base - Entradas para el agente IA
  // Cada entrada con: title (topic), category, content, tags
  // ==========================================================================

  console.log('🧠 Insertando base de conocimiento para el agente IA...');

  const knowledgeBaseData = [
    {
      topic: 'Administradora de Riesgos Laborales (ARL)',
      category: 'ARL',
      content:
        'La ARL es la entidad encargada de cubrir los riesgos laborales de los trabajadores en Colombia. ASGRO LTDA asesora en la selección, afiliación y traslado de ARL, garantizando la mejor cobertura según la actividad económica y nivel de riesgo de cada empresa. Gestionamos la clasificación de riesgos (del I al V), asesoramos en reportes de accidentes de trabajo y enfermedades laborales, y acompañamos los procesos de calificación de origen y pérdida de capacidad laboral.',
      tags: 'ARL,riesgos laborales,afiliación,traslado,clasificación de riesgos,accidentes de trabajo,enfermedad laboral,cobertura,cotización ARL',
      isActive: true,
    },
    {
      topic: 'Sistema de Gestión de Seguridad y Salud en el Trabajo (SG-SST)',
      category: 'SST',
      content:
        'El SG-SST es obligatorio para todas las empresas en Colombia según el Decreto 1072 de 2015. ASGRO LTDA diseña, implementa y acompaña el Sistema de Gestión incluyendo: política de SST, identificación de peligros y evaluación de riesgos (IPEVR), planes de trabajo anuales, programas de capacitación, investigación de incidentes y accidentes, inspecciones de seguridad, planes de emergencia, y auditorías internas. Cumplimos con los estándares mínimos de la Resolución 0312 de 2019.',
      tags: 'SST,SG-SST,Decreto 1072,seguridad,salud en el trabajo,IPEVR,peligros,evaluación de riesgos,plan de trabajo,capacitación,Resolución 0312',
      isActive: true,
    },
    {
      topic: 'Seguros empresariales a la medida',
      category: 'seguros',
      content:
        'ASGRO LTDA ofrece seguros empresariales a la medida diseñados según las necesidades específicas de cada organización. Nuestro portafolio incluye: pólizas de responsabilidad civil extracontractual, seguros de cumplimiento para contratos estatales y privados, seguros multirriesgo empresarial (incendio, terremoto, sustracción), seguros de transporte de mercancías, seguros de vida colectivos, y pólizas de directores y administradores (D&O). Realizamos análisis de riesgos para recomendar las coberturas óptimas.',
      tags: 'seguros empresariales,póliza,responsabilidad civil,cumplimiento,multirriesgo,transporte,vida colectivo,cobertura,protección patrimonial,seguros a la medida',
      isActive: true,
    },
    {
      topic: 'Bienestar laboral y programas de prevención',
      category: 'bienestar',
      content:
        'Los programas de bienestar laboral de ASGRO LTDA están diseñados para mejorar la calidad de vida de los trabajadores y reducir el ausentismo. Incluimos: programas de vigilancia epidemiológica (riesgo biomecánico, cardiovascular, psicosocial), pausas activas, jornadas de salud, programas de estilos de vida saludable, medición de clima organizacional, y actividades de integración. Estos programas contribuyen a la productividad y retención del talento humano.',
      tags: 'bienestar laboral,prevención,vigilancia epidemiológica,pausas activas,salud ocupacional,clima organizacional,ausentismo,calidad de vida,productividad',
      isActive: true,
    },
    {
      topic: 'Riesgos laborales y clasificación',
      category: 'ARL',
      content:
        'En Colombia, los riesgos laborales se clasifican en 5 niveles: Riesgo I (mínimo, actividades administrativas), Riesgo II (bajo, manufactura liviana), Riesgo III (medio, manufactura industrial), Riesgo IV (alto, construcción, minería artesanal), y Riesgo V (máximo, trabajos en alturas, minería subterránea). La cotización a la ARL varía desde el 0.522% hasta el 6.960% del salario según el nivel de riesgo. ASGRO LTDA asesora en la correcta clasificación para evitar sobrecostos o coberturas insuficientes.',
      tags: 'riesgos laborales,clasificación,nivel de riesgo,cotización,tarifa ARL,actividad económica,CIIU,riesgo I,riesgo V,trabajos en alturas',
      isActive: true,
    },
    {
      topic: 'Normatividad colombiana en SST',
      category: 'SST',
      content:
        'La normatividad principal en Seguridad y Salud en el Trabajo en Colombia incluye: Decreto 1072 de 2015 (Decreto Único Reglamentario del Sector Trabajo), Resolución 0312 de 2019 (Estándares Mínimos del SG-SST), Resolución 2400 de 1979 (higiene y seguridad industrial), Ley 1562 de 2012 (modificaciones al Sistema de Riesgos Laborales), y Resolución 2764 de 2022 (batería de riesgo psicosocial). El incumplimiento puede acarrear multas de hasta 500 SMMLV y cierre del establecimiento.',
      tags: 'normatividad,Decreto 1072,Resolución 0312,Ley 1562,estándares mínimos,multas,sanciones,cumplimiento legal,regulación,ministerio de trabajo',
      isActive: true,
    },
    {
      topic: 'Proceso de cotización y asesoría personalizada',
      category: 'servicios',
      content:
        'El proceso de cotización en ASGRO LTDA inicia con un diagnóstico de necesidades donde evaluamos la actividad económica, número de trabajadores, nivel de riesgo, y requerimientos específicos de la empresa. Con esta información generamos una propuesta personalizada en máximo 48 horas hábiles. Nuestros asesores acompañan todo el proceso de selección, comparando opciones de diferentes aseguradoras y ARL para garantizar la mejor relación costo-beneficio.',
      tags: 'cotización,asesoría,propuesta,diagnóstico,personalizado,comparar,aseguradoras,costo-beneficio,consulta,presupuesto',
      isActive: true,
    },
    {
      topic: 'Investigación de accidentes de trabajo',
      category: 'ARL',
      content:
        'ASGRO LTDA acompaña la investigación de accidentes e incidentes de trabajo según la Resolución 1401 de 2007. El proceso incluye: conformación del equipo investigador, recolección de evidencias, análisis de causalidad (método árbol de causas), determinación de causas inmediatas y básicas, formulación de acciones correctivas y preventivas, y seguimiento a la implementación. La investigación debe realizarse dentro de los 15 días calendario siguientes al evento.',
      tags: 'accidente de trabajo,investigación,incidente,Resolución 1401,causalidad,causas,acciones correctivas,reporte,FURAT,evidencia',
      isActive: true,
    },
  ];

  await db.insert(knowledgeBase).values(knowledgeBaseData);
  console.log(`  ✓ ${knowledgeBaseData.length} entradas de base de conocimiento insertadas\n`);

  // ==========================================================================
  // Site Settings - Configuración por defecto del sitio
  // ==========================================================================

  console.log('⚙️  Insertando configuración del sitio...');

  const siteSettingsData = [
    {
      key: 'site_name',
      value: 'ASGRO LTDA - Agencia de Seguros',
      description: 'Nombre del sitio web',
    },
    {
      key: 'site_description',
      value:
        'Agencia de seguros especializada en ARL, SST, seguros empresariales a la medida y bienestar laboral en Colombia',
      description: 'Descripción SEO del sitio',
    },
    {
      key: 'business_hours',
      value: 'Lunes a Viernes: 8:00 AM - 6:00 PM | Sábados: 8:00 AM - 12:00 PM',
      description: 'Horario de atención al público',
    },
    {
      key: 'ai_agent_welcome_message',
      value:
        '¡Hola! Soy el asistente virtual de ASGRO LTDA. Puedo ayudarte con consultas sobre ARL, Seguridad y Salud en el Trabajo, seguros empresariales y bienestar laboral. ¿En qué puedo asistirte?',
      description: 'Mensaje de bienvenida del agente IA',
    },
    {
      key: 'ai_agent_fallback_message',
      value:
        'No tengo información suficiente para responder esta consulta. Te recomiendo comunicarte con uno de nuestros asesores a través de WhatsApp o el formulario de contacto para recibir atención personalizada.',
      description: 'Mensaje de fallback cuando el agente IA no encuentra respuesta',
    },
    {
      key: 'data_privacy_text',
      value:
        'Al enviar este formulario, autorizo a ASGRO LTDA para el tratamiento de mis datos personales de acuerdo con la Ley 1581 de 2012 y su política de privacidad.',
      description: 'Texto de autorización de tratamiento de datos personales',
    },
    {
      key: 'whatsapp_default_message',
      value:
        'Hola, soy visitante de la página web de ASGRO LTDA y me gustaría recibir información sobre sus servicios.',
      description: 'Mensaje pre-llenado por defecto para WhatsApp',
    },
  ];

  await db.insert(siteSettings).values(siteSettingsData);
  console.log(`  ✓ ${siteSettingsData.length} configuraciones del sitio insertadas\n`);

  // ==========================================================================
  // Finalización
  // ==========================================================================

  console.log('✅ Seed completado exitosamente.');
  console.log(`   - ${faqData.length} preguntas frecuentes`);
  console.log(`   - ${metricsData.length} métricas`);
  console.log(`   - ${knowledgeBaseData.length} entradas de base de conocimiento`);
  console.log(`   - ${siteSettingsData.length} configuraciones del sitio`);

  await pool.end();
  process.exit(0);
}

seed().catch((error) => {
  console.error('❌ Error ejecutando seed:', error);
  process.exit(1);
});

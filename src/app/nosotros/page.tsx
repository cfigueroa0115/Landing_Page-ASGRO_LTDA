import type { Metadata } from 'next';
import { Shield, Users, Target, Heart, Award, Building2, Scale, Lightbulb } from 'lucide-react';
import PageHero from '@/components/shared/PageHero';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import SectionCTA from '@/components/shared/SectionCTA';
import PremiumCard from '@/components/shared/PremiumCard';
import EqualHeightGrid from '@/components/shared/EqualHeightGrid';
import AnimatedSection from '@/components/shared/AnimatedSection';

export const metadata: Metadata = {
  title: 'Nosotros - ASGRO LTDA',
  description:
    'Conozca ASGRO LTDA: empresa colombiana con más de 15 años de experiencia en gestión integral de riesgos laborales, seguridad y salud en el trabajo, y seguros empresariales.',
};

export default function NosotrosPage() {
  return (
    <>
      <Breadcrumbs
        items={[{ label: 'Nosotros', href: '/nosotros' }]}
      />
      <PageHero
        title="Conozca ASGRO LTDA"
        subtitle="Más de 15 años protegiendo empresas colombianas con soluciones integrales en gestión de riesgos laborales, seguridad y salud en el trabajo, y seguros empresariales."
        eyebrow="Quiénes somos"
      />

      {/* Descripción de la empresa */}
      <section className="py-10 md:py-12 bg-white">
        <div className="section-container">
          <AnimatedSection>
            <div className="max-w-[800px] mx-auto text-center">
              <h2 className="text-h2 text-brand-dark-blue mb-3">
                Protección integral para su empresa
              </h2>
              <p className="text-body-lg text-gray-600 mb-2">
                ASGRO LTDA es una empresa colombiana especializada en la gestión integral de riesgos
                laborales y empresariales. Acompañamos a organizaciones de todos los sectores
                económicos en la implementación de estrategias que protegen su capital humano y
                patrimonial.
              </p>
              <p className="text-body text-gray-600">
                Nuestro enfoque combina conocimiento técnico, normatividad vigente y atención
                personalizada para diseñar soluciones que se adaptan a la realidad de cada empresa.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Misión y Visión */}
      <section className="py-10 md:py-12 bg-brand-light-gray">
        <div className="section-container">
          <AnimatedSection>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-card p-4 shadow-card border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-[48px] w-[48px] items-center justify-center rounded-full bg-gradient-to-br from-brand-green/20 to-brand-blue/10">
                    <Target className="h-[24px] w-[24px] text-brand-green" />
                  </div>
                  <h3 className="text-xl font-bold text-brand-dark-blue">Misión</h3>
                </div>
                <p className="text-body text-gray-600">
                  Brindar soluciones integrales en gestión de riesgos laborales, seguridad y salud
                  en el trabajo, y protección empresarial, garantizando el cumplimiento normativo y
                  el bienestar de los trabajadores colombianos a través de un acompañamiento
                  personalizado y continuo.
                </p>
              </div>

              <div className="bg-white rounded-card p-4 shadow-card border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-[48px] w-[48px] items-center justify-center rounded-full bg-gradient-to-br from-brand-green/20 to-brand-blue/10">
                    <Lightbulb className="h-[24px] w-[24px] text-brand-green" />
                  </div>
                  <h3 className="text-xl font-bold text-brand-dark-blue">Visión</h3>
                </div>
                <p className="text-body text-gray-600">
                  Ser referentes en Colombia en la gestión integral de riesgos laborales y
                  empresariales, reconocidos por la calidad de nuestro acompañamiento, la
                  innovación en nuestras soluciones y el impacto positivo en la cultura de
                  prevención de las organizaciones que asesoramos.
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Valores corporativos */}
      <section className="py-10 md:py-12 bg-white">
        <div className="section-container">
          <AnimatedSection>
            <h2 className="text-h2 text-brand-dark-blue text-center mb-4">
              Valores corporativos
            </h2>
          </AnimatedSection>
          <EqualHeightGrid columns={{ sm: 2, md: 2, lg: 4 }}>
            <PremiumCard
              icon={<Shield className="h-[24px] w-[24px] text-brand-green" />}
              title="Compromiso"
              description="Actuamos con responsabilidad y dedicación en cada gestión, priorizando las necesidades de nuestros clientes."
            />
            <PremiumCard
              icon={<Scale className="h-[24px] w-[24px] text-brand-green" />}
              title="Transparencia"
              description="Operamos con honestidad y claridad en todos nuestros procesos, generando relaciones de confianza."
            />
            <PremiumCard
              icon={<Heart className="h-[24px] w-[24px] text-brand-green" />}
              title="Integridad"
              description="Nuestras acciones se rigen por principios éticos que garantizan un servicio confiable y profesional."
            />
            <PremiumCard
              icon={<Award className="h-[24px] w-[24px] text-brand-green" />}
              title="Excelencia"
              description="Buscamos la mejora continua en nuestros servicios para superar las expectativas y generar valor real."
            />
          </EqualHeightGrid>
        </div>
      </section>

      {/* Especializaciones */}
      <section className="py-10 md:py-12 bg-brand-light-gray">
        <div className="section-container">
          <AnimatedSection>
            <h2 className="text-h2 text-brand-dark-blue text-center mb-4">
              Líneas de especialización
            </h2>
          </AnimatedSection>
          <EqualHeightGrid columns={{ sm: 1, md: 2, lg: 4 }}>
            <PremiumCard
              icon={<Shield className="h-[24px] w-[24px] text-brand-green" />}
              title="Riesgos Laborales"
              description="Gestión integral de ARL: afiliaciones, traslados, clasificación de riesgo y acompañamiento en eventos laborales."
              bullets={['Afiliación y traslado', 'Gestión de accidentes', 'Enfermedad laboral']}
            />
            <PremiumCard
              icon={<Users className="h-[24px] w-[24px] text-brand-green" />}
              title="Seguridad y Salud en el Trabajo"
              description="Diseño, implementación y seguimiento del SG-SST conforme a la normatividad colombiana vigente."
              bullets={['SG-SST', 'Auditorías', 'Investigación de accidentes']}
            />
            <PremiumCard
              icon={<Heart className="h-[24px] w-[24px] text-brand-green" />}
              title="Bienestar y Protección"
              description="Seguros de vida grupo, accidentes personales, salud, exequiales y programas de bienestar laboral."
              bullets={['Vida grupo', 'Salud', 'Bienestar laboral']}
            />
            <PremiumCard
              icon={<Building2 className="h-[24px] w-[24px] text-brand-green" />}
              title="Seguros Empresariales"
              description="Pólizas a la medida: multirriesgo, responsabilidad civil, cumplimiento, manejo y transporte."
              bullets={['Multirriesgo', 'Responsabilidad civil', 'Cumplimiento']}
            />
          </EqualHeightGrid>
        </div>
      </section>

      <SectionCTA
        title="¿Listo para proteger su empresa?"
        subtitle="Solicite una asesoría personalizada sin compromiso."
        primaryAction={{ label: 'Solicitar cotización', href: '/cotizar' }}
        secondaryAction={{ label: 'Contáctenos', href: '/contacto' }}
        whatsappAction
      />
    </>
  );
}

import type { Metadata } from 'next';
import { Shield, Users, Target, Heart, Award, Building2, Scale, Lightbulb } from 'lucide-react';
import PageHero from '@/components/shared/PageHero';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import SectionCTA from '@/components/shared/SectionCTA';
import PremiumCard from '@/components/shared/PremiumCard';
import EqualHeightGrid from '@/components/shared/EqualHeightGrid';
import AnimatedSection from '@/components/shared/AnimatedSection';

export const metadata: Metadata = {
  title: 'Nosotros - ASGRO Agencia de Seguros',
  description:
    'Conozca ASGRO: agencia de seguros y aliado integral en gestión del riesgo en Colombia. Protegemos personas, patrimonio y empresas con acompañamiento cercano.',
};

export default function NosotrosPage() {
  return (
    <>
      <Breadcrumbs
        items={[{ label: 'Nosotros', href: '/nosotros' }]}
      />
      <PageHero
        title="Conozca ASGRO"
        subtitle="Agencia de seguros y aliado integral en gestión del riesgo. Acompañamos la protección de personas, patrimonio y empresas con conocimiento técnico y cercanía."
        eyebrow="Quiénes somos"
      />

      {/* Descripción de la empresa */}
      <section className="py-10 md:py-12 bg-white">
        <div className="section-container">
          <AnimatedSection>
            <div className="max-w-[800px] mx-auto text-center">
              <h2 className="text-h2 text-brand-dark-blue mb-3">
                Protegemos personas, patrimonio y empresas
              </h2>
              <p className="text-body-lg text-gray-600 mb-2">
                ASGRO es una agencia de seguros y aliado integral en gestión del riesgo.
                Acompañamos a personas y empresas en la protección de lo que realmente importa,
                buscando alternativas acordes con su perfil y su exposición al riesgo.
              </p>
              <p className="text-body text-gray-600">
                Aplicamos el conocimiento técnico y la trayectoria profesional del equipo a cada
                cliente, con un acompañamiento cercano antes, durante y después de la contratación.
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
                  Acompañar a personas y empresas en la protección de lo que valoran, ofreciendo
                  soluciones de seguros y gestión del riesgo con asesoría cercana, clara y
                  estratégica, y complementando con acompañamiento en ARL y SST.
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
                  Ser reconocidos como una agencia de seguros cercana y confiable, aliada integral
                  en la gestión del riesgo de personas y empresas en Colombia, por la calidad de
                  nuestro acompañamiento y la claridad de nuestras soluciones.
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
              title="Seguros"
              description="Soluciones para personas, patrimonio y empresas: vida, salud, hogar, automóviles y coberturas empresariales."
              bullets={['Personas', 'Patrimonio', 'Empresas']}
            />
            <PremiumCard
              icon={<Building2 className="h-[24px] w-[24px] text-brand-green" />}
              title="Seguros Empresariales"
              description="Pólizas a la medida: multirriesgo, responsabilidad civil, cumplimiento, manejo y vida grupo."
              bullets={['Multirriesgo', 'Responsabilidad civil', 'Cumplimiento']}
            />
            <PremiumCard
              icon={<Shield className="h-[24px] w-[24px] text-brand-green" />}
              title="ARL y Riesgos Laborales"
              description="Acompañamiento en ARL: afiliaciones, traslados, clasificación de riesgo y gestión de eventos laborales."
              bullets={['Afiliación y traslado', 'Gestión de accidentes', 'Enfermedad laboral']}
            />
            <PremiumCard
              icon={<Users className="h-[24px] w-[24px] text-brand-green" />}
              title="Seguridad y Salud en el Trabajo"
              description="Diseño, implementación y seguimiento del SG-SST conforme a la normatividad colombiana vigente."
              bullets={['SG-SST', 'Auditorías', 'Investigación de accidentes']}
            />
          </EqualHeightGrid>
        </div>
      </section>

      <SectionCTA
        title="Conversemos sobre lo que necesita proteger."
        subtitle="Permítanos conocer su necesidad y acompañarlo en la búsqueda de una solución adecuada."
        primaryAction={{ label: 'Hablar con un asesor', href: '/contacto' }}
        secondaryAction={{ label: 'Solicitar una cotización', href: '/cotizar' }}
        whatsappAction
      />
    </>
  );
}

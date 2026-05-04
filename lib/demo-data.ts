import type { Investment, Project } from '@/types';
import { demoProfiles } from '@/lib/demo-session';

const now = new Date().toISOString();

export const demoProjects: Project[] = [
  {
    id: 'demo-project-asuncion-eje',
    developer_id: demoProfiles.developer.id,
    title: 'Torre Asuncion Eje',
    slug: 'torre-asuncion-eje',
    description:
      'Edificio residencial y corporativo en zona de alta demanda de Asuncion. Preventa validada, avance de obra y estrategia de renta ejecutiva.',
    location: 'Asuncion, Paraguay',
    address: 'Av. Aviadores del Chaco 1820',
    latitude: -25.2854,
    longitude: -57.5682,
    status: 'funding',
    total_value: 1800000,
    token_price: 100,
    total_tokens: 18000,
    sold_tokens: 12960,
    min_investment: 100,
    expected_return: 14.2,
    return_period_months: 21,
    start_date: '2026-02-01',
    end_date: '2027-11-01',
    image_url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1400&q=85&auto=format&fit=crop',
    gallery_urls: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1400&q=85&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&q=85&auto=format&fit=crop',
    ],
    documents_url: '/verify/demo-contract-asuncion',
    featured: true,
    created_at: now,
    updated_at: now,
    developer: demoProfiles.developer,
  },
  {
    id: 'demo-project-cordoba-norte',
    developer_id: demoProfiles.developer.id,
    title: 'Edificio Cordoba Norte',
    slug: 'edificio-cordoba-norte',
    description:
      'Activo estabilizado con foco conservador, unidades listas para renta y flujo mensual proyectado desde los primeros meses.',
    location: 'Cordoba, Argentina',
    address: 'Av. Rafael Nunez 4510',
    latitude: -31.3829,
    longitude: -64.2216,
    status: 'funding',
    total_value: 920000,
    token_price: 100,
    total_tokens: 9200,
    sold_tokens: 5336,
    min_investment: 100,
    expected_return: 10.8,
    return_period_months: 12,
    start_date: '2026-01-15',
    end_date: '2027-01-15',
    image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1400&q=85&auto=format&fit=crop',
    gallery_urls: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1400&q=85&auto=format&fit=crop'],
    documents_url: '/verify/demo-contract-cordoba',
    featured: false,
    created_at: now,
    updated_at: now,
    developer: demoProfiles.developer,
  },
  {
    id: 'demo-project-punta-carretas',
    developer_id: demoProfiles.developer.id,
    title: 'Residencias Punta Carretas',
    slug: 'residencias-punta-carretas',
    description:
      'Ubicacion premium en Montevideo, salida flexible por mercado secundario y upside comercial por demanda sostenida.',
    location: 'Montevideo, Uruguay',
    address: 'Jose Ellauri 980',
    latitude: -34.9231,
    longitude: -56.1597,
    status: 'funding',
    total_value: 2400000,
    token_price: 250,
    total_tokens: 9600,
    sold_tokens: 4128,
    min_investment: 250,
    expected_return: 12.6,
    return_period_months: 30,
    start_date: '2026-03-10',
    end_date: '2028-09-10',
    image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&q=85&auto=format&fit=crop',
    gallery_urls: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&q=85&auto=format&fit=crop'],
    documents_url: '/verify/demo-contract-punta-carretas',
    featured: false,
    created_at: now,
    updated_at: now,
    developer: demoProfiles.developer,
  },
];

export const demoProjectScores: Record<string, { rating: 'A_plus' | 'A' | 'B'; overall_score: number; ai_analysis: string }> = {
  'demo-project-asuncion-eje': {
    rating: 'A_plus',
    overall_score: 94,
    ai_analysis: 'Demanda ejecutiva, developer verificado y avance de obra reducen el riesgo operativo.',
  },
  'demo-project-cordoba-norte': {
    rating: 'A',
    overall_score: 88,
    ai_analysis: 'Activo estabilizado con retorno mas moderado y mejor previsibilidad de flujo.',
  },
  'demo-project-punta-carretas': {
    rating: 'B',
    overall_score: 81,
    ai_analysis: 'Mayor upside por ubicacion premium, con plazo mas largo y riesgo comercial medio.',
  },
};

export function getDemoProject(projectId: string) {
  return demoProjects.find((project) => project.id === projectId || project.slug === projectId) || null;
}

export function demoInvestments(): Investment[] {
  const project = demoProjects[0];
  return [
    {
      id: 'demo-investment-001',
      investor_id: demoProfiles.investor.id,
      project_id: project.id,
      tokens_purchased: 5,
      amount: 500,
      status: 'confirmed',
      contract_hash: 'demo-contract-asuncion',
      contract_url: null,
      notes: 'Inversion demo inicial',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
      project,
    },
  ];
}

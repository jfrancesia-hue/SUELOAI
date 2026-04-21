import Link from 'next/link';
import { Users, Target, LayoutGrid, Send, ArrowRight } from 'lucide-react';

const SECTIONS = [
  {
    href: '/crm/contacts',
    icon: Users,
    title: 'Contactos',
    description: 'Base de contactos y prospectos con tags y notas.',
  },
  {
    href: '/crm/leads',
    icon: Target,
    title: 'Leads',
    description: 'Oportunidades frías antes de calificar como deals.',
  },
  {
    href: '/crm/pipeline',
    icon: LayoutGrid,
    title: 'Pipeline',
    description: 'Kanban drag-and-drop con 7 etapas por default.',
  },
  {
    href: '/crm/campaigns',
    icon: Send,
    title: 'Campañas',
    description: 'Envíos masivos WhatsApp con templates dinámicos.',
  },
];

export default function CrmIndexPage() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-surface-900">CRM</h1>
        <p className="text-surface-600 mt-1">
          Gestioná tu pipeline comercial sin salir de Suelo.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="card group hover:border-brand-500/50 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-brand-500/10">
                <s.icon className="w-6 h-6 text-brand-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-semibold text-lg text-surface-900 group-hover:text-brand-500 transition-colors">
                  {s.title}
                </h3>
                <p className="text-sm text-surface-600 mt-1">{s.description}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-surface-400 group-hover:text-brand-500 transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

import Link from 'next/link';
import { Shield } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-surface-200 bg-surface-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
                <Shield className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="font-display font-bold text-lg text-surface-900">
                Prop<span className="text-brand-500">Chain</span>
              </span>
            </div>
            <p className="text-sm text-surface-500 max-w-md leading-relaxed">
              Plataforma de inversión inmobiliaria fraccionada con trazabilidad criptográfica.
              Activos reales, contratos verificables, retornos transparentes.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-surface-800 mb-4">Plataforma</h4>
            <div className="space-y-2.5">
              {['Marketplace', 'Cómo Funciona', 'Verificar Contrato', 'FAQ'].map((item) => (
                <Link
                  key={item}
                  href="#"
                  className="block text-sm text-surface-500 hover:text-surface-800 transition-colors"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-surface-800 mb-4">Legal</h4>
            <div className="space-y-2.5">
              {['Términos de Uso', 'Política de Privacidad', 'Riesgos', 'Contacto'].map((item) => (
                <Link
                  key={item}
                  href="#"
                  className="block text-sm text-surface-500 hover:text-surface-800 transition-colors"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-surface-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-surface-400">
            &copy; {new Date().getFullYear()} Suelo. Todos los derechos reservados.
          </p>
          <p className="text-xs text-surface-400">
            Desarrollado por Nativos Consultora Digital
          </p>
        </div>
      </div>
    </footer>
  );
}

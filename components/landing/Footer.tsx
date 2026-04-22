import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-surface-200 bg-surface-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-[0_0_0_1px_rgba(0,200,83,0.4),0_8px_20px_-4px_rgba(0,200,83,0.4)]">
                <span className="text-white font-[700] text-base">S</span>
              </div>
              <span className="font-display font-[620] text-[19px] text-surface-900 tracking-[-0.01em]">
                Suelo<span className="text-brand-400">.ai</span>
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

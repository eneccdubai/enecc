import React from 'react'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  showInfo = true,
  className = ''
}) => {
  const { language } = useLanguage()

  // No mostrar si no hay páginas suficientes
  if (totalPages <= 1) return null

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  // Generar números de página a mostrar
  const getPageNumbers = () => {
    const pages = []
    const delta = 2 // Número de páginas a mostrar a cada lado

    // Siempre mostrar primera página
    if (1 < currentPage - delta) {
      pages.push(1)
      if (2 < currentPage - delta) {
        pages.push('...')
      }
    }

    // Páginas alrededor de la actual
    for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) {
      pages.push(i)
    }

    // Siempre mostrar última página
    if (totalPages > currentPage + delta) {
      if (totalPages - 1 > currentPage + delta) {
        pages.push('...')
      }
      pages.push(totalPages)
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      {/* Información de resultados */}
      {showInfo && (
        <div className="text-sm text-stone-500 font-light">
          {language === 'es'
            ? `Mostrando ${startItem}-${endItem} de ${totalItems} usuarios`
            : `Showing ${startItem}-${endItem} of ${totalItems} users`
          }
        </div>
      )}

      {/* Controles de paginación */}
      <div className="flex items-center space-x-1">
        {/* Botón anterior */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="flex items-center justify-center w-10 h-10 border border-stone-300 hover:border-stone-900 text-stone-600 hover:text-stone-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-stone-300 disabled:hover:text-stone-600"
          title={language === 'es' ? 'Página anterior' : 'Previous page'}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Números de página */}
        {pageNumbers.map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <div className="flex items-center justify-center w-10 h-10">
                <MoreHorizontal className="w-4 h-4 text-stone-400" />
              </div>
            ) : (
              <button
                onClick={() => onPageChange(page)}
                className={`flex items-center justify-center w-10 h-10 border transition-all text-sm font-light ${
                  page === currentPage
                    ? 'border-stone-900 text-stone-900 bg-stone-50'
                    : 'border-stone-300 text-stone-600 hover:border-stone-900 hover:text-stone-900'
                }`}
                title={`${language === 'es' ? 'Ir a página' : 'Go to page'} ${page}`}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}

        {/* Botón siguiente */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="flex items-center justify-center w-10 h-10 border border-stone-300 hover:border-stone-900 text-stone-600 hover:text-stone-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-stone-300 disabled:hover:text-stone-600"
          title={language === 'es' ? 'Página siguiente' : 'Next page'}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Selector de elementos por página (opcional) */}
      <div className="flex items-center space-x-2 text-sm">
        <span className="text-stone-500 font-light">
          {language === 'es' ? 'Mostrar:' : 'Show:'}
        </span>
        <select
          value={itemsPerPage}
          onChange={(e) => onPageChange(1, parseInt(e.target.value))} // Reset to page 1 when changing items per page
          className="border border-stone-300 px-2 py-1 text-sm bg-white focus:border-stone-900 focus:outline-none"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <span className="text-stone-500 font-light">
          {language === 'es' ? 'por página' : 'per page'}
        </span>
      </div>
    </div>
  )
}

export default Pagination

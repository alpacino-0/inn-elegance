'use client';

interface VillaPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function VillaPagination({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: VillaPaginationProps) {
  // Sayfalama düğmelerinin oluşturulması
  const getPageButtons = () => {
    const buttons = [];
    
    // Toplam sayfa sayısı az ise tüm sayfaları göster
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(
          <button
            key={i}
            type="button"
            onClick={() => onPageChange(i)}
            className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
              currentPage === i
                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
            } border`}
          >
            {i}
          </button>
        );
      }
      return buttons;
    }

    // Sayfa sayısı çok ise akıllı sayfalama göster
    buttons.push(
      <button
        key={1}
        type="button"
        onClick={() => onPageChange(1)}
        className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
          currentPage === 1
            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
        } border`}
      >
        1
      </button>
    );
    
    // Başta boşluk
    if (currentPage > 3) {
      buttons.push(
        <span key="start-ellipsis" className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300">
          ...
        </span>
      );
    }
    
    // Ortadaki sayfalar
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);
    
    // Kenar durumları için ayarla
    if (currentPage === 1) {
      endPage = Math.min(totalPages - 1, 3);
    } else if (currentPage === totalPages) {
      startPage = Math.max(2, totalPages - 2);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          type="button"
          onClick={() => onPageChange(i)}
          className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
            currentPage === i
              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
          } border`}
        >
          {i}
        </button>
      );
    }
    
    // Sonda boşluk
    if (currentPage < totalPages - 2) {
      buttons.push(
        <span key="end-ellipsis" className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300">
          ...
        </span>
      );
    }
    
    // Son sayfa
    buttons.push(
      <button
        key={totalPages}
        type="button"
        onClick={() => onPageChange(totalPages)}
        className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
          currentPage === totalPages
            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
        } border`}
      >
        {totalPages}
      </button>
    );
    
    return buttons;
  };

  return (
    <div className="flex items-center justify-center">
      <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Sayfalar">
        {/* Önceki sayfa düğmesi */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ${
            currentPage === 1
              ? 'cursor-not-allowed bg-gray-50'
              : 'bg-white hover:bg-gray-50'
          } border border-gray-300`}
        >
          <span className="sr-only">Önceki</span>
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
          </svg>
        </button>
        
        {/* Sayfa düğmeleri */}
        {getPageButtons()}
        
        {/* Sonraki sayfa düğmesi */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ${
            currentPage === totalPages
              ? 'cursor-not-allowed bg-gray-50'
              : 'bg-white hover:bg-gray-50'
          } border border-gray-300`}
        >
          <span className="sr-only">Sonraki</span>
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
          </svg>
        </button>
      </nav>
    </div>
  );
} 
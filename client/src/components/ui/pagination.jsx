import { Button } from './button';

export const Pagination = ({ pagination, onPageChange, className = '' }) => {
  if (!pagination || pagination.pages <= 1) return null;

  const { page, pages, total, limit } = pagination;
  
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  const getPageNumbers = () => {
    const SHOW_PAGES = 5;
    
    if (pages <= SHOW_PAGES + 2) {
      return Array.from({ length: pages }, (_, i) => i + 1);
    }
    
    const leftSide = Math.floor(SHOW_PAGES / 2);
    const rightSide = SHOW_PAGES - leftSide - 1;
    
    if (page <= leftSide + 1) {
      return [...Array.from({ length: SHOW_PAGES }, (_, i) => i + 1), '...', pages];
    }
    
    if (page >= pages - rightSide) {
      return [1, '...', ...Array.from({ length: SHOW_PAGES }, (_, i) => pages - SHOW_PAGES + i + 1)];
    }
    
    return [1, '...', ...Array.from({ length: SHOW_PAGES }, (_, i) => page - leftSide + i), '...', pages];
  };

  const renderPageButton = (pageNum, index) => {
    if (pageNum === '...') {
      return <span key={`ellipsis-${index}`} className="px-2">...</span>;
    }
    
    return (
      <Button
        key={pageNum}
        variant={pageNum === page ? 'default' : 'outline'}
        size="sm"
        onClick={() => onPageChange(pageNum)}
        className="min-w-[40px]"
      >
        {pageNum}
      </Button>
    );
  };

  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {startItem}-{endItem} of {total} items
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
        >
          Previous
        </Button>
        
        {getPageNumbers().map((pageNum, index) => renderPageButton(pageNum, index))}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page === pages}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
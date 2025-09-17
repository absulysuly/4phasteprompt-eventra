
import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) {
    return null;
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };
  
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav className="flex justify-center items-center space-x-2 my-8" aria-label="Pagination">
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="px-3 py-2 text-neutral-text-soft bg-neutral-container border border-neutral-border rounded-md hover:bg-neutral-border/50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>

      {pageNumbers.map((page, index) =>
        typeof page === 'number' ? (
          <button
            key={index}
            onClick={() => onPageChange(page)}
            className={`px-4 py-2 border border-neutral-border rounded-md ${
              currentPage === page
                ? 'bg-primary text-white border-primary'
                : 'bg-neutral-container text-neutral-text hover:bg-neutral-border/50'
            }`}
          >
            {page}
          </button>
        ) : (
          <span key={index} className="px-4 py-2 text-neutral-text-soft">
            {page}
          </span>
        )
      )}

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="px-3 py-2 text-neutral-text-soft bg-neutral-container border border-neutral-border rounded-md hover:bg-neutral-border/50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </nav>
  );
};

import { ArrowLeft, ArrowRight } from 'lucide-react';
import React from 'react';
// import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md';

export default function Pagination({
    products,
    currentPage,
    itemsPerPage,
    handlePageChange,
}) {
    // Calculate total pages
    const totalPages = Math.ceil(products.length / itemsPerPage);

    // Safety check for empty data
    if (totalPages <= 1) return null;

    // Generate page numbers
    const getPageNumbers = () => {
        const pages = [];

        if (totalPages <= 7) {
            // Show all pages if 7 or fewer
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Complex logic for many pages (show edges and current neighbors)
            pages.push(1);

            let startPage = Math.max(currentPage - 1, 2);
            let endPage = Math.min(currentPage + 1, totalPages - 1);

            if (startPage > 2) {
                pages.push("...");
            }

            for (let i = startPage; i <= endPage; i++) {
                // Avoid duplicates of first/last page
                if (i !== 1 && i !== totalPages) {
                    pages.push(i);
                }
            }

            if (endPage < totalPages - 1) {
                pages.push("...");
            }

            // Always include the last page
            if (totalPages > 1) {
                pages.push(totalPages);
            }

            // Remove duplicates (for edge overlap cases)
            return pages.filter(
                (page, index, self) =>
                    typeof page === 'number'
                        ? index === self.findIndex((p) => p === page)
                        : true
            );
        }

        return pages;
    };

    return (
        <nav className="flex items-center justify-center p-4" aria-label="Pagination">
            <div className="flex items-center md:space-x-1 border border-gray-200 rounded-xl md:p-1 shadow-md bg-white">
                {/* Previous Button */}
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center justify-center md:w-10 h-10 w-8 text-gray-500 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
                    title="Previous Page"
                >
                    <ArrowLeft className="text-2xl" />
                </button>

                {/* Page Numbers */}
                {getPageNumbers().map((page, i) => {
                    const isCurrent = currentPage === page;
                    const isEllipsis = page === "...";

                    return (
                        <button
                            key={i}
                            onClick={() => typeof page === "number" && handlePageChange(page)}
                            disabled={isEllipsis}
                            className={`
                md:w-10 h-10 w-8 font-medium rounded-lg transition duration-150
                ${isCurrent
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                                    : isEllipsis
                                        ? "text-gray-500 cursor-default"
                                        : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                                }
              `}
                        >
                            {page}
                        </button>
                    );
                })}

                {/* Next Button */}
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center justify-center md:w-10 h-10 w-8 text-gray-500 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
                    title="Next Page"
                >
                    <ArrowRight className="text-2xl" />
                </button>
            </div>
        </nav>
    );
}

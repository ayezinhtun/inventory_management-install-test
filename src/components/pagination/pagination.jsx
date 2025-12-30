export default function Pagination({ currentPage, totalPages, onPageChange }) {

    const getPageNumbers = (currentPage, totalPages) => {
        const pages = [];
        const visibleCount = 3;

        if (totalPages <= 7) {
            // Show all if total pages <=7
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            // Always show first 3
            pages.push(1, 2, 3);

            // Determine middle pages
            const startMiddle = Math.max(4, currentPage);
            const endMiddle = Math.min(totalPages - 3, currentPage);

            if (startMiddle > 4) {
                pages.push("...");
            }

            // Show current page if not in first or last 3
            if (currentPage > 3 && currentPage <= totalPages - 3) {
                pages.push(currentPage);
            }

            if (endMiddle < totalPages - 3) {
                pages.push("...");
            }

            // Always show last 3
            pages.push(totalPages - 2, totalPages - 1, totalPages);
        }

        return pages;
    };

    if (totalPages <= 1) return null;

    return (
        <div className="flex justify-between w-full items-center space-x-2 py-4 p-5 border border-gray-200 ">

            <button
                onClick={() => onPageChange(prev => Math.max(prev - 1, 1))}
                className="px-3 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 flex items-center"
            >
                &larr; Previous
            </button>

            {/* Normal Pagination */}
            {/* <div className="flex items-center gap-2">
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`px-3 py-1 rounded ${currentPage === i + 1 ? " bg-gray-200 text-[#26599F] font-medium" : "hover:bg-gray-200 text-gray-700"}`}
                            >
                                {i + 1}
                            </button>
                        ))}

                    </div> */}

            <div className="flex items-center gap-2">
                {getPageNumbers(currentPage, totalPages).map((page, index) =>
                    page === "..." ? (
                        <span key={index} className="px-3 py-1 text-gray-500">
                            ...
                        </span>
                    ) : (
                        <button
                            key={index}
                            onClick={() => onPageChange(page)}
                            className={`px-3 py-1 rounded ${currentPage === page
                                ? "bg-gray-200 text-[#26599F] font-medium"
                                : "text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            {page}
                        </button>
                    )
                )}
            </div>

            <button
                onClick={() => onPageChange(prev => Math.min(prev + 1, totalPages))}
                className="px-3 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 flex items-center"
            >
                Next &rarr;
            </button>
        </div>
    )

}
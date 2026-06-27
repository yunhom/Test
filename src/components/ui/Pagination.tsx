import Link from 'next/link';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  buildHref: (page: number) => string;
};

export default function Pagination({ currentPage, totalPages, buildHref }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      {/* 上一页 */}
      {currentPage <= 1 ? (
        <span className="px-4 py-2 rounded-lg text-sm text-gray-300 cursor-not-allowed select-none">
          ← 上一页
        </span>
      ) : (
        <Link
          href={buildHref(currentPage - 1)}
          className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-primary transition"
        >
          ← 上一页
        </Link>
      )}

      {/* 页码 */}
      {pages.map((page, i) =>
        page === '...' ? (
          <span key={`dots-${i}`} className="px-2 text-gray-300 select-none">
            ...
          </span>
        ) : (
          <Link
            key={page}
            href={buildHref(page as number)}
            className={`w-9 h-9 rounded-lg text-sm flex items-center justify-center transition ${
              page === currentPage
                ? 'bg-primary text-white font-medium shadow-sm'
                : 'text-gray-600 hover:bg-gray-100 hover:text-primary'
            }`}
          >
            {page}
          </Link>
        )
      )}

      {/* 下一页 */}
      {currentPage >= totalPages ? (
        <span className="px-4 py-2 rounded-lg text-sm text-gray-300 cursor-not-allowed select-none">
          下一页 →
        </span>
      ) : (
        <Link
          href={buildHref(currentPage + 1)}
          className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-primary transition"
        >
          下一页 →
        </Link>
      )}
    </div>
  );
}

function getPageNumbers(current: number, total: number): (number | string)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | string)[] = [];
  if (current <= 4) {
    pages.push(1, 2, 3, 4, 5, '...', total);
  } else if (current >= total - 3) {
    pages.push(1, '...', total - 4, total - 3, total - 2, total - 1, total);
  } else {
    pages.push(1, '...', current - 1, current, current + 1, '...', total);
  }
  return pages;
}

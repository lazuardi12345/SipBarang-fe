import { useEffect, useState } from "react";

export const DEFAULT_PAGE_SIZE = 20;

export function usePagination(items, resetKey = "", pageSize = DEFAULT_PAGE_SIZE) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;

  useEffect(() => {
    setPage(1);
  }, [resetKey]);

  return {
    items: items.slice(startIndex, startIndex + pageSize),
    page: currentPage,
    pageSize,
    totalItems: items.length,
    totalPages,
    startIndex,
    setPage,
  };
}

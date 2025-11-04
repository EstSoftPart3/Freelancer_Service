import { useMemo } from 'react'

export default function CommonPagination({ currentPage, totalPages, onPageChange }) {
  const changePage = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page)
    }
  }

  const visiblePages = useMemo(() => {
    const maxPages = 5
    const pages = []

    let start = Math.max(1, currentPage - Math.floor(maxPages / 2))
    let end = start + maxPages - 1

    if (end > totalPages) {
      end = totalPages
      start = Math.max(1, end - maxPages + 1)
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    return pages
  }, [currentPage, totalPages])

  return (
    <div className="d-flex justify-content-end mt-5 pt-3">
      <ul className="pagination mb-0">
        <li
          className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}
          onClick={() => changePage(currentPage - 1)}
        >
          <a className="page-link" href="#" onClick={(e) => e.preventDefault()}>
            <i className="fas fa-angle-left"></i>
          </a>
        </li>

        {visiblePages.map(page => (
          <li
            key={page}
            className={`page-item ${page === currentPage ? 'active' : ''}`}
            onClick={() => changePage(page)}
          >
            <a className="page-link" href="#" onClick={(e) => e.preventDefault()}>
              {page}
            </a>
          </li>
        ))}

        <li
          className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}
          onClick={() => changePage(currentPage + 1)}
        >
          <a className="page-link" href="#" onClick={(e) => e.preventDefault()}>
            <i className="fas fa-angle-right"></i>
          </a>
        </li>
      </ul>
    </div>
  )
}




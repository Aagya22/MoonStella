'use client'

import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  totalPages: number
  onChange: (newPage: number) => void
}

export default function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null

  // Generate page numbers array with simple buffer logic
  const getPages = () => {
    const range = []
    const buffer = 2 // number of pages to show around current page
    
    let start = Math.max(1, page - buffer)
    let end = Math.min(totalPages, page + buffer)

    if (page - start < buffer) {
      end = Math.min(totalPages, end + (buffer - (page - start)))
    }
    if (end - page < buffer) {
      start = Math.max(1, start - (buffer - (end - page)))
    }

    for (let i = start; i <= end; i++) {
      range.push(i)
    }
    return range
  }

  const pageNumbers = getPages()

  return (
    <div className="flex items-center justify-center gap-2 mt-8 select-none font-sans">
      
      {/* Prev Button */}
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="w-9 h-9 rounded-full border border-[#5F3041]/10 flex items-center justify-center text-[#5F3041] hover:bg-[#5F3041]/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer disabled:cursor-not-allowed bg-white"
        title="Previous Page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Numerical page list buttons */}
      {pageNumbers[0] > 1 && (
        <>
          <button
            onClick={() => onChange(1)}
            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
              page === 1
                ? 'bg-[#5F3041] text-[#E9D7C3] shadow-sm'
                : 'bg-white border border-[#5F3041]/10 text-gray-700 hover:bg-[#5F3041]/5'
            }`}
          >
            1
          </button>
          {pageNumbers[0] > 2 && (
            <span className="text-gray-400 text-xs px-1 select-none">...</span>
          )}
        </>
      )}

      {pageNumbers.map((num) => (
        <button
          key={num}
          onClick={() => onChange(num)}
          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
            page === num
              ? 'bg-[#5F3041] text-[#E9D7C3] shadow-sm scale-95'
              : 'bg-white border border-[#5F3041]/10 text-gray-700 hover:bg-[#5F3041]/5'
          }`}
        >
          {num}
        </button>
      ))}

      {pageNumbers[pageNumbers.length - 1] < totalPages && (
        <>
          {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
            <span className="text-gray-400 text-xs px-1 select-none">...</span>
          )}
          <button
            onClick={() => onChange(totalPages)}
            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
              page === totalPages
                ? 'bg-[#5F3041] text-[#E9D7C3] shadow-sm'
                : 'bg-white border border-[#5F3041]/10 text-gray-700 hover:bg-[#5F3041]/5'
            }`}
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Next Button */}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="w-9 h-9 rounded-full border border-[#5F3041]/10 flex items-center justify-center text-[#5F3041] hover:bg-[#5F3041]/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer disabled:cursor-not-allowed bg-white"
        title="Next Page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

    </div>
  )
}

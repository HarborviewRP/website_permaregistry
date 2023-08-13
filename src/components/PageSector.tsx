import React, { useState } from "react";
import { FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";

interface Props {
  currentPage: number;
  totalPages: number;
  adjacentPages?: number;
  onPageClick: (pageNum: number) => void;
}

const PageSelector: React.FC<Props> = ({
  currentPage,
  totalPages,
  adjacentPages = 1,
  onPageClick,
}) => {
  const [showPageInput, setShowPageInput] = useState(false);
  const [pageInputValue, setPageInputValue] = useState(1);

  const handlePageInputChange = () => {
    setShowPageInput(false);
    onPageClick(pageInputValue);
  };

  const renderPageButtons = () => {
    const pageButtons = [];
    const startPage = Math.max(
      currentPage - adjacentPages,
      currentPage == 1 ? 1 : 2
    );
    const endPage = Math.min(
      currentPage + adjacentPages,
      currentPage === totalPages ? totalPages : totalPages - 1
    );

    if (currentPage > 1) {
      pageButtons.push(
        <button
          key={1}
          className="text-black mx-1 hover:text-blue-500"
          onClick={() => onPageClick(1)}
        >
          1
        </button>
      );

      if (currentPage > 2) {
        pageButtons.push(
          <span key="dot-dot" className="text-black mx-1">
            ...
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      const isActive = i === currentPage;
      pageButtons.push(
        <button
          key={i}
          className={`${
            isActive ? "text-blue-500" : "text-black hover:text-blue-500"
          } mx-1`}
          onClick={() => onPageClick(i)}
        >
          {i}
        </button>
      );
    }

    if (currentPage < totalPages) {
      if (currentPage < totalPages - 1) {
        pageButtons.push(
          <span
            key="dot-dot-dot"
            className="text-black mx-1 cursor-pointer"
            onClick={() => setShowPageInput(true)}
          >
            ...
          </span>
        );
      }
      pageButtons.push(
        <button
          key={totalPages}
          className="text-black mx-1 hover:text-blue-500"
          onClick={() => onPageClick(totalPages)}
        >
          {totalPages}
        </button>
      );

      if (showPageInput) {
        pageButtons.push(
          <div key="page-input" className="inline-flex flex-row">
            <input
              type="number"
              className="bg-slate-500 bg-opacity-10 text-gray-300 px-2 rounded-md w-1/3 mx-1"
              min="1"
              max={totalPages}
              value={pageInputValue}
              onChange={(e) => setPageInputValue(Number(e.target.value))}
            />
            <button
              className="text-black mx-1 hover:text-blue-500"
              onClick={handlePageInputChange}
            >
              Go
            </button>
          </div>
        );
      }
    }

    return pageButtons;
  };

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <>
      <button
        className={`${
          isFirstPage ? "text-gray-600 cursor-not-allowed" : "text-black"
        } mx-1`}
        disabled={isFirstPage}
        onClick={() => onPageClick(1)}
      >
        <FaAngleDoubleLeft />
      </button>
      <div className="flex flex-row">{renderPageButtons()}</div>
      <button
        className={`${
          isLastPage ? "text-gray-600 cursor-not-allowed" : "text-black"
        } mx-1`}
        disabled={isLastPage}
        onClick={() => onPageClick(totalPages)}
      >
        <FaAngleDoubleRight />
      </button>
    </>
  );
};

export default PageSelector;

import React, { useCallback, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

function PaginationNav({data}) {
  const [pageIndex, setPageIndex] = useState(0);
  const pageCount = 3;

  const renderPageLinks = useCallback(() => {
    const pageButtons = [];
    for (let i = 0; i < pageCount; i++) {
      pageButtons.push(
        <button
          key={i}
          className={`flex w-12 h-8 text-sm bg-blue rounded-xl text-white justify-center items-center ${
            pageIndex === i ? "cursor-not-allowed" : ""
          }`}
          onClick={() => setPageIndex(i)}
          disabled={pageIndex === i}
        >
          {i + 1}
        </button>
      );
    }
    return pageButtons;
  }, [pageIndex, pageCount]);

  return (
    <div className="flex gap-3 flex-wrap p-6 py-12">
      <ul className="flex gap-2">
        <li>
          <button
            className={`flex text-sm  rounded-full focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-600 ${
              pageIndex === 0 ? "cursor-not-allowed" : ""
            }`}
            onClick={() => setPageIndex(0)}
            disabled={pageIndex === 0}
          >
            <div className="flex ml-1 text-md mt-2 font-semibold justify-center items-center ">
              
              Previous
            </div>
          </button>
        </li>
        {renderPageLinks()}
        <li>
          <button
            className={`flex text-sm  rounded-full focus:ring-4 focus:ring-blue-300 dark:focus:ring-gray-600 ${
              pageIndex === pageCount - 1 ? "cursor-not-allowed" : ""
            }`}
            onClick={() => setPageIndex(pageCount - 1)}
            disabled={pageIndex === pageCount - 1}
          >
            <div className="flex ml-1 text-md mt-2 font-semibold justify-center items-center">
             
              Next
            </div>
          </button>
        </li>
      </ul>
    </div>
  );
}

export default PaginationNav;

import React from "react";
import { useTable, useExpanded } from "react-table";
import classNames from "classnames";

const Table = ({
  columns,
  data,
  isLoading = false,
  renderSubComponent,
  getRowProps,
  fullHeight = false,
  pagination = true,
  total = 0,
  pageSize = 50,
  className = "",
}) => {
  const totalPages = Math.ceil(total / pageSize);
  const tableInstance = useTable({ columns, data }, useExpanded);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  return (
    <div className="h-auto flex flex-col mt-0">
      <div
        className={classNames(
          `flex-1 overflow-auto scrollbar-hide`,
          className
        )}
      >
        <table
          {...getTableProps()}
          className="w-full table-auto border-collapse text-black min-w-full"
        >
          <thead className="sticky top-0 z-10 bg-white border-b-2 border-gray-200">
            {headerGroups.map((headerGroup, gIdx) => {
              const { key, ...headerGroupProps } = headerGroup.getHeaderGroupProps();
              return (
                <tr key={key || gIdx} {...headerGroupProps}>
                  {headerGroup.headers.map((column, cIdx) => {
                    const { key: headerKey, ...headerProps } = column.getHeaderProps();
                    return (
                      <th
                        key={headerKey || cIdx}
                        {...headerProps}
                        className="px-4 py-4 font-bold uppercase text-xs text-white bg-primary text-center border-r border-primaryLight last:border-r-0"
                      >
                        {column.render("Header")}
                      </th>
                    );
                  })}
                </tr>
              );
            })}
          </thead>

          <tbody {...getTableBodyProps()}>
            {rows.map((row) => {
              prepareRow(row);
              const rowProps = getRowProps
                ? row.getRowProps(getRowProps(row))
                : row.getRowProps();
              
              const { key: rowKey, ...restRowProps } = rowProps;
              
              return (
                <React.Fragment key={rowKey}>
                  <tr
                    {...restRowProps}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150"
                  >
                    {row.cells.map((cell, cIdx) => {
                      const { key: cellKey, ...cellProps } = cell.getCellProps();
                      return (
                        <td
                          key={cellKey || cIdx}
                          {...cellProps}
                          className="px-4 py-0 text-sm text-center border-r border-gray-100 last:border-r-0"
                        >
                          {cell.render("Cell", {
                            row: {
                              ...row,
                              canExpand: !!renderSubComponent,
                            },
                          })}
                        </td>
                      );
                    })}
                  </tr>
                  {row.isExpanded &&
                    renderSubComponent &&
                    renderSubComponent({ row, rowProps })}
                </React.Fragment>
              );
            })}
            {/* Empty state */}
            {rows.length === 0 && (
              <tr>
                <td 
                  colSpan={columns.length}
                  className="px-4 py-6 text-center text-gray-500"
                >
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;

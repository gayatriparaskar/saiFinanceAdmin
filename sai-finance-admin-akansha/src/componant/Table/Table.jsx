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
    <div>
      <div
        className={classNames(
          `overflow-auto h-viewport relative scrollbar-hide`,
          className
        )}
        style={{ height: '75vh' }}
      >
        <table
          {...getTableProps()}
          className="w-full table-auto border-collapse text-white bg-transparent"
        >
          <thead className="border-b border-slate-600">
            {headerGroups.map((headerGroup, gIdx) => {
              const { key: headerGroupKey, ...headerGroupProps } = headerGroup.getHeaderGroupProps();
              return (
                <tr key={headerGroupKey || gIdx} {...headerGroupProps}>
                  {headerGroup.headers.map((column, cIdx) => {
                    const { key: headerKey, ...headerProps } = column.getHeaderProps();
                    return (
                      <th
                        key={headerKey || cIdx}
                        {...headerProps}
                        className="px-3 py-2 font-bold uppercase text-xs text-slate-300 sticky top-0 z-10 bg-gradient-to-r from-slate-800 to-slate-700 text-center border-r border-slate-600 last:border-r-0"
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
              const baseRowProps = getRowProps
                ? row.getRowProps(getRowProps(row))
                : row.getRowProps();
              
              const { key: rowKey, ...rowProps } = baseRowProps;
              
              return (
                <React.Fragment key={rowKey}>
                  <tr
                    key={rowKey}
                    {...rowProps}
                    className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors duration-200 text-slate-200"
                  >
                    {row.cells.map((cell, cIdx) => {
                      const { key: cellKey, ...cellProps } = cell.getCellProps();
                      return (
                        <td
                          key={cellKey || cIdx}
                          {...cellProps}
                          className="px-3 py-2 text-sm text-center max-w-xs break-words text-slate-200 border-r border-slate-700 last:border-r-0"
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
                    renderSubComponent({ row, rowProps: { key: rowKey, ...rowProps } })}
                </React.Fragment>
              );
            })}
            {/* Empty state */}
            {rows.length === 0 && (
              <tr>
                <td 
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-slate-400"
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

import React from "react";
import { useTable, useExpanded } from "react-table";
import classNames from "classnames";
import { useLocalTranslation } from "../../hooks/useLocalTranslation";

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
  const { t } = useLocalTranslation();
  const totalPages = Math.ceil(total / pageSize);
  const tableInstance = useTable({ columns, data }, useExpanded);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  return (

    <div className="h-auto flex flex-col">

      <div
        className={classNames(
          `overflow-auto h-viewport relative scrollbar-hide`,
          className
        )}
        style={{ height: '75vh' }}
      >
        <table
          {...getTableProps()}
          className="w-full table-auto border-collapse text-black bg-transparent border-gray-500"
        >
          <thead className="border-b border-gray-600">
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
                        className=" font-bold uppercase text-xs text-gray-900 sticky top-0 z-1 bg-blue-200 text-center border-r border-gray-300 last:border-r-0"
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
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200 text-black"
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
                    renderSubComponent({ row, rowProps: { key: rowKey, ...rowProps } })}
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
                  {t("No data available")}
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

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
<<<<<<< HEAD

  const tbleFun = () => {
    // console.log("abc")
  }
=======
>>>>>>> refs/remotes/origin/main

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  return (
<<<<<<< HEAD
    <div>
=======
    <div className="h-full flex flex-col">
>>>>>>> refs/remotes/origin/main
      <div
        className={classNames(
          `flex-1 overflow-auto scrollbar-hide`,
          className
        )}
<<<<<<< HEAD
        style={{ height: '75vh' }}
=======
>>>>>>> refs/remotes/origin/main
      >
        <table
          {...getTableProps()}
          className="w-full table-auto border-collapse text-black min-w-full"
        >
<<<<<<< HEAD
          <thead className="border-b">
            {headerGroups.map((headerGroup, gIdx) => {
              const { key: headerGroupKey, ...headerGroupProps } = headerGroup.getHeaderGroupProps();
              return (
                <tr key={headerGroupKey || gIdx} {...headerGroupProps}>
=======
          <thead className="sticky top-0 z-10 bg-white border-b-2 border-gray-200">
            {headerGroups.map((headerGroup, gIdx) => {
              const { key, ...headerGroupProps } = headerGroup.getHeaderGroupProps();
              return (
                <tr key={key || gIdx} {...headerGroupProps}>
>>>>>>> refs/remotes/origin/main
                  {headerGroup.headers.map((column, cIdx) => {
                    const { key: headerKey, ...headerProps } = column.getHeaderProps();
                    return (
                      <th
                        key={headerKey || cIdx}
                        {...headerProps}
<<<<<<< HEAD
                        className="px-2 py-4 font-bold uppercase text-xs text-white sticky top-0 z-10 bg-primaryLight text-center"
=======
                        className="px-4 py-4 font-bold uppercase text-xs text-white bg-primary text-center border-r border-primaryLight last:border-r-0"
>>>>>>> refs/remotes/origin/main
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
<<<<<<< HEAD
              const baseRowProps = getRowProps
                ? row.getRowProps(getRowProps(row))
                : row.getRowProps();
              
              const { key: rowKey, ...rowProps } = baseRowProps;
=======
              const rowProps = getRowProps
                ? row.getRowProps(getRowProps(row))
                : row.getRowProps();
              
              const { key: rowKey, ...restRowProps } = rowProps;
>>>>>>> refs/remotes/origin/main
              
              return (
                <React.Fragment key={rowKey}>
                  <tr
<<<<<<< HEAD
                    key={rowKey}
                    {...rowProps}
                    className="border-b border-dashed text-black"
=======
                    {...restRowProps}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150"
>>>>>>> refs/remotes/origin/main
                  >
                    {row.cells.map((cell, cIdx) => {
                      const { key: cellKey, ...cellProps } = cell.getCellProps();
                      return (
                        <td
                          key={cellKey || cIdx}
                          {...cellProps}
<<<<<<< HEAD
                          className="px-2 py-2 text-sm text-center max-w-xs break-words text-black"
=======
                          className="px-4 py-3 text-sm text-center border-r border-gray-100 last:border-r-0"
>>>>>>> refs/remotes/origin/main
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
<<<<<<< HEAD
                    renderSubComponent({ row, rowProps: { key: rowKey, ...rowProps } })}
                </React.Fragment>
              );
            })}
=======
                    renderSubComponent({ row, rowProps })}
                </React.Fragment>
              );
            })}
            {/* Empty state */}
            {rows.length === 0 && (
              <tr>
                <td 
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No data available
                </td>
              </tr>
            )}
>>>>>>> refs/remotes/origin/main
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;

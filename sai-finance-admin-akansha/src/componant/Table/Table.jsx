import React from "react";
import { useTable, useExpanded } from "react-table";
import classNames from "classnames";

const Table = ({
  columns,
  data,
  isLoading,
  renderSubComponent,
  getRowProps,
  fullHeight = false,
  pagination = true,
  total,
  pageSize = 50,
  className,
}) => {
  const totalPages = Math.ceil(total / pageSize);
  const tableInstance = useTable({ columns, data }, useExpanded);

  const tbleFun = () => {
    // console.log("abc")
  }

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
          className="w-full table-auto border-collapse text-black"
        >
          <thead className="border-b">
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
                        className="px-2 py-4 font-bold uppercase text-xs text-white sticky top-0 z-10 bg-primaryLight text-center"
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
                    className="border-b border-dashed text-black"
                  >
                    {row.cells.map((cell, cIdx) => {
                      const { key: cellKey, ...cellProps } = cell.getCellProps();
                      return (
                        <td
                          key={cellKey || cIdx}
                          {...cellProps}
                          className="px-2 py-2 text-sm text-center max-w-xs break-words text-black"
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
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;

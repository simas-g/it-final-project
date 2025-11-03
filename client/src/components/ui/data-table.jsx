const DataTable = ({ columns, data, onRowClick, className = '' }) => {
  return (
    <div className={`hidden md:block overflow-x-auto ${className}`}>
      <table className="w-full">
        <thead className="border-b-2">
          <tr className="text-left">
            {columns.map((column, index) => (
              <th 
                key={column.key || index}
                className={`pb-3 px-4 font-semibold whitespace-nowrap ${column.headerClassName || ''}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr 
              key={row.id || rowIndex}
              className={`border-b hover:bg-muted/50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((column, colIndex) => (
                <td 
                  key={column.key || colIndex}
                  className={`py-3 px-4 ${column.cellClassName || ''}`}
                >
                  {column.render ? column.render(row, rowIndex) : row[column.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default DataTable


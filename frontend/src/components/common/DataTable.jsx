import React from 'react';

export default function DataTable({ columns, data, onEdit, onDelete, loading }) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-400">No data available</div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-6 px-6">
      <div className="min-w-full inline-block align-middle">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#1a1a1a] text-white text-left text-sm">
              {columns.map((column, index) => (
                <th key={index} className="p-3 font-semibold whitespace-nowrap">
                  {column.header}
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th className="p-3 font-semibold text-right whitespace-nowrap">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr
                key={row._id || rowIndex}
                className="border-b border-gray-700 hover:bg-[#2f2f2f] transition-colors"
              >
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="p-3 text-sm text-gray-300">
                    {column.render ? column.render(row[column.accessor], row) : row[column.accessor]}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="p-3">
                    <div className="flex gap-2 justify-end">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(row)}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-br from-[#2E8BFD] to-[#1E62D0] text-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
                          title="Edit"
                        >
                          <i className="fa-solid fa-pen text-xs"></i>
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(row)}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-red-800 text-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
                          title="Delete"
                        >
                          <i className="fa-solid fa-trash text-xs"></i>
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

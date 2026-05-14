import React from 'react';
import { cn } from '../utils/cn';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  onRowClick?: (item: T) => void;
}

export function Table<T extends { id: string | number }>({ 
  columns, 
  data, 
  isLoading,
  onRowClick 
}: TableProps<T>) {
  return (
    /* 1. Гаднах хайрцаг: Утсан дээр хажуу тийш гүйлгэдэг (Scroll) болгоно */
    <div className="w-full overflow-x-auto pb-2 custom-scrollbar">
      
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="border-b border-slate-100">
            {columns.map((col, idx) => (
              <th 
                key={idx} 
                className={cn(
                  "py-4 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap",
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                {columns.map((_, j) => (
                  <td key={j} className="py-4 px-4">
                    <div className="h-4 bg-slate-100 rounded w-full"></div>
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-12 text-center text-slate-400 text-sm">
                Мэдээлэл олдсонгүй
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr 
                key={item.id} 
                onClick={() => onRowClick?.(item)}
                className={cn(
                  "hover:bg-slate-50 transition-colors group",
                  onRowClick && "cursor-pointer"
                )}
              >
                {columns.map((col, idx) => (
                  <td key={idx} className={cn("py-4 px-4 text-sm text-slate-600", col.className)}>
                    {typeof col.accessor === 'function' 
                      ? col.accessor(item) 
                      : (item[col.accessor] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
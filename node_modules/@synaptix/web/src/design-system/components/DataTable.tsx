import React, { useState } from 'react';
import { ArrowUpDown, Search } from 'lucide-react';

export interface ColumnDef<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  title?: string;
  subtitle?: string;
  onRowClick?: (item: T) => void;
  searchable?: boolean;
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  title,
  subtitle,
  onRowClick,
  searchable = true,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const filteredData = data.filter((item) => {
    if (!searchTerm) return true;
    return Object.values(item).some(
      (val) => typeof val === 'string' && val.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="ds-data-table-container">
      {(title || searchable) && (
        <div className="data-table-top-bar">
          {title && (
            <div>
              <h3 className="table-title">{title}</h3>
              {subtitle && <p className="table-subtitle">{subtitle}</p>}
            </div>
          )}

          {searchable && (
            <div className="table-search-box">
              <Search size={15} className="table-search-icon" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter dataset rows..."
                className="table-search-input"
              />
            </div>
          )}
        </div>
      )}

      <div className="data-table-scroll-wrapper">
        <table className="ds-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  style={{ width: col.width }}
                  onClick={() => col.sortable && handleSort(String(col.key))}
                  className={col.sortable ? 'sortable-th' : ''}
                >
                  <div className="th-content">
                    <span>{col.header}</span>
                    {col.sortable && <ArrowUpDown size={12} className="sort-icon" />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="empty-table-td">
                  No records match your search filter.
                </td>
              </tr>
            ) : (
              filteredData.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={onRowClick ? 'clickable-tr' : ''}
                >
                  {columns.map((col) => (
                    <td key={String(col.key)}>
                      {col.render ? col.render(row) : String(row[col.key as keyof T] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

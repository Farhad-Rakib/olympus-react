import { useEffect, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Eye } from 'lucide-react';
import { DataTable, Column, RowAction } from '../../../components/table/DataTable';
import { Modal } from '../../../components/ui/Modal/Modal';
import { auditLogApi } from '../../../core/api/services/audit-log.api';
import { AuditLogDto } from '../../../domain/dto/audit-log.dto';
import { getErrorMessage } from '../../../core/api/api-error';

type StatusFilter = 'all' | 'success' | 'failed';

const SEARCH_DEBOUNCE_MS = 300;

/** "Namespace.UsersController.GetProfile (Assembly)" -> "Users: Get Profile". */
const formatAction = (action: string) => {
  const match = /\.(\w+)Controller\.(\w+)/.exec(action);
  if (!match) return action;
  return `${match[1]}: ${match[2].replace(/(?<!^)([A-Z])/g, ' $1')}`;
};

const pathOf = (url: string) => {
  try {
    const { pathname, search } = new URL(url);
    return pathname + search;
  } catch {
    return url;
  }
};

const prettyJson = (raw: string | null) => {
  if (!raw) return '—';
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
};

export const AuditLogsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [selected, setSelected] = useState<AuditLogDto | null>(null);

  // Query the API only after typing pauses.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['audit-logs', page, pageSize, search, status],
    queryFn: () => auditLogApi.query({
      page,
      pageSize,
      action: search || undefined,
      success: status === 'all' ? undefined : status === 'success',
    }),
    placeholderData: keepPreviousData,
  });

  const columns: Column<AuditLogDto>[] = [
    {
      key: 'timestamp', label: 'Time',
      render: (_, row) => <time className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap" dateTime={row.timestamp}>{new Date(row.timestamp).toLocaleString()}</time>,
    },
    {
      key: 'userName', label: 'User',
      render: (_, row) => <span className="text-sm text-gray-900 dark:text-white">{row.userName ?? (row.userId ? `User #${row.userId}` : 'Anonymous')}</span>,
    },
    {
      key: 'action', label: 'Action',
      render: (_, row) => (
        <div className="min-w-0">
          <p className="text-sm text-gray-900 dark:text-white">{formatAction(row.action)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">{row.method} {pathOf(row.path)}</p>
        </div>
      ),
    },
    {
      key: 'statusCode', label: 'Status',
      render: (_, row) => (
        <span className={`px-2 py-0.5 text-[11px] font-medium rounded-full ${row.success
          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}
        >
          {row.statusCode ?? (row.success ? 'OK' : 'Error')}
        </span>
      ),
    },
  ];

  const rowActions: RowAction<AuditLogDto>[] = [
    { icon: Eye, label: 'View details', onClick: (row) => setSelected(row), variant: 'primary' },
  ];

  const total = data?.total ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Audit Logs</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Every API request, newest first</p>
        </div>
        <select
          aria-label="Status filter"
          value={status}
          onChange={(e) => { setStatus(e.target.value as StatusFilter); setPage(1); }}
          className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All statuses</option>
          <option value="success">Successful</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading}
        error={error ? getErrorMessage(error, 'Failed to load audit logs') : undefined}
        onRetry={() => refetch()}
        searchable
        searchPlaceholder="Search by action or path..."
        onSearch={setSearchInput}
        sortable={false}
        rowActions={rowActions}
        emptyState={{ title: 'No audit entries found', description: 'Try a different search or status filter' }}
        pagination={{
          currentPage: page,
          totalPages: Math.max(1, Math.ceil(total / pageSize)),
          pageSize,
          total,
          onPageChange: setPage,
          onPageSizeChange: (size) => { setPageSize(size); setPage(1); },
        }}
      />

      <Modal isOpen={selected !== null} onClose={() => setSelected(null)} title="Audit Entry" size="lg">
        {selected && (
          <div className="space-y-4 text-sm">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              {[
                ['Time', new Date(selected.timestamp).toLocaleString()],
                ['User', selected.userName ?? (selected.userId ? `User #${selected.userId}` : 'Anonymous')],
                ['Action', formatAction(selected.action)],
                ['Request', `${selected.method} ${pathOf(selected.path)}`],
                ['Status', String(selected.statusCode ?? '—')],
                ['IP address', selected.ip ?? '—'],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</dt>
                  <dd className="mt-0.5 text-gray-900 dark:text-white break-all">{value}</dd>
                </div>
              ))}
            </dl>
            {[
              ['Request body', selected.requestBody],
              ['Response body', selected.responseBody],
            ].map(([label, body]) => (
              <div key={label}>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</p>
                <pre className="max-h-56 overflow-auto p-3 rounded-lg bg-gray-50 dark:bg-gray-900 text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-all">{prettyJson(body)}</pre>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

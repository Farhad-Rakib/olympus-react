import { Calendar, Eye, Mail, Pencil, Trash2 } from 'lucide-react';
import { DynamicForm, FormField } from '../../components/form/DynamicForm';
import { DataTable, Column, RowAction } from '../../components/table/DataTable';
import { ConfirmDialog } from '../../components/ui/Dialog/ConfirmDialog';
import { Modal } from '../../components/ui/Modal/Modal';
import { User, UserRole, UserStatus } from '../../domain/models/user.model';
import { useUsersPage } from '../hooks/useUsersPage';

const getStatusBadge = (status: string) => {
  const colors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    suspended: 'bg-red-100 text-red-800',
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full ${
        colors[status as keyof typeof colors] || colors.inactive
      }`}
    >
      {status}
    </span>
  );
};

const getRoleBadge = (role: string) => {
  const colors = {
    admin: 'bg-purple-100 text-purple-800',
    manager: 'bg-blue-100 text-blue-800',
    user: 'bg-gray-100 text-gray-800',
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full ${
        colors[role as keyof typeof colors] || colors.user
      }`}
    >
      {role}
    </span>
  );
};

export const UsersPage: React.FC = () => {
  const { state, actions, usersQuery, createMutation, updateMutation } = useUsersPage();

  const columns: Column<User>[] = [
    {
      key: 'fullName',
      label: 'Name',
      sortable: true,
      render: (_, user) => (
        <div className="flex items-center gap-3">
          {user.avatar ? (
            <img src={user.avatar} alt={user.fullName} className="w-10 h-10 rounded-full" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user.firstName[0]}
                {user.lastName[0]}
              </span>
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{user.fullName}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {user.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (role) => getRoleBadge(role as string),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (status) => getStatusBadge(status as string),
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (date) => (
        <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {new Date(date as string).toLocaleDateString()}
        </span>
      ),
    },
  ];

  const rowActions: RowAction<User>[] = [
    {
      icon: Eye,
      label: 'View',
      onClick: (user) => actions.setViewUser(user),
      variant: 'secondary',
    },
    {
      icon: Pencil,
      label: 'Edit',
      onClick: (user) => actions.setEditUser(user),
      variant: 'primary',
    },
    {
      icon: Trash2,
      label: 'Delete',
      onClick: (user) => actions.setDeleteUserId(user.id),
      variant: 'danger',
    },
  ];

  const userFormFields: FormField[] = [
    {
      name: 'firstName',
      label: 'First Name',
      type: 'text',
      required: true,
      placeholder: 'John',
      defaultValue: state.editUser?.firstName || '',
    },
    {
      name: 'lastName',
      label: 'Last Name',
      type: 'text',
      required: true,
      placeholder: 'Doe',
      defaultValue: state.editUser?.lastName || '',
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      placeholder: 'john@example.com',
      defaultValue: state.editUser?.email || '',
    },
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      required: true,
      options: [
        { label: 'Admin', value: UserRole.ADMIN },
        { label: 'Manager', value: UserRole.MANAGER },
        { label: 'User', value: UserRole.USER },
      ],
      defaultValue: state.editUser?.role || UserRole.USER,
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: [
        { label: 'Active', value: UserStatus.ACTIVE },
        { label: 'Inactive', value: UserStatus.INACTIVE },
        { label: 'Suspended', value: UserStatus.SUSPENDED },
      ],
      defaultValue: state.editUser?.status || UserStatus.ACTIVE,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage user accounts and permissions</p>
      </div>

      <DataTable
        columns={columns}
        data={usersQuery.data?.data || []}
        isLoading={usersQuery.isLoading}
        error={usersQuery.error?.message}
        searchable
        searchPlaceholder="Search users by name or email..."
        onSearch={actions.setSearch}
        sortable
        onSort={(key, order) => {
          actions.setSortBy(key as string);
          actions.setSortOrder(order);
        }}
        pagination={
          usersQuery.data
            ? {
                currentPage: usersQuery.data.page,
                totalPages: usersQuery.data.totalPages,
                pageSize: usersQuery.data.pageSize,
                total: usersQuery.data.total,
                onPageChange: actions.setPage,
                onPageSizeChange: (size) => {
                  actions.setPageSize(size);
                  actions.setPage(1);
                },
              }
            : undefined
        }
        emptyState={{
          title: 'No users found',
          description: 'Try adjusting your search criteria',
        }}
        actions={{
          add: {
            label: 'Add User',
            onClick: () => actions.setShowAddModal(true),
          },
        }}
        rowActions={rowActions}
        onRetry={() => usersQuery.refetch()}
      />

      <ConfirmDialog
        isOpen={!!state.deleteUserId}
        onClose={() => actions.setDeleteUserId(null)}
        onConfirm={() => state.deleteUserId && actions.deleteUser(state.deleteUserId)}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />

      <Modal
        isOpen={state.showAddModal}
        onClose={() => actions.setShowAddModal(false)}
        title="Add New User"
      >
        <DynamicForm
          fields={userFormFields.map((f) => ({ ...f, defaultValue: '' }))}
          onSubmit={(formData) => actions.createUser(formData as Record<string, string>)}
          submitLabel="Create User"
          isLoading={createMutation.isPending}
        />
      </Modal>

      <Modal
        isOpen={!!state.editUser}
        onClose={() => actions.setEditUser(null)}
        title="Edit User"
      >
        <DynamicForm
          fields={userFormFields}
          onSubmit={(formData) => actions.updateUser(formData as Record<string, string>)}
          submitLabel="Update User"
          isLoading={updateMutation.isPending}
        />
      </Modal>

      <Modal
        isOpen={!!state.viewUser}
        onClose={() => actions.setViewUser(null)}
        title="User Details"
      >
        {state.viewUser && (
          <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
            <p>
              <span className="font-semibold">Name:</span> {state.viewUser.fullName}
            </p>
            <p>
              <span className="font-semibold">Email:</span> {state.viewUser.email}
            </p>
            <p>
              <span className="font-semibold">Role:</span> {state.viewUser.role}
            </p>
            <p>
              <span className="font-semibold">Status:</span> {state.viewUser.status}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

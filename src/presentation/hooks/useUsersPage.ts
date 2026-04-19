import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { User, UserRole, UserStatus } from '../../domain/models/user.model';
import { CreateUserRequestDto, UpdateUserRequestDto } from '../../domain/dto/user.dto';
import { userApplicationService } from '../../application/services/user.application.service';
import { QueryKeys } from '../../shared/constants/query-keys';
import { toast } from '../../components/ui/Toast/toast.store';
import { getErrorMessage } from '../../shared/utils/get-error-message';

export const useUsersPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [viewUser, setViewUser] = useState<User | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const usersQuery = useQuery({
    queryKey: [QueryKeys.users, page, pageSize, search, sortBy, sortOrder],
    queryFn: () =>
      userApplicationService.getUsers({
        page,
        pageSize,
        search,
        sortBy,
        sortOrder,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userApplicationService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.users] });
      toast.success('User deleted successfully');
      setDeleteUserId(null);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to delete user'));
    },
  });

  const createMutation = useMutation({
    mutationFn: (dto: CreateUserRequestDto) => userApplicationService.createUser(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.users] });
      toast.success('User created successfully');
      setShowAddModal(false);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to create user'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateUserRequestDto }) =>
      userApplicationService.updateUser(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.users] });
      toast.success('User updated successfully');
      setEditUser(null);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to update user'));
    },
  });

  const getDefaultPermissions = (role: UserRole): string[] => {
    switch (role) {
      case UserRole.ADMIN:
        return ['users.view', 'users.create', 'users.edit', 'users.delete', 'dashboard.view', 'settings.view', 'reports.view'];
      case UserRole.MANAGER:
        return ['users.view', 'users.edit', 'dashboard.view', 'reports.view'];
      default:
        return ['dashboard.view'];
    }
  };

  const createUser = (formData: Record<string, string>) => {
    const dto: CreateUserRequestDto = {
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      fullName: `${formData.firstName} ${formData.lastName}`,
      role: formData.role as UserRole,
      status: formData.status as UserStatus,
      permissions: getDefaultPermissions(formData.role as UserRole),
    };

    createMutation.mutate(dto);
  };

  const updateUser = (formData: Record<string, string>) => {
    if (!editUser) return;

    const dto: UpdateUserRequestDto = {
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      fullName: `${formData.firstName} ${formData.lastName}`,
      role: formData.role as UserRole,
      status: formData.status as UserStatus,
    };

    updateMutation.mutate({ id: editUser.id, dto });
  };

  const state = useMemo(
    () => ({
      page,
      pageSize,
      search,
      sortBy,
      sortOrder,
      deleteUserId,
      editUser,
      viewUser,
      showAddModal,
    }),
    [page, pageSize, search, sortBy, sortOrder, deleteUserId, editUser, viewUser, showAddModal]
  );

  const actions = {
    setPage,
    setPageSize,
    setSearch,
    setSortBy,
    setSortOrder,
    setDeleteUserId,
    setEditUser,
    setViewUser,
    setShowAddModal,
    createUser,
    updateUser,
    deleteUser: (id: string) => deleteMutation.mutate(id),
  };

  return {
    state,
    actions,
    usersQuery,
    createMutation,
    updateMutation,
    deleteMutation,
  };
};

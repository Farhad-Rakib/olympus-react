import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Plus, Shield } from 'lucide-react';
import { toast } from '../../../components/ui/Toast/toast.store';
import { BaseRepository } from '../../../core/api/base.repository';
import { ApiResponse } from '../../../domain/dto/auth.dto';
import { ConfirmDialog } from '../../../components/ui/Dialog/ConfirmDialog';
import { Modal } from '../../../components/ui/Modal/Modal';
import { DynamicForm, FormField } from '../../../components/form/DynamicForm';
import { getErrorMessage } from '../../../core/api/api-error';

interface RoleDto {
  id: number;
  name: string;
  description: string;
  permissions: string[];
}

interface PermissionDto {
  id: number;
  name: string;
  description: string;
}

class RolesApi extends BaseRepository {
  constructor() { super('/roles'); }
  async getAll(): Promise<RoleDto[]> {
    const res = await this.get<ApiResponse<RoleDto[]>>('');
    if (!res.success) throw new Error(res.message);
    return res.data;
  }
  async getRolePermissions(roleId: number): Promise<PermissionDto[]> {
    const res = await this.get<ApiResponse<PermissionDto[]>>(`/${roleId}/permissions`);
    if (!res.success) throw new Error(res.message);
    return res.data;
  }
  async addPermission(roleId: number, permissionId: number): Promise<RoleDto> {
    const res = await this.post<ApiResponse<RoleDto>>(`/${roleId}/permissions/${permissionId}`, {});
    if (!res.success) throw new Error(res.message);
    return res.data;
  }
  async removePermission(roleId: number, permissionId: number): Promise<RoleDto> {
    const res = await this.delete<ApiResponse<RoleDto>>(`/${roleId}/permissions/${permissionId}`);
    if (!res.success) throw new Error(res.message);
    return res.data;
  }
  async updatePermissions(roleId: number, permissionIds: number[]): Promise<RoleDto> {
    const res = await this.put<ApiResponse<RoleDto>>(`/${roleId}/permissions`, { permissionIds });
    if (!res.success) throw new Error(res.message);
    return res.data;
  }
}

class PermissionsApi extends BaseRepository {
  constructor() { super('/permissions'); }
  async getAll(): Promise<PermissionDto[]> {
    const res = await this.get<ApiResponse<PermissionDto[]>>('');
    if (!res.success) throw new Error(res.message);
    return res.data;
  }
}

const rolesApi = new RolesApi();
const permissionsApi = new PermissionsApi();

export const RolePermissionsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<{ roleId: number; permissionId: number; name: string } | null>(null);

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => rolesApi.getAll(),
  });

  const { data: allPermissions = [] } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => permissionsApi.getAll(),
  });

  const { data: rolePermissions = [], isLoading: loadingPerms } = useQuery({
    queryKey: ['role-permissions', selectedRoleId],
    queryFn: () => rolesApi.getRolePermissions(selectedRoleId!),
    enabled: selectedRoleId !== null,
  });

  const addMutation = useMutation({
    mutationFn: ({ roleId, permissionId }: { roleId: number; permissionId: number }) =>
      rolesApi.addPermission(roleId, permissionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-permissions', selectedRoleId] });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Permission added to role');
      setShowAddModal(false);
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Failed to add permission')),
  });

  const removeMutation = useMutation({
    mutationFn: ({ roleId, permissionId }: { roleId: number; permissionId: number }) =>
      rolesApi.removePermission(roleId, permissionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-permissions', selectedRoleId] });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Permission removed from role');
      setRemoveTarget(null);
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Failed to remove permission')),
  });

  const assignedIds = new Set(rolePermissions.map(p => p.id));
  const availablePermissions = allPermissions.filter(p => !assignedIds.has(p.id));

  const addFields: FormField[] = [
    {
      name: 'permissionId',
      label: 'Permission',
      type: 'select',
      required: true,
      options: availablePermissions.map(p => ({ label: `${p.name}${p.description ? ' - ' + p.description : ''}`, value: p.id })),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Role Permissions</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Assign permissions to roles</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Role selector */}
        <div className="w-full lg:w-72 shrink-0">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Select Role</h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700/50 max-h-96 overflow-y-auto">
              {roles.map(role => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRoleId(role.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    selectedRoleId === role.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Shield className="w-4 h-4 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{role.name}</p>
                    {role.description && <p className="text-xs text-gray-400 truncate">{role.description}</p>}
                  </div>
                </button>
              ))}
              {roles.length === 0 && (
                <p className="px-4 py-6 text-sm text-gray-400 text-center">No roles found</p>
              )}
            </div>
          </div>
        </div>

        {/* Permissions list */}
        <div className="flex-1">
          {selectedRoleId === null ? (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center">
              <Shield className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">Select a role to manage its permissions</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Permissions for "{roles.find(r => r.id === selectedRoleId)?.name}"
                </h3>
                {availablePermissions.length > 0 && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                )}
              </div>

              {loadingPerms ? (
                <div className="p-8 text-center text-gray-400">Loading...</div>
              ) : rolePermissions.length === 0 ? (
                <div className="p-8 text-center text-gray-400">No permissions assigned</div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {rolePermissions.map(perm => (
                    <div key={perm.id} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{perm.name}</p>
                        {perm.description && <p className="text-xs text-gray-400">{perm.description}</p>}
                      </div>
                      <button
                        onClick={() => setRemoveTarget({ roleId: selectedRoleId, permissionId: perm.id, name: perm.name })}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Permission to Role" size="md">
        <DynamicForm
          fields={addFields}
          onSubmit={(data) => addMutation.mutateAsync({ roleId: selectedRoleId!, permissionId: Number(data.permissionId) })}
          submitLabel="Add Permission"
          onCancel={() => setShowAddModal(false)}
          isLoading={addMutation.isPending}
        />
      </Modal>

      <ConfirmDialog
        isOpen={removeTarget !== null}
        onClose={() => setRemoveTarget(null)}
        onConfirm={() => removeTarget && removeMutation.mutate({ roleId: removeTarget.roleId, permissionId: removeTarget.permissionId })}
        title="Remove Permission"
        message={`Remove "${removeTarget?.name}" from this role?`}
        confirmText="Remove"
        variant="danger"
      />
    </div>
  );
};

import { api, apiLogin, USERS } from './helpers';

// Creates the checklist's test accounts. Registration takes no roles,
// so roles are assigned afterwards by the super admin. Safe to re-run.
export default async function globalSetup() {
  const sa = await apiLogin(USERS.superadmin.email, USERS.superadmin.password);
  if (!sa) throw new Error('Cannot log in as super admin - is the API running?');
  const token = sa.accessToken;

  const roles: { id: number; name: string }[] = (await api('GET', '/roles', undefined, token)).json.data;
  const permissions: { id: number; name: string }[] = (await api('GET', '/permissions', undefined, token)).json.data;

  let manager = roles.find((r) => r.name === 'Manager');
  if (!manager) {
    manager = (await api('POST', '/roles', { name: 'Manager', description: 'Users read only' }, token)).json.data;
  }
  const usersRead = permissions.find((p) => p.name === 'users.read')!;
  await api('PUT', `/roles/${manager!.id}/permissions`, { permissionIds: [usersRead.id] }, token);

  const assignments: [keyof typeof USERS, string | null][] = [
    ['admin', 'Admin'],
    ['manager', 'Manager'],
    ['user', 'User'],
    ['norole', null],
  ];

  const existing: { id: number; email: string }[] = (await api('GET', '/users', undefined, token)).json.data;
  for (const [key, roleName] of assignments) {
    const u = USERS[key] as { email: string; password: string; name: string };
    let id = existing.find((x) => x.email === u.email)?.id;
    if (!id) {
      const res = await api('POST', '/auth/register', { fullName: u.name, email: u.email, password: u.password });
      if (res.status !== 201) throw new Error(`register ${u.email} failed: ${res.status}`);
      id = res.json.data.user.id;
    }
    const roleIds = roleName ? [(roleName === 'Manager' ? manager! : roles.find((r) => r.name === roleName)!).id] : [];
    await api('PUT', `/users/${id}/roles`, { roleIds }, token);
  }
}

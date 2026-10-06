import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { KeyRound } from 'lucide-react';
import { authApi } from '../../../core/api/services/auth.api';
import { siteSettingsApi } from '../../../core/api/services/site-settings.api';
import { ExternalProviderStatusDto } from '../../../domain/dto/external-auth.dto';
import { toast } from '../../../components/ui/Toast/toast.store';
import { getErrorMessage } from '../../../core/api/api-error';
import { useAuthStore } from '../../auth/store/auth.store';

/** Switches external sign-in providers on and off (the Auth.<Provider>.Enabled site settings). */
export const SignInMethodsCard: React.FC = () => {
  const queryClient = useQueryClient();
  const canEdit = useAuthStore((s) => s.hasPermission('site-settings.create'));

  const { data: providers = [], isLoading } = useQuery({
    queryKey: ['external-provider-status'],
    queryFn: () => authApi.getExternalProviderStatuses(),
  });
  const { data: settings = [] } = useQuery({
    queryKey: ['site-settings'],
    queryFn: () => siteSettingsApi.getAll(),
  });

  const toggle = useMutation({
    mutationFn: (provider: ExternalProviderStatusDto) => {
      const existing = settings.find((s) => s.key === provider.settingKey);
      return siteSettingsApi.create({
        id: existing?.id ?? 0,
        key: provider.settingKey,
        value: String(!provider.enabled),
        // The save replaces the description, so send the current one back.
        description: existing?.description ?? `Show 'Continue with ${provider.displayName}' on the login page`,
      });
    },
    onSuccess: (_, provider) => {
      queryClient.invalidateQueries({ queryKey: ['external-provider-status'] });
      queryClient.invalidateQueries({ queryKey: ['external-providers'] });
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast.success(`${provider.displayName} sign-in ${provider.enabled ? 'disabled' : 'enabled'}`);
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Failed to update sign-in method')),
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <KeyRound className="w-5 h-5 text-blue-600" aria-hidden="true" />
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Sign-in Methods</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Show these providers on the login page. Each also needs a client ID and secret in the server's ExternalAuth configuration.
          </p>
        </div>
      </div>
      {isLoading ? (
        <p className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Loading...</p>
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-gray-700/50">
          {providers.map((provider) => {
            const switchId = `signin-${provider.id}`;
            return (
              <li key={provider.id} className="flex items-center justify-between gap-4 px-6 py-3">
                <div className="flex items-center gap-2 min-w-0">
                  <label htmlFor={switchId} className="text-sm font-medium text-gray-900 dark:text-white">
                    {provider.displayName}
                  </label>
                  {!provider.configured && (
                    <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      Not configured
                    </span>
                  )}
                </div>
                <button
                  id={switchId}
                  type="button"
                  role="switch"
                  aria-checked={provider.enabled}
                  disabled={!canEdit || toggle.isPending}
                  onClick={() => toggle.mutate(provider)}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 ${provider.enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${provider.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

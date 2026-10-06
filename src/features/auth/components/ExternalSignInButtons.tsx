import { useQuery } from '@tanstack/react-query';
import { Github, Linkedin, KeyRound } from 'lucide-react';
import { authApi } from '../../../core/api/services/auth.api';

const GoogleLogo = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.2-2.1 3.5-5.1 3.5-8.7z" />
    <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24z" />
    <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1z" />
    <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9z" />
  </svg>
);

const MicrosoftLogo = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
    <path fill="#F25022" d="M1 1h10.5v10.5H1z" />
    <path fill="#7FBA00" d="M12.5 1H23v10.5H12.5z" />
    <path fill="#00A4EF" d="M1 12.5h10.5V23H1z" />
    <path fill="#FFB900" d="M12.5 12.5H23V23H12.5z" />
  </svg>
);

const ICONS: Record<string, React.ReactNode> = {
  google: <GoogleLogo />,
  microsoft: <MicrosoftLogo />,
  github: <Github className="w-4 h-4" aria-hidden="true" />,
  linkedin: <Linkedin className="w-4 h-4 text-[#0A66C2]" aria-hidden="true" />,
};

/** "Continue with ..." buttons for every sign-in provider an admin has switched on. */
export const ExternalSignInButtons: React.FC<{ returnUrl: string; disabled?: boolean }> = ({ returnUrl, disabled }) => {
  const { data: providers = [] } = useQuery({
    queryKey: ['external-providers'],
    queryFn: () => authApi.getExternalProviders(),
    staleTime: 60 * 1000,
    retry: false,
  });

  if (providers.length === 0) return null;

  return (
    <div className="mt-6">
      <div className="relative flex items-center">
        <div className="flex-grow border-t border-gray-200 dark:border-gray-700" />
        <span className="mx-3 text-xs text-gray-500 dark:text-gray-400">or continue with</span>
        <div className="flex-grow border-t border-gray-200 dark:border-gray-700" />
      </div>
      <div className="mt-4 grid gap-2">
        {providers.map((provider) => (
          <a
            key={provider.id}
            href={authApi.getExternalStartUrl(provider.id, returnUrl)}
            aria-disabled={disabled}
            className={`flex items-center justify-center gap-2 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${disabled ? 'pointer-events-none opacity-50' : ''}`}
          >
            {ICONS[provider.id] ?? <KeyRound className="w-4 h-4" aria-hidden="true" />}
            Continue with {provider.displayName}
          </a>
        ))}
      </div>
    </div>
  );
};

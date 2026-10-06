import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { LogIn, ArrowLeft, Mail } from 'lucide-react';
import { useAuthStore } from '../store/auth.store';
import { toast } from '../../../components/ui/Toast/toast.store';
import { AppConfig } from '../../../core/config/app.config';
import { AuthService } from '../../../core/services/impl/auth.service';
import { ExternalSignInButtons } from '../components/ExternalSignInButtons';

const authService = new AuthService();

/** Messages for the error codes the API puts on /login?error=... after a provider callback. */
const EXTERNAL_ERRORS: Record<string, string> = {
  external_expired: 'That sign-in attempt expired. Please try again.',
  external_cancelled: 'Sign-in was cancelled.',
  external_unavailable: 'That sign-in method is not available.',
  external_no_email: 'The provider did not share an email address, so we could not sign you in.',
  external_email_in_use: 'An account with this email already exists. Sign in with your password instead.',
  external_inactive: 'This account is disabled.',
  external_failed: 'Sign-in with the provider failed. Please try again.',
};

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const externalError = searchParams.get('error');
  const shownError = useRef<string | null>(null);
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || AppConfig.auth.defaultRedirect;

  useEffect(() => {
    // Show each error once, even if the effect runs twice (React StrictMode).
    if (!externalError || shownError.current === externalError) return;
    shownError.current = externalError;
    toast.error(EXTERNAL_ERRORS[externalError] ?? 'Sign-in failed. Please try again.');
    // Clear the code so a refresh does not show the message again.
    setSearchParams({}, { replace: true });
  }, [externalError, setSearchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(credentials);
      toast.success('Login successful!');
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(error instanceof Error && error.message ? error.message : 'Login failed. Please try again.');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotLoading(true);
    try {
      const msg = await authService.forgotPassword({ email: forgotEmail });
      toast.success(msg || 'Password reset link sent to your email');
      setShowForgotPassword(false);
      setForgotEmail('');
    } catch (error) {
      toast.error(error instanceof Error && error.message ? error.message : 'Failed to send reset email');
    } finally {
      setForgotLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Forgot Password</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Enter your email address and we'll send you a reset link
          </p>
        </div>

        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div>
            <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email address
            </label>
            <input
              id="forgot-email"
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              required
              disabled={forgotLoading}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={forgotLoading || !forgotEmail}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {forgotLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                Send Reset Link
              </>
            )}
          </button>
        </form>

        <button
          onClick={() => setShowForgotPassword(false)}
          className="mt-4 w-full flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sign In
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome back</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Sign in to your account to continue
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={credentials.email}
            onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
            required
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              Forgot password?
            </button>
          </div>
          <input
            id="password"
            type="password"
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            required
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              Sign in
            </>
          )}
        </button>
      </form>

      <ExternalSignInButtons returnUrl={from} disabled={isLoading} />
    </div>
  );
};

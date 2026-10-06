import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { Loader } from '../../../components/ui/Loader/Loader';
import { AppConfig } from '../../../core/config/app.config';

/** Only same-site relative paths, so the callback cannot be used as an open redirect. */
const safeReturnUrl = (url: string | null) =>
  url && url.startsWith('/') && !url.startsWith('//') && !url.startsWith('/\\') ? url : AppConfig.auth.defaultRedirect;

/** Landing page after an external provider: trades the one-time code for a session. */
export const AuthCallbackPage: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const loginWithExternalCode = useAuthStore((s) => s.loginWithExternalCode);
  const started = useRef(false);

  useEffect(() => {
    // The code is single-use; guard against React StrictMode running the effect twice.
    if (started.current) return;
    started.current = true;

    const code = params.get('code');
    if (!code) {
      navigate('/login?error=external_expired', { replace: true });
      return;
    }

    loginWithExternalCode(code)
      .then(() => navigate(safeReturnUrl(params.get('returnUrl')), { replace: true }))
      .catch(() => navigate('/login?error=external_expired', { replace: true }));
  }, [params, navigate, loginWithExternalCode]);

  return <Loader text="Signing you in..." />;
};

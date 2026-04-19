import { QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from '../../components/ui/Toast/Toast';
import { queryClient } from '../store/query-client';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ToastContainer />
    </QueryClientProvider>
  );
};

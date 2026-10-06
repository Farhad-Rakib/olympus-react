import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './query-client';
import { ToastContainer } from '../../components/ui/Toast/Toast';


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

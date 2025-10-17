import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.tsx";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error) => {
        // Don't retry on 404s or auth errors
        if (error instanceof Error && (error.message.includes('404') || error.message.includes('auth'))) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      networkMode: 'offlineFirst', // Better offline support
      // Request deduplication
      structuralSharing: true, // Avoid unnecessary re-renders
    },
    mutations: {
      retry: 1,
      networkMode: 'offlineFirst',
      // Optimistic updates rollback on error
      onError: (error, variables, context: any) => {
        // Rollback is handled automatically when context is returned from onMutate
        console.error('Mutation error:', error);
      },
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);

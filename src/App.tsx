import FormBuilderExample from './components/FormBuilderExample';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="app-container">
        <FormBuilderExample />
      </div>
    </QueryClientProvider>
  );
}

export default App;
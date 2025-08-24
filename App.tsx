import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MoodTracker from "./MoodTracker";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MoodTracker />
    </QueryClientProvider>
  );
}

export default App;

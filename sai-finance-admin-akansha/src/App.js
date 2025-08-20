import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { motion } from "framer-motion";
import EnhancedMainroute from "./routes/EnhancedMainroute";
import EnhancedCursor from "./components/EnhancedCursor/EnhancedCursor";
import "./i18n"; // Import i18n configuration

function App() {
  const queryClient = new QueryClient();

  return (
    <motion.div
      className="App no-select"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <QueryClientProvider client={queryClient}>
        <EnhancedCursor />
        <EnhancedMainroute/>
      </QueryClientProvider>
    </motion.div>
  );
}

export default App;

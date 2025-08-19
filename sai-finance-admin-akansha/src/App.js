import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Mainroute from "./routes/Mainroute";


function App() {
  const queryClient = new QueryClient();
  return (
    <div className="App no-select">
      <QueryClientProvider client={queryClient}>
      {/* {token && token.length > 0 ? (
        <>
          {" "}
          <Sidebar />
           
        </>
      ) : (
        <LoginRout />
      )} */}
      
     
      <Mainroute/>
      </QueryClientProvider>
    </div>
  );
}

export default App;

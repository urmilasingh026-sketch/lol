import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Workspace } from "@/pages/Workspace";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Workspace} />
      <Route>
        <div className="min-h-screen flex items-center justify-center bg-background text-white">
          <h1 className="text-2xl font-bold">404 - Area Not Found</h1>
        </div>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

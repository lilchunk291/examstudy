import { RouterProvider } from "react-router";
import { ThemeProvider } from "next-themes";
import { router } from "./routes";
import { Toaster } from "./components/ui/sonner";
import { AIWorkerProvider } from "../lib/AIWorkerContext";
import { AuthProvider } from "../lib/AuthContext";

export default function App() {
  return (
    // @ts-ignore
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <AIWorkerProvider>
          <RouterProvider router={router} />
          <Toaster />
        </AIWorkerProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

import { RouterProvider } from "react-router";
import { ThemeProvider } from "next-themes";
import { router } from "./routes";
import { Toaster } from "./components/ui/sonner";
import { AIWorkerProvider } from "../lib/AIWorkerContext";

export default function App() {
  return (
    // @ts-ignore
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AIWorkerProvider>
        <RouterProvider router={router} />
        <Toaster />
      </AIWorkerProvider>
    </ThemeProvider>
  );
}
import { ClerkProvider } from "@clerk/clerk-react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RegisterForm from "./RegisterForm";
import Dashboard from "./Dashboard";

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY!;

export default function App() {
  return (
    <ClerkProvider publishableKey={publishableKey}>
      <BrowserRouter>
        <Routes>
          {/* rota principal com Register */}
          <Route path="/" element={<RegisterForm />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </ClerkProvider>
  );
}

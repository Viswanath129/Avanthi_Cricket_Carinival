import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Portal Runtime Incident:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0e1114",
          color: "#f4f1ea",
          fontFamily: "Inter, sans-serif",
          padding: "24px",
          textAlign: "center"
        }}>
          <div style={{
            maxWidth: "480px",
            background: "#151a1f",
            border: "1px solid rgba(214, 222, 215, 0.15)",
            borderRadius: "16px",
            padding: "32px",
            boxShadow: "0 20px 48px rgba(0,0,0,0.5)"
          }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "12px", color: "#10B981" }}>
              ACC 2026 Portal
            </h2>
            <p style={{ color: "#8b9698", fontSize: "0.875rem", marginBottom: "20px" }}>
              The portal encountered an unexpected state. You can reload or access the primary OS terminal below.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: "10px 20px",
                  background: "#10B981",
                  color: "#0e1114",
                  fontWeight: 600,
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer"
                }}
              >
                Reload
              </button>
              <a
                href="/os.html"
                style={{
                  padding: "10px 20px",
                  border: "1px solid rgba(214, 222, 215, 0.2)",
                  color: "#f4f1ea",
                  borderRadius: "8px",
                  textDecoration: "none",
                  display: "inline-block",
                  fontWeight: 600
                }}
              >
                Open Web OS
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

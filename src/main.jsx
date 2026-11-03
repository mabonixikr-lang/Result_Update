import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";

// Shows the real error on screen instead of a blank white page
class ErrorBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ padding: 24, color: "#fca5a5", fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
        Something went wrong:{"\n"}
        {String(this.state.error?.message || this.state.error)}
      </div>
    );
  }
}

createRoot(document.getElementById("root")).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

import { Component } from "react";

/* Catches a crash anywhere inside it and shows a friendly message instead of a
blank page. React only offers this as a class component (componentDidCatch) */
class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Something crashed:", error, info.componentStack);
  }

  /* Moving to another page clears the error */
  componentDidUpdate(previous) {
    if (this.state.error && previous.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
        <p className="text-5xl">🎞️</p>
        <h1 className="mt-4 text-2xl font-bold text-fg">Something went wrong</h1>
        <p className="mt-2 text-soft">
          This page hit a problem. Try reloading; if it keeps happening, let us know.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover"
        >
          Reload the page
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;

import { Component, ReactNode } from 'react';

interface Props {
  onError(error: Error): void;
  children: ReactNode;
}

/**
 * Catches render-time crashes of one experience so siblings keep working.
 * Does NOT catch async or event-handler errors; experiences report those via `fail()`.
 */
export class ExperienceErrorBoundary extends Component<Props, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    this.props.onError(error);
  }

  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

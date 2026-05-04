import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (!this.state.hasError) return this.props.children;

        return (
            <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
                <h1>Something went wrong.</h1>
                <details style={{ whiteSpace: 'pre-wrap' }}>
                    {this.state.error && this.state.error.toString()}
                    <br />
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                </details>
            </div>
        );
    }
}

export default ErrorBoundary;

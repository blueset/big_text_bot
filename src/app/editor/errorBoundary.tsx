'use client';

import React from 'react';
import { clearPersistedKeys } from './persistedState';
import classes from './errorBoundary.module.scss';

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('React rendering error:', error, errorInfo);
        clearPersistedKeys().catch(e => {
            console.error('Failed to clear persisted keys:', e);
        });
    }

    private handleRefresh = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className={classes.container}>
                    <div className={classes.dialog}>
                        <h2 className={classes.title}>
                            Something went wrong
                        </h2>
                        <p className={classes.message}>
                            {this.state.error?.message || 'An unexpected error occurred'}
                        </p>
                        <button
                            onClick={this.handleRefresh}
                            className={classes.button}
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
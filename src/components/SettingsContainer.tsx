import React, { FC, useEffect, useState } from 'react';
import settings from '../controllers/settings';
import ErrorBoundary from './ErrorBoundary';

export const SettingsContainer: FC<{ children?: React.ReactNode }> = ({
    children
}) => {
    const [ready, setIsReady] = useState(false);
    useEffect(() => {
        settings.refresh().then(() => {
            setIsReady(true);
        });
    }, []);
    return <>{ready ? <ErrorBoundary>{children}</ErrorBoundary> : null}</>;
};

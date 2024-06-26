import { ModalContext } from './Context';
import React, { FC, ReactNode, useCallback, useEffect, useState } from 'react';
import { Modal } from '../Modal';

export const ModalContainer: FC<{ children?: React.ReactNode }> = ({
    children
}) => {
    const [value, setValue] = useState<ReactNode>(null);
    const listener = useCallback((event: { key: string }) => {
        if (event.key === 'Escape') {
            setValue(null);
        }
    }, []);
    useEffect(() => {
        if (value) {
            document.addEventListener('keydown', listener);
        } else {
            document.removeEventListener('keydown', listener);
        }
    }, [value]);
    return (
        <ModalContext.Provider value={{ value, setValue }}>
            {children}
            {value && <Modal onClose={() => setValue(null)}>{value}</Modal>}
        </ModalContext.Provider>
    );
};

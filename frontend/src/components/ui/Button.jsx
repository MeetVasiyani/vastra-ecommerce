import React from 'react';
import { Button as BootstrapButton } from 'react-bootstrap';

const Button = ({
    children,
    variant = 'primary',
    className = '',
    ...props
}) => {
    const vastraVariant = variant === 'primary'
        ? 'btn-vastra-primary'
        : variant === 'outline'
            ? 'btn-vastra-outline'
            : '';

    return (
        <BootstrapButton
            className={`${vastraVariant} ${className}`}
            {...props}
        >
            {children}
        </BootstrapButton>
    );
};

export default Button;

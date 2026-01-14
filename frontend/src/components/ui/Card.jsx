import React from 'react';
import { Card as BootstrapCard } from 'react-bootstrap';

export const Card = ({ children, className = '', hover = true, ...props }) => {
  return (
    <BootstrapCard 
      className={`vastra-card ${hover ? 'hover-effect' : ''} ${className}`}
      {...props}
    >
      {children}
    </BootstrapCard>
  );
};

export const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <BootstrapCard.Header className={className} {...props}>
      {children}
    </BootstrapCard.Header>
  );
};

export const CardBody = ({ children, className = '', ...props }) => {
  return (
    <BootstrapCard.Body className={className} {...props}>
      {children}
    </BootstrapCard.Body>
  );
};

export const CardTitle = ({ children, className = '', ...props }) => {
  return (
    <BootstrapCard.Title className={className} {...props}>
      {children}
    </BootstrapCard.Title>
  );
};

export const CardText = ({ children, className = '', ...props }) => {
  return (
    <BootstrapCard.Text className={className} {...props}>
      {children}
    </BootstrapCard.Text>
  );
};

export const CardImg = ({ src, alt, className = '', position = 'top', ...props }) => {
  const Component = position === 'top' ? BootstrapCard.Img : BootstrapCard.ImgOverlay;
  return <BootstrapCard.Img variant={position} src={src} alt={alt} className={className} {...props} />;
};

export default Card;

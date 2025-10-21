import React from 'react';
import { Card as MuiCard, CardContent, CardHeader, CardActions, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

export interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'small' | 'medium' | 'large';
  hover?: boolean;
  onClick?: () => void;
  className?: string;
}

const StyledCard = styled(MuiCard)<{ 
  customvariant: string; 
  custompadding: string; 
  hoverable: boolean;
  clickable: boolean;
}>(({ theme, customvariant, custompadding, hoverable, clickable }) => {
  const baseStyles = {
    borderRadius: '12px',
    transition: 'all 0.2s ease-in-out',
    cursor: clickable ? 'pointer' : 'default',
  };

  const variants = {
    default: {
      backgroundColor: 'white',
      border: '1px solid #F3F4F6',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
    },
    outlined: {
      backgroundColor: 'white',
      border: '1px solid #E5E7EB',
      boxShadow: 'none',
    },
    elevated: {
      backgroundColor: 'white',
      border: 'none',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    },
  };

  const paddingMap = {
    none: 0,
    small: 16,
    medium: 24,
    large: 32,
  };

  const hoverStyles = hoverable || clickable ? {
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
      borderColor: customvariant === 'outlined' ? '#D1D5DB' : undefined,
    },
  } : {};

  return {
    ...baseStyles,
    ...variants[customvariant as keyof typeof variants],
    ...hoverStyles,
    '& .MuiCardContent-root': {
      padding: paddingMap[custompadding as keyof typeof paddingMap],
      '&:last-child': {
        paddingBottom: paddingMap[custompadding as keyof typeof paddingMap],
      },
    },
  };
});

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  actions,
  variant = 'default',
  padding = 'medium',
  hover = false,
  onClick,
  className,
  ...props
}) => {
  const hasHeader = title || subtitle;
  const clickable = !!onClick;

  return (
    <StyledCard
      customvariant={variant}
      custompadding={padding}
      hoverable={hover}
      clickable={clickable}
      onClick={onClick}
      className={className}
      {...props}
    >
      {hasHeader && (
        <CardHeader
          title={title}
          subheader={subtitle}
          sx={{
            pb: 1,
            '& .MuiCardHeader-title': {
              fontSize: '18px',
              fontWeight: 600,
              color: '#1F2937',
            },
            '& .MuiCardHeader-subheader': {
              fontSize: '14px',
              color: '#6B7280',
              marginTop: '4px',
            },
          }}
        />
      )}
      
      <CardContent>
        {children}
      </CardContent>
      
      {actions && (
        <CardActions sx={{ pt: 0, justifyContent: 'flex-end' }}>
          {actions}
        </CardActions>
      )}
    </StyledCard>
  );
};

export default Card;

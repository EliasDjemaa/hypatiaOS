import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

export interface ButtonProps extends Omit<MuiButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const StyledButton = styled(MuiButton)<{ customvariant: string }>(({ theme, customvariant }) => {
  const baseStyles = {
    borderRadius: '8px',
    textTransform: 'none' as const,
    fontWeight: 600,
    transition: 'all 0.2s ease-in-out',
    '&:disabled': {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
  };

  const variants = {
    primary: {
      backgroundColor: '#3B82F6',
      color: 'white',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      '&:hover': {
        backgroundColor: '#2563EB',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      '&:active': {
        backgroundColor: '#1D4ED8',
      },
    },
    secondary: {
      backgroundColor: '#8B5CF6',
      color: 'white',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      '&:hover': {
        backgroundColor: '#7C3AED',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      '&:active': {
        backgroundColor: '#6D28D9',
      },
    },
    outline: {
      backgroundColor: 'white',
      color: '#374151',
      border: '1px solid #E5E7EB',
      '&:hover': {
        backgroundColor: '#F9FAFB',
        borderColor: '#D1D5DB',
      },
      '&:active': {
        backgroundColor: '#F3F4F6',
      },
    },
    ghost: {
      backgroundColor: 'transparent',
      color: '#6B7280',
      '&:hover': {
        backgroundColor: '#F9FAFB',
        color: '#374151',
      },
      '&:active': {
        backgroundColor: '#F3F4F6',
      },
    },
    danger: {
      backgroundColor: '#EF4444',
      color: 'white',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      '&:hover': {
        backgroundColor: '#DC2626',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      '&:active': {
        backgroundColor: '#B91C1C',
      },
    },
  };

  const sizes = {
    small: {
      padding: '6px 12px',
      fontSize: '14px',
      minHeight: '32px',
    },
    medium: {
      padding: '8px 16px',
      fontSize: '14px',
      minHeight: '40px',
    },
    large: {
      padding: '12px 24px',
      fontSize: '16px',
      minHeight: '48px',
    },
  };

  return {
    ...baseStyles,
    ...variants[customvariant as keyof typeof variants],
  };
});

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  icon,
  disabled,
  onClick,
  ...props
}) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (loading || disabled) return;
    onClick?.(event);
  };

  return (
    <StyledButton
      customvariant={variant}
      size={size}
      disabled={disabled || loading}
      onClick={handleClick}
      startIcon={loading ? <CircularProgress size={16} color="inherit" /> : icon}
      {...props}
    >
      {children}
    </StyledButton>
  );
};

export default Button;

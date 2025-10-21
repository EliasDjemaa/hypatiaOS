import React, { forwardRef } from 'react';
import {
  TextField,
  TextFieldProps,
  InputAdornment,
  FormHelperText,
  Box,
} from '@mui/material';
import { styled } from '@mui/material/styles';

export interface InputProps extends Omit<TextFieldProps, 'variant'> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  description?: string;
  errorMessage?: string;
}

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: 'white',
    transition: 'all 0.2s ease-in-out',
    '& fieldset': {
      borderColor: '#E5E7EB',
      borderWidth: '1px',
    },
    '&:hover fieldset': {
      borderColor: '#D1D5DB',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#3B82F6',
      borderWidth: '2px',
    },
    '&.Mui-error fieldset': {
      borderColor: '#EF4444',
    },
    '&.Mui-disabled': {
      backgroundColor: '#F9FAFB',
      '& fieldset': {
        borderColor: '#E5E7EB',
      },
    },
  },
  '& .MuiInputLabel-root': {
    color: '#6B7280',
    fontSize: '14px',
    fontWeight: 500,
    '&.Mui-focused': {
      color: '#3B82F6',
    },
    '&.Mui-error': {
      color: '#EF4444',
    },
  },
  '& .MuiOutlinedInput-input': {
    padding: '12px 14px',
    fontSize: '14px',
    color: '#1F2937',
    '&::placeholder': {
      color: '#9CA3AF',
      opacity: 1,
    },
  },
}));

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ leftIcon, rightIcon, description, errorMessage, error, helperText, ...props }, ref) => {
    const hasError = error || !!errorMessage;
    const displayHelperText = errorMessage || helperText || description;

    return (
      <Box sx={{ width: '100%' }}>
        <StyledTextField
          ref={ref}
          variant="outlined"
          fullWidth
          error={hasError}
          helperText={displayHelperText}
          InputProps={{
            startAdornment: leftIcon && (
              <InputAdornment position="start">
                <Box sx={{ color: hasError ? '#EF4444' : '#6B7280', display: 'flex' }}>
                  {leftIcon}
                </Box>
              </InputAdornment>
            ),
            endAdornment: rightIcon && (
              <InputAdornment position="end">
                <Box sx={{ color: hasError ? '#EF4444' : '#6B7280', display: 'flex' }}>
                  {rightIcon}
                </Box>
              </InputAdornment>
            ),
          }}
          FormHelperTextProps={{
            sx: {
              color: hasError ? '#EF4444' : '#6B7280',
              fontSize: '12px',
              marginTop: '6px',
              marginLeft: 0,
            },
          }}
          {...props}
        />
      </Box>
    );
  }
);

Input.displayName = 'Input';

export default Input;

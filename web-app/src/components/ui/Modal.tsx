import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  Fade,
} from '@mui/material';
import { CloseOutlined as CloseIcon } from '@mui/icons-material';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  disableBackdropClick?: boolean;
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = 'md',
  fullWidth = true,
  disableBackdropClick = false,
  showCloseButton = true,
}) => {
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (disableBackdropClick) return;
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={disableBackdropClick ? undefined : onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      TransitionComponent={Fade}
      transitionDuration={200}
      sx={{
        '& .MuiBackdrop-root': {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(8px)',
        },
        '& .MuiDialog-paper': {
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          maxHeight: '90vh',
          overflow: 'hidden',
        },
      }}
      onClick={handleBackdropClick}
    >
      {title && (
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 4,
            py: 3,
            borderBottom: '1px solid #F3F4F6',
            backgroundColor: 'white',
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#1F2937' }}>
            {title}
          </Typography>
          {showCloseButton && (
            <IconButton
              onClick={onClose}
              sx={{
                backgroundColor: '#F9FAFB',
                '&:hover': {
                  backgroundColor: '#F3F4F6',
                },
              }}
            >
              <CloseIcon sx={{ fontSize: 20 }} />
            </IconButton>
          )}
        </DialogTitle>
      )}

      <DialogContent
        sx={{
          p: 0,
          backgroundColor: '#FAFBFC',
          overflowY: 'auto',
        }}
      >
        <Box sx={{ p: 4 }}>{children}</Box>
      </DialogContent>

      {actions && (
        <DialogActions
          sx={{
            p: 4,
            borderTop: '1px solid #F3F4F6',
            backgroundColor: 'white',
            gap: 2,
          }}
        >
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default Modal;

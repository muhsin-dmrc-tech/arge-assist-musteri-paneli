import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

interface ButtonProps {
  text: string;
  onClick: () => void;
}

interface AlertDialogProps {
  title: string;
  text?: string;
  closeButton: ButtonProps;
  actionButton: ButtonProps;
  open: boolean;
  setOpen: (isOpen: boolean) => void;
}


export default function AlertDialog({
  text,
  title,
  closeButton,
  actionButton,
  open,
  setOpen
}: AlertDialogProps){

  const handleClose = () => {
    setOpen(false);
  };

  const handleActionButon = () => {
    actionButton.onClick()
    setOpen(false);
  };

  return (
    <Dialog
    open={open}
    onClose={handleClose}
    aria-labelledby="alert-dialog-title"
    aria-describedby="alert-dialog-description"
  >
    <DialogTitle id="alert-dialog-title">
      {title}
    </DialogTitle>
    <DialogContent>
      {text && <DialogContentText id="alert-dialog-description">
        {text}
      </DialogContentText>}
    </DialogContent>
    <DialogActions>
      <Button color='error' onClick={closeButton ? closeButton.onClick : handleClose}>{closeButton ? closeButton.text : 'Close'}</Button>
      <Button onClick={handleActionButon} autoFocus>
        {actionButton.text}
      </Button>
    </DialogActions>
  </Dialog>
  );
}

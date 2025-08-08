import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#41C1BA',
      dark: '#339893', // Hover için daha koyu ton
      light: '#5CCBC5', // Light variant için
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#365B6D',
      dark: '#2B4957', // Hover için daha koyu ton
      light: '#4B7083', // Light variant için
      contrastText: '#ffffff',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          '&.text-white': {
            color: '#ffffff',
            '&:hover': {
              color: '#ffffff',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
            },
          },
          // Contained button hover efekti
          '&.MuiButton-contained': {
            '&:hover': {
              boxShadow: 'none',
            },
          },
          // Outlined button hover efekti
          '&.MuiButton-outlined': {
            '&:hover': {
              backgroundColor: 'rgba(65, 193, 186, 0.08)',
            },
          },
        },
        // Primary button özel stili
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#339893',
          },
        },
        // Secondary button özel stili
        containedSecondary: {
          '&:hover': {
            backgroundColor: '#2B4957',
          },
        },
      },
    },
  },
});

export default theme;

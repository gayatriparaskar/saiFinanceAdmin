import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import "./i18n";
import reportWebVitals from './reportWebVitals';
import {Provider} from 'react-redux'
import { BrowserRouter } from 'react-router-dom';
import { store } from './redux/store';
import { ChakraProvider, extendTheme } from '@chakra-ui/react'

// Custom theme to ensure toast is centered
const theme = extendTheme({
  styles: {
    global: {
      '.chakra-toast__manager': {
        position: 'fixed !important',
        top: '80px !important',
        left: '50% !important',
        transform: 'translateX(-50%) !important',
        zIndex: '100000 !important',
      }
    }
  }
});
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>

  <BrowserRouter>
  <ChakraProvider theme={theme}>
    <App />
    </ChakraProvider>
    </BrowserRouter>
    </Provider>
  
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

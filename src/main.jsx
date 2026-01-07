import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import "@fontsource/cardo/400.css";
import "@fontsource/cardo/700.css";
import { AuthProvider } from './context/AuthContext.jsx'
import { UserProfileProvider } from './context/UserProfileContext.jsx'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <UserProfileProvider>
          <App />
        </UserProfileProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

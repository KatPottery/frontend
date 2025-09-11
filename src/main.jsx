import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import axios from "axios";

// Set the base URL for axios from environment variable NGROK
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || "";


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

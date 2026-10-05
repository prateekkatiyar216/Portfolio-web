import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import portfolio from './data/index.js'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App data={portfolio} />
  </StrictMode>,
)

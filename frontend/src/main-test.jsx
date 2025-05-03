import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ThreeTest from './ThreeTest'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThreeTest />
  </StrictMode>,
)

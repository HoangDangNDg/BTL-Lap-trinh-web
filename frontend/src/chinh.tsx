import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './trang_thai/useComponentTheme'
import UngDung from './UngDung'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UngDung />
  </StrictMode>,
)




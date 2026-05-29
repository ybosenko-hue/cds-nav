import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import CdsNavPrototype from './CdsNavPrototype'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CdsNavPrototype />
  </StrictMode>,
)

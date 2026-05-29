import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import CdsNavPrototype from './CdsNavPrototype'

// basename matches the Vite `base` (and the GitHub Pages project path) so
// react-router treats /cds-nav as the app root. Deep links like
// /cds-nav/orchestration resolve to the "/orchestration" route inside the app.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename="/cds-nav">
      <CdsNavPrototype />
    </BrowserRouter>
  </StrictMode>,
)

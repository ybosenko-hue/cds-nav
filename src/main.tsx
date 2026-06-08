import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import CdsNavPrototype from './CdsNavPrototype'
import TestViewPage from './TestViewPage'

// basename matches the Vite `base` (and the GitHub Pages project path) so
// react-router treats /cds-nav as the app root. Deep links like
// /cds-nav/orchestration resolve to the "/orchestration" route inside the app.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename="/cds-nav">
      <Routes>
        {/* Standalone Linear-style tree page */}
        <Route path="/views" element={<TestViewPage />} />
        {/* Everything else renders the Crusoe shell, which parses its own
            sub-paths (/compute, /foundry/model-hub, /admin/usage, …). */}
        <Route path="*" element={<CdsNavPrototype />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)

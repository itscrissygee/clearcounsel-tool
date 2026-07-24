import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import Home from './Home'
import ClearCounsel from './ClearCounsel'
import LegalTranslator from './LegalTranslator'

function App() {
  const [page, setPage] = useState(getPage());

  function getPage() {
    const hash = window.location.hash.replace('#', '').replace('/', '');
    if (hash === 'professional') return 'professional';
    if (hash === 'prose') return 'prose';
    return 'home';
  }

  useEffect(() => {
    const onHash = () => setPage(getPage());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  if (page === 'professional') return <ClearCounsel />;
  if (page === 'prose') return <LegalTranslator />;
  return <Home />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

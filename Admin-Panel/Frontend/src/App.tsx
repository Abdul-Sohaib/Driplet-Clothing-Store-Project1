
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Setting from './Pages/SiteSettings';

import './App.css';
import Dashboard from './Pages/Dashboard';
import Categories from './Pages/Categories';
import Products from './Pages/Products';
import Sales from './Pages/Sales';
import Support from './Pages/Support';

function App() {
  return (
    <Router>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/products" element={<Products />} />
          <Route path="/site-settings" element={<Setting />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/Support" element={<Support />} />

        </Routes>
      </SignedIn>
    </Router>
  );
}

export default App;
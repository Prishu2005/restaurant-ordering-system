// Filename: src/App.js

import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AdminPanel from "./pages/AdminPanel";
import MenuPage from "./components/MenuPage";

// Import the new ReceptionDashboard component
import ReceptionDashboard from "./pages/ReceptionDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/restaurant/:restaurantId" element={<MenuPage />} />
        <Route path="/admin/:restaurantId" element={<AdminPanel />} />

        {/* Add the new route for the reception dashboard */}
        <Route path="/reception/:restaurantId" element={<ReceptionDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

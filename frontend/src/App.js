import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import GuestPage from "./pages/GuestPage";
import Reports from './pages/Reports'; 
import NotFound from './pages/NotFound';
import EmployeeHousekeeping from './pages/EmployeeHousekeeping';
import NotificationProvider from "./components/NotificationProvider";
import "./App.css";



function App() {
  
  return (
    <NotificationProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/guests" element={<GuestPage />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/employee-housekeeping" element={<EmployeeHousekeeping />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </NotificationProvider>
  );
}

export default App;

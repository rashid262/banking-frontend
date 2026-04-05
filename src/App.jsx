import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RoleSelect from "./pages/RoleSelect";
import AdminDashboard from "./pages/AdminDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import Register from "./pages/Register";
import VerifySuccess from "./pages/VerifySuccess"; // 👈 1. Import your new page

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RoleSelect />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/customer" element={<CustomerDashboard />} />
        
        {/* 👈 2. Add the route for the verification success page */}
        <Route path="/verify-success" element={<VerifySuccess />} />
      </Routes>
    </Router>
  );
}

export default App;
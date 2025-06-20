import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/register";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/products";
import LowStockPage from "./pages/LowStockPage";
import StockReportPage from "./pages/StockReportPage";
import Receipts from "./pages/reciepts";



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/low-stock" element={<LowStockPage />} />
        <Route path="/report" element={<StockReportPage />} />
        <Route path="/receipts" element={<Receipts />} />
      </Routes>

      <ToastContainer />
    </Router>
  );
}

export default App;

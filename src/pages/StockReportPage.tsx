import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { unparse } from "papaparse";

interface Product {
  name: string;
  quantity: number;
}

interface Summary {
  totalItems: number;
  totalStock: number;
  lowStock: Product[];
}

export default function StockSummary() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filteredLowStock, setFilteredLowStock] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/reports/stock-summary");
        const data = await res.json();
        setSummary(data);
        setFilteredLowStock(data.lowStock); // initialize filtered list
      } catch (err) {
        setError("Failed to fetch stock summary");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const filtered = summary?.lowStock.filter((item) =>
      item.name.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredLowStock(filtered || []);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Low Stock Report", 14, 16);
    autoTable(doc, {
      startY: 20,
      head: [["Product", "Quantity"]],
      body: filteredLowStock.map(p => [p.name, p.quantity]),
    });
    doc.save("low-stock-report.pdf");
  };

  const exportToCSV = () => {
    const csv = unparse(filteredLowStock);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "low-stock-report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <p>Loading stock summary...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <AdminLayout>
      <div className="p-6 bg-white shadow-md rounded-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 className="text-2xl font-bold mb-2 sm:mb-0">Stock Summary</h2>
          <input
            type="text"
            placeholder="Search product..."
            className="border px-3 py-1 rounded"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <p>Total Products: <strong>{summary?.totalItems}</strong></p>
          <p>Total Stock Quantity: <strong>{summary?.totalStock}</strong></p>
        </div>

        <div className="flex gap-4 mb-4">
          <button onClick={exportToCSV} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Export CSV
          </button>
          <button onClick={exportToPDF} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
            Export PDF
          </button>
        </div>

        <h3 className="text-xl font-semibold mb-2">🚨 Low Stock Items</h3>
        <table className="min-w-full border border-gray-300 text-sm mb-6">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Product</th>
              <th className="p-2 border">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {filteredLowStock.length > 0 ? (
              filteredLowStock.map((item, i) => (
                <tr key={i} className="text-center">
                  <td className="p-2 border">{item.name}</td>
                  <td className="p-2 border text-red-500">{item.quantity}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="p-2 border text-center text-gray-500">
                  All items are sufficiently stocked.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={filteredLowStock}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="quantity" fill="#4f46e5" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </AdminLayout>
  );
}

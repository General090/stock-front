import AdminLayout from "../components/AdminLayout";
import { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";
import StockChart from "../components/StockChart";
import { toast } from "react-toastify";

interface DashboardStats {
  totalProducts: number;
  totalQuantity: number;
  lowStock: number;
}

interface Product {
  _id: string;
  name: string;
  quantity: number;
  remainingQuantity: number;
  minThreshold: number;
}

interface ProductForChart {
  name: string;
  quantity: number;
}

interface Transaction {
  _id: string;
  product: { name: string };
  type: string;
  quantity: number;
  createdAt: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalQuantity: 0,
    lowStock: 0,
  });
  const [products, setProducts] = useState<ProductForChart[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [statsRes, transactionsRes, productsRes] = await Promise.all([
          api.get<{success: boolean; data: DashboardStats}>("/dashboard/stats"),
          api.get<{success: boolean; data: Transaction[]}>("/transactions/recent"),
          api.get<{success: boolean; data: Product[]}>("/products")
        ]);

        // Set stats
        if (statsRes.data.success) {
          setStats(statsRes.data.data);
        }

        // Set transactions
        if (transactionsRes.data.success) {
          setTransactions(transactionsRes.data.data);
        }

        // Format products for chart
        if (productsRes.data.success) {
          setProducts(productsRes.data.data.map((p: Product) => ({
            name: p.name,
            quantity: p.remainingQuantity
          })));
        }

        // Show low stock alert
        if (statsRes.data.success && statsRes.data.data.lowStock > 0) {
          toast.warn(
            `${statsRes.data.data.lowStock} product${statsRes.data.data.lowStock > 1 ? 's' : ''} below stock threshold`,
            { position: "top-right", autoClose: 10000 }
          );
        }

      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return <AdminLayout><div className="p-6">Loading...</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>

        {stats.lowStock > 0 && (
          <div className="bg-yellow-100 text-yellow-800 border border-yellow-300 p-4 rounded mb-6">
            ⚠️ <strong>{stats.lowStock}</strong> product
            {stats.lowStock > 1 ? "s are" : " is"} running low on stock.{" "}
            <Link to="/low-stock" className="text-blue-600 underline ml-1 font-medium">
              View details
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-100 p-4 rounded shadow">
            <h2 className="text-lg font-semibold">Total Products</h2>
            <p className="text-xl">{stats.totalProducts}</p>
          </div>
          <div className="bg-green-100 p-4 rounded shadow">
            <h2 className="text-lg font-semibold">Total Quantity</h2>
            <p className="text-xl">{stats.totalQuantity}</p>
          </div>
          <div className="bg-red-100 p-4 rounded shadow">
            <h2 className="text-lg font-semibold">Low Stock Items</h2>
            <p className="text-xl">{stats.lowStock}</p>
          </div>
        </div>

        <StockChart data={products} />

        <h2 className="text-xl font-semibold mb-2 mt-10">Recent Transactions</h2>
        <div className="bg-white p-4 shadow rounded">
          {transactions.length === 0 ? (
            <p className="text-gray-600">No recent transactions.</p>
          ) : (
            <ul className="divide-y">
              {transactions.map((tx) => (
                <li key={tx._id} className="py-2 flex justify-between text-sm">
                  <span>{tx.type} - {tx.product?.name}</span>
                  <span>{tx.quantity} pcs</span>
                  <span>{new Date(tx.createdAt).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
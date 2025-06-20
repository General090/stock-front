import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";
import { toast } from "react-toastify";

interface Product {
  _id: string;
  name: string;
  quantity: number;
  price: number;
}

export default function LowStockPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchLowStock();
  }, []);

  async function fetchLowStock() {
    try {
      const res = await api.get("/products/low-stock");
      setProducts(res.data);

      if (res.data.length > 0) {
        const lowStockNames = res.data.map((p: Product) => p.name).join(", ");
        toast.warn(`Low stock on: ${lowStockNames}`, {
          autoClose: 8000,
          position: "top-right",
        });
      }
    } catch (error) {
      console.error("Failed to fetch low stock items", error);
    }
  }

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-50 min-h-screen rounded-md shadow-md">
        <h1 className="text-3xl font-semibold text-gray-800 mb-8 border-b pb-2">
          Low Stock Products
        </h1>

        {/* Banner Notification */}
        {products.length > 0 && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-md mb-6">
            ⚠️ The following products are low in stock:{" "}
            <span className="font-medium">
              {products.map((p) => p.name).join(", ")}
            </span>
          </div>
        )}

        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full table-auto border-collapse">
            <thead className="bg-blue-100 text-gray-700">
              <tr>
                <th className="text-left px-6 py-3 border-b">Product Name</th>
                <th className="text-left px-6 py-3 border-b">Quantity</th>
                <th className="text-left px-6 py-3 border-b">Price</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="text-center text-gray-500 py-6 px-4"
                  >
                    All stock levels are sufficient.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product._id}
                    className="bg-red-50 hover:bg-red-100 transition duration-200"
                  >
                    <td className="px-6 py-4 border-b">{product.name}</td>
                    <td className="px-6 py-4 border-b">{product.quantity}</td>
                    <td className="px-6 py-4 border-b">
                      ₦{product.price.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

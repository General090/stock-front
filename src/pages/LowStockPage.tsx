import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";

interface Product {
  _id: string;
  name: string;
  quantity?: number;
  remainingQuantity?: number;
  price?: number;
  minThreshold?: number;
}

export default function LowStockPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [threshold] = useState(5);

  useEffect(() => {
    const fetchLowStock = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/low-stock?threshold=${threshold}`);
        
        if (!res.data) {
          throw new Error("No data received");
        }

        setProducts(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Failed to fetch low stock items:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLowStock();
  }, [threshold]);

  const getCurrentQuantity = (product: Product) => {
    return product.remainingQuantity ?? product.quantity ?? 0;
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Low Stock Products</h1>

        {loading ? (
          <p>Loading low stock products...</p>
        ) : products.length > 0 ? (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left">Product</th>
                  <th className="px-6 py-3 text-left">Current Stock</th>
                  <th className="px-6 py-3 text-left">Threshold</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product._id} className="border-t hover:bg-gray-50">
                    <td className="px-6 py-4">{product.name}</td>
                    <td className="px-6 py-4">
                      {getCurrentQuantity(product)}
                    </td>
                    <td className="px-6 py-4">
                      {product.minThreshold ?? threshold}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-green-50 text-green-800 p-4 rounded-md">
            All products are above the stock threshold ({threshold}).
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
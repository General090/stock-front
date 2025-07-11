import AdminLayout from "../components/AdminLayout";
import { useEffect, useState } from "react";
import api from "../services/api";
import { toast } from 'react-toastify';

interface Product {
  _id: string;
  name: string;
  initialQuantity: number;
  remainingQuantity: number;
  costPrice?: number;
  sellingPrice?: number;
  minThreshold: number;
  maxThreshold: number;
  category: string;
}

interface ProductForm {
  name: string;
  initialQuantity: number;
  remainingQuantity: number;
  costPrice: number;
  sellingPrice: number;
  minThreshold: number;
  maxThreshold: number;
  category: string;
}

function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<ProductForm>({
    name: "",
    initialQuantity: 0,
    remainingQuantity: 0,
    costPrice: 0,
    sellingPrice: 0,
    minThreshold: 5,
    maxThreshold: 100,
    category: "General"
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const res = await api.get("/products");
      const productsData = (res.data.data || res.data).map((product: any) => ({
        ...product,
        costPrice: product.costPrice ?? 0,
        sellingPrice: product.sellingPrice ?? 0
      }));
      setProducts(productsData);
    } catch (error) {
      console.error("Failed to load products", error);
      toast.error("Failed to load products");
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: ['initialQuantity', 'remainingQuantity', 'costPrice', 'sellingPrice', 'minThreshold', 'maxThreshold'].includes(name)
        ? Number(value)
        : value
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        remainingQuantity: form.initialQuantity
      };

      if (editId) {
        await api.put(`/products/${editId}`, payload);
        toast.success('Product updated successfully!');
      } else {
        await api.post("/products", payload);
        toast.success('Product created successfully!');
      }

      setForm({
        name: "",
        initialQuantity: 0,
        remainingQuantity: 0,
        costPrice: 0,
        sellingPrice: 0,
        minThreshold: 5,
        maxThreshold: 100,
        category: "General"
      });
      setEditId(null);
      fetchProducts();
    } catch (error: any) {
      console.error("Failed to save product", error);
      toast.error(error.response?.data?.message || "Failed to save product");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
      toast.success('Product deleted successfully!');
    } catch (error) {
      console.error("Failed to delete product", error);
      toast.error("Failed to delete product");
    }
  }

  function startEdit(product: Product) {
    setEditId(product._id);
    setForm({
      name: product.name,
      initialQuantity: product.initialQuantity,
      remainingQuantity: product.remainingQuantity,
      costPrice: product.costPrice ?? 0,
      sellingPrice: product.sellingPrice ?? 0,
      minThreshold: product.minThreshold,
      maxThreshold: product.maxThreshold,
      category: product.category
    });
  }

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-semibold">Inventory Management</h1>
          <input
            type="text"
            placeholder="Search product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 shadow-md rounded-2xl px-6 py-8 mb-10 w-full max-w-2xl mx-auto space-y-6">
          <h2 className="text-xl font-semibold text-gray-800 text-center">
            {editId ? "Update Product" : "Add New Product"}
          </h2>

          <div className="space-y-4">
            <label>
              <span className="block text-sm font-medium text-gray-700 mb-1">Product Name:</span>
              <input
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none mb-5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </label>

            <label>
              <span className="block text-sm font-medium text-gray-700 mb-1">Initial Quantity:</span>
              <input
                name="initialQuantity"
                type="number"
                value={form.initialQuantity}
                onChange={handleChange}
                min={0}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none mb-5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </label>

            <label>
              <span className="block text-sm font-medium text-gray-700 mb-1">Cost Price (₦):</span>
              <input
                name="costPrice"
                type="number"
                value={form.costPrice}
                onChange={handleChange}
                min={0}
                step="10"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none mb-5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </label>

            <label>
              <span className="block text-sm font-medium text-gray-700 mb-1">Selling Price (₦):</span>
              <input
                name="sellingPrice"
                type="number"
                value={form.sellingPrice}
                onChange={handleChange}
                min={0}
                step="10"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none mb-5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </label>

            <label>
              <span className="block text-sm font-medium text-gray-700 mb-1">Minimum Threshold:</span>
              <input
                name="minThreshold"
                type="number"
                value={form.minThreshold}
                onChange={handleChange}
                min={0}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none mb-5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </label>

            <label>
              <span className="block text-sm font-medium text-gray-700 mb-1">Category:</span>
              <input
                name="category"
                type="text"
                value={form.category}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none mb-5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition cursor-pointer"
            >
              {editId ? "Update Product" : "Add Product"}
            </button>

            {editId && (
              <button
                type="button"
                onClick={() => {
                  setEditId(null);
                  setForm({
                    name: "",
                    initialQuantity: 0,
                    remainingQuantity: 0,
                    costPrice: 0,
                    sellingPrice: 0,
                    minThreshold: 5,
                    maxThreshold: 100,
                    category: "General"
                  });
                }}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="table w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Quantity</th>
                <th className="p-3 text-left">Cost Price</th>
                <th className="p-3 text-left">Selling Price</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-4">
                    No products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr
                    key={product._id}
                    className={product.remainingQuantity < product.minThreshold ? "bg-red-50" : "hover:bg-gray-50"}
                  >
                    <td className="p-3">{product.name}</td>
                    <td className="p-3">{product.remainingQuantity}</td>
                    <td className="p-3">₦{(product.costPrice ?? 0).toFixed(2)}</td>
                    <td className="p-3">₦{(product.sellingPrice ?? 0).toFixed(2)}</td>
                    <td className="p-3 flex flex-col sm:flex-row gap-2">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => startEdit(product)}
                          className="bg-yellow-500 cursor-pointer hover:bg-yellow-600 text-white px-4 py-1 rounded text-sm font-medium transition duration-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="bg-red-500 cursor-pointer hover:bg-red-600 text-white px-4 py-1 rounded text-sm font-medium transition duration-200"
                        >
                          Delete
                        </button>
                      </div>
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

export default ProductManagement;
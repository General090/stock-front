import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import api from "../services/api";
import { toast } from "react-toastify";
import AdminLayout from "../components/AdminLayout";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

type ReceiptForm = {
  productId: string;
  quantity: number;
};

type Product = {
  _id: string;
  name: string;
  costPrice: number;
};

type SavedReceipt = {
  product: Product;
  quantity: number;
};

export default function Receipts() {
  const { register, handleSubmit, reset } = useForm<ReceiptForm>();
  const [products, setProducts] = useState<Product[]>([]);
  const [savedReceipt, setSavedReceipt] = useState<SavedReceipt | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await api.get("/products");
        const productsData = res.data.data;
        setProducts(Array.isArray(productsData) ? productsData : []);
      } catch (err) {
        toast.error("Failed to load products");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const onSubmit = async (data: ReceiptForm) => {
    try {
      setLoading(true);
      const product = products.find((p) => p._id === data.productId);
      if (!product) throw new Error("Product not found");

      await api.post("/receipts", { ...data, type: "sale" });
      toast.success("Receipt saved!");
      setSavedReceipt({ product, quantity: data.quantity });
      reset();
    } catch (err) {
      toast.error("Failed to save receipt.");
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    const element = document.getElementById("receipt-preview");
    if (!element) return;
  
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");
  
    const pdf = new jsPDF();
  
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("receipt.pdf");
  };

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <h2 className="text-3xl font-semibold text-gray-800 mb-8 border-b pb-2">
          Generate Receipt
        </h2>

        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="bg-white p-6 rounded-lg shadow-md max-w-md space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Select Product
                </label>
                <select
                  {...register("productId")}
                  required
                  defaultValue=""
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  <option value="" disabled>
                    {loading ? "Loading products..." : "-- Choose a product --"}
                  </option>
                  {products.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.name} - ₦{product.costPrice}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Quantity
                </label>
                <input
                  {...register("quantity")}
                  type="number"
                  min={1}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter quantity"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded transition"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Receipt"}
              </button>
            </form>

            {savedReceipt && (
              <div className="mt-10">
                <div
                  id="receipt-preview"
                  className="bg-white w-[320px] border shadow-lg rounded p-6 space-y-3"
                >
                  <h3 className="text-xl font-semibold border-b pb-2 mb-2">
                    Receipt
                  </h3>
                  <p>
                    <span className="font-medium">Product:</span>{" "}
                    {savedReceipt.product.name}
                  </p>
                  <p>
                    <span className="font-medium">Unit Price:</span> ₦
                    {savedReceipt.product.costPrice}
                  </p>
                  <p>
                    <span className="font-medium">Quantity:</span>{" "}
                    {savedReceipt.quantity}
                  </p>
                  <p className="text-lg font-semibold">
                    Total: ₦
                    {savedReceipt.product.costPrice * Number(savedReceipt.quantity)}
                  </p>
                </div>

                <button
                  onClick={handleGeneratePDF}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition"
                >
                  Download PDF
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
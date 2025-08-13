import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black px-4">
      <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">StockEase</h1>
        <p className="text-lg text-gray-600 mb-10">Smart Stock Monitoring & Receipt Management System</p>

      <div className="flex gap-6">
        <Link to="/login">
          <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-900 cursor-pointer transition">
            Login
          </button>
        </Link>
        <Link to="/register">
          <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer transition">
            Register
          </button>
        </Link>
      </div>
    </div>
  );
}


export default Home;
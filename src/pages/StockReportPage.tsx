import { useEffect, useState } from "react";
import { Table, Badge, Statistic, message, Spin, Tabs } from "antd";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api"

interface StockItem {
  id: string;
  name: string;
  initialQuantity: number;
  remainingQuantity: number;
  soldQuantity: number;
  costPrice?: number | null;
  sellingPrice?: number | null;
  minThreshold: number;
  maxThreshold: number;
  totalCostValue?: number | null;
  totalSalesValue?: number | null;
  profit?: number | null;
}

interface ApiResponse {
  success: boolean;
  data: StockItem[];
  summary: {
    totalItems: number;
    totalStockValue: number;
    totalSalesValue: number;
    totalProfit: number;
    lowStockItems: StockItem[];
  };
}

const { TabPane } = Tabs;

export default function StockReportPage() {
  const [stockData, setStockData] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<ApiResponse['summary']>({
    totalItems: 0,
    totalStockValue: 0,
    totalSalesValue: 0,
    totalProfit: 0,
    lowStockItems: []
  });

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        setLoading(true);
        setError(null);
    
        const response = await api.get<ApiResponse>("/reports/stock-summary");
    
        if (!response.data.success) {
          throw new Error("Failed to fetch stock data");
        }
    
        const result = response.data;
    
        const transformedData = result.data.map(item => ({
          ...item,
          id: Math.random().toString(36).substring(2, 9),
          costPrice: item.costPrice ?? 0,
          sellingPrice: item.sellingPrice ?? 0,
          totalCostValue: item.totalCostValue ?? 0,
          totalSalesValue: item.totalSalesValue ?? 0,
          profit: item.profit ?? 0
        }));
    
        setStockData(transformedData);
        setSummary({
          ...result.summary,
          lowStockItems: result.summary.lowStockItems.map(item => ({
            ...item,
            costPrice: item.costPrice ?? 0,
            sellingPrice: item.sellingPrice ?? 0
          }))
        });
    
        message.success("Stock data loaded successfully");
      } catch (error: any) {
        console.error("Error:", error);
        setError(error?.message || "Failed to load stock data");
        message.error("Failed to load stock data");
      } finally {
        setLoading(false);
      }
    };
    

    fetchStockData();
  }, []);

  const columns = [
    {
      title: "Product",
      dataIndex: "name",
      key: "name",
      fixed: 'left' as const,
      width: 150,
      ellipsis: true
    },
    {
      title: "Initial Qty",
      dataIndex: "initialQuantity",
      key: "initial",
      width: 80,
      align: 'right' as const
    },
    {
      title: "Remaining Qty",
      dataIndex: "remainingQuantity",
      key: "remaining",
      width: 90,
      align: 'right' as const,
      render: (quantity: number, record: StockItem) => (
        <Badge
          status={quantity < (record.minThreshold ?? 0) ? "error" : "success"}
          text={quantity}
        />
      )
    },
    {
      title: "Sold Qty",
      dataIndex: "soldQuantity",
      key: "sold",
      width: 80,
      align: 'right' as const
    },
    {
      title: "Cost/Unit (₦)",
      dataIndex: "costPrice",
      key: "cost",
      render: (value: number | null | undefined) => (value ?? 0).toFixed(2),
      width: 90,
      align: 'right' as const
    },
    {
      title: "Price/Unit (₦)",
      dataIndex: "sellingPrice",
      key: "price",
      render: (value: number | null | undefined) => (value ?? 0).toFixed(2),
      width: 90,
      align: 'right' as const
    },
    {
      title: "Profit/Unit (₦)",
      key: "unitProfit",
      render: (_: any, record: StockItem) => 
        ((record.sellingPrice ?? 0) - (record.costPrice ?? 0)).toFixed(2),
      width: 90,
      align: 'right' as const
    },
    {
      title: "Total Cost (₦)",
      dataIndex: "totalCostValue",
      key: "totalCost",
      render: (value: number | null | undefined) => (value ?? 0).toFixed(2),
      width: 100,
      align: 'right' as const
    },
    {
      title: "Total Sales (₦)",
      dataIndex: "totalSalesValue",
      key: "totalSales",
      render: (value: number | null | undefined) => (value ?? 0).toFixed(2),
      width: 100,
      align: 'right' as const
    },
    {
      title: "Total Profit (₦)",
      dataIndex: "profit",
      key: "profit",
      render: (value: number | null | undefined) => (
        <span style={{ color: (value ?? 0) >= 0 ? 'green' : 'red' }}>
          {(value ?? 0).toFixed(2)}
        </span>
      ),
      width: 100,
      align: 'right' as const
    }
  ];

  const lowStockColumns = [
    {
      title: "Product",
      dataIndex: "name",
      key: "name"
    },
    {
      title: "Remaining Qty",
      dataIndex: "remainingQuantity",
      key: "remaining",
      render: (value: number) => (
        <Badge status="error" text={value} />
      )
    },
    {
      title: "Min Threshold",
      dataIndex: "minThreshold",
      key: "threshold"
    },
    {
      title: "Price/Unit (₦)",
      dataIndex: "sellingPrice",
      key: "price",
      render: (value: number | null | undefined) => (value ?? 0).toFixed(2)
    }
  ];

  if (error) {
    return (
      <AdminLayout>
        <div className="p-6 text-red-500">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Stock Summary Report</h2>
        
        <Spin spinning={loading}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded border">
              <Statistic
                title="Total Products"
                value={summary.totalItems}
              />
            </div>
            <div className="p-4 bg-green-50 rounded border">
              <Statistic
                title="Stock Value"
                value={summary.totalStockValue}
                precision={2}
                prefix="₦"
              />
            </div>
            <div className="p-4 bg-purple-50 rounded border">
              <Statistic
                title="Sales Value"
                value={summary.totalSalesValue}
                precision={2}
                prefix="₦"
              />
            </div>
            <div className="p-4 bg-orange-50 rounded border">
              <Statistic
                title="Total Profit"
                value={summary.totalProfit}
                precision={2}
                prefix="₦"
                valueStyle={{ color: summary.totalProfit >= 0 ? '#3f8600' : '#cf1322' }}
              />
            </div>
          </div>

          <Tabs defaultActiveKey="1">
            <TabPane tab="Full Inventory" key="1">
              <Table
                columns={columns}
                dataSource={stockData}
                loading={loading}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                scroll={{ x: 1500 }}
                size="middle"
                bordered
              />
            </TabPane>
            <TabPane tab="Low Stock Items" key="2">
              <Table
                columns={lowStockColumns}
                dataSource={summary.lowStockItems}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                bordered
              />
            </TabPane>
          </Tabs>
        </Spin>
      </div>
    </AdminLayout>
  );
}
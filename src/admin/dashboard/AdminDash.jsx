import React, { useEffect, useState } from "react";
import Layout from "../layout/Layout";
import { useGetSummaryQuery } from "../../api/req/ApiOrder";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import MetaData from "../../components/meta/MetaData";

const AdminDash = () => {
  const [chartData, setChartData] = useState([]);
  const { data, isLoading } = useGetSummaryQuery();

  useEffect(() => {
    if (data && data.length > 0) {
      const formatted = data?.map((item) => ({
        order_date: new Date(item.order_date).toLocaleDateString("id-ID"),
        total_price: parseFloat(item.total_price),
      }));

      setChartData(formatted.reverse());
    }
  }, [data]);
  return (
    <Layout pageName={"Dashboard"}>
      <MetaData title={"Admin - Dashboard"} />
      <div className="bg-white p-4 border shadow rounded orverflow-auto">
        <p className="mb-4 h6 text-center">
          Laporan keuangan 7 hari kebelakang
        </p>
        {isLoading ? (
          "Loading..."
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={500}>
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="order_date" />
              <YAxis tickFormatter={(value) => value.toLocaleString("id-ID")} />
              <Tooltip
                formatter={(value) => `Rp ${value.toLocaleString("id-ID")}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="total_price"
                stroke="#00bcd4"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p>Tidak ada data yang ditampilkan</p>
        )}
      </div>
    </Layout>
  );
};

export default AdminDash;

import React, { Fragment, useState } from "react";
import Layout from "../layout/Layout";
import TableComponent from "../table/TableComponent";
import { useGetProfitQuery } from "../../api/req/ApiOrder";
import MetaData from "../../components/meta/MetaData";

const AdminReport = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const { data: rawData = {} } = useGetProfitQuery({ page, limit, search });
  const { result = [], totalData, totalPages, grandProfit } = rawData;

  return (
    <Layout pageName={"Laporan"}>
      <MetaData title={"Admin - Laporan"} />
      <TableComponent
        height={"75vh"}
        page={page}
        setPage={(e) => setPage(e)}
        setLimit={(e) => setLimit(e)}
        setSearch={(e) => setSearch(e)}
        totalData={totalData}
        totalPages={totalPages}
      >
        <table className="table table-border table-striped table-hover">
          <thead>
            <tr>
              <th>No</th>
              <th>Kode Transaksi</th>
              <th>Produk</th>
              <th>Penjualan</th>
              <th>Modal</th>
              <th>Profit</th>
              <th>Total Profit</th>
            </tr>
          </thead>
          <tbody>
            {result?.map((item, i) => (
              <Fragment key={i}>
                {item?.products?.map((product, index) => (
                  <tr key={index}>
                    {index === 0 && (
                      <>
                        <td rowSpan={item?.products?.length || 1}>
                          {(page - 1) * limit + i + 1}
                        </td>
                        <td rowSpan={item?.products?.length || 1}>
                          {item?.transaction_id}
                        </td>
                      </>
                    )}
                    <td>{product?.name || "-"}</td>
                    <td>
                      {product?.price
                        ? parseFloat(product?.price).toLocaleString("id-ID", {
                            style: "currency",
                            currency: "IDR",
                          })
                        : "Rp 0"}
                    </td>
                    <td>
                      {product?.capital
                        ? parseFloat(product?.capital).toLocaleString("id-ID", {
                            style: "currency",
                            currency: "IDR",
                          })
                        : "Rp 0"}
                    </td>
                    <td>
                      {product?.profit
                        ? parseFloat(product?.profit).toLocaleString("id-ID", {
                            style: "currency",
                            currency: "IDR",
                          })
                        : "Rp 0"}
                    </td>
                    {index === 0 && (
                      <td rowSpan={item?.products?.length || 1}>
                        {item?.total_profit
                          ? parseFloat(item?.total_profit).toLocaleString(
                              "id-ID",
                              {
                                style: "currency",
                                currency: "IDR",
                              }
                            )
                          : "Rp 0"}
                      </td>
                    )}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>

          <tfoot>
            <tr>
              <td colSpan={7}>
                <p className="m-0">
                  Total Penjualan{" "}
                  <strong>
                    {grandProfit
                      ? parseFloat(grandProfit).toLocaleString("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        })
                      : "Rp 0"}
                  </strong>
                </p>
              </td>
            </tr>
          </tfoot>
        </table>
      </TableComponent>
    </Layout>
  );
};

export default AdminReport;

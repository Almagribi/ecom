import React, { useEffect, useState } from "react";
import Layout from "../layout/Layout";
import TableComponent from "../table/TableComponent";
import {
  useDeleteProductMutation,
  useGetProductsQuery,
} from "../../api/req/ApiProduct";
import Modal from "./Modal";
import { toast } from "react-toastify";
import Images from "./Images";
import MetaData from "../../components/meta/MetaData";

const AdminProd = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [product, setProduct] = useState({});
  const id = "product";
  const [images, setImages] = useState([]);

  const { data: rawData = {}, isLoading } = useGetProductsQuery({
    search,
    page,
    limit,
  });
  const { totalProducts, totalPages, products = [] } = rawData;
  const [deleteProduct, { data, isSuccess, isLoading: delLoad, error, reset }] =
    useDeleteProductMutation();

  useEffect(() => {
    if (isSuccess) {
      toast.success(data.message);

      reset();
    }

    if (error) {
      toast.error(error.data.message);
      reset();
    }
  }, [data, isSuccess, error]);
  return (
    <Layout pageName={"Daftar Produk"}>
      <MetaData title={"Admin - Produk"} />
      <TableComponent
        height={"75vh"}
        page={page}
        setPage={(e) => setPage(e)}
        setLimit={(e) => setLimit(e)}
        setSearch={(e) => setSearch(e)}
        totalData={totalProducts}
        totalPages={totalPages}
        id={id}
      >
        <table className="table table-hover table-striped">
          <thead>
            <tr>
              <th className="text-center align-middle">No</th>
              <th className="text-center align-middle">Kategori</th>
              <th className="text-center align-middle">Gambar</th>
              <th className="text-center align-middle">Produk</th>
              <th className="text-center align-middle">Modal</th>
              <th className="text-center align-middle">Harga</th>
              <th className="text-center align-middle">Stok</th>
              <th className="text-center align-middle">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td>Loading...</td>
              </tr>
            ) : (
              products?.map((item, i) => (
                <tr key={i}>
                  <td className="text-center align-middle">{i + 1}</td>
                  <td className="align-middle">{item.category.name}</td>
                  <td className="text-center align-middle">
                    <div
                      className="rounded overflow-hidden pointer"
                      style={{ height: 100, width: 100 }}
                      data-bs-toggle="modal"
                      data-bs-target="#images"
                      onClick={() => setImages(item.images)}
                    >
                      <img
                        src={item.images[0].link}
                        alt={`Gambar produk ${item.name}`}
                        width="100%"
                        height="100%"
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  </td>
                  <td className="text-center align-middle">
                    {item.name.length >= 26
                      ? item.name.slice(0, 26) + "..."
                      : item.name}
                  </td>
                  <td className="text-center align-middle">{`Rp ${parseFloat(
                    item.capital
                  ).toLocaleString("id-ID")}`}</td>
                  <td className="text-center align-middle">{`Rp ${parseFloat(
                    item.price
                  ).toLocaleString("id-ID")}`}</td>
                  <td className="text-center align-middle">{item.stock}</td>
                  <td className="text-center align-middle">
                    <div className="d-flex justify-content-center gap-2">
                      <button
                        className="btn btn-primary"
                        data-bs-toggle="modal"
                        data-bs-target={`#${id}`}
                        onClick={() => setProduct(item)}
                      >
                        Detail
                      </button>
                      <button
                        className="btn btn-danger"
                        disabled={delLoad}
                        onClick={() => deleteProduct(item.id)}
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </TableComponent>

      <Images images={images} close={() => setImages({})} />

      <Modal id={id} product={product} close={() => setProduct({})} />
    </Layout>
  );
};

export default AdminProd;

import React, { useEffect, useRef, useState } from "react";
import { useAddProductMutation } from "../../api/req/ApiProduct";
import { useGetCategoriesQuery } from "../../api/req/ApiCategory";
import { toast } from "react-toastify";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const elements = [
  { name: "name", type: "text", placeHolder: "Nama Product" },
  { name: "price", type: "text", placeHolder: "Harga Jual" },
  { name: "capital", type: "text", placeHolder: "Harga Beli" },
  { name: "stock", type: "number", placeHolder: "Stok Produk" },
  { name: "weight", type: "number", placeHolder: "Berat produk dalam gram" },
];

const formatCurrency = (value) => {
  if (!value) return "Rp 0";
  const number = value?.replace(/[^\d]/g, "");
  return `Rp ${parseInt(number).toLocaleString("id-ID")}`;
};

const parseCurrency = (value) => {
  return value?.replace(/[^\d]/g, "");
};
const Modal = ({ id, product, close }) => {
  const searchCat = "";
  const pageCat = "";
  const limitCat = "";

  const [categoryId, setCategoryId] = useState("");
  const [data, setData] = useState({
    name: "",
    price: "",
    capital: "",
    stock: "",
    weight: "",
  });
  const [images, setImages] = useState(null);
  const [value, setValue] = useState("");
  const fileInput = useRef(null);

  const { data: categories } = useGetCategoriesQuery({
    search: searchCat,
    page: pageCat,
    limit: limitCat,
  });
  const [addProduct, { data: msg, isSuccess, isLoading, error, reset }] =
    useAddProductMutation();

  const handleChage = (e) => {
    const { name, value } = e.target;

    if (name === "price" || name === "capital") {
      setData((prev) => ({
        ...prev,
        [name]: formatCurrency(value),
      }));
    } else {
      setData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const addHandler = () => {
    const formData = new FormData();
    formData.append("id", product ? product.id : "");
    formData.append("categoryId", categoryId);
    formData.append("name", data.name);
    formData.append("desc", value);
    formData.append("price", parseCurrency(data.price));
    formData.append("capital", parseCurrency(data.capital));
    formData.append("stock", data.stock);
    formData.append("weight", data.weight);
    if (images) {
      images.forEach((image) => formData.append("images", image));
    }

    addProduct(formData);
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(msg.message);
      setCategoryId("");
      setData({
        name: "",
        price: 0,
        capital: 0,
        stock: "",
        weight: "",
      });
      setValue("");

      fileInput.current.value = "";

      reset();
    }

    if (error) {
      toast.error(error.data.message);
      reset();
    }
  }, [msg, isSuccess, error]);

  useEffect(() => {
    if (product) {
      setData({
        name: product?.name,
        price: formatCurrency(product?.price),
        capital: formatCurrency(product?.capital),
        stock: product?.stock,
        weight: product?.weight,
      });
      setValue(product?.description);
      setCategoryId(product?.category_id);
    }
  }, [product]);

  useEffect(() => {
    const openModalButton = document.querySelector(`[data-bs-target="#${id}"]`);
    if (openModalButton) {
      openModalButton.focus();
    }
  });
  return (
    <div
      className="modal fade"
      id={id}
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabIndex="-1"
      aria-labelledby="staticBackdropLabel"
    >
      <div className="modal-dialog modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="staticBackdropLabel">
              Produk
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
              onClick={close}
            ></button>
          </div>
          <div className="modal-body">
            <div className="d-flex flex-column gap-4">
              <select
                name="category"
                id="category"
                className="form-select"
                required
                value={categoryId || ""}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="" hidden>
                  Pilih Kategori
                </option>
                {categories?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              {elements.map((item) => (
                <input
                  key={item.name}
                  name={item.name}
                  type={item.type}
                  className="form-control"
                  placeholder={item.placeHolder}
                  required
                  value={data[item.name] || ""}
                  onChange={handleChage}
                />
              ))}

              <input
                type="file"
                accept="image/*"
                className="form-control"
                multiple
                ref={fileInput}
                onChange={(e) => setImages([...e.target.files])}
              />

              <div style={{ height: 300 }} className="d-flex">
                <ReactQuill
                  className="react-quill border border-2 rounded"
                  placeholder="Deskripsi Produk"
                  theme="snow"
                  value={value}
                  onChange={setValue}
                  style={{ width: "100%" }}
                />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
              onClick={close}
            >
              Batal
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={isLoading}
              onClick={addHandler}
            >
              Simpan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;

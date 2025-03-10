import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useAddCartMutation } from "../api/req/ApiCart";

const Counter = ({ product }) => {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);

  const { isSignin, user } = useSelector((state) => state.auth);
  const [addCart, { data, isLoading, isSuccess, error, reset }] =
    useAddCartMutation();

  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleBuy = () => {
    if (!isSignin) {
      return toast.info("Silahkan Login terlebih dahulu!");
    }

    if (!user?.address.id) {
      return toast.info("Lengkapi profil dulu yuk");
    }

    const checkoutProduct = [
      {
        id: product.id,
        name: product.name,
        img: product.images[0].link,
        price: product.price,
        quantity,
        subtotal: price,
        stock: product.stock,
        weight: quantity * product.weight,
      },
    ];

    sessionStorage.setItem("checkout_product", JSON.stringify(checkoutProduct));

    navigate("/checkout");
  };

  const handleCart = () => {
    if (!isSignin) {
      return toast.info("Silahkan Login terlebih dahulu!");
    }

    const data = { product, quantity, price };

    addCart(data);
  };

  useEffect(() => {
    setPrice(quantity * product.price);
  }, [quantity]);

  useEffect(() => {
    if (product) {
      setPrice(product.price);
    }
  }, [product]);

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
    <div className="rounded p-2 bg-white border border-2 shadow w-100 d-flex flex-column gap-2">
      <p className="m-0 h6">Atur jumlah</p>

      <div className="d-flex align-items-center justify-content-between">
        <div className="d-flex gap-1 align-items-center p-1 rounded border">
          <button className="btn btn-pill btn-light" onClick={decreaseQuantity}>
            -
          </button>
          <p className="m-0 text-center text-secondary" style={{ width: 40 }}>
            {quantity}
          </p>
          <button className="btn btn-pill btn-light" onClick={increaseQuantity}>
            +
          </button>
        </div>

        <p className="m-0">
          Stok Total: <strong>{product.stock}</strong>
        </p>
      </div>

      <div className="d-flex align-items-center justify-content-between">
        <p className="m-0 fw-bold text-muted">Subtotal</p>
        <p className="m-0 fw-bold">{`Rp ${parseFloat(price).toLocaleString(
          "id-ID"
        )}`}</p>
      </div>

      <div className="d-flex justify-content-end gap-2">
        <button className="btn btn-outline-success" onClick={handleBuy}>
          Beli
        </button>
        <button
          className="btn btn-success"
          disabled={isLoading}
          onClick={handleCart}
        >
          + Keranjang
        </button>
      </div>
    </div>
  );
};

export default Counter;

import React, { useEffect, useState } from "react";
import {
  useAddCourierMutation,
  useDeleteCourierMutation,
} from "../../api/req/ApiApp";
import { toast } from "react-toastify";

const Courier = ({ data }) => {
  const [name, setName] = useState("");
  const [addCourier, { data: msg, isSuccess, isLoading, error, reset }] =
    useAddCourierMutation();
  const [
    deleteCourier,
    {
      data: delMsg,
      isSuccess: delSuccess,
      isLoading: delLoading,
      error: delError,
      reset: delReset,
    },
  ] = useDeleteCourierMutation();

  const addHandler = (e) => {
    e.preventDefault();

    const data = { name };

    addCourier(data);
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(msg.message);
      setName("");
      reset();
    }

    if (error) {
      toast.error(error.data.message);
      reset();
    }
  }, [msg, isSuccess, error]);

  useEffect(() => {
    if (delSuccess) {
      toast.success(delMsg.message);

      delReset();
    }

    if (delError) {
      toast.error(delError.data.message);
      delReset();
    }
  }, [delMsg, delSuccess, delError]);
  return (
    <div className="d-flex flex-column gap-2">
      <form onSubmit={addHandler} className="d-flex gap-2">
        <input
          type="text"
          name="courier"
          id="courier"
          className="form-control"
          placeholder="Nama Ekspedisi"
          value={name || ""}
          onChange={(e) => setName(e.target.value)}
        />

        <button type="submit" className="btn btn-success" disabled={isLoading}>
          Simpan
        </button>
      </form>
      <ul className="list-group">
        {data?.map((item) => (
          <li
            key={item.id}
            className="list-group-item d-flex align-items-center justify-content-between"
          >
            {item.name}

            <button
              className="btn btn-danger circle"
              disabled={delLoading}
              onClick={() => deleteCourier(item.id)}
            >
              <i className="bi bi-trash"></i>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Courier;

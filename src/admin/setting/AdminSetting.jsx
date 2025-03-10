import React, { useEffect, useState } from "react";
import Layout from "../layout/Layout";
import MetaData from "../../components/meta/MetaData";
import { useGetCitiesMutation } from "../../api/req/ApiAddress";
import { toast } from "react-toastify";
import Courier from "./Courier";
import { useEditAppMutation, useGetAppQuery } from "../../api/req/ApiApp";
import Logo from "./Logo";

const AdminSetting = () => {
  const { data: app } = useGetAppQuery();

  const [city, setCity] = useState("");
  const [cities, setCities] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    desc: "",
    origin_id: "",
    origin: "",
  });

  const [getCities, { data, isSuccess, isLoading, error, reset }] =
    useGetCitiesMutation();
  const [
    editApp,
    {
      data: msg,
      isSuccess: aSuccess,
      isLoading: aLoad,
      error: aError,
      reset: aReset,
    },
  ] = useEditAppMutation();

  const filteredResult = cities?.filter((item) =>
    item.subdistrict_name.toLowerCase().includes(search.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getCityData = () => getCities(city);

  const handleSave = () => {
    if (!selected?.id || !selected?.label) {
      toast.error("Pilih alamat terlebih dahulu!");
      return;
    }

    const data = {
      ...formData,
      origin_id: selected.id,
      origin: selected.label,
    };

    editApp(data);
  };

  useEffect(() => {
    if (aSuccess) {
      toast.success(msg.message);
      setFormData({
        name: "",
        desc: "",
        origin: "",
        origin_id: "",
      });
      aReset();
    }
    if (aError) {
      toast.error(aError.data.message);
      aReset();
    }
  }, [msg, aSuccess, aError, app]);

  useEffect(() => {
    if (isSuccess) {
      setCities(data);
      reset();
    }
    if (error) {
      toast.error(error.data.message);
    }
  }, [isSuccess, error, data]);

  useEffect(() => {
    if (app) {
      setFormData({
        name: app?.name,
        desc: app?.description,
        origin: app?.origin,
        origin_id: app?.origin_id,
      });
    }
  }, [app]);

  return (
    <Layout pageName={"Pengaturan"}>
      <MetaData title={"Admin - Pengaturan"} />
      <div
        className="container-fluid rounded bg-white p-2 border border-2 shadow overflow-auto"
        style={{ height: "80vh" }}
      >
        <div className="d-flex flex-column gap-3">
          <p className="m-0 h5">Logo Aplikasi</p>
          <Logo logo={app?.logo} />

          <p className="m-0 h5">Detail Aplikasi</p>
          <div className="input-group">
            <span className="input-group-text" style={{ width: 150 }}>
              Nama Aplikasi
            </span>
            <input
              type="text"
              className="form-control"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          <div className="input-group">
            <span className="input-group-text" style={{ width: 150 }}>
              Meta Data
            </span>
            <textarea
              className="form-control"
              placeholder="Penjelasan Toko"
              rows={3}
              name="desc"
              value={formData.desc}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="input-group">
            <span className="input-group-text" style={{ width: 150 }}>
              Alamat Toko
            </span>
            <input
              type="text"
              className="form-control"
              name="name"
              value={app?.origin || ""}
              readOnly
            />
          </div>

          <div className="d-flex align-items-center gap-2">
            <div className="input-group">
              <span className="input-group-text" style={{ width: 150 }}>
                Nama Kota
              </span>
              <input
                type="text"
                className="form-control"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <button
              className="btn btn-info"
              disabled={isLoading}
              onClick={getCityData}
            >
              Cari
            </button>
          </div>
          {cities.length > 0 && (
            <>
              <div className="input-group">
                <span className="input-group-text">Nama Kecamatan</span>
                <input
                  type="text"
                  className="form-control"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select
                className="form-select"
                onChange={(e) => {
                  const finding = filteredResult.find(
                    (item) => item.id === e.target.value
                  );
                  setSelected(finding);
                }}
              >
                <option value="" hidden>
                  Pilih Alamat
                </option>
                {filteredResult.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
              <div className="text-end">
                <button
                  className="btn btn-success"
                  disabled={aLoad}
                  onClick={handleSave}
                >
                  Simpan
                </button>
              </div>
            </>
          )}

          <p className="m-0 h5">Ekspedisi</p>
          <Courier data={app?.couriers} />
        </div>
      </div>
    </Layout>
  );
};

export default AdminSetting;

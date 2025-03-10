import express from "express";
import { client } from "../config/connection.js";
import { authorize } from "../middleware/Authorize.js";

const api = process.env.BINDER_API;

const router = express.Router();

router.get(
  "/get-cities/:city",
  authorize("user", "admin"),
  async (req, res) => {
    try {
      const options = {
        method: "GET",
        headers: {
          accept: "application/json",
          key: process.env.API,
        },
      };

      const response = await fetch(
        `https://rajaongkir.komerce.id/api/v1/destination/domestic-destination?search=${req.params.city}&limit=1000000`,
        options
      );

      const data = await response.json();

      // const sorted = data.data.sort((a, b) =>
      //   a.province_name.localeCompare(b.province_name)
      // );
      res.status(200).json(data.data);
    } catch (error) {
      console.log(error);
      res.status(200).json({ message: error.message });
    }
  }
);

router.get("/cost", authorize("user"), async (req, res) => {
  try {
    const { courier, origin = "8122", destination, weight } = req.query;

    const data = new URLSearchParams();
    data.append("courier", courier);
    data.append("origin", origin);
    data.append("destination", destination);
    data.append("weight", weight);

    const options = {
      method: "POST",
      headers: {
        accept: "application/x-www-form-urlencoded",
        key: process.env.API,
        "content-type": "application/x-www-form-urlencoded",
      },
      body: data.toString(),
    };

    const response = await fetch(
      "https://rajaongkir.komerce.id/api/v1/calculate/domestic-cost",
      options
    );

    const service = await response.json();

    res.status(200).json(service.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/get-provinces", authorize("user"), async (req, res) => {
  try {
    const response = await fetch(
      `https://api.binderbyte.com/wilayah/provinsi?api_key=${api}`
    );

    const data = await response.json();

    const sorted = data.value.sort((a, b) => a.name.localeCompare(b.name));
    res.status(200).json(sorted);
  } catch (error) {
    console.log(error);
  }
});

router.get("/get-cities/:provinceId", authorize("user"), async (req, res) => {
  try {
    const { provinceId } = req.params;

    const response = await fetch(
      `https://api.binderbyte.com/wilayah/kabupaten?api_key=${api}&id_provinsi=${provinceId}`
    );

    const data = await response.json();

    const sorted = data.value.sort((a, b) => a.name.localeCompare(b.name));
    res.status(200).json(sorted);
  } catch (error) {
    console.log(error);
  }
});

router.get("/get-districts/:cityId", authorize("user"), async (req, res) => {
  try {
    const { cityId } = req.params;

    const response = await fetch(
      `https://api.binderbyte.com/wilayah/kecamatan?api_key=${api}&id_kabupaten=${cityId}`
    );

    const data = await response.json();

    const sorted = data.value.sort((a, b) => a.name.localeCompare(b.name));
    res.status(200).json(sorted);
  } catch (error) {
    console.log(error);
  }
});

router.get("/get-villages/:districtId", authorize("user"), async (req, res) => {
  try {
    const { districtId } = req.params;

    const response = await fetch(
      `https://api.binderbyte.com/wilayah/kelurahan?api_key=${api}&id_kecamatan=${districtId}`
    );

    const data = await response.json();

    const sorted = data.value.sort((a, b) => a.name.localeCompare(b.name));
    res.status(200).json(sorted);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/add", authorize("user"), async (req, res) => {
  try {
    const {
      id,
      data_id,
      label,
      province_name,
      city_name,
      district_name,
      subdistrict_name,
      zip_code,
      detail,
    } = req.body;
    const user_id = req.user.id;

    if (id) {
      await client.query(
        `UPDATE address SET
            data_id = $1, label = $2, province_name = $3, city_name = $4,
            district_name = $5, subdistrict_name = $6, zip_code = $7, 
            detail = $8 WHERE id = $9`,
        [
          data_id,
          label,
          province_name,
          city_name,
          district_name,
          subdistrict_name,
          zip_code,
          detail,
          id,
        ]
      );
    } else {
      await client.query(
        `INSERT INTO 
        address(user_id, data_id, label, province_name, city_name, 
        district_name, subdistrict_name, zip_code, detail)
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          user_id,
          data_id,
          label,
          province_name,
          city_name,
          district_name,
          subdistrict_name,
          zip_code,
          detail,
        ]
      );
    }

    res
      .status(201)
      .json({ message: id ? "Berhasil diperbarui" : "Berhasil disimpan" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/get-address", authorize("user"), async (req, res) => {
  try {
    const data = await client.query(
      `SELECT * FROM address WHERE user_id = $1`,
      [req.user.id]
    );

    const address = data.rows;

    res.status(200).json(address);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

router.delete("/delete-address/:id", authorize("user"), async (req, res) => {
  try {
    await client.query(`DELETE FROM address WHERE id = $1`, [req.params.id]);

    res.status(200).json({ message: "Berhasil dihapus" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

export default router;

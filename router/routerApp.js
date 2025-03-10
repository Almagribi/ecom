import express from "express";
import { client } from "../config/connection.js";
import { authorize } from "../middleware/Authorize.js";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./assets");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = uuidv4();
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/\s+/g, "-");
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({ storage: storage });

const router = express.Router();

router.get("/detail-app", async (req, res) => {
  try {
    const id = 1;

    const data = await client.query(
      `SELECT app.id AS app_id, app.name, app.description, app.origin, app.origin_id, app.logo,
              courier.id AS courier_id, courier.name AS courier_name
       FROM app 
       LEFT JOIN courier ON app.id = courier.app_id
       WHERE app.id = $1`,
      [id]
    );

    if (data.rows.length === 0) {
      return res.status(404).json({ message: "App not found" });
    }

    const appData = {
      name: data.rows[0].name,
      description: data.rows[0].description,
      origin: data.rows[0].origin,
      origin_id: data.rows[0].origin_id,
      logo: data.rows[0].logo,
      couriers: data.rows
        .map((row) => ({
          id: row.courier_id,
          name: row.courier_name,
        }))
        .filter((courier) => courier.id), // Menghindari courier null jika tidak ada data
    };

    res.status(200).json(appData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/edit-app", authorize("admin"), async (req, res) => {
  try {
    const { name, desc, origin_id, origin } = req.body;
    const id = 1;

    await client.query(
      `UPDATE app 
        SET name = $1, description = $2, origin_id = $3, origin = $4
        WHERE id = $5`,
      [name, desc, origin_id, origin, id]
    );

    res.status(200).json({ message: "Berhasil diperbarui" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

router.put(
  "/upload-logo",
  authorize("admin"),
  upload.single("image"),
  async (req, res) => {
    try {
      const id = 1;

      const image = `${process.env.URL}/assets/${req.file.filename}`;
      await client.query(
        `UPDATE app 
        SET logo = $1  WHERE id = $2`,
        [image, id]
      );

      res.status(200).json({ message: "Logo berhasil diperbarui" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  }
);

router.post("/add-courier", authorize("admin"), async (req, res) => {
  try {
    const appid = 1;

    await client.query(
      `INSERT INTO courier(app_id, name)
        VALUES($1, $2) RETURNING *`,
      [appid, req.body.name]
    );

    res.status(200).json({ message: "Ekspedisi berhasil disimpan" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

router.delete("/delete-courier/:id", authorize("admin"), async (req, res) => {
  try {
    const { id } = req.params;

    await client.query(`DELETE FROM courier WHERE id = ${id}`);

    res.status(200).json({ message: "Berhasil dihapus" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

export default router;

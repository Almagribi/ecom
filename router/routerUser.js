import express from "express";
import { client } from "../config/connection.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authorize } from "../middleware/Authorize.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    bcrypt.hash(password, 10, async function (err, hash) {
      // Store hash in your password DB.
      if (err) {
        return res.status(500).json({ message: err.message });
      } else {
        const data = await client.query(
          `INSERT INTO users (name, email, password, phone)
                VALUES ($1, $2, $3, $4) RETURNING *`,
          [name, email, hash, phone]
        );

        const user = data.rows[0];

        res.status(201).json({ message: "Pendaftaran Berhasil", user });
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const data = await client.query(`SELECT * FROM users WHERE email = $1`, [
      email,
    ]);

    if (data.rowCount === 0) {
      return res.status(404).json({ message: "Email tidak ditemukan." });
    }

    const user = data.rows[0];

    bcrypt.compare(password, user.password, (err, result) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }

      if (!result) {
        return res.status(400).json({ message: "Password Salah" });
      }

      const token = jwt.sign(
        { id: user.id, level: user.level },
        process.env.KEY,
        { expiresIn: "7d" }
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.status(200).json({ message: "Berhasil login", user });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/get-users", authorize("admin"), async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const data = await client.query(
      `SELECT * FROM users WHERE level = 'user' 
        AND (name ILIKE $1 OR email ILIKE $1)
        ORDER BY createdat ASC LIMIT $2 OFFSET $3`,
      [`%${search}%`, limit, offset]
    );

    const countData = await client.query(
      `SELECT count(*) AS total FROM users WHERE level = 'user' AND name ILIKE $1`,
      [`%${search}%`]
    );

    const totalUsers = parseInt(countData.rows[0].total);
    const totalPages = Math.ceil(totalUsers / limit);
    const users = data.rows;

    res.status(200).json({ totalUsers, totalPages, users });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/get-user/:id", authorize("admin"), async (req, res) => {
  try {
    const { id } = req.params;

    const data = await client.query(
      `SELECT users.name, users.email, users.level, users.phone, users.id,
        jsonb_build_object(
          'id', address.id,
          'province_id', address.province_id,
          'province', address.province,
          'city_id', address.city_id, 
          'city', address.city, 
          'district_id', address.district_id, 
          'district', address.district,
          'village_id', address.village_id,
          'village', address.village, 
          'detail', address.detail
        ) AS address
       FROM users
       LEFT JOIN address ON users.id = address.user_id
       WHERE users.id = $1`,
      [id]
    );

    const user = data.rows[0];

    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/load-user", authorize("user", "admin"), async (req, res) => {
  try {
    const data = await client.query(
      `SELECT users.name, users.email, users.level, users.phone, users.id,
        jsonb_build_object(
          'id', address.id,
          'data_id', address.data_id,
          'label', address.label,
          'province_name', address.province_name, 
          'city_name', address.city_name, 
          'district_name', address.district_name, 
          'subdistrict_name', address.subdistrict_name,
          'zip_code', address.zip_code,
          'detail', address.detail
        ) AS address
       FROM users
       LEFT JOIN address ON users.id = address.user_id
       WHERE users.id = $1`,
      [req.user.id]
    );

    const user = data.rows[0];

    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

router.delete("/delete-user/:id", authorize("admin"), async (req, res) => {
  try {
    await client.query(`DELETE FROM users WHERE id = $1`, [req.params.id]);

    res.status(200).json({ message: "Berhasil dihapus" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

router.put("/update-profile", authorize("user"), async (req, res) => {
  try {
    const { name, email, phone, oldPassword, newPassword } = req.body;

    await client.query(
      `UPDATE users SET name = $1, email = $2, phone = $3 WHERE id = $4`,
      [name, email, phone, req.user.id]
    );

    if (oldPassword && newPassword) {
      const result = await client.query(
        `SELECT password from users WHERE id = $1`,
        [req.user.id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ message: "User tidak ditemukan" });
      }

      const user = result.rows[0];

      const isMatch = await bcrypt.compare(oldPassword, user.password);

      if (!isMatch) {
        return res.status(400).json({ message: "Password lama tidak sesuai" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await client.query(`UPDATE users SET password = $1 WHERE id = $2`, [
        hashedPassword,
        req.user.id,
      ]);
    }

    res.status(200).json({ message: "Berhasil diperbarui" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/logout", (req, res) => {
  try {
    res.cookie("token", "", { httpOnly: true, expires: new Date(0) });

    res.status(200).json({ message: "Berhasil keluar" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

export default router;

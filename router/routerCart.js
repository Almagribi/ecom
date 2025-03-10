import express from "express";
import { authorize } from "../middleware/Authorize.js";
import { client } from "../config/connection.js";

const router = express.Router();

router.post("/add-cart", authorize("user"), async (req, res) => {
  try {
    const { product, quantity, price } = req.body;

    const userid = req.user.id;

    const checkUser = await client.query(
      `SELECT * FROM cart WHERE user_id = ${userid}`
    );

    if (checkUser.rowCount > 0) {
      await client.query(
        `INSERT INTO
        cart_items(cart_id, product_id, quantity, price)
        VALUES($1, $2, $3, $4)`,
        [checkUser.rows[0].id, product.id, quantity, price]
      );
    } else {
      const cart = await client.query(
        `INSERT INTO
        cart(user_id) VALUES($1) RETURNING *`,
        [userid]
      );

      const cartId = cart.rows[0].id;

      await client.query(
        `INSERT INTO
        cart_items(cart_id, product_id, quantity, price)
        VALUES($1, $2, $3, $4)`,
        [cartId, product.id, quantity, price]
      );
    }

    res.status(200).json({ message: "Berhasil disimpan" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/get-cart", authorize("user"), async (req, res) => {
  try {
    const userid = req.user.id;
    const level = req.user.level;

    const data = await client.query(
      `SELECT cart.*,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', product.id,
              'name', product.name,
              'quantity', cart_items.quantity,
              'price', cart_items.price,
              'weight', product.weight,
              'stock', product.stock,
              'images', COALESCE(image_data.images, '[]')
            )
          ) FILTER (WHERE product.id IS NOT NULL), '[]'
        ) AS cart
      FROM cart
      INNER JOIN cart_items ON cart.id = cart_items.cart_id
      INNER JOIN product ON cart_items.product_id = product.id
      LEFT JOIN (
        SELECT product_id, json_agg(image.link) AS images
        FROM image
        GROUP BY product_id
      ) AS image_data ON product.id = image_data.product_id
      WHERE cart.user_id = $1
      GROUP BY cart.id`,
      [userid]
    );

    const cart = data.rows[0];

    res.status(200).json(cart);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

router.delete("/delete-cart/:id", authorize("user"), async (req, res) => {
  try {
    const { id } = req.params;

    await client.query(`DELETE FROM cart WHERE id = $1`, [id]);

    res.status(200).json({ message: "Berhasil dihapus" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

export default router;

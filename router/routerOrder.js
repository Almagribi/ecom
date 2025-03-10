import express from "express";
import axios from "axios";
import { authorize } from "../middleware/Authorize.js";
import { nanoid } from "nanoid";
import { client } from "../config/connection.js";

const router = express.Router();

const config = {
  authorization: `Basic ${Buffer.from(
    process.env.MID_SERVER_KEY + ":"
  ).toString("base64")}`,
};

router.post("/create-order", authorize("user"), async (req, res) => {
  try {
    const { products, gross_amount, shipping } = req.body;
    const user = req.user;
    const productsData = products;

    const orderid = `ORDER-${nanoid(5)}-${nanoid(5)}`;

    await client.query("BEGIN");

    const rawData = await client.query(
      `INSERT INTO
      orders(transaction_id, user_id, gross_amount)
      VALUES($1, $2, $3) RETURNING *`,
      [orderid, user.id, gross_amount]
    );
    const order = rawData.rows[0];

    for (const product of productsData) {
      await client.query(
        `INSERT INTO
        order_items(order_id, product_id, quantity, price, shipping)
        VALUES($1, $2, $3, $4, $5)`,
        [order.id, product.id, product.quantity, product.price, shipping]
      );
    }

    await client.query("COMMIT");

    const data = {
      customer_details: {
        first_name: user.name,
        email: user.email,
        phone: user.phone,
      },
      transaction_details: { order_id: orderid, gross_amount: gross_amount },
      credit_card: { secure: true },
      callbacks: {
        finish: `${process.env.DOMAIN_1}/user-transaksi`,
      },
    };

    const response = await axios.post(
      `${process.env.MID_BASE_URL}/snap/v1/transactions`,
      data,
      { headers: config }
    );

    res.status(201).json(response.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

const updateStatusOrder = async (status, orderid) => {
  console.log(status, orderid);

  await client.query(
    `UPDATE orders SET transaction_status = $1 WHERE transaction_id = $2`,
    [status, orderid]
  );
};

router.post("/transaction-notification", async (req, res) => {
  try {
    const data = req.body;

    let orderId = data.order_id;
    let transactionStatus = data.transaction_status;
    let fraudStatus = data.fraud_status;

    // Sample transactionStatus handling logic

    if (transactionStatus == "capture") {
      if (fraudStatus == "accept") {
        // TODO set transaction status on your database to 'success'
        // and response with 200 OK
        updateStatusOrder(transactionStatus, orderId);
      }
    } else if (transactionStatus == "settlement") {
      // TODO set transaction status on your database to 'success'
      // and response with 200 OK
      updateStatusOrder(transactionStatus, orderId);
    } else if (
      transactionStatus == "cancel" ||
      transactionStatus == "deny" ||
      transactionStatus == "expire"
    ) {
      // TODO set transaction status on your database to 'failure'
      // and response with 200 OK
      updateStatusOrder(transactionStatus, orderId);
    } else if (transactionStatus == "pending") {
      // TODO set transaction status on your database to 'pending' / waiting payment
      // and response with 200 OK
      updateStatusOrder(transactionStatus, orderId);
    }

    res.status(200).json({ status: "success", message: "OK" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

router.put("/confirm/:id", authorize("admin"), async (req, res) => {
  try {
    const { id } = req.params;

    const status = "processing";

    const checkOrder = await client.query(
      `SELECT * FROM order_items WHERE order_id = $1`,
      [id]
    );
    const order = checkOrder.rows[0];

    const checkProduct = await client.query(
      `SELECT * FROM product WHERE id = $1`,
      [order.product_id]
    );
    const product = checkProduct.rows[0];

    const updateStock = product.stock - order.quantity;

    await client.query(`UPDATE product SET stock = $1 WHERE id = $2`, [
      updateStock,
      product.id,
    ]);

    await client.query(`UPDATE orders SET status_order = $1 WHERE id = $2`, [
      status,
      id,
    ]);

    res.status(200).json({ message: "Order diproses" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

router.put("/give-resi", authorize("admin"), async (req, res) => {
  try {
    const { resi, id } = req.body;
    const status = "shipping";

    await client.query(
      `UPDATE orders SET resi = $1, status_order = $2  WHERE id = $3`,
      [resi, status, id]
    );

    res.status(200).json({ message: "Berhasil diperbarui" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

router.put("/cancel/:id", authorize("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const status = "cancel";

    await client.query(`UPDATE orders SET status_order = $1  WHERE id = $2`, [
      status,
      id,
    ]);

    res.status(200).json({ message: "Berhasil diperbarui" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/get-orders", authorize("admin", "user"), async (req, res) => {
  try {
    const level = req.user.level;
    const userid = req.user.id;
    const { search = "", page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Query total data count
    const countQuery = `
      SELECT COUNT(DISTINCT orders.id) AS total FROM orders 
      INNER JOIN users ON orders.user_id = users.id
      WHERE orders.transaction_id ILIKE $1 OR users.name ILIKE $1`;

    const countResult = await client.query(countQuery, [`%${search}%`]);
    const totalData = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalData / limit);

    // Query untuk mengambil data order dengan pagination
    let baseQuery = `
      SELECT orders.id AS order_id, orders.transaction_id, orders.transaction_status, orders.status_order, orders.resi,
             orders.gross_amount, orders.createdat,
             users.id AS user_id, users.name AS user_name, users.email, users.phone,
             address.province_name, address.city_name, address.district_name, address.subdistrict_name, address.detail,
             COALESCE(json_agg(DISTINCT jsonb_build_object(
                'id', product.id,
                'name', product.name,
                'quantity', order_items.quantity,
                'price', order_items.price,
                'capital', order_items.quantity * product.capital,
                'profit', (order_items.price - (order_items.quantity * product.capital)),
                'shipping', order_items.shipping
             )) FILTER (WHERE product.id IS NOT NULL), '[]') AS products
      FROM orders
      INNER JOIN users ON orders.user_id = users.id
      LEFT JOIN order_items ON orders.id = order_items.order_id
      LEFT JOIN product ON order_items.product_id = product.id
      LEFT JOIN address ON users.id = address.user_id
      WHERE (orders.transaction_id ILIKE $1 OR users.name ILIKE $1)`;

    let params = [`%${search}%`];

    if (level !== "admin") {
      baseQuery += " AND orders.user_id = $2";
      params.push(userid);
    }

    baseQuery += `
      GROUP BY orders.id, users.id, address.id 
      ORDER BY orders.createdat DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const data = await client.query(baseQuery, params);
    const rawData = data.rows;

    const orders = rawData.map((order) => {
      const totalProfit = order.products.reduce((sum, product) => {
        return sum + (level !== "admin" ? 0 : product.profit);
      }, 0);

      return {
        id: order.order_id,
        transaction_id: order.transaction_id,
        transaction_status: order.transaction_status,
        status_order: order.status_order,
        resi: order.resi,
        user: {
          user_id: order.user_id,
          name: order.user_name,
          email: order.email,
          phone: order.phone,
        },
        product: order.products.map((product) => ({
          id: product.id,
          name: product.name,
          quantity: product.quantity,
          shipping: product.shipping,
          price: product.price,
          capital: level !== "admin" ? null : product.capital,
          profit: level !== "admin" ? null : product.profit,
        })),
        gross_amount: Number(order.gross_amount),
        totalProfit: level !== "admin" ? null : totalProfit,
        address: {
          province: order.province_name,
          city: order.city_name,
          district: order.district_name,
          village: order.subdistrict_name,
          detail: order.detail,
          shipping: Number(order.shipping),
        },
        createdat: order.createdat,
      };
    });

    res.status(200).json({
      orders,
      totalData,
      totalPages,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/get-profit", authorize("admin"), async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const offset = (page - 1) * limit;

    const countResult = await client.query(
      `SELECT COUNT(*) FROM orders WHERE transaction_id ILIKE $1`,
      [`%${search}%`]
    );
    const totalData = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalData / limit);

    const trxResult = await client.query(
      `SELECT id, transaction_id FROM orders WHERE transaction_id ILIKE $1 LIMIT $2 OFFSET $3`,
      [`%${search}%`, limit, offset]
    );
    const trxs = trxResult.rows;

    let result = [];

    for (let trx of trxs) {
      const orderItemsResult = await client.query(
        `SELECT order_items.product_id,
        order_items.quantity, product.name, product.price, product.capital, product.profit
        FROM order_items
        JOIN product ON order_items.product_id = product.id
        WHERE order_items.order_id = $1`,
        [trx.id]
      );

      const products = orderItemsResult.rows.map((item) => ({
        name: item.name,
        price: item.price,
        capital: item.capital,
        profit: item.profit * item.quantity,
      }));

      const totalProfit = products.reduce((acc, item) => acc + item.profit, 0);

      result.push({
        transaction_id: trx.transaction_id,
        products,
        total_profit: totalProfit,
      });
    }

    const grandProfit = result.reduce(
      (acc, item) => acc + Number(item.total_profit),
      0
    );

    res.status(200).json({ result, totalData, totalPages, grandProfit });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/order-summary", authorize("admin"), async (req, res) => {
  try {
    const data = await client.query(`
      SELECT DATE(orders.createdat) AS order_date, SUM(order_items.price) AS total_price 
      FROM orders
      JOIN order_items ON orders.id = order_items.order_id
      WHERE orders.transaction_status = 'settlement'
      AND orders.createdat >= NOW() - INTERVAL '7 days'
      GROUP BY order_date ORDER BY order_date DESC`);

    res.status(200).json(data.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

export default router;

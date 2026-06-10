const db = require("../config/db");

exports.getCustomers = (req, res) => {
  db.query(
    `SELECT
      c.id,
      c.full_name,
      c.phone,
      c.email,
      c.address,
      c.citizen_id,
      c.created_at,
      COUNT(b.id) AS booking_count,
      COALESCE(SUM(CASE WHEN b.status IN ('Đã xác nhận', 'Đã Check-in', 'Đang ở') THEN b.total_amount ELSE 0 END), 0) AS total_spent,
      MAX(b.created_at) AS last_booking_date
    FROM customers c
    LEFT JOIN bookings b ON b.customer_id = c.id
    GROUP BY c.id, c.full_name, c.phone, c.email, c.address, c.citizen_id, c.created_at`,
    (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }
      res.json(results);
    }
  );
};

exports.getCustomerById = (req, res) => {
  const id = Number(req.params.id);
  db.query(
    `SELECT id, full_name, phone, email, address, citizen_id, created_at FROM customers WHERE id = ?`,
    [id],
    (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }
      if (!results.length) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      res.json(results[0]);
    }
  );
};

exports.createCustomer = (req, res) => {
  const { full_name, phone, email, address, citizen_id } = req.body;
  db.query(
    `INSERT INTO customers (full_name, phone, email, address, citizen_id) VALUES (?, ?, ?, ?, ?)`,
    [full_name, phone || null, email || null, address || null, citizen_id || null],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }
      const newCustomer = {
        id: result.insertId,
        full_name,
        phone,
        email,
        address,
        citizen_id,
        created_at: new Date().toISOString(),
      };
      res.status(201).json(newCustomer);
    }
  );
};

exports.updateCustomer = (req, res) => {
  const id = Number(req.params.id);
  const { full_name, phone, email, address, citizen_id } = req.body;
  db.query(
    `UPDATE customers SET full_name = ?, phone = ?, email = ?, address = ?, citizen_id = ? WHERE id = ?`,
    [full_name, phone || null, email || null, address || null, citizen_id || null, id],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      res.json({ id, full_name, phone, email, address, citizen_id });
    }
  );
};

exports.deleteCustomer = (req, res) => {
  const id = Number(req.params.id);
  db.query(
    `DELETE FROM customers WHERE id = ?`,
    [id],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      res.status(204).send();
    }
  );
};

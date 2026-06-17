const pool = require("../config/db");

const getManagerCompanyId = async (managerId) => {
  const [companies] = await pool.query("SELECT id FROM waste_companies WHERE manager_id = ?", [managerId]);
  return companies[0]?.id;
};

const createTruck = async (req, res) => {
  const { truck_number_plate, truck_capacity, driver_id, status = "active" } = req.body;
  const companyId = await getManagerCompanyId(req.user.id);

  if (!companyId) return res.status(400).json({ message: "Create a company profile first" });
  if (!truck_number_plate) return res.status(400).json({ message: "Truck number plate is required" });

  const [result] = await pool.query(
    "INSERT INTO trucks (company_id, truck_number_plate, truck_capacity, driver_id, status) VALUES (?, ?, ?, ?, ?)",
    [companyId, truck_number_plate, truck_capacity || null, driver_id || null, status]
  );

  res.status(201).json({ message: "Truck created", id: result.insertId });
};

const getCompanyTrucks = async (req, res) => {
  const companyId = await getManagerCompanyId(req.user.id);
  if (!companyId) return res.json([]);

  const [trucks] = await pool.query(
    `SELECT t.*, u.full_name AS driver_name
     FROM trucks t
     LEFT JOIN users u ON u.id = t.driver_id
     WHERE t.company_id = ?
     ORDER BY t.created_at DESC`,
    [companyId]
  );
  res.json(trucks);
};

const updateTruck = async (req, res) => {
  const { truck_number_plate, truck_capacity, driver_id, status } = req.body;
  const companyId = await getManagerCompanyId(req.user.id);

  const [result] = await pool.query(
    `UPDATE trucks
     SET truck_number_plate = ?, truck_capacity = ?, driver_id = ?, status = ?
     WHERE id = ? AND company_id = ?`,
    [truck_number_plate, truck_capacity || null, driver_id || null, status || "active", req.params.id, companyId]
  );

  if (!result.affectedRows) return res.status(404).json({ message: "Truck not found" });
  res.json({ message: "Truck updated" });
};

const deleteTruck = async (req, res) => {
  const companyId = await getManagerCompanyId(req.user.id);
  const [result] = await pool.query("DELETE FROM trucks WHERE id = ? AND company_id = ?", [req.params.id, companyId]);
  if (!result.affectedRows) return res.status(404).json({ message: "Truck not found" });
  res.json({ message: "Truck deleted" });
};

module.exports = { createTruck, getCompanyTrucks, updateTruck, deleteTruck };

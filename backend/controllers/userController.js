const { User } = require('../models');
const bcrypt = require('bcryptjs');

async function create(req, res) {
  try {
    const { nama, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ nama, password: hash });
    res.json({ id: user.id, nama: user.nama });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getAllData(req, res) {
  try {
    const list = await User.findAll({ attributes: ['id', 'nama'] });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getDataById(req, res) {
  try {
    const item = await User.findByPk(req.params.id, { attributes: ['id', 'nama'] });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function update(req, res) {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Not found' });
    const data = req.body;
    if (data.password) data.password = await bcrypt.hash(data.password, 10);
    await user.update(data);
    res.json({ id: user.id, nama: user.nama });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function remove(req, res) {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Not found' });
    await user.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { create, getAllData, getDataById, update, remove };

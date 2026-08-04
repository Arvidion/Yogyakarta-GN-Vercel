const { Bidang } = require('../models');

async function create(req, res) {
  try {
    const b = await Bidang.create(req.body);
    res.json(b);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getAllData(req, res) {
  try {
    const list = await Bidang.findAll();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getDataById(req, res) {
  try {
    const item = await Bidang.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function update(req, res) {
  try {
    const b = await Bidang.findByPk(req.params.id);
    if (!b) return res.status(404).json({ error: 'Not found' });
    await b.update(req.body);
    res.json(b);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function remove(req, res) {
  try {
    const b = await Bidang.findByPk(req.params.id);
    if (!b) return res.status(404).json({ error: 'Not found' });
    await b.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { create, getAllData, getDataById, update, remove };

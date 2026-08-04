const { Negara } = require('../models');

async function create(req, res) {
  try {
    const { kode_iso, nama } = req.body;
    if (!kode_iso || !nama) {
      return res.status(400).json({ error: 'kode_iso and nama are required' });
    }
    const negara = await Negara.create({ kode_iso, nama });
    res.status(201).json(negara);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getAll(req, res) {
  try {
    const list = await Negara.findAll();
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getById(req, res) {
  try {
    const negara = await Negara.findByPk(req.params.id);
    if (!negara) return res.status(404).json({ error: 'Not found' });
    res.json(negara);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function update(req, res) {
  try {
    const negara = await Negara.findByPk(req.params.id);
    if (!negara) return res.status(404).json({ error: 'Not found' });
    const { kode_iso, nama } = req.body;
    await negara.update({ kode_iso, nama });
    res.json(negara);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function remove(req, res) {
  try {
    const negara = await Negara.findByPk(req.params.id);
    if (!negara) return res.status(404).json({ error: 'Not found' });
    await negara.destroy();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const getAllData = getAll;
const getDataById = getById;

module.exports = { create, getAll, getById, getAllData, getDataById, update, remove };

const { Partner, Bidang, Negara } = require('../models');

function formatPartner(partner) {
  const item = partner.toJSON();
  item.negara = item.Negara?.nama || null;
  delete item.negara_id;
  delete item.Negara;
  return item;
}

async function resolveNegara(data) {
  if (data.negara) {
    const negara = await Negara.findOne({ where: { nama: data.negara } });
    if (negara) data.negara_id = negara.id;
  }

  if (!data.negara_id) {
    return { error: 'negara_id is required' };
  }

  const negara = await Negara.findByPk(data.negara_id);
  if (!negara) {
    return { error: 'Invalid negara_id' };
  }

  delete data.negara;
  return {};
}

async function create(req, res) {
  try {
    const data = req.body;
    const bidangIds = data.bidangIds || [];
    delete data.bidangIds;

    const invalid = await resolveNegara(data);
    if (invalid.error) return res.status(400).json({ error: invalid.error });

    const partner = await Partner.create(data);
    if (Array.isArray(bidangIds) && bidangIds.length) {
      await partner.setBidangs(bidangIds);
    }
    const result = await Partner.findByPk(partner.id, { include: [Bidang, Negara] });
    res.json(formatPartner(result));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getAllData(req, res) {
  try {
    const list = await Partner.findAll({ include: [Bidang, Negara] });
    res.json(list.map(formatPartner));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getDataById(req, res) {
  try {
    const id = req.params.id;
    const item = await Partner.findByPk(id, { include: [Bidang, Negara] });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(formatPartner(item));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function update(req, res) {
  try {
    const id = req.params.id;
    const data = req.body;
    const bidangIds = data.bidangIds;
    delete data.bidangIds;

    const invalid = await resolveNegara(data);
    if (invalid.error) return res.status(400).json({ error: invalid.error });

    const partner = await Partner.findByPk(id);
    if (!partner) return res.status(404).json({ error: 'Not found' });
    await partner.update(data);
    if (Array.isArray(bidangIds)) await partner.setBidangs(bidangIds);
    const result = await Partner.findByPk(id, { include: [Bidang, Negara] });
    res.json(formatPartner(result));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function remove(req, res) {
  try {
    const id = req.params.id;
    const partner = await Partner.findByPk(id);
    if (!partner) return res.status(404).json({ error: 'Not found' });
    await partner.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { create, getAllData, getDataById, update, remove };

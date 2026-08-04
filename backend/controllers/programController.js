const { Program, Partner, Bidang, Negara } = require('../models');

function formatProgram(program) {
  const item = program.toJSON();
  item.negara = item.Negara?.nama || null;
  delete item.negara_id;
  delete item.Negara;
  return item;
}

async function resolveProgramNegara(data) {
  if (data.negara) {
    const negara = await Negara.findOne({ where: { nama: data.negara } });
    if (negara) data.negara_id = negara.id;
  }

  if (data.partner_id) {
    const partner = await Partner.findByPk(data.partner_id);
    if (!partner) {
      return { error: 'Invalid partner_id' };
    }
  }

  if (data.negara_id) {
    const negara = await Negara.findByPk(data.negara_id);
    if (!negara) {
      return { error: 'Invalid negara_id' };
    }
  }

  delete data.negara;
  return {};
}

async function addBidangsToPartner(partnerId, bidangIds) {
  if (!partnerId || !Array.isArray(bidangIds) || !bidangIds.length) return;
  const partner = await Partner.findByPk(partnerId);
  if (!partner) return;
  await partner.addBidangs(bidangIds);
}

async function create(req, res) {
  try {
    const data = req.body;
    const bidangIds = data.bidangIds || [];
    delete data.bidangIds;

    const invalid = await resolveProgramNegara(data);
    if (invalid.error) return res.status(400).json({ error: invalid.error });

    const program = await Program.create(data);
    if (Array.isArray(bidangIds) && bidangIds.length) {
      await program.setBidangs(bidangIds);
      if (data.partner_id) {
        await addBidangsToPartner(data.partner_id, bidangIds);
      }
    }
    const result = await Program.findByPk(program.id, { include: [Partner, Bidang, Negara] });
    res.json(formatProgram(result));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getAllData(req, res) {
  try {
    const list = await Program.findAll({ include: [Partner, Bidang, Negara] });
    res.json(list.map(formatProgram));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getDataById(req, res) {
  try {
    const item = await Program.findByPk(req.params.id, { include: [Partner, Bidang, Negara] });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(formatProgram(item));
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

    const invalid = await resolveProgramNegara(data);
    if (invalid.error) return res.status(400).json({ error: invalid.error });

    const program = await Program.findByPk(id);
    if (!program) return res.status(404).json({ error: 'Not found' });
    await program.update(data);
    if (Array.isArray(bidangIds)) {
      await program.setBidangs(bidangIds);
      const partnerId = data.partner_id ?? program.partner_id;
      if (partnerId && bidangIds.length) {
        await addBidangsToPartner(partnerId, bidangIds);
      }
    }
    const result = await Program.findByPk(id, { include: [Partner, Bidang, Negara] });
    res.json(formatProgram(result));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function remove(req, res) {
  try {
    const program = await Program.findByPk(req.params.id);
    if (!program) return res.status(404).json({ error: 'Not found' });
    await program.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { create, getAllData, getDataById, update, remove };

const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function login(req, res) {
  try {
    const { nama, password } = req.body;
    const user = await User.findOne({ where: { nama } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Nama pengguna atau password salah' });
    }

    const secret = process.env.JWT_SECRET || 'yogyakarta_global_network_jwt_secret_key_2026';
    const token = jwt.sign(
      { id: user.id, nama: user.nama },
      secret,
      { expiresIn: '7d' }
    );

    res.json({ id: user.id, nama: user.nama, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { login };
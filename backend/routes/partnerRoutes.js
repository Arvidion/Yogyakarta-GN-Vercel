const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/partnerController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', ctrl.getAllData);
router.get('/:id', ctrl.getDataById);
router.post('/', verifyToken, ctrl.create);
router.put('/:id', verifyToken, ctrl.update);
router.delete('/:id', verifyToken, ctrl.remove);

module.exports = router;

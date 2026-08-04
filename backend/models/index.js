const Sequelize = require('sequelize');
const sequelize = require('../config/db');

const Bidang = require('./bidang')(sequelize, Sequelize.DataTypes);
const Partner = require('./partner')(sequelize, Sequelize.DataTypes);
const Program = require('./program')(sequelize, Sequelize.DataTypes);
const Negara = require('./negara')(sequelize, Sequelize.DataTypes);
const User = require('./user')(sequelize, Sequelize.DataTypes);

// Associations
Partner.belongsToMany(Bidang, { through: 'PartnerBidangs' });
Bidang.belongsToMany(Partner, { through: 'PartnerBidangs' });

Partner.belongsTo(Negara, { foreignKey: 'negara_id' });
Negara.hasMany(Partner, { foreignKey: 'negara_id' });

Program.belongsTo(Partner, { foreignKey: 'partner_id' });
Partner.hasMany(Program, { foreignKey: 'partner_id' });

Program.belongsTo(Negara, { foreignKey: 'negara_id' });
Negara.hasMany(Program, { foreignKey: 'negara_id' });

Program.belongsToMany(Bidang, { through: 'ProgramBidangs' });
Bidang.belongsToMany(Program, { through: 'ProgramBidangs' });

module.exports = { sequelize, Sequelize, Bidang, Partner, Program, Negara, User };

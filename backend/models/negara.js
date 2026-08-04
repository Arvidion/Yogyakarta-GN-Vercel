module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Negara', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    kode_iso: { type: DataTypes.CHAR(2), allowNull: false, unique: true },
    nama: { type: DataTypes.STRING(100), allowNull: false },
  }, {
    timestamps: false,
  });
};

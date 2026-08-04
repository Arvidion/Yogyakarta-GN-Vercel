module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Bidang', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    jenis: { type: DataTypes.STRING, allowNull: false },
  }, { timestamps: false });
};

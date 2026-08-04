module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Program', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nama: { type: DataTypes.STRING, allowNull: false },
    partner_id: { type: DataTypes.INTEGER, allowNull: true },
    negara_id: { type: DataTypes.INTEGER, allowNull: true },
    tanggal: { type: DataTypes.DATE, allowNull: true },
    lokasi: { type: DataTypes.STRING, allowNull: true },
    status: { type: DataTypes.STRING, allowNull: true },
    deskripsi: { type: DataTypes.TEXT },
    situs: { type: DataTypes.TEXT, allowNull: true },
    gambar: { type: DataTypes.TEXT, allowNull: true },
    dokumen: { type: DataTypes.TEXT, allowNull: true },
  }, { timestamps: false });
};

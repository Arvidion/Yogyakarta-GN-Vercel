module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Partner', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nama: { type: DataTypes.STRING, allowNull: false },
    tipe: { type: DataTypes.STRING, allowNull: false },
    negara_id: { type: DataTypes.INTEGER, allowNull: false },
    kota: { type: DataTypes.STRING, allowNull: false },
    jenis: { type: DataTypes.STRING, allowNull: true },
    status: { type: DataTypes.STRING, allowNull: false },
    deskripsi: { type: DataTypes.TEXT },
    situs1: { type: DataTypes.STRING, allowNull: false },
    gambar: { type: DataTypes.TEXT, allowNull: true },
  }, { timestamps: false });
};

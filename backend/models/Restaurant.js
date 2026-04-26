const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Restaurant = sequelize.define("Restaurant", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  location: { type: DataTypes.STRING },
}, { timestamps: false });

module.exports = Restaurant;

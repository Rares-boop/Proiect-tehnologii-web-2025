import sequelize from "../sequelize.js";
import { DataTypes } from "sequelize";

const History = sequelize.define("history",{
    id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    bountyId:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    userId:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    changeDescription:{
        type: DataTypes.TEXT
    }
});

export default History;


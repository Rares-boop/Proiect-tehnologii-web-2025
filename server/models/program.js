import sequelize from "../sequelize.js";
import {DataTypes} from "sequelize";

const Program = sequelize.define("program",{
    id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name:{
        type:DataTypes.STRING,
        allowNull: false
    },
    description:{
        type: DataTypes.STRING
    }
});

export default Program;


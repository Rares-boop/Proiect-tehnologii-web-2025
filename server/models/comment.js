import sequelize from "../sequelize.js";
import { DataTypes } from "sequelize";

const Comment = sequelize.define("comment",{
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
    text:{
        type: DataTypes.TEXT,
        allowNull: false
    },
});

export default Comment;


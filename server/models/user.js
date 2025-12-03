import sequelize from "../sequelize.js";
import {DataTypes} from "sequelize";

const User = sequelize.define("user",{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username:{
        type: DataTypes.STRING,
        allowNull: false
    },
    email:{
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate:{
            isEmail: true
        }
    },
    role:{
        type: DataTypes.ENUM("admin","hunter"),
        defaultValue: "hunter"
    }
});

export default User;


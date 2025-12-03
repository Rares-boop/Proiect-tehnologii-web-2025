import sequelize from "../sequelize.js";
import {DataTypes} from "sequelize";

const Bounty = sequelize.define("bounty",{
    id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title:{
        type:DataTypes.STRING,
        allowNull: false
    },
    description:{
        type:DataTypes.STRING
    },
    rewardAmount:{
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    status:{
        type: DataTypes.ENUM("open","validated","paid"),
        defaultValue: "open"
    },
    programId:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    reporterId:{
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

export default Bounty;


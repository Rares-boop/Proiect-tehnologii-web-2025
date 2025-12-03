import express from "express";
import "dotenv/config"
import Bounty from "./models/bounty.js";
import User from "./models/user.js";
import Program from "./models/program.js";
import sequelize from "./sequelize.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

User.hasMany(Bounty, {foreignKey: "reporterId"});
Bounty.belongsTo(User, {foreignKey: "reporterId"});

Program.hasMany(Bounty, {foreignKey: "programId"});
Bounty.belongsTo(Program, {foreignKey: "programId"});

const port = process.env.PORT || 3000;

/*const createDatabase = async ()=>{
    try{
        await sequelize.sync({alter: true});
    }catch(err){
        console.error("Eroare la crearea tabelelor ");
    }
}

app.listen(port,()=>{
    console.log(`Server started on port ${port}`);
    createDatabase();
});*/

const startServer = async () => {
    try {
        await sequelize.sync({ alter: true });

        app.listen(port, () => {
            console.log(`Server started on port ${port}`);
        });
    } catch (err) {
        console.error("Eroare la crearea tabelelor ", err);
    }
}

startServer();



import express from "express";
import "dotenv/config"
import Bounty from "./models/bounty.js";
import User from "./models/user.js";
import Program from "./models/program.js";
import sequelize from "./sequelize.js";
import History from "./models/history.js";
import Comment from "./models/comment.js";
import router from "./routes/api.js";
import commentRouter from "./routes/comment.js";
import historyRouter from "./routes/history.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use("/api", router);
app.use("/api/comments", commentRouter);

app.use("/api/histories", historyRouter);

User.hasMany(Bounty, {
    foreignKey: "reporterId",
    onDelete: 'CASCADE'
});
Bounty.belongsTo(User, {foreignKey: "reporterId"});

Program.hasMany(Bounty, {
    foreignKey: "programId",
    onDelete: 'CASCADE' 
});
Bounty.belongsTo(Program, {foreignKey: "programId"});

User.hasMany(Comment, {
    foreignKey: "userId",
    onDelete: 'CASCADE' 
});
Comment.belongsTo(User, {foreignKey: "userId"});

Bounty.hasMany(Comment, {
    foreignKey: "bountyId",
    onDelete: 'CASCADE'
});
Comment.belongsTo(Bounty, {foreignKey: "bountyId"});

User.hasMany(History, {
    foreignKey: "userId",
    onDelete: 'CASCADE' 
});
History.belongsTo(User, {foreignKey: "userId"});

Bounty.hasMany(History, {
    foreignKey: "bountyId",
    onDelete: 'CASCADE'
});
History.belongsTo(Bounty, {foreignKey: "bountyId"});

const port = process.env.PORT || 3000;

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

app.use((err,req,res,next)=>{
    console.error("[ERROR] "+err);
    return res.status(500).json({message: "500 Server error "});
});



import express from "express";
import User from "../models/user.js";
import Program from "../models/program.js";
import Bounty from "../models/bounty.js";
import sequelize from "../sequelize.js";
import { Op, QueryError } from "sequelize";

const router = express.Router();

router.get("/users",async (req,res,next)=>{
    try{
        const users = await User.findAll();
        
        return res.status(200).json(users);

    }catch(err){
        next(err);
    }
}).post("/users",async (req,res,next)=>{
    try{
        const userBody = req.body;
        if (!userBody || !userBody.username) {
            return res.status(400).json({ message: "Username is missing!" });
        }
            
        if (userBody.username.length <= 3 || userBody.username.length >= 20) {
            return res.status(400).json({ message: "Username must be between 3 and 20 chars" });
        }

        const newUser = await User.create(userBody);
        return res.status(201).json(newUser);

    }catch(err){
        next(err);
    }
});

router.put("/users/:userId", async(req,res,next)=>{
    try{
        const userBody = req.body;
        if (!userBody || !userBody.username) {
            return res.status(400).json({ message: "Username is missing!" });
        }
            
        if (userBody.username.length <= 3 || userBody.username.length >= 20) {
            return res.status(400).json({ message: "Username must be between 3 and 20 chars" });
        }

        const user = await User.findByPk(req.params.userId);

        if(!user){
            return res.status(404).json({message: "User not found "});
        }

        await user.update(req.body);
        return res.status(200).json(user);

    }catch(err){
        next(err);
    }
}).delete("/users/:userId",async (req,res,next)=>{
    try{
        const user = await User.findByPk(req.params.userId);

        if(!user){
            return res.status(404).json({message: "User not found "});
        }

        await user.destroy();
        return res.status(200).json({message: "User successfully deleted "});

    }catch(err){
        next(err);
    }
});

router.get("/programs",async (req,res,next)=>{
    try{
        const programs = await Program.findAll();
        return res.status(200).json(programs);

    }catch(err){
        next(err);
    }
}).post("/programs",async (req,res,next)=>{
    try{
        const programBody = req.body;

        if(!programBody || !programBody.name){
            return res.status(400).json({message: "Program body is missing "});
        }

        if(programBody.name.length < 3 || programBody.name.length > 20){
            return res.status(400).json({message: "Program must be between 3 and 20 chars"})
        }

        const newProgram = await Program.create(programBody);
        return res.status(201).json(newProgram);

    }catch(err){
        next(err);
    }
});

router.put("/programs/:programId",async (req,res,next)=>{
    try{
        const program  = await Program.findByPk(req.params.programId);

        if(!program){
            return res.status(404).json({message: "Program not found "});
        }

        if(req.body.name && (req.body.name.length < 3 || req.body.name.length > 20 )){
            return res.status(400).json({message: "Program name is not of correct length "});
        }

        await program.update(req.body);
        return res.status(200).json(program);

    }catch(err){
        next(err);
    }
}).delete("/programs/:programId",async (req,res,next)=>{
    try{
        const program = await Program.findByPk(req.params.programId);

        if(!program){
            return res.status(404).json({message: "Program not found "});
        }

        await program.destroy();
        return res.status(200).json({message: "Program deleted successfully "});

    }catch(err){
        next(err);
    }
});

router.get("/bounties",async (req,res,next)=>{
    try{
        const bounties = await Bounty.findAll();

        return res.status(200).json(bounties);

    }catch(err){
        next(err);
    }
}).post("/bounties",async (req,res,next)=>{
    try{
        const body = req.body;

        if(!body){
            return res.status(400).json({message: "Body is missing "});
        }

        if (body.title && (body.title.length < 3 || body.title.length > 20)) {
            return res.status(400).json({ message: "Title length error" });
        }

        if (body.rewardAmount !== undefined && body.rewardAmount < 0) {
            return res.status(400).json({ message: "Reward amount negative" });
        }

        if(!body.reporterId){
            return res.status(400).json({message: "Bounty must have user id "});
        }

        if(!body.programId){
            return res.status(400).json({message: "Bounty must have program id "});
        }

        const newBounty = await Bounty.create(req.body);
        
        return res.status(201).json(newBounty);

    }catch(err){
        next(err);
    }
});

router.get("/bounties/search",async (req,res,next)=>{
    try{
        const query = req.query;
        if(Object.keys(query).length === 0){
            const bounties = await Bounty.findAll({
                where:{
                    status: "open"
                },
                order: [["rewardAmount","DESC"]],
                limit: 10,
            });

            return res.status(200).json(bounties);
        }

        const whereClause = {};

        if(query.title){
            whereClause.title = {[Op.like]: `%${query.title}%`};
        }

        if(query.minReward){
            whereClause.rewardAmount = {[Op.gte]: query.minReward};
        }

        if(query.status){
            whereClause.status = {[Op.eq]: query.status};
        }

        if(query.reporterId){
            whereClause.reporterId = query.reporterId;
        }

        if(query.programId){
            whereClause.programId = query.programId;
        }

        const bounties = await Bounty.findAll({
            where: whereClause,
            order: [["createdAt","DESC"]]
        });

        return res.status(200).json(bounties);

    }catch(err){
        next(err);
    }
});

router.get("/bounties/:bountyId", async (req, res, next) => {
    try {
        const bounty = await Bounty.findByPk(req.params.bountyId);
        if (bounty) {
            return res.status(200).json(bounty);
        } else {
            return res.status(404).json({ message: "Bounty not found" });
        }
    } catch (err) {
        next(err);
    }
})
.put("/bounties/:bountyId", async (req, res, next) => {
    try {
        const body = req.body;
        if (!body) {
            return res.status(400).json({ message: "Body is missing" });
        }

        if (body.title && (body.title.length < 3 || body.title.length > 20)) {
            return res.status(400).json({ message: "Title length error" });
        }

        if (body.rewardAmount !== undefined && body.rewardAmount < 0) {
            return res.status(400).json({ message: "Reward amount negative" });
        }

        const bounty = await Bounty.findByPk(req.params.bountyId);
        if (!bounty) {
            return res.status(404).json({ message: "Bounty not found" });
        }

        await bounty.update(req.body);

        return res.status(200).json(bounty);
    } catch (err) {
        next(err);
    }
})
.delete("/bounties/:bountyId", async (req, res, next) => {
    try {
        const bounty = await Bounty.findByPk(req.params.bountyId);
        
        if (!bounty) {
            return res.status(404).json({ message: "Bounty not found" });
        }

        await bounty.destroy();

        return res.status(200).json({ message: "Bounty deleted" });

    } catch (err) {
        next(err);
    }
});

router.get("/stats/leaderboard", async (req, res, next) => {
    try {
        const limitValue = req.query.numberOfPeople ? parseInt(req.query.numberOfPeople) : 10;

        const leaderboard = await User.findAll({
            attributes: [
                "username",
                [sequelize.fn("SUM", sequelize.col("bounties.rewardAmount")), "totalEarnings"],
                [sequelize.fn("COUNT", sequelize.col("bounties.id")), "bugsFixed"]
            ],
            include: [{
                model: Bounty,
                attributes: [],
                where: {
                    status: "paid"
                }
            }],
            group: ['user.id'], 
            order: [[sequelize.literal('"totalEarnings"'), 'DESC']],
            limit: limitValue,
            subQuery: false
        });

        return res.status(200).json(leaderboard);

    } catch (err) {
        next(err);
    }
});

export default router;

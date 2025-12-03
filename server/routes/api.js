import express from "express";
import User from "../models/user.js";
import Program from "../models/program.js";

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

/*router.post("/bounties",(req,res,next)=>{
    try{
        const bountyBody = req.body;
        if(bountyBody){
            console.log(bountyBody);
            if(bountyBody.title.length > 3 && bountyBody.title.length < 20){
                if(bountyBody.rewardAmount > 0){
                    console.log(bountyBody);
                }
                else{
                    return res.status(401).json({message: "Reward amount cannot be negaitve "});
                }
            }
            else{
                return res.status(401).json({message: "Bounty title not too long or too short "});
            }
        }
        else{
            return res.status(404).json({message: "Bounty body missing "});
        }
    }catch(err){
        next(err);
    }
});*/ 

export default router;

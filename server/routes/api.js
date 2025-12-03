import express from "express";
import User from "../models/user.js";
import Program from "../models/program.js";
import Bounty from "../models/bounty.js";

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

router.post("/bounties",async (req,res,next)=>{
    try{
        const body = req.body;

        if(!body || !body.title || !body.description || !body.rewardAmount || !body.status){
            return res.status(400).json({message: "Missing title, programId or reporterId"});
        }

        if(body.title.length < 3 || body.title.length > 20){
            return res.status(400).json({message: "Title must be between 3 and 20 chars"});
        }

        if(body.rewardAmount && body.rewardAmount < 0){
            return res.status(400).json({message: "Reward amount must be positive "});
        }

        const newBounty = await Bounty.create(body);

        return res.status(201).json(newBounty);

    }catch(err){
        next(err);
    }
});

export default router;

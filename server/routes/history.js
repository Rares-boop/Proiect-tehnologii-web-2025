import express from "express";
import History from "../models/history.js";

const historyRouter = express.Router();

historyRouter.get("/bounty/:bountyId", async (req, res, next) => {
    try {
        const history = await History.findAll({
            where: {
                bountyId: req.params.bountyId
            },
            order: [['createdAt', 'DESC']]
        });

        if (history.length > 0) {
            return res.status(200).json(history);
        } else {
            return res.status(200).json([]); 
        }
    } catch (err) {
        next(err);
    }
});


historyRouter.post("/bounty/:bountyId/user/:userId", async (req, res, next) => {
    try {
        if (!req.body.changeDescription) {
            return res.status(400).json({ message: "Change description is missing" });
        }

        const newEntry = await History.create({
            changeDescription: req.body.changeDescription,
            bountyId: req.params.bountyId, 
            userId: req.params.userId
        });

        return res.status(201).json(newEntry);
    } catch (err) {
        next(err);
    }
});

historyRouter.put("/:historyId",async (req,res,next)=>{
    try{
        const history = await History.findByPk(req.params.historyId);
        const body = req.body;

        if(!history){
            return res.status(404).json({message: "History is missing "});
        }

        if(!body || !body.changeDescription){
            return res.status(400).json({message: "Descrition is missing "});
        }

        await history.update({changeDescription: req.body.changeDescription});

        return res.status(200).json(history);

    }catch(err){
        next(err);
    }
}).delete("/:historyId",async (req,res,next)=>{
    try{
        const history = await History.findByPk(req.params.historyId);

        if(!history){
            return res.status(404).json({message: "History is missing "});
        }

        await history.destroy();

        return res.status(200).json({message: "History deleted successfully "});

    }catch(err){
        next(err);
    }
});

export default historyRouter;

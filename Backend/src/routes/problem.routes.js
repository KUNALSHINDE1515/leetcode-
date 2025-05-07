import express from 'express';
import { authmiddleware, checkAdmin } from '../middleware/auth.middleware.js';
import { createProblem, deleteProblem, getAllProblem, getProblem, getSolvedProblems, updateProblem } from '../controllers/problem.controllers.js';


const problemRouters = express.Router();

problemRouters.post("/create-problem",authmiddleware,checkAdmin,createProblem)
problemRouters.get("/get-all-problem",authmiddleware,getAllProblem)
problemRouters.get("/get-problem/:id",authmiddleware,getProblem)

problemRouters.put("update-problem/:id",authmiddleware,checkAdmin,updateProblem)
problemRouters.delete("/delete-problem/:id",authmiddleware,checkAdmin,deleteProblem)
problemRouters.get("get-solved-problems",authmiddleware,getSolvedProblems)


export default problemRouters;




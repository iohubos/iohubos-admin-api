import express, { Request, Response } from "express";
const router = express.Router();

const res404 = (_req: Request, res: Response) => {
    res.sendStatus(404);
};

router.route("*").get(res404).post(res404).patch(res404).put(res404).delete(res404);

export default router;

import express, { Request, Response } from "express";
import { writeFile } from "fs/promises";

const router = express.Router();

// reboot in seconds
router.post("/reboot/:seconds", async (_req: Request, res: Response) => {
    const seconds = Math.max(1, parseInt(_req.params.seconds));
    setTimeout(() => {
        (async function reboot() {
            try {
                await writeFile("/proc/sys/kernel/sysrq", Buffer.from("1"));
                await writeFile("/proc/sysrq-trigger", Buffer.from("b"));
            } catch (error) {
                console.log(error);
            }
        })();
    }, seconds * 1000);
    res.status(202).send(`Will reboot in ${seconds} second${seconds == 1 ? "" : "s"}`);
});

export default router;

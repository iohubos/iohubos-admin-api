import express, { Request, Response } from "express";
import { writeFile } from "fs/promises";

const router = express.Router();

const MIN_SECS = 3;

// reboot in seconds
router.post("/reboot/:seconds", async (_req: Request, res: Response) => {
    try {
        const seconds = isNaN(parseInt(_req.params.seconds))
            ? MIN_SECS
            : Math.max(MIN_SECS, parseInt(_req.params.seconds));

        // enable commands
        await writeFile("/proc/sys/kernel/sysrq", Buffer.from("1"));
        // sync filesystem
        await writeFile("/proc/sysrq-trigger", Buffer.from("s"));

        setTimeout(() => {
            (async function reboot() {
                try {
                    // reboot
                    await writeFile("/proc/sysrq-trigger", Buffer.from("b"));
                } catch (error) {
                    console.log(error);
                }
            })();
        }, seconds * 1000);

        res.status(202).send(`Will reboot in ${seconds} second${seconds == 1 ? "" : "s"}`);
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: "cannot reboot" });
    }
});

export default router;

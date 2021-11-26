import express, { Request, Response, NextFunction } from "express";
import { access, chmod, mkdir, readdir, readFile, rmdir, stat, writeFile } from "fs/promises";
import { constants } from "fs";
import { Buffer } from "buffer";
import path from "path";
import yaml from "yaml";

const globalVolume = process.env.ROOT_DOCKER_GLOBAL_VOLUME || "global-vol";
const rootDockerFolder = process.env.ROOT_DOCKER_FOLDER || "/iohub/docker/apps";
const destDockerFolder = process.env.DEST_DOCKER_FOLDER || "/iohub/docker/apps";

const appRegExp = /^[a-z][a-z0-9-_]{0,63}$/;

const router = express.Router();

const getAppFolder = (appsFolder, appname) => {
    return path.join(appsFolder, appname);
};

const getComposeName = (appsFolder, appname) => {
    return path.join(appsFolder, appname, "docker-compose.yml");
};

const getStartName = (appsFolder, appname) => {
    return path.join(appsFolder, appname, "start.sh");
};

const getApps = async appsFolder => {
    const content = await readdir(appsFolder, { withFileTypes: true });
    return content.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);
};

const getCompose = async (appsFolder, appname) => {
    const dockerComposePath = getComposeName(appsFolder, appname);
    const dockerCompose = await readFile(dockerComposePath);
    return dockerCompose.toString();
};

const isEnabled = async (appsFolder, appname) => {
    const startPath = getStartName(appsFolder, appname);
    try {
        const fileStat = await stat(startPath);
        return fileStat.isFile() && (fileStat.mode & 0o0755) === 0o0755;
    } catch (error) {
        return false;
    }
};

const checkAppName = (req: Request, res: Response, next: NextFunction) => {
    if (req.params.app == undefined || !appRegExp.test(req.params.app)) {
        res.status(400).send("Invalid app name");
    } else {
        next();
    }
};

const guessIfDockerCompose = compose => {
    return compose && compose.version && compose.services && Object.keys(compose.services).length > 0;
};

// get app list
router.get("/", async (_req: Request, res: Response) => {
    try {
        const apps = await getApps(rootDockerFolder);
        res.status(200).json(apps);
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: "cannot load the applications" });
    }
});

// get app info
router.get("/:app", checkAppName, async (req: Request, res: Response) => {
    try {
        const enabled = await isEnabled(rootDockerFolder, req.params.app);
        const compose = await getCompose(rootDockerFolder, req.params.app);
        res.status(200).json({ enabled, compose });
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: "cannot load the application" });
    }
});

// get app status
router.get("/:app/status", checkAppName, async (req: Request, res: Response) => {
    try {
        const enabled = await isEnabled(rootDockerFolder, req.params.app);
        res.status(200).json({ enabled });
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: "cannot load the application" });
    }
});

// get app compose
router.get("/:app/compose", checkAppName, async (req: Request, res: Response) => {
    try {
        const compose = await getCompose(rootDockerFolder, req.params.app);
        res.status(200).send(compose);
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: "cannot load the application" });
    }
});

// enable app
router.post("/:app/enable", checkAppName, async (req: Request, res: Response) => {
    try {
        const startName = getStartName(rootDockerFolder, req.params.app);
        await access(startName, constants.F_OK);
        await chmod(startName, 0o0755);
        res.status(200).send("Enabled");
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: "cannot enable the application" });
    }
});

// disable app
router.post("/:app/disable", checkAppName, async (req: Request, res: Response) => {
    try {
        const startName = getStartName(rootDockerFolder, req.params.app);
        await access(startName, constants.F_OK);
        await chmod(startName, 0o0644);
        res.status(200).send("Disabled");
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: "cannot disable the application" });
    }
});

// deploy app
//
// x-www-form-urlencoded
// compose: yaml
// enabled: false/true or absent
router.post("/:app/deploy", checkAppName, async (req: Request, res: Response) => {
    try {
        const compose = yaml.parse(req.body.compose);
        if (!guessIfDockerCompose(compose)) {
            throw new Error("Invalid compose");
        }
        try {
            const appFolder = getAppFolder(rootDockerFolder, req.params.app);
            await mkdir(appFolder, { recursive: true });

            const composePath = getComposeName(rootDockerFolder, req.params.app);
            await writeFile(composePath, Buffer.from(req.body.compose), { mode: 0o644 });
            if (/^true$/i.test(req.body.enabled)) {
                let startSh = "#!/bin/sh\n";
                if (compose.volumes) {
                    for (const volume in compose.volumes) {
                        if (globalVolume !== volume) {
                            const volumePath = path.join(destDockerFolder, req.params.app, "volumes", volume);
                            startSh += `[ -d ${volumePath} ] || mkdir -p ${volumePath}\n`;
                        }
                    }
                }
                const dockerComposePath = path.join(destDockerFolder, req.params.app, "docker-compose.yml");
                startSh += `docker-compose -f ${dockerComposePath} up -d\n`;
                await writeFile(getStartName(rootDockerFolder, req.params.app), Buffer.from(startSh), { mode: 0o755 });
            }
            res.status(201).send("Deployed");
        } catch (error) {
            console.log(error);
            res.status(400).json({ error: "cannot save the application" });
        }
    } catch (error) {
        res.status(400).json({ error: "not in yaml format" });
    }
});

// undeploy app
router.post("/:app/undeploy", checkAppName, async (req: Request, res: Response) => {
    try {
        const appFolder = getAppFolder(rootDockerFolder, req.params.app);
        const fileStat = await stat(appFolder);
        if (!fileStat.isDirectory) {
            throw new Error("Invalid app folder");
        }
        await rmdir(appFolder, { recursive: true });
        res.send("Undeployed");
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: "cannot undeploy the application" });
    }
});

export default router;

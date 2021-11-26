"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const promises_1 = require("fs/promises");
const fs_1 = require("fs");
const buffer_1 = require("buffer");
const path_1 = __importDefault(require("path"));
const yaml_1 = __importDefault(require("yaml"));
const globalVolume = process.env.ROOT_DOCKER_GLOBAL_VOLUME || "global-vol";
const rootDockerFolder = process.env.ROOT_DOCKER_FOLDER || "/iohub/docker/apps";
const destDockerFolder = process.env.DEST_DOCKER_FOLDER || "/iohub/docker/apps";
const appRegExp = /^[a-z][a-z0-9-_]{0,63}$/;
const router = express_1.default.Router();
const getAppFolder = (appsFolder, appname) => {
    return path_1.default.join(appsFolder, appname);
};
const getComposeName = (appsFolder, appname) => {
    return path_1.default.join(appsFolder, appname, "docker-compose.yml");
};
const getStartName = (appsFolder, appname) => {
    return path_1.default.join(appsFolder, appname, "start.sh");
};
const getApps = (appsFolder) => __awaiter(void 0, void 0, void 0, function* () {
    const content = yield (0, promises_1.readdir)(appsFolder, { withFileTypes: true });
    return content.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);
});
const getCompose = (appsFolder, appname) => __awaiter(void 0, void 0, void 0, function* () {
    const dockerComposePath = getComposeName(appsFolder, appname);
    const dockerCompose = yield (0, promises_1.readFile)(dockerComposePath);
    return dockerCompose.toString();
});
const isEnabled = (appsFolder, appname) => __awaiter(void 0, void 0, void 0, function* () {
    const startPath = getStartName(appsFolder, appname);
    try {
        const fileStat = yield (0, promises_1.stat)(startPath);
        return fileStat.isFile() && (fileStat.mode & 0o0755) === 0o0755;
    }
    catch (error) {
        return false;
    }
});
const checkAppName = (req, res, next) => {
    if (req.params.app == undefined || !appRegExp.test(req.params.app)) {
        res.status(400).send("Invalid app name");
    }
    else {
        next();
    }
};
const guessIfDockerCompose = compose => {
    return compose && compose.version && compose.services && Object.keys(compose.services).length > 0;
};
// get app list
router.get("/", (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const apps = yield getApps(rootDockerFolder);
        res.status(200).json(apps);
    }
    catch (error) {
        console.log(error);
        res.status(404).json({ error: "cannot load the applications" });
    }
}));
// get app info
router.get("/:app", checkAppName, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const enabled = yield isEnabled(rootDockerFolder, req.params.app);
        const compose = yield getCompose(rootDockerFolder, req.params.app);
        res.status(200).json({ enabled, compose });
    }
    catch (error) {
        console.log(error);
        res.status(404).json({ error: "cannot load the application" });
    }
}));
// get app status
router.get("/:app/status", checkAppName, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const enabled = yield isEnabled(rootDockerFolder, req.params.app);
        res.status(200).json({ enabled });
    }
    catch (error) {
        console.log(error);
        res.status(404).json({ error: "cannot load the application" });
    }
}));
// get app compose
router.get("/:app/compose", checkAppName, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const compose = yield getCompose(rootDockerFolder, req.params.app);
        res.status(200).send(compose);
    }
    catch (error) {
        console.log(error);
        res.status(404).json({ error: "cannot load the application" });
    }
}));
// enable app
router.post("/:app/enable", checkAppName, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const startName = getStartName(rootDockerFolder, req.params.app);
        yield (0, promises_1.access)(startName, fs_1.constants.F_OK);
        yield (0, promises_1.chmod)(startName, 0o0755);
        res.status(200).send("Enabled");
    }
    catch (error) {
        console.log(error);
        res.status(404).json({ error: "cannot enable the application" });
    }
}));
// disable app
router.post("/:app/disable", checkAppName, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const startName = getStartName(rootDockerFolder, req.params.app);
        yield (0, promises_1.access)(startName, fs_1.constants.F_OK);
        yield (0, promises_1.chmod)(startName, 0o0644);
        res.status(200).send("Disabled");
    }
    catch (error) {
        console.log(error);
        res.status(404).json({ error: "cannot disable the application" });
    }
}));
// deploy app
//
// x-www-form-urlencoded
// compose: yaml
// enabled: false/true or absent
router.post("/:app/deploy", checkAppName, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const compose = yaml_1.default.parse(req.body.compose);
        if (!guessIfDockerCompose(compose)) {
            throw new Error("Invalid compose");
        }
        try {
            const appFolder = getAppFolder(rootDockerFolder, req.params.app);
            yield (0, promises_1.mkdir)(appFolder, { recursive: true });
            const composePath = getComposeName(rootDockerFolder, req.params.app);
            yield (0, promises_1.writeFile)(composePath, buffer_1.Buffer.from(req.body.compose), { mode: 0o644 });
            if (/^true$/i.test(req.body.enabled)) {
                let startSh = "#!/bin/sh\n";
                if (compose.volumes) {
                    for (const volume in compose.volumes) {
                        if (globalVolume !== volume) {
                            const volumePath = path_1.default.join(destDockerFolder, req.params.app, "volumes", volume);
                            startSh += `[ -d ${volumePath} ] || mkdir -p ${volumePath}\n`;
                        }
                    }
                }
                const dockerComposePath = path_1.default.join(destDockerFolder, req.params.app, "docker-compose.yml");
                startSh += `docker-compose -f ${dockerComposePath} up -d\n`;
                yield (0, promises_1.writeFile)(getStartName(rootDockerFolder, req.params.app), buffer_1.Buffer.from(startSh), { mode: 0o755 });
            }
            res.sendStatus(201);
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ error: "cannot save the application" });
        }
    }
    catch (error) {
        res.status(400).json({ error: "not in yaml format" });
    }
}));
// undeploy app
router.post("/:app/undeploy", checkAppName, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const appFolder = getAppFolder(rootDockerFolder, req.params.app);
        const fileStat = yield (0, promises_1.stat)(appFolder);
        if (!fileStat.isDirectory) {
            throw new Error("Invalid app folder");
        }
        yield (0, promises_1.rmdir)(appFolder, { recursive: true });
        res.send("Undeployed");
    }
    catch (error) {
        console.log(error);
        res.status(400).json({ error: "cannot undeploy the application" });
    }
}));
exports.default = router;
//# sourceMappingURL=app.js.map
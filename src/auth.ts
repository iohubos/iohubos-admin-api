import { Request, Response, NextFunction } from "express";
import { passwordStrength, defaultOptions } from "check-password-strength";

const appToken = process.env.API_TOKEN || "";

const iohubAPIStrength = "IOhubAPIStrength";

defaultOptions[3].minDiversity = 4;
defaultOptions[3].minLength = 32;
defaultOptions[3].value = iohubAPIStrength;

const isAuthorized = (req: Request, res: Response, next: NextFunction) => {
    if (iohubAPIStrength !== passwordStrength(appToken).value) {
        res.status(403).json({
            error: "Your API token is not strong enough. Set a strong API token and restart the API"
        });
        return;
    }

    const token = req.get("X-API-Token");
    if (token !== appToken) {
        res.status(401).send("Unauthorized");
        return;
    }

    next();
};

export { isAuthorized };

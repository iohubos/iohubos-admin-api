"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthorized = void 0;
const check_password_strength_1 = require("check-password-strength");
const appToken = process.env.API_TOKEN || "";
const iohubAPIStrength = "IOhubAPIStrength";
check_password_strength_1.defaultOptions[3].minDiversity = 4;
check_password_strength_1.defaultOptions[3].minLength = 32;
check_password_strength_1.defaultOptions[3].value = iohubAPIStrength;
const isAuthorized = (req, res, next) => {
    if (iohubAPIStrength !== (0, check_password_strength_1.passwordStrength)(appToken).value) {
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
exports.isAuthorized = isAuthorized;
//# sourceMappingURL=auth.js.map
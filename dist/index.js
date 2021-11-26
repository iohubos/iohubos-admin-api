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
const body_parser_1 = __importDefault(require("body-parser"));
const auth_1 = require("./auth");
const default_1 = __importDefault(require("./routes/default"));
const app_1 = __importDefault(require("./routes/v1/app"));
const admin_1 = __importDefault(require("./routes/v1/admin"));
const port = process.env.PORT || 8080;
process.on("unhandledRejection", (reason, promise) => {
    console.log("Unhandled Rejection because of:", reason, promise);
});
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise(() => {
        const expressApp = (0, express_1.default)();
        expressApp.use(body_parser_1.default.urlencoded({ extended: false }));
        expressApp.use(body_parser_1.default.json());
        // issues with bad params, ending with %
        expressApp.use((req, res, next) => {
            try {
                decodeURIComponent(req.path);
                next();
            }
            catch (e) {
                res.sendStatus(400);
            }
        });
        expressApp.use(auth_1.isAuthorized);
        expressApp.use("/v1/app", app_1.default);
        expressApp.use("/v1/admin", admin_1.default);
        expressApp.use("/v1/*", default_1.default);
        app_1.default.use("*", default_1.default);
        expressApp.listen(port, () => {
            console.log("Running on port " + port);
        });
    });
});
main()
    .then(() => {
    console.log("stopping app");
})
    .catch(err => {
    console.log(err.message);
});
//# sourceMappingURL=index.js.map
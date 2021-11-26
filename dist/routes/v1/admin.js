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
const router = express_1.default.Router();
// reboot in seconds
router.post("/reboot/:seconds", (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const seconds = Math.max(1, parseInt(_req.params.seconds));
    setTimeout(() => {
        (function reboot() {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    yield (0, promises_1.writeFile)("/proc/sys/kernel/sysrq", Buffer.from("1"));
                    yield (0, promises_1.writeFile)("/proc/sysrq-trigger", Buffer.from("b"));
                }
                catch (error) {
                    console.log(error);
                }
            });
        })();
    }, seconds * 1000);
    res.status(202).send(`Will reboot in ${seconds} second${seconds == 1 ? "" : "s"}`);
}));
exports.default = router;
//# sourceMappingURL=admin.js.map
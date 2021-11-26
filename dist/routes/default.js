"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const res404 = (_req, res) => {
    res.sendStatus(404);
};
router.route("*").get(res404).post(res404).patch(res404).put(res404).delete(res404);
exports.default = router;
//# sourceMappingURL=default.js.map
import express from "express";
import bodyParser from "body-parser";

import { isAuthorized } from "./auth";
import defaultRoute from "./routes/default";
import app from "./routes/v1/app";
import admin from "./routes/v1/admin";

const port = process.env.PORT || 8080;

process.on("unhandledRejection", (reason, promise) => {
    console.log("Unhandled Rejection because of:", reason, promise);
});

const main = async () => {
    return new Promise(() => {
        const expressApp = express();

        expressApp.use(bodyParser.urlencoded({ extended: false }));
        expressApp.use(bodyParser.json());

        // issues with bad params, ending with %
        expressApp.use((req, res, next) => {
            try {
                decodeURIComponent(req.path);
                next();
            } catch (e) {
                res.sendStatus(400);
            }
        });

        expressApp.use(isAuthorized);

        expressApp.use("/v1/app", app);
        expressApp.use("/v1/admin", admin);
        expressApp.use("/v1/*", defaultRoute);

        app.use("*", defaultRoute);

        expressApp.listen(port, () => {
            console.log("Running on port " + port);
        });
    });
};

main()
    .then(() => {
        console.log("stopping app");
    })
    .catch(err => {
        console.log(err.message);
    });

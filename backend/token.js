const express = require("express")

const jsonwebtoken = require("jsonwebtoken")



const TokenRouter = express.Router()



const VerifyToken = (req, res, next) => {
    const header = req.headers.authorization;
    const token = header && header.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            status: "error",
            message: "Authentication token is required.",
        });
    }

    jsonwebtoken.verify(
        token,
        process.env.JWT_SECRET || "YOUR_SECRET_KEY",
        (error, decoded) => {
            if (error) {
                return res.status(401).json({
                    status: "error",
                    message:
                        "Invalid or expired authentication token.",
                });
            }

            req.Token = decoded;
            next();
        }
    );
};


TokenRouter.get("/GetToken",VerifyToken,(req,res)=> {
    res.json({status : "success",Token : req.Token})
})




module.exports = {
    TokenRouter,
    VerifyToken

}
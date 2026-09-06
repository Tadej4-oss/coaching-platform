const express = require("express")
const router = express.Router()
const jwt = require("jsonwebtoken")
require("dotenv").config()

function authenticateToken(req, res, next){
    const accessToken = req.cookies.accessToken
    if(!accessToken){
        //sent to refresh token
        return res.status(401).json({
            success: false,
            message: "No accesstoken",
        })
    }

    try {
        const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN)
        req.user = decoded
        next()

    } catch (err) {
        return res.status(401).json({
            success: false,
            message: "Not Authorized"
        })
    }
    
}




module.exports = authenticateToken;

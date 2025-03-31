import jwt from "jsonwebtoken";
import dotenv from "dotenv";

// .env config
dotenv.config();

// Authentication
export const authenticateToken = (req, res, next) => {
    // Get Token from auth header
    const token = req.header("Authorization")?.split(" ")[1];

    // if not token, revoke 
    if (!token) return res.status(401).json({ error: "Access denied" });

    // Try Verification
    try {
        // if jwt token valid proceed
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        // invalid, revoke error
        res.status(403).json({ error: "Invalid token" });
    }
};
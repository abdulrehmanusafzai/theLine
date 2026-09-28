const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

const fetchUser = (req, res, next) => {
    try {

        const token = req.header("auth-token");
        if (!token) {
            const feedback = {
                status: "error",
                message: "Token not found"
            }
            res.status(401).json({feedback});
        } else {
            try {
                const data = jwt.verify(token, JWT_SECRET);
                req.user = data.user;
                next();
            } catch (error) {
                console.log(error)
                const feedback = {
                    status: "error",
                    message: "Error occured in fetching the user"
                }
                res.status(401).json({feedback});
            }
        }
    } catch (error) {
        console.log(error)
        const feedback = {
            status: "error",
            message: "Internal Server Error"
        }
        res.status(401).json({feedback});
    }
}

module.exports = fetchUser;
import jwt from "jsonwebtoken";
import dotenv from "dotenv"
dotenv.config


const auth = (req, res, next) => {


//check if may jwt token sa headers

const token = req.header("Authorization")

if(!token) {
    return res.status(403).json( {
        err: "invalid token"
    })
}

//verify jwt token
try {
    jwt.verify(token.slice(7), process.env.jwtSecret, (err, user) => {
        if(err) {
            return res.sendStatus(403)
        }

        //store payload sa req.user

        req.user = user

        next()


    })
} catch (error) {
    return res.status(403).json( {
        err: error.message
    })
}



}


export { auth }

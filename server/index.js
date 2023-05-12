//imports
import express from 'express'
import bodyParser from 'body-parser'
import { connectToDatabase } from './pool.js'
import { generateJWT } from './jwt/jwtGenerator.js'
import bycrpt from "bcryptjs"
import { auth } from "./middleware/auth.js"
import cors from "cors"

//setups
const app = express()
const pool = connectToDatabase()


app.use(cors())
app.use(express.json())
app.use(bodyParser.urlencoded( { extended: true }))


//GLOBAL vars
const PORT = 8000


app.get('/', (req, res) => {
    res.send("Hello world")
})


app.get('/students', async (req, res) => {
    try {
        
        const students = await pool.query(`SELECT name FROM students`)

        res.json(students.rows)

    } catch (error) {
        console.log(error.message)
    }
})

app.post('/students' , async (req, res) => {
    try {
        const { name, age } = req.body

        console.log(req)

        const newStudent = await pool.query(`
        INSERT INTO students (name, age)
        VALUES ('${name}', '${age}') RETURNING *
        `)

        res.json(newStudent.rows[0])

    } catch (error) {
        console.log(error.message)
    }
})

//auth routes

app.post('/register', async (req, res) => {
    try {

        const {email, password, name, age } = req.body

        //check if email is existing
        const user = await pool.query(`SELECT * FROM users WHERE email = '${email}'`)


        if(user.rows.length > 0) {
            res.status(401).send("email has been taken")
        }

        //encrypt the plain text password
        const saltRound = 10;
        const salt = await bycrpt.genSalt(saltRound)

        const encryptedPassword = await bycrpt.hash(password, salt)

        //insert new user to the database

        const newUser = await pool.query(`INSERT INTO users (email, password, name, age)
        VALUES ('${email}', '${encryptedPassword}', '${name}', '${age}')
        RETURNING *
        ;`)

        const token = generateJWT(newUser.rows[0])

        res.json({token})

    } catch (error) {
        console.log(error.message)
    }
})

app.post('/login', async (req, res) => {
    try {

        const {email, password} = req.body

        //check if email is existing
        const user = await pool.query(`SELECT * FROM users WHERE email = '${email}'`)


        if(user.rows.length < 0) {
            res.status(401).send("User does not exist")
        }

        //validate the encrypted password
        const validPassword = await bycrpt.compare(password, user.rows[0].password)

        if(!validPassword){
            return res.status(401).send("Password or Email is not correct")
        }

        const token = generateJWT(user.rows[0])

        res.json({token})

    } catch (error) {
        console.log(error.message)
    }
})

app.get('/profile', auth, async(req, res) => {
    try {
        res.json(req.user)
    } catch (error) {
        console.log(error.message)
    }
})


app.listen(PORT, () => {
    console.log(`Server has started on http://localhost:8000`)
})
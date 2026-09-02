const express = require('express');
const multer = require('multer');
const jwt = require("jsonwebtoken");
const {body, validationResult} = require('express-validator');
const Pool = require('../db.js');
const fetchuser = require('../middleware/fetchuser.js');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET

const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error("Select Image File"), false);
        }
    }
});

router.get('/', (req, res) => {
    res.status(200).render('admin.pug')
});

router.post('/add-item', upload.single("image"), [
    body("name", "Enter name for menu").notEmpty(),
    body("price", "Enter price for menu").notEmpty(),
    body("category", "Enter category for menu").notEmpty(),
    body("description", "Enter a description for menu").notEmpty(),
], async (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()){
        errors = errors.array();
        const feedback = {
            status: "error",
            message: errors[0].msg
        }
        return res.status(400).json(feedback)
    } else if (!req.file){
    const feedback = {
            status: "error",
            message: "Select an Image for Menu Item"
        }
        return res.status(400).json(feedback)
    }

    const {name, price, category, description, available} = req.body;
    const image = req.file.path;

    try {
        await Pool.query(
            `INSERT INTO menu (name, price, category, description, image, available)
            VALUES ($1, $2, $3, $4, $5, $6)`,
            [name, price, category, description, image, available]
        );
        const feedback = {
            status: "success",
            message: "Item added"
        }
        res.status(200).json(feedback);
    } catch (error) {
        console.log(error);
        
        const feedback = {
            status: "error",
            message: "Something went wrong"
        }
        res.status(400).json(feedback);
    }
});

router.get('/get-menu', async (req, res) => {
    try {
        const menu = await Pool.query("SELECT * FROM menu");
        res.status(200).send(menu.rows)
    } catch (error) {
        console.log(error);
        res.status(400).send({error: "Internal Server Error"});
    }
})

router.post('/register-user', [
    body("phone", "Enter Correct Phone Number").isLength({min: 11, max: 11})
], async (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()){
        errors = errors.array();
        const feedback = {
            status: "error",
            message: errors[0].msg
        }
        return res.status(400).json(feedback);
    }
    try {
        let result = await Pool.query(
            'SELECT * FROM users WHERE phone = $1',
            [req.body.phone]
        );
        
        let user;
        
        if (result.rows.length === 0){
            result = await Pool.query(
                "INSERT INTO users (phone) VALUES ($1) RETURNING *",
                [req.body.phone]
            )
        }
        user = result.rows[0]
        
        const data = {
            user: {
                id: user.id
            }
        }
        
        const authToken = jwt.sign(data, JWT_SECRET)
        
        res.json({authToken})
    } catch (error) {
        res.send(error)
    }
});

router.get('/fetch-user', fetchuser, async (req, res) => {
    const userId = req.user
    let result = await Pool.query(
        'SELECT * FROM users WHERE id = $1',
        [userId.id]
    );
    const user = result.rows
    res.json({user})
});

router.get('/pending-orders', async (req, res) => {
    const orders = await Pool.query(
        "SELECT * FROM orders"
    )
    const allOrders = orders.rows;

    for (const order of allOrders){
        const itemNames = await Pool.query(
            "SELECT * FROM menu WHERE id = ANY($1)",
            [order.item_ids]
        );
        
        order.item_ids = itemNames.rows
    }
    
    res.status(200).render("admin-orders.pug", {allOrders});
});

module.exports = router;
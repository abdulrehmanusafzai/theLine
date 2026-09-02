const express = require('express');
const path = require('path');
const {body, validationResult} = require('express-validator');
const Pool = require('./db');
const fetchuser = require('./middleware/fetchuser.js');

const app = express();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('static'));
app.use('/uploads', express.static('uploads'));
app.use('/admin', require('./routes/admin.js'));

setInterval(async () => {
    try{
        await Pool.query("UPDATE orders SET status = 'delivered' WHERE status = 'pending' AND created_at <= NOW() - INTERVAL '20 minutes'");
        await Pool.query("DELETE FROM orders WHERE status = 'delivered' AND created_at <= NOW() - INTERVAL '30 minutes'");
    } catch (error){
        console.log(error)
    }
}, 1000 * 60);

app.get('/', async (req, res) => {
    const fastFood = await Pool.query("SELECT * FROM menu WHERE category = \'Fast Food\'");
    const fastFoodMenuItems = fastFood.rows

    const desiFood = await Pool.query("SELECT * FROM menu WHERE category = \'Desi Food\'");
    const desiFoodMenuItems = desiFood.rows

    const deserts = await Pool.query("SELECT * FROM menu WHERE category = \'Dessert\'");
    const desertsMenuItems = deserts.rows

    const coldDrinks = await Pool.query("SELECT * FROM menu WHERE category = \'Drinks\'");
    const coldDrinksMenuItems = coldDrinks.rows

    
    res.status(200).render('home.pug', {fastFoodMenuItems, desiFoodMenuItems, desertsMenuItems, coldDrinksMenuItems});
});

app.get('/cart', (req, res) => {
    res.render('cart.pug')
})

app.post('/fetch-cart', async (req, res) => {
    try {
        
        const itemIds = JSON.parse(req.body.itemIds).map(Number)
        
        const cartItems = await Pool.query(
            "SELECT * FROM menu WHERE id = ANY($1)",
            [itemIds]
        );
        
        const items = cartItems.rows;

        res.status(200).json(items);
    } catch (error) {
        const feedback = {
            status: "error",
            message: "Cart could not be Loaded"
        };
        res.status(200).json(feedback);
        
    }
});

app.post('/create-order', fetchuser, [
    body("orderPayment", "Your Payment was not Loaded, try again").notEmpty(),
    body("orderItems", "Your Cart was not Loaded try again or try adding something to your Cart").isArray({min: 1}),
    body("address", "Enter Delivery Address").notEmpty()
], async (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()){
        errors = errors.array();
        const feedback = {
            status: "error",
            message: errors[0].msg
        };
        return res.status(400).json(feedback);
    }
    
    const userId = req.user.id;
    const orderAmount = req.body.orderPayment;
    const orderItems = req.body.orderItems;
    const address = req.body.address;

    const userPhoneResult = await Pool.query("SELECT phone FROM users WHERE id = ($1)", [userId]);
    const userPhone = userPhoneResult.rows[0].phone;
    try {
        
        const placedOrder = await Pool.query(
            "INSERT INTO orders (phone, address, item_ids, total_amount) VALUES ($1, $2, $3, $4)",
            [userPhone, address, orderItems, orderAmount]
        );

        const feedback = {
            status: "success",
            message: "Order Placed"
        }
        
        res.json(feedback)
    } catch (error) {
        const feedback = {
            status: "error",
            message: "An Error Occured, Try Again"
        }
        
        res.json(feedback);
        console.log(error);
    }
});

app.get('/orders', (req, res) => {
    res.status(200).render("order-status.pug");
});

app.get('/fetch-pending-order', fetchuser, async (req, res) => {
    const userId = req.user.id;

    const userPhoneResult = await Pool.query("SELECT phone FROM users WHERE id = ($1)", [userId])
    const userPhone = userPhoneResult.rows[0].phone
    
    try {
        const order = await Pool.query(
            "SELECT * FROM orders WHERE phone = ($1)",
            [userPhone]
        );

        const orderData = order.rows;

        if (orderData.length > 0){
            const feedback = {
                status: "success",
                message: "Order fetched"
            }
            
            res.status(200).json({orderData, feedback});
        } else {
            const feedback = {
                status: "No Order",
                message: "No Pending Order"
            }
            
            res.status(200).json({feedback});
        }
    } catch (error) {
        const feedback = {
            status: "error",
            message: "Some error occured"
        }
        console.log(error);
        res.json(feedback);
    }
});

app.listen(8000);
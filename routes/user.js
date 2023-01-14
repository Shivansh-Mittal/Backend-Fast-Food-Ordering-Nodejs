const express = require('express');
const connection = require('../connection');
const router = express.Router();

const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

// signup api
router.post('/signup', (req, res) => {
    let user = req.body;
    query = "select email,password,role,status from user where email=?";
    connection.query(query, [user.email], (err, results) => {
        if (!err) {
            if (results.length <= 0) {
                query = "insert into user(name,contactNumber,email,password,status,role) values(?,?,?,?,'false','user')";
                connection.query(query, [user.name, user.contactNumber, user.email, user.password], (err, results) => {
                    if (!err) {
                        return res.status(200).json({ message: "Successfully Registered" });
                    } else {
                        return res.status(500).json(err);
                    }
                })
            }
            else {
                return res.status(400).json({ message: "Email is already registered. Please Signin with your account." });
            }
        }
        else {
            return res.status(500).json(err);
        }
    })
})

// login api
router.post('/login', (req, res) => {
    const user = req.body;
    query = "select email,password,role,status from user where email=?";
    connection.query(query, [user.email], (err, results) => {
        if (!err) {
            if (results.length <= 0 || results[0].password != user.password) {
                return res.status(401).json({ message: "Invalid Credentials" });
            }
            else if (results[0].status == 'false') {
                return res.status(401).json({ message: "Wait for Admin Approval" });
            }
            else if (results[0].password == user.password) {
                const response = { email: results[0].email, role: results[0].role };
                const accessToken = jwt.sign(response, process.env.ACCESS_TOKEN, { expiresIn: '24h' });
                res.status(200).json({ token: accessToken });
            }
            else {
                return res.status(400).json({ message: "Something went wrong. Please try again later" });
            }
        }
        else {
            return res.status(500).json(err);
        }
    })
})

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.APP_PASSWORD
    }
})

//forgot password api
router.post('/forgotPassword',(req,res)=>{
    const user = req.body;
    query = "select email,password from user where email=?";
    connection.query(query,[user.email],(err,results)=>{
        if(!err){
            if(results.length<=0)
            {
                return res.status(200).json({message:"Password sent successfully to your email."});
            }
            else{
                var mailOptions = {
                    from: process.env.EMAIL,
                    to: results[0].email,
                    subject: 'Password by Fast Food Order',
                    html: '<p><b>Your Login Details for Fast Food Order</b><br><b>Email: </b>'+results[0].email+'<br><b>Password: </b>'+results[0].password+'<br><a href="http://localhost:4200/">Click here to login</a></p>'
                };
                transporter.sendMail(mailOptions,function(error,info){
                    if(error){
                        console.error(error);
                    }
                    else{
                        console.log('Email sent: '+info.response);
                    }
                });
                return res.status(200).json({message:"Password sent successfully to your email."});
            }
        }
        else{
            return res.status(500).json(err);
        }
    })
})

//get all users with user role api
router.get('/get',(req,res)=>{
    var query = "select id,name,email,contactNumber,status from user where role='user'";
    connection.query(query,(err,results)=>{
        if(!err){
            return res.status(200).json(results);
        }
        else{
            return res.status(500).json(err);
        }
    })
})

// api to update the user status using user id
router.patch('/update', (req,res)=>{
    let user = req.body;
    var query = "update user set status=? where id=?";
    connection.query(query, [user.status. user.id], (err,results)=>{
        if(!err){
            if(results.affectedRows == 0){
                return res.status(404).json({message:"User does not exist"});
            }
            return res.status(200).json({message:"User Updated successfully"});
        }
        else {
            return res.status(500).json(err);
        }
    })
})

router.get('/checkToken',(req,res)=>{
    return res.status(200).json({message:"true"});
})



module.exports = router;
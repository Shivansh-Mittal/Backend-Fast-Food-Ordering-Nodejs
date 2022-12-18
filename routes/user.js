const express = require('express');
const connection = require('../connection');
const router = express.Router();

const jwt = require('jsonwebtoken');
require('dotenv').config();

// signup api
router.post('/signup', (req,res) => {
    let user = req.body;
    query = "select email,password,role,status from user where email=?";
    connection.query(query, [user.email], (err,results) => {
        if(!err){
            if(results.length <= 0){
                query = "insert into user(name,contactNumber,email,password,status,role) values(?,?,?,?,'false','user')";
                connection.query(query, [user.name, user.contactNumber, user.email, user.password], (err,results) => {
                    if(!err){
                        return res.status(200).json({message: "Successfully Registered"});
                    }else{
                        return res.status(500).json(err);
                    }
                })
            }
            else{
                return res.status(400).json({message: "Email is already registered. Please Signin with your account."});
            }
        }
        else{
            return res.status(500).json(err);
        }
    })
})

// login api
router.post('/login', (req,res) => {
    const user = req.body;
    query = "select email,password,role,status from user where email=?";
    connection.query(query, [user.email], (err,results) => {
        if(!err){
            if(results.length <= 0 || results[0].password != user.password){
                return res.status(401).json({message:"Invalid Credentials"});
            }
            else if(results[0].status == 'false'){
                return res.status(401).json({message:"Wait for Admin Approval"});
            }
            else if(results[0].password == user.password){

            }
            else{
                return res.status(400).json({message:"Something went wrong. Please try again later"});
            }
        }
        else{
            return res.status(500).json(err);
        }
    })
})

module.exports = router;
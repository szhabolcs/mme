'use strict';
const express = require('express');
const axios = require('axios').default;
const serverless = require('serverless-http');
const app = express();
const router = express.Router();

let response = {data: "Operation not permitted."};

const MASTERPASS = process.env.MASTERPASS;
const APIENDPOINT = process.env.APIENDPOINT;

router.post("*", async (req, res) => {
    const {user} = req.context.clientContext;

    if(typeof(user) === "undefined"){
        //Guest logged in
    }
    else if(typeof(user.app_metadata.roles) !== 'undefined' && user.app_metadata.roles[0] == "admin"){
        //Admin logged in

        req.query.MASTERPASS = MASTERPASS;

        await axios.post(APIENDPOINT+req.path, null,{
            params: req.query
        }).then((e)=>{
            response = e;
        })
        .catch((error)=>{
            response = error;
        });
    }

    res.status(200).json(response.data);
});

router.put("*", async (req, res) => {
    const {user} = req.context.clientContext;

    if(typeof(user) === "undefined"){
        //Guest logged in
    }
    else if(typeof(user.app_metadata.roles) !== 'undefined' && user.app_metadata.roles[0] == "admin"){
        //Admin logged in

        req.query.MASTERPASS = MASTERPASS;

        await axios.put(APIENDPOINT+req.path, null,{
            params: req.query
        }).then((e)=>{
            response = e;
        })
        .catch((error)=>{
            response = error;
        });
    }

    res.status(200).json(response.data);
});

router.delete("*", async (req, res) => {
    const {user} = req.context.clientContext;

    if(typeof(user) === "undefined"){
        //Guest logged in
    }
    else if(typeof(user.app_metadata.roles) !== 'undefined' && user.app_metadata.roles[0] == "admin"){
        //Admin logged in

        req.query.MASTERPASS = MASTERPASS;

        await axios.delete(APIENDPOINT+req.path,{
            params: req.query
        }).then((e)=>{
            response = e;
        })
        .catch((error)=>{
            response = error;
        });
    }

    res.status(200).json(response.data);
});

router.get("*", async (req, res) => {

    await axios.get(APIENDPOINT+req.path,{
        params: req.query
    }).then((e)=>{
        response = e;
    })
    .catch((error)=>{
        response = error;
    });

    res.status(200).json(response.data);
});

app.use("/.netlify/functions/proxy",router);

module.exports.handler = serverless(app, {
    request: function (req, event, context) {
        req.event = event;
        req.context = context;
    },
 });

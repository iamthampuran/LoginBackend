const express = require('express')
const router = express.Router()
//mongodb user model
const User = require('./../models/User')
const Differ = require('./../models/Diff')
const bcrypt = require('bcrypt') //password hashing
const publication = require('./../models/Pub')
const jwt = require('jsonwebtoken')
const SECRET_KEY = "SIGNIN_API"

router.get('/signup', (req,res) =>{
    let{name, email, password,dateOfBirth} = req.body
    name = name.trim()
    email = email.trim()
    password = password.trim()
    dateOfBirth = dateOfBirth.trim()

    if(name == "" || email == "" || password == "" || dateOfBirth == "")
    {
        res.json({
            status: "FAILED",
            message: "Empty input fields"
        });
    }
    else if (!/^[a-zA-Z ]*$/.test(name)){
        res.json({
            status: "FAILED",
            message: "Invalid name"
        });
    }
    else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)){
        res.json({
            status: "FAILED",
            message: "Invalid email"
        }); 
    }
    else if(!new Date(dateOfBirth).getTime()){
        res.json({
            status: "FAILED",
            message: "Invalid Date"
        });
    }
    else if(password.length<8){
        res.json({
            status: "FAILED",
            message: "Password too short"
        });
    }
    else{
        //checking if user already exist
        User.find({email}).then(result =>{
            if(result.length){
                //user already exist
                res.json({
                    status: "FAILED",
                    message: "User already exist"
                })
            }
            else{
                //Try to create new user


                //password handling
                const saltRounds = 10;
                bcrypt.hash(password,saltRounds).then(hashedPassword =>{
                    const newUser = new User({
                        name,
                        email,
                        password: hashedPassword,
                        dateOfBirth,
                        type: "F"
                    });
                    const newDiffer = new Differ({
                        email,
                        type: "F"
                    });
                    newUser.save().then(result => {
                        newDiffer.save()
                        res.json({
                            status: "SUCCESS",
                            message: "Sign Up Successful",
                            data: result
                        });
                    })
                    .catch(err => {
                        res.json({
                            status: "FAILED",
                            message: "An error occured while signing you up"
                        });
                    })
                })
                .catch(err =>{
                    res.json({
                        status: "FAILED",
                        message: "Error occured while hashing the password"
                    });
                })
            }
        }).catch(err => {
            console.log(err)
            res.json({
                status: "FAILED",
                message: "An error occured while checking for existing user"
            })
        })
    }
})

//signin
router.get('/signin', (req,res) =>{
    let{email, password,} = req.body
    email = email.trim()
    password = password.trim()

    if(email== "" || password == ""){
        res.json({
            status: "FAILED",
            message: "Empty field"
        })
    } else{
        User.find({email})
        .then( data => {
            if (data.length){
                const hashedPassword = data[0].password;
                const token = jwt.sign({
                    email: data[0].email,
                    id: data[0]._id
                }, SECRET_KEY)
                bcrypt.compare(password, hashedPassword).then(result =>{
                    if(result){
                        res.json({
                            status: "SUCCESS",
                            message: "Signin Successful",
                            data: data[0].type,
                            token: token
                        })
                    } else{
                        res.json({
                            status: "FAILED",
                            message: "Invalid password!"
                        })
                    }
                })
                .catch(err =>{
                    console.log(err)
                    res.json({
                        status: "FAILED",
                        message: "An error occured while comparing passwords"
                    })
                    
                })
            }
            else{
                res.json({
                    status: "FAILED",
                    message: "Invalid credentials enterred!"
                })
            }
        })
        .catch(err =>{
            res.json({
                status: "FAILED",
                message: "An error occured while checking for existing user!"
            })
        })  
    }
})

router.post('/viewprofile', (req,res) =>{
    let name = req.body
    User.find(name).then(result =>{
        if(result.length){
            console.log(result)
            let name = result[0].name
             let email = result[0].email
             console.log("Name = ",name,"\nEmail = ",email)
             const requ = {
                "Faculties": {$regex: name}
             }
             console.log(requ)
            publication.find({
                "Faculties": {$regex : name}
            }).then(data =>{
                console.log(1)
                if(data.length)
                {
                    res.json({
                    "status": "SUCCESS",
                    "message": "Faculty details found",
                    "name": name,
                    "email": email,
                    "data": data
                })
            }
            else{
                res.json(({
                    "status": "SUCCESS",
                    "message": "No publications",
                    "name": name,
                    "email": email
                }))
            }
            }).catch(err =>{
                console.log(err)
            })
        }
        else{
            res.json({
                "status": "FAILED",
                "message": "No user found"
            })
            
        }
    })
})


router.get('/assignmember', (req,res) =>{

    let {name} = req.body
    User.updateOne(req.body,
    {
        $set:{
            "type": "M"
        }
    })
    User.find(req.body)
    .then(data =>{
        if(data[0].type == "M")
        {
            res.json({
                "status": "SUCCESS",

                "message": "Sucessfully appointed as member",
                "data": data
            })
        }
        else{
            res.json({
                "status": "FAILED",
                "message": "Failed in appointing as member"
            })
        }
    }).catch(err =>{
        res.json({
            "status": "FAILED",
            "message": "Couldn't find the user"
        })
    })
       
    })


module.exports = router
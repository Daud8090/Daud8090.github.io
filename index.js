const mysql = require("mysql");
const express= require("express");
const app = express();
const bodyParser=require('body-parser');
const { json } = require("body-parser");
var cors = require('cors');
const { query } = require("express");
app.use(cors())

//to access json data we use bodyParser
app.use(bodyParser.json());



// const db = mysql.createPool({
//     host:"localhost",
//     user:"root",
//     password:"",
//     database:"customer",
//     insecureAuth: true
// });
const { Client } = require('pg');

const db = new Client({
  connectionString: "postgres://rctpmolfdkpwyn:e802edbf278cf1677c1a78b1e06571f2186d068c62222195cfb04ba2b509045d@ec2-3-218-123-191.compute-1.amazonaws.com:5432/de5iup4l1fhejk",
  ssl: {
    rejectUnauthorized: false
  }
});

db.connect();


// db.getConnection(function (err) {
//     // if(err)
//     console.log(err)
// })

app.listen(process.env.PORT || 3005,() => {
console.log(process.env.PORT);
});

//to fetch the data from database on the route and the function 
// will be called we someone calls the route
app.get("/", (req, res)=>{
    res.send("All good")
})

app.get('/Allcustomers', (req, res)=>{
    db.query('SELECT * FROM cust_table', (err, rows, fields)=>{
        if(!err){
        res.send(rows.rows);
        }
        else
        console.log(err);
    })
})

// route for a single user
app.get('/Allcustomers/:sno', (req, res)=>{
    db.query('SELECT * FROM cust_table WHERE sno = ?',[req.params.sno], (err, rows, fields)=>{
        if(!err)
        res.send(rows.rows);
        else
        console.log(err);
    })
})

app.get('/transferMoney', (req,res) =>{
    var sender=req.query.email1;
    var receiver=req.query.email2;
    var amount=parseInt(req.query.amount);
    // var bool=false;
    db.query("SELECT * FROM cust_table WHERE email in ($1,$2)",[sender, receiver],(err,rows,fields)=>{
        if(!err)
        {
            var senderdb=rows.rows.filter(x=> x.email == sender);
            var receiverdb=rows.rows.filter(x=>x.email!=sender);
            // console.log(senderdb[0].email )

            // console.log(receiverdb[0].email )
                var slen=senderdb.length;
                var rlen=receiverdb.length;

                // if(senderdb[0].email!=sender || receiverdb[0].email!=receiver )
                if(slen == 0 || rlen == 0)
                {
                    // res.json({ success: false });
                    // res.send("going")
                    res.send("invalid email address")
                }
                else{

                        if(amount>senderdb[0].balance || amount <= 0)
                        {
                        // console.log("insufficient amount of money")
                            // bool=true;
                            // res.json({ success: false });
                            res.send("insufficient amount of money")
                            // return;
                        }

                        else{
                            // console.log(rows[1].balance)


                            var balS=senderdb[0].balance-amount;
                            var balR=receiverdb[0].balance+amount;
                            // console.log(balS);
                            // console.log(balR);
                            db.query("UPDATE cust_table SET balance=$1 WHERE email=$2",[balS,sender],(err,rows,fields)=>
                            {
                                if(err)
                                console.log(err);
                                db.query("UPDATE cust_table SET balance=$1 WHERE email=$2",[balR,receiver],(err,rows,fields)=>
                                {
                                    if(err)
                                    console.log(err);
                                    else
                                    // res.json({ success: true });
                                    // console.log("hora hai ")
                                    res.send("transfer successfull ");
                                    console.log("success")
                                });

                            });
                            

                            }
                    }




        }
        else{
        // res.json({ success: false });
        // console.log("last else")

        res.send("error in db");
        }
    });
   
});



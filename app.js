import express from "express";
import bodyParser from "body-parser";


const app = express();
const port = 3000;
var currentuser;
var userCredentials = {"dummy":{password:"dummy", email:"dummy@gmail.com",fname:"dum",lname:"my"}};
var posts = [];
app.set('view engine','ejs');
app.set('views','./views');

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

app.listen(port,()=>{
    console.log("Port is listening ");
});

app.get("/",(req,res)=>{
    res.render("login.ejs");
});
app.get("/signup",(req,res)=>{
    res.render("signup.ejs");
});
app.post("/login",(req,res)=>{
    const username = req.body.username;
    const password = req.body.password;
    if(username in userCredentials) {
        if(userCredentials[username].password === password) {
            currentuser = userCredentials[username].fname; // Add this line!
            res.render("home.ejs", {fname:currentuser, posts:posts});
        } else {
            res.render("login.ejs",{showAlert:true,error:"Wrong password"});
        }
    } else {
        res.render("login.ejs",{showAlert:true,error:"No such user exists, please sign up. "});
    }
});


app.post("/signup",(req,res)=>{
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    const fname = req.body.fname;
    const lname = req.body.lname;
    currentuser = fname;
    userCredentials[username] = {password:password,
        email:email,fname:fname,lname:lname
    }
    res.render("home.ejs",{fname:currentuser,posts:posts});
});

app.get("/create",(req,res)=>{
    res.render("create.ejs");
})
app.get("/home",(req,res)=>{
    res.render("home.ejs",{fname:currentuser,posts:posts});
})


app.post("/create",(req,res)=>{
    const title = req.body.title;
    const content = req.body.content;  // Fixed
    const author = req.body.author;    // Fixed
    var today = new Date();
    posts.push({
        title:title,
        content:content,
        author:author,
        time:today
    });
    res.render("create.ejs",{showSuccess:true});
});


app.post("/delete/:index", (req, res) => {
    const index = parseInt(req.params.index);
    
    if (index >= 0 && index < posts.length) {
        posts.splice(index, 1); // Remove 1 element at the specified index
        // Pass showDeleteSuccess flag
        res.render("home.ejs", {
            fname: currentuser, 
            posts: posts, 
            showDeleteSuccess: true
        });
    } else {
        // If deletion failed, don't show popup
        res.render("home.ejs", {
            fname: currentuser, 
            posts: posts, 
            showDeleteSuccess: false
        });
    }
});

app.get("/edit/:index",(req,res)=>{
    const index = parseInt(req.params.index);
    
    // Add validation
    if (index >= 0 && index < posts.length) {
        res.render("edit.ejs",{
            post:posts[index],
            index:index
        });
    } else {
        res.redirect("/home"); // Handle invalid index
    }
});


app.post("/edit/:index",(req,res)=>{
    const index = parseInt(req.params.index);
    const newtitle = req.body.title;
    const newText = req.body.content;
    var today = new Date();
    posts[index].title = newtitle;
    posts[index].content = newText;
    posts[index].time = today;
    res.redirect("/home")
})



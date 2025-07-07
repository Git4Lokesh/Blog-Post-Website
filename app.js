import express from "express";
import bodyParser from "body-parser";
import session from "express-session";

const app = express();
const port = 3000;

var userCredentials = {"dummy":{password:"dummy", email:"dummy@gmail.com",fname:"dum",lname:"my"}};
var posts = [];

app.set('view engine','ejs');
app.set('views','./views');

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

// Session middleware
app.use(session({
    secret: 'your-secret-key-here', // Change this to a random string
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Helper function to get current username from userCredentials
function getCurrentUsername(sessionUser) {
    for (let username in userCredentials) {
        if (userCredentials[username].fname === sessionUser) {
            return username;
        }
    }
    return null;
}

// Middleware to check authentication
function requireAuth(req, res, next) {
    if (!req.session.currentuser) {
        return res.redirect("/");
    }
    next();
}

app.get("/",(req,res)=>{
    res.render("login.ejs", {showAlert: false, error: null});
});

app.get("/signup",(req,res)=>{
    res.render("signup.ejs", {showAlert: false, error: null});
});

app.post("/login",(req,res)=>{
    const username = req.body.username;
    const password = req.body.password;
    if(username in userCredentials) {
        if(userCredentials[username].password === password) {
            // Store user info in session
            req.session.currentuser = userCredentials[username].fname;
            req.session.username = username;
            res.render("home.ejs", {
                fname: req.session.currentuser,
                posts: posts,
                showDeleteSuccess: false
            });
        } else {
            res.render("login.ejs",{showAlert:true,error:"Wrong password"});
        }
    } else {
        res.render("login.ejs",{showAlert:true,error:"No such user exists, please sign up."});
    }
});

app.post("/signup",(req,res)=>{
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    const fname = req.body.fname;
    const lname = req.body.lname;
    // Store in session
    req.session.currentuser = fname;
    req.session.username = username;
    userCredentials[username] = {
        password:password,
        email:email,
        fname:fname,
        lname:lname
    }
    res.render("home.ejs",{
        fname: req.session.currentuser,
        posts: posts,
        showDeleteSuccess: false
    });
});

app.get("/create", requireAuth, (req,res)=>{
    res.render("create.ejs", {showSuccess: false});
});

app.get("/home", requireAuth, (req,res)=>{
    res.render("home.ejs",{
        fname: req.session.currentuser,
        posts: posts,
        showDeleteSuccess: false
    });
});

app.post("/create", requireAuth, (req,res)=>{
    const title = req.body.title;
    const content = req.body.content;
    const author = req.body.author;
    var today = new Date();
    posts.push({
        title: title,
        content: content,
        author: author,
        time: today,
        owner: req.session.currentuser,
        ownerUsername: req.session.username
    });
    res.render("create.ejs",{showSuccess:true});
});

app.post("/delete/:index", requireAuth, (req, res) => {
    const index = parseInt(req.params.index);
    if (index >= 0 && index < posts.length) {
        const post = posts[index];
        if (post.owner === req.session.currentuser) {
            posts.splice(index, 1);
            res.render("home.ejs", {
                fname: req.session.currentuser,
                posts: posts,
                showDeleteSuccess: true
            });
        } else {
            res.render("home.ejs", {
                fname: req.session.currentuser,
                posts: posts,
                showDeleteSuccess: false,
                error: "Unauthorized: You can only delete your own posts"
            });
        }
    } else {
        res.render("home.ejs", {
            fname: req.session.currentuser,
            posts: posts,
            showDeleteSuccess: false
        });
    }
});

app.get("/edit/:index", requireAuth, (req,res)=>{
    const index = parseInt(req.params.index);
    if (index >= 0 && index < posts.length) {
        const post = posts[index];
        if (post.owner === req.session.currentuser) {
            res.render("edit.ejs",{
                post: posts[index],
                index: index
            });
        } else {
            res.redirect("/home");
        }
    } else {
        res.redirect("/home");
    }
});

app.post("/edit/:index", requireAuth, (req,res)=>{
    const index = parseInt(req.params.index);
    if (index >= 0 && index < posts.length) {
        const post = posts[index];
        if (post.owner === req.session.currentuser) {
            const newtitle = req.body.title;
            const newText = req.body.content;
            var today = new Date();
            posts[index].title = newtitle;
            posts[index].content = newText;
            posts[index].time = today;
            res.redirect("/home");
        } else {
            res.redirect("/home");
        }
    } else {
        res.redirect("/home");
    }
});

// Logout route
app.post("/logout", requireAuth, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        }
        res.redirect("/");
    });
});

app.listen(port,()=>{
    console.log("Port is listening ");
});

var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var expressSanitizer = require('express-sanitizer');
var ejs = require("ejs");
var mongoose = require('mongoose');


var url = "mongodb://localhost:27017/karma_Blogs";

var app = express();
mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true});
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

const hostname = "localhost";
const port = 3000;  

var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});

var Blog = new mongoose.model("Blog", blogSchema);

app.get("/", (req, res) => {
    res.redirect("/blogs");
});

app.get("/blogs", (req, res) => {
    Blog.find({}, (err, blogs) => {
        if(err) {
            console.log(err);
        } else {
            res.render("index", {blogs: blogs});
        }
    });
});


app.get("/blogs/new", (req, res) => {
    res.render("new");
});

app.post("/blogs", (req, res) => {

    req.body.blog.body = req.sanitize(req.body.blog.body);

    var obj = req.body.blog;
    Blog.create(obj, (err, newlyBlog) => {
        if(err) {
            res.render("new");
        } else {
            res.redirect("/blogs");
        }
    })
});

app.get("/blogs/:id", (req, res) => {
    Blog.findById(req.params.id, (err, foundPost) => {
        if(err) {
            console.log(err);
            res.redirect("/blogs");
        } else {
            res.render("show", {blog: foundPost});
        }
    });
});

app.get("/blogs/:id/edit", (req, res) => {
    Blog.findById(req.params.id, (err, foundPost) => {
        if(err) {
            console.log(err);
            res.redirect("/blogs");
        } else {
            res.render("edit", {blog: foundPost});
        }
    });
});

app.put("/blogs/:id", (req, res) => {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, (err, updatedBlog) => {
        if(err) {
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs/" + req.params.id);
        }
    });  
});

app.delete("/blogs/:id", (req, res) => {
    Blog.findByIdAndRemove(req.params.id, (err) => {
        if(err) {
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs");
        }
    });
});


app.listen(port, hostname, () => {
    console.log('Server is running!');
});
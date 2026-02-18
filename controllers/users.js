const User = require("../models/user");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

module.exports.renderSignupForm = (req, res) => {
    return res.render("users/signup.ejs");
}

module.exports.signup = async(req,res,next) => {
    try{
        let { username, email, password } = req.body;
        const newUser = new User({email, username});
        const registeredUser =  await User.register(newUser,password);
        console.log(registeredUser);
        req.login(registeredUser,(err) => {
            if(err){
                return next(err);
            }
            req.flash("success", "Welcome to Wanderlust!");
            return res.redirect("/listings");  
        })
    } catch(e){
        req.flash("error", e.message);
        return res.redirect("/signup");
    }
}

module.exports.renderLoginForm = (req,res) => {
    return res.render("users/login.ejs");
}

module.exports.login = async(req,res) => {
    req.flash("success", "Welcome back to Wanderlust!");
    if(!res.locals.redirectUrl){
        return res.redirect("/listings");
    }
    return res.redirect(res.locals.redirectUrl);
}

module.exports.logout = (req,res,next) => {
    req.logOut((err) => {
        if(err){
           return next(err);
        }
        req.flash("success", "you are logged out!");
        return res.redirect("/listings");
    })
}

module.exports.renderforgotForm = async(req,res) =>{
    return res.render("users/forgot.ejs");
}

module.exports.forgot = async(req,res) => {
    const user = await User.findOne({email:req.body.email});
    if (!user) {
        req.flash("error", "No account found");
        return res.redirect("/forgot");
    }
    const otp = crypto.randomInt(100000,999999).toString();
    user.resetOtp = otp;
    user.otpExpire = Date.now() + 300000; // 5 minutes
    await user.save();
    await sendEmail(user.email,"Password Reset OTP",`Your OTP is ${otp}`);
    return res.redirect("/verify-otp?email="+user.email);
}

module.exports.verifyOTP = async(req,res) => {
    const user = await User.findOne({ email: req.body.email });
    console.log(user.resetOtp);
    if (!user) {
        req.flash("error", "User not found");
        return res.redirect("/forgot");
    }
    if (user.resetOtp !== req.body.otp.toString()) {
        req.flash("error", "Invalid OTP");
        return res.redirect("/verify-otp");
    }
    if (user.otpExpire < Date.now()) {
        req.flash("error", "OTP expired");
        return res.redirect("/forgot");
    }
    req.session.resetUserId = user._id;
    return res.redirect("/reset-password");
};

module.exports.renderResetForm = async(req,res) => {
    if(!req.session.resetUserId){
        req.flash("error", "Failed to change your password");
        return res.redirect("/forgot");
    }
    return res.render("users/resetPassword.ejs");
}

module.exports.reset = async(req,res) => {
    const user = await User.findById(req.session.resetUserId);
    if(req.body.newpass != req.body.confirmpass){
        req.flash("error", "Passwords do not match");
        return res.redirect("/reset-password");
    }
    await user.setPassword(req.body.newpass); // (hash if needed)
    user.resetOtp = undefined;
    user.otpExpire = undefined;
    await user.save();
    req.session.resetUserId = null;
    req.flash("success","Password updated successfully!");
    return res.redirect("/login");
}
// jkaj ifpf vrli hlhi
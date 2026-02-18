const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    return res.render("./listings/index.ejs", {allListings});
}

module.exports.renderNewForm = (req,res) => {
    return res.render("./listings/new.ejs");
}

module.exports.showListing = async(req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        })
        .populate("owner");
    if(!listing){
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    return res.render("./listings/show.ejs", {listing});
}

module.exports.createListing = async (req,res) => {
    let response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(req.body.listing.location)}`);
    let data = await response.json();
    const lat = data[0].lat;
    const lng = data[0].lon;

    let url = req.file.path;
    let filename = req.file.filename;
    let newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};

    newListing.geometry = {
        type: "Point",
        coordinates: [parseFloat(lng), parseFloat(lat)]
    };

    let savedListing = await newListing.save();
    console.log(savedListing);

    req.flash("success", "New Listing created!")
    return res.redirect("/listings");
}

module.exports.renderEditForm = async(req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    } 
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250")
    return res.render("./listings/edit.ejs",{ listing, originalImageUrl }); 
}

module.exports.updateListing = async(req,res) => {
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing}); 
    if(req.file){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }
    req.flash("success","Listing Updated!");
    return res.redirect(`/listings/${id}`); 
}

module.exports.destroyListing = async(req,res) => {
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!")
    return res.redirect("/listings");
}
const Footer = require("../models/Footer");
const Setting = require("../models/SiteSettings");


const getFooter = async (req, res) => {
  try {
    let footer = await Footer.findOne();

    if (!footer) {
      footer = await Footer.create({
        companyName: "My Ecommerce",
        description: "Your trusted online shopping destination.",
        phone: "",
        email: "",
        address: "",
        facebook: "",
        instagram: "",
        twitter: "",
        youtube: "",
        copyright: "© 2026 My Ecommerce. All rights reserved.",
      });
    }

    res.status(200).json({
      success: true,
      footer,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


const updateFooter = async (req, res) => {
  try {
    const {
      companyName,
      description,
      phone,
      email,
      address,
      facebook,
      instagram,
      twitter,
      youtube,
      copyright,
    } = req.body;

    let footer = await Footer.findOne();

    if (!footer) {
      footer = new Footer();
    }

    if (companyName) {
      footer.companyName = companyName;
    }

    if (description) {
      footer.description = description;
    }

    if (phone) {
      footer.phone = phone;
    }

    if (email) {
      footer.email = email;
    }

    if (address) {
      footer.address = address;
    }

    if (facebook) {
      footer.facebook = facebook;
    }

    if (instagram) {
      footer.instagram = instagram;
    }

    if (twitter) {
      footer.twitter = twitter;
    }

    if (youtube) {
      footer.youtube = youtube;
    }

    if (copyright) {
      footer.copyright = copyright;
    }

    await footer.save();


    let settings = await Setting.findOne();

    if (settings && companyName) {
      settings.siteName = companyName;
      await settings.save();
    }

    res.status(200).json({
      success: true,
      message: "Footer updated successfully",
      footer,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

module.exports = {
  getFooter,
  updateFooter,
};
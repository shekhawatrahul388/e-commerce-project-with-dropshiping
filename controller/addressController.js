const Address = require("../models/Address");


const createAddress = async (req, res) => {
  try {
    const {
      name,
      phone,
      address,
      landmark,
      city,
      state,
      pincode,
      isDefault,
    } = req.body;

    if (!name || !phone || !address || !city || !state || !pincode) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled",
      });
    }

    if (phone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be 10 digits",
      });
    }

    if (pincode.length !== 6) {
      return res.status(400).json({
        success: false,
        message: "Pincode must be 6 digits",
      });
    }


    if (isDefault) {
      await Address.updateMany(
        { user: req.user._id },
        { isDefault: false }
      );
    }

    const newAddress = await Address.create({
      user: req.user._id,
      name,
      phone,
      address,
      landmark,
      city,
      state,
      pincode,
      isDefault,
    });

    res.status(201).json({
      success: true,
      message: "Address created successfully",
      address: newAddress,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


const getMyAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({
      user: req.user._id,
    });

    res.status(200).json({
      success: true,
      addresses,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


const getSingleAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    res.status(200).json({
      success: true,
      address,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


const updateAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    const {
      name,
      phone,
      address: addressText,
      landmark,
      city,
      state,
      pincode,
      isDefault,
    } = req.body;

    if (phone && phone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be 10 digits",
      });
    }

    if (pincode && pincode.length !== 6) {
      return res.status(400).json({
        success: false,
        message: "Pincode must be 6 digits",
      });
    }

    if (isDefault) {
      await Address.updateMany(
        {
          user: req.user._id,
          _id: { $ne: req.params.id },
        },
        {
          isDefault: false,
        }
      );
    }

    address.name = name || address.name;
    address.phone = phone || address.phone;
    address.address = addressText || address.address;
    address.landmark = landmark || address.landmark;
    address.city = city || address.city;
    address.state = state || address.state;
    address.pincode = pincode || address.pincode;

    if (isDefault !== undefined) {
      address.isDefault = isDefault;
    }

    await address.save();

    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      address,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


const deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


const setDefaultAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    await Address.updateMany(
      { user: req.user._id },
      { isDefault: false }
    );

    address.isDefault = true;

    await address.save();

    res.status(200).json({
      success: true,
      message: "Default address updated",
      address,
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
  createAddress,
  getMyAddresses,
  getSingleAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
import Product from "../models/Product.js";

// Create Product
export const createProduct = async (
  req,
  res
) => {
  try {
    const {
      title,
      description,
      price,
      category,
      image,
    } = req.body;

    const product = await Product.create({
      title,
      description,
      price,
      category,
      image,
      seller: req.user.id,
    });

    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Get All Products
export const getProducts = async (
  req,
  res
) => {
  try {
    const products = await Product.find()
      .populate("seller", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
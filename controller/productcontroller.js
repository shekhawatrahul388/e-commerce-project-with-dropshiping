const mongoose = require("mongoose");

const Product = require("../models/product");
const Category = require("../models/category");
const Supplier = require("../models/Supplier");



const createSlug = (name) => {
  return String(name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};



const getUniqueSlug = async (
  name,
  excludeId = null
) => {
  const baseSlug =
    createSlug(name) || "product";

  let slug = baseSlug;
  let count = 1;

  while (true) {
    const query = {
      slug,
    };

    if (excludeId) {
      query._id = {
        $ne: excludeId,
      };
    }

    const exists =
      await Product.findOne(query);

    if (!exists) {
      return slug;
    }

    slug =
      `${baseSlug}-${count}`;

    count++;
  }
};



const toBoolean = (value) => {
  if (
    value === true ||
    value === "true" ||
    value === 1 ||
    value === "1"
  ) {
    return true;
  }

  return false;
};



const validateSupplier = async (
  supplierId,
  isDropshipping,
  supplierPrice,
  allowExternalSupplier = false
) => {
  const dropshipping =
    toBoolean(isDropshipping);

  if (!dropshipping) {
    return {
      error: null,
      supplier: null,
    };
  }

  if (!supplierId) {
    if (allowExternalSupplier) {
      if (supplierPrice === undefined || supplierPrice === null || supplierPrice === "") {
        return { error: "Supplier price is required" };
      }

      const externalPrice = Number(supplierPrice);
      if (Number.isNaN(externalPrice) || externalPrice < 0) {
        return { error: "Supplier price cannot be negative" };
      }

      return { error: null, supplier: null };
    }

    return {
      error:
        "Supplier is required for dropshipping product",
    };
  }

  if (
    !mongoose.Types.ObjectId.isValid(
      supplierId
    )
  ) {
    return {
      error: "Invalid supplier ID",
    };
  }

  const supplier =
    await Supplier.findById(
      supplierId
    );

  if (!supplier) {
    return {
      error: "Supplier not found",
    };
  }

  if (!supplier.isActive) {
    return {
      error: "Supplier is inactive",
    };
  }

  if (
    supplierPrice === undefined ||
    supplierPrice === null ||
    supplierPrice === ""
  ) {
    return {
      error:
        "Supplier price is required",
    };
  }

  const price =
    Number(supplierPrice);

  if (
    Number.isNaN(price) ||
    price < 0
  ) {
    return {
      error:
        "Supplier price cannot be negative",
    };
  }

  return {
    error: null,
    supplier,
  };
};



const validateProductData = async (
  data,
  options = {}
) => {
  const {
    name,
    description,
    category,
    price,
    salePrice,
    stock,
    isDropshipping,
    supplier,
    supplierPrice
  } = data;


  if (
    !name ||
    !String(name).trim()
  ) {
    return "Product name is required";
  }


  if (
    !description ||
    !String(description).trim()
  ) {
    return "Product description is required";
  }


  if (!category) {
    return "Category is required";
  }

  if (
    !mongoose.Types.ObjectId.isValid(
      category
    )
  ) {
    return "Invalid category ID";
  }

  const categoryExists =
    await Category.findById(
      category
    );

  if (!categoryExists) {
    return "Category not found";
  }


  if (
    price === undefined ||
    price === null ||
    price === ""
  ) {
    return "Price is required";
  }

  const productPrice =
    Number(price);

  if (
    Number.isNaN(productPrice) ||
    productPrice < 0
  ) {
    return "Price cannot be negative";
  }


  if (
    salePrice !== undefined &&
    salePrice !== null &&
    salePrice !== ""
  ) {
    const sale =
      Number(salePrice);

    if (
      Number.isNaN(sale) ||
      sale < 0
    ) {
      return "Sale price cannot be negative";
    }

    if (
      sale > productPrice
    ) {
      return "Sale price cannot be greater than price";
    }
  }


  if (
    stock !== undefined &&
    stock !== null &&
    stock !== ""
  ) {
    const stockNumber =
      Number(stock);

    if (
      Number.isNaN(stockNumber) ||
      stockNumber < 0
    ) {
      return "Stock cannot be negative";
    }
  }


  const supplierValidation =
    await validateSupplier(
      supplier,
      isDropshipping,
      supplierPrice
    );

  if (
    supplierValidation.error
  ) {
    return supplierValidation.error;
  }

  return null;
};

const hasValue = (value) =>
  value !== undefined && value !== null && value !== "";

const cleanText = (value) =>
  value ? String(value).trim() : "";

const buildProductData = (data, extra = {}) => {
  const dropshipping = toBoolean(data.isDropshipping);

  return {
    name: cleanText(data.name),
    description: cleanText(data.description),
    brand: cleanText(data.brand),
    category: data.category,
    price: Number(data.price),
    salePrice: hasValue(data.salePrice) ? Number(data.salePrice) : null,
    stock: hasValue(data.stock) ? Number(data.stock) : 0,
    sku: data.sku ? cleanText(data.sku).toUpperCase() : undefined,
    image: data.image || "",
    images: Array.isArray(data.images) ? data.images : [],
    isActive: data.isActive !== undefined ? toBoolean(data.isActive) : true,
    featured: toBoolean(data.featured),
    newArrival: toBoolean(data.newArrival),
    bestSeller: toBoolean(data.bestSeller),
    isDropshipping: dropshipping,
    supplier: dropshipping ? data.supplier || null : null,
    supplierName: cleanText(data.supplierName),
    supplierProductId: cleanText(data.supplierProductId),
    supplierUrl: cleanText(data.supplierUrl),
    supplierPrice: dropshipping ? Number(data.supplierPrice || 0) : 0,
    tags: Array.isArray(data.tags)
      ? data.tags.map((tag) => cleanText(tag)).filter(Boolean)
      : [],
    ...extra,
  };
};



const createProduct = async (
  req,
  res
) => {
  try {
    const data = req.body;

    const validationError =
      await validateProductData(
        data
      );

    if (validationError) {
      return res.status(400).json({
        success: false,
        message:
          validationError,
      });
    }

    let productSku;

    if (data.sku) {
      productSku =
        String(data.sku)
          .trim()
          .toUpperCase();

      const existingSku =
        await Product.findOne({
          sku: productSku,
        });

      if (existingSku) {
        return res.status(400).json({
          success: false,
          message:
            "SKU already exists",
        });
      }
    }



    const product = await Product.create({
      ...buildProductData(data),
      slug: await getUniqueSlug(data.name),
      sku: productSku,
    });



    const populatedProduct =
      await Product.findById(
        product._id
      )
        .populate(
          "category",
          "name slug image description"
        )
        .populate(
          "supplier",
          "name companyName phone email address website isActive"
        );



    res.status(201).json({
      success: true,

      message:
        "Product created successfully",

      product:
        populatedProduct,
    });
  } catch (error) {
    console.error(
      "Create Product Error:",
      error
    );

    if (
      error.code === 11000
    ) {
      return res.status(400).json({
        success: false,
        message:
          "SKU or slug already exists",
      });
    }

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to create product",
    });
  }
};



const createMultipleProducts =
  async (req, res) => {
    try {
      const {
        products,
      } = req.body;

      if (
        !Array.isArray(
          products
        ) ||
        products.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Products array is required",
        });
      }

      if (
        products.length > 100
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Maximum 100 products can be added at once",
        });
      }

      const preparedProducts =
        [];



      for (
        let i = 0;
        i < products.length;
        i++
      ) {
        const data =
          products[i];

        const validationError =
          await validateProductData(
            data
          );

        if (validationError) {
          return res.status(400).json({
            success: false,
            message:
              `Product ${i + 1}: ${validationError}`,
          });
        }



        let productSku;

        if (data.sku) {
          productSku =
            String(
              data.sku
            )
              .trim()
              .toUpperCase();

          const existingSku =
            await Product.findOne({
              sku: productSku,
            });

          if (existingSku) {
            return res.status(400).json({
              success: false,
              message:
                `Product ${i + 1}: SKU already exists`,
            });
          }

          const duplicateSku =
            preparedProducts.some(
              (item) =>
                item.sku ===
                productSku
            );

          if (duplicateSku) {
            return res.status(400).json({
              success: false,
              message:
                `Product ${i + 1}: duplicate SKU in request`,
            });
          }
        }



        const slug =
          await getUniqueSlug(
            data.name
          );



        preparedProducts.push({
          name:
            String(
              data.name
            ).trim(),

          slug,

          description:
            String(
              data.description
            ).trim(),

          brand:
            data.brand
              ? String(
                  data.brand
                ).trim()
              : "",

          category:
            data.category,

          price:
            Number(
              data.price
            ),

          salePrice:
            data.salePrice !==
              undefined &&
            data.salePrice !==
              null &&
            data.salePrice !== ""
              ? Number(
                  data.salePrice
                )
              : null,

          stock:
            data.stock !==
              undefined &&
            data.stock !==
              null &&
            data.stock !== ""
              ? Number(
                  data.stock
                )
              : 0,

          sku:
            productSku,

          image:
            data.image || "",

          images:
            Array.isArray(
              data.images
            )
              ? data.images
              : [],

          isActive:
            data.isActive !== undefined
              ? toBoolean(data.isActive)
              : true,

          approvalStatus:
            data.approvalStatus || "approved",

          submittedBy:
            req.user?._id || null,

          featured:
            toBoolean(
              data.featured
            ),

          newArrival:
            toBoolean(
              data.newArrival
            ),

          bestSeller:
            toBoolean(
              data.bestSeller
            ),

          isDropshipping:
            toBoolean(
              data.isDropshipping
            ),

          supplier:
            toBoolean(
              data.isDropshipping
            )
              ? data.supplier || null
              : null,

          supplierName:
            data.supplierName
              ? String(
                  data.supplierName
                ).trim()
              : "",

          supplierProductId:
            data.supplierProductId
              ? String(
                  data.supplierProductId
                ).trim()
              : "",

          supplierUrl:
            data.supplierUrl
              ? String(
                  data.supplierUrl
                ).trim()
              : "",

          supplierPrice:
            toBoolean(
              data.isDropshipping
            )
              ? Number(
                  data.supplierPrice || 0
                )
              : 0,

          tags:
            Array.isArray(
              data.tags
            )
              ? data.tags.map(
                  (tag) =>
                    String(
                      tag
                    ).trim()
                ).filter(Boolean)
              : [],
        });
      }



      const createdProducts =
        await Product.insertMany(
          preparedProducts,
          {
            ordered: true,
          }
        );



      const productIds =
        createdProducts.map(
          (product) =>
            product._id
        );

      const populatedProducts =
        await Product.find({
          _id: {
            $in: productIds,
          },
        })
          .populate(
            "category",
            "name slug image"
          )
          .populate(
            "supplier",
            "name companyName phone email website isActive"
          );

      res.status(201).json({
        success: true,

        message:
          `${createdProducts.length} products created successfully`,

        count:
          createdProducts.length,

        products:
          populatedProducts,
      });
    } catch (error) {
      console.error(
        "Create Multiple Products Error:",
        error
      );

      if (
        error.code === 11000
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Duplicate SKU or slug found",
        });
      }

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to create multiple products",
      });
    }
  };



const submitProduct = async (req, res) => {
  try {
    const filePath = req.file?.path;
    const uploadedImage = req.file
      ? typeof filePath === "string" && filePath.startsWith("http")
        ? filePath
        : `https://${req.get("host")}/uploads/products/${req.file.filename}`
      : "";

    const bodyImage =
      typeof req.body?.image === "string"
        ? req.body.image
        : req.body?.image?.url ||
          req.body?.image?.secure_url ||
          req.body?.image?.path ||
          "";

    const data = {
      ...(req.body || {}),
      image: uploadedImage || bodyImage,
    };

    if (!data.image) {
      return res.status(400).json({
        success: false,
        message: "Product image is required",
      });
    }

    const validationError = await validateProductData({
      ...data,
      isDropshipping: data.isDropshipping,
      supplier: data.supplier,
      supplierPrice: data.supplierPrice,
    }, { allowExternalSupplier: true });

    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const product = await Product.create({
      ...buildProductData(data, {
        isActive: false,
        approvalStatus: "pending",
        submittedBy: req.user._id,
      }),
      slug: await getUniqueSlug(data.name),
    });

    return res.status(201).json({
      success: true,
      message: "Product submitted for admin approval",
      product,
    });
  } catch (error) {
    console.error("SUBMIT PRODUCT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to submit product",
    });
  }
};

const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ submittedBy: req.user._id })
      .populate("category", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("GET MY PRODUCTS ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to load your products" });
  }
};

const approveProduct = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const rejected = req.body.approvalStatus === "rejected";
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { approvalStatus: rejected ? "rejected" : "approved", isActive: !rejected },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return res.status(200).json({
      success: true,
      message: `Product ${product.approvalStatus}`,
      product,
    });
  } catch (error) {
    console.error("APPROVE PRODUCT ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to update approval" });
  }
};



const getAllProducts =
  async (req, res) => {
    try {
      const {
        search = "",
        category,
        supplier,
        dropshipping,
        featured,
        newArrival,
        bestSeller,
        active,
        minPrice,
        maxPrice,
        page = 1,
        limit = 20,
        sort = "latest",
      } = req.query;

      const pageNumber =
        Math.max(
          Number(page) || 1,
          1
        );

      const limitNumber =
        Math.min(
          Math.max(
            Number(limit) || 20,
            1
          ),
          100
        );

      const skip =
        (pageNumber - 1) *
        limitNumber;

      const filter = {};

      if (req.query.includePending !== "true") {
        filter.isActive = true;
        filter.$and = [
          {
            $or: [
              { approvalStatus: "approved" },
              { approvalStatus: { $exists: false } },
            ],
          },
        ];
      }



      if (
        search &&
        search.trim()
      ) {
        filter.$or = [
          {
            name: {
              $regex:
                search.trim(),
              $options: "i",
            },
          },
          {
            brand: {
              $regex:
                search.trim(),
              $options: "i",
            },
          },
          {
            sku: {
              $regex:
                search.trim(),
              $options: "i",
            },
          },
          {
            tags: {
              $regex:
                search.trim(),
              $options: "i",
            },
          },
        ];
      }



      if (category) {
        if (
          mongoose.Types.ObjectId.isValid(
            category
          )
        ) {
          filter.category =
            category;
        }
      }



      if (supplier) {
        if (
          mongoose.Types.ObjectId.isValid(
            supplier
          )
        ) {
          filter.supplier =
            supplier;
        }
      }



      if (
        dropshipping !==
        undefined
      ) {
        filter.isDropshipping =
          toBoolean(
            dropshipping
          );
      }



      if (
        featured !==
        undefined
      ) {
        filter.featured =
          toBoolean(
            featured
          );
      }



      if (
        newArrival !==
        undefined
      ) {
        filter.newArrival =
          toBoolean(
            newArrival
          );
      }



      if (
        bestSeller !==
        undefined
      ) {
        filter.bestSeller =
          toBoolean(
            bestSeller
          );
      }



      if (
        active !==
        undefined
      ) {
        filter.isActive =
          toBoolean(
            active
          );
      }



      if (
        minPrice !==
          undefined ||
        maxPrice !==
          undefined
      ) {
        filter.price = {};

        if (
          minPrice !==
          undefined
        ) {
          filter.price.$gte =
            Number(
              minPrice
            );
        }

        if (
          maxPrice !==
          undefined
        ) {
          filter.price.$lte =
            Number(
              maxPrice
            );
        }
      }



      let sortOption = {
        createdAt: -1,
      };

      if (
        sort === "oldest"
      ) {
        sortOption = {
          createdAt: 1,
        };
      }

      if (
        sort === "price-low"
      ) {
        sortOption = {
          price: 1,
        };
      }

      if (
        sort === "price-high"
      ) {
        sortOption = {
          price: -1,
        };
      }

      if (
        sort === "name"
      ) {
        sortOption = {
          name: 1,
        };
      }



      const [
        products,
        total,
      ] = await Promise.all([
        Product.find(filter)
          .populate(
            "category",
            "name slug image"
          )
          .populate(
            "supplier",
            "name companyName phone email website isActive"
          )
          .sort(sortOption)
          .skip(skip)
          .limit(
            limitNumber
          ),

        Product.countDocuments(
          filter
        ),
      ]);

      res.status(200).json({
        success: true,

        products,

        pagination: {
          total,
          page: pageNumber,
          limit: limitNumber,
          totalPages:
            Math.ceil(
              total /
                limitNumber
            ),
        },
      });
    } catch (error) {
      console.error(
        "Get Products Error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to get products",
      });
    }
  };



const getSingleProduct =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      let query;

      if (
        mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        query = {
          _id: id,
        };
      } else {
        query = {
          slug: id,
        };
      }

      const product =
        await Product.findOne(
          {
            ...query,
            isActive: true,
            $or: [
              { approvalStatus: "approved" },
              { approvalStatus: { $exists: false } },
            ],
          }
        )
          .populate(
            "category",
            "name slug image description"
          )
          .populate(
            "supplier",
            "name companyName phone email address website isActive"
          );

      if (!product) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found",
        });
      }

      res.status(200).json({
        success: true,
        product,
      });
    } catch (error) {
      console.error(
        "Get Single Product Error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to get product",
      });
    }
  };



const updateProduct =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid product ID",
        });
      }

      const product =
        await Product.findById(
          id
        );

      if (!product) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found",
        });
      }

      const data =
        req.body;



      if (
        data.name !==
        undefined
      ) {
        const name =
          String(
            data.name
          ).trim();

        if (!name) {
          return res.status(400).json({
            success: false,
            message:
              "Product name cannot be empty",
          });
        }

        product.name =
          name;

        product.slug =
          await getUniqueSlug(
            name,
            id
          );
      }



      if (
        data.description !==
        undefined
      ) {
        const description =
          String(
            data.description
          ).trim();

        if (!description) {
          return res.status(400).json({
            success: false,
            message:
              "Description cannot be empty",
          });
        }

        product.description =
          description;
      }



      if (
        data.brand !==
        undefined
      ) {
        product.brand =
          String(
            data.brand
          ).trim();
      }



      if (
        data.category !==
        undefined
      ) {
        if (
          !mongoose.Types.ObjectId.isValid(
            data.category
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid category ID",
          });
        }

        const category =
          await Category.findById(
            data.category
          );

        if (!category) {
          return res.status(404).json({
            success: false,
            message:
              "Category not found",
          });
        }

        product.category =
          data.category;
      }



      if (
        data.price !==
        undefined
      ) {
        const price =
          Number(
            data.price
          );

        if (
          Number.isNaN(price) ||
          price < 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid product price",
          });
        }

        product.price =
          price;
      }



      if (
        data.salePrice !==
        undefined
      ) {
        if (
          data.salePrice ===
            null ||
          data.salePrice ===
            ""
        ) {
          product.salePrice =
            null;
        } else {
          const salePrice =
            Number(
              data.salePrice
            );

          if (
            Number.isNaN(
              salePrice
            ) ||
            salePrice < 0
          ) {
            return res.status(400).json({
              success: false,
              message:
                "Invalid sale price",
            });
          }

          if (
            salePrice >
            product.price
          ) {
            return res.status(400).json({
              success: false,
              message:
                "Sale price cannot be greater than price",
            });
          }

          product.salePrice =
            salePrice;
        }
      }



      if (
        data.stock !==
        undefined
      ) {
        const stock =
          Number(
            data.stock
          );

        if (
          Number.isNaN(
            stock
          ) ||
          stock < 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid stock",
          });
        }

        product.stock =
          stock;
      }



      if (
        data.sku !==
        undefined
      ) {
        const sku =
          String(
            data.sku
          )
            .trim()
            .toUpperCase();

        if (sku) {
          const existingSku =
            await Product.findOne({
              sku,
              _id: {
                $ne: id,
              },
            });

          if (existingSku) {
            return res.status(400).json({
              success: false,
              message:
                "SKU already exists",
            });
          }

          product.sku =
            sku;
        } else {
          product.sku =
            undefined;
        }
      }



      if (
        data.image !==
        undefined
      ) {
        product.image =
          String(
            data.image
          );
      }



      if (
        data.images !==
        undefined
      ) {
        if (
          !Array.isArray(
            data.images
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Images must be an array",
          });
        }

        product.images =
          data.images;
      }



      if (
        data.isActive !==
        undefined
      ) {
        product.isActive =
          toBoolean(
            data.isActive
          );
      }



      if (
        data.featured !==
        undefined
      ) {
        product.featured =
          toBoolean(
            data.featured
          );
      }



      if (
        data.newArrival !==
        undefined
      ) {
        product.newArrival =
          toBoolean(
            data.newArrival
          );
      }



      if (
        data.bestSeller !==
        undefined
      ) {
        product.bestSeller =
          toBoolean(
            data.bestSeller
          );
      }



      if (
        data.isDropshipping !==
        undefined
      ) {
        product.isDropshipping =
          toBoolean(
            data.isDropshipping
          );
      }



      if (
        data.supplier !==
        undefined
      ) {
        if (
          data.supplier ===
            null ||
          data.supplier ===
            ""
        ) {
          product.supplier =
            null;
        } else {
          if (
            !mongoose.Types.ObjectId.isValid(
              data.supplier
            )
          ) {
            return res.status(400).json({
              success: false,
              message:
                "Invalid supplier ID",
            });
          }

          const supplier =
            await Supplier.findById(
              data.supplier
            );

          if (!supplier) {
            return res.status(404).json({
              success: false,
              message:
                "Supplier not found",
            });
          }

          if (
            !supplier.isActive
          ) {
            return res.status(400).json({
              success: false,
              message:
                "Supplier is inactive",
            });
          }

          product.supplier =
            data.supplier;
        }
      }



      if (
        data.supplierName !==
        undefined
      ) {
        product.supplierName =
          String(
            data.supplierName
          ).trim();
      }



      if (
        data.supplierProductId !==
        undefined
      ) {
        product.supplierProductId =
          String(
            data.supplierProductId
          ).trim();
      }



      if (
        data.supplierUrl !==
        undefined
      ) {
        product.supplierUrl =
          String(
            data.supplierUrl
          ).trim();
      }



      if (
        data.supplierPrice !==
        undefined
      ) {
        const supplierPrice =
          Number(
            data.supplierPrice
          );

        if (
          Number.isNaN(
            supplierPrice
          ) ||
          supplierPrice < 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid supplier price",
          });
        }

        product.supplierPrice =
          supplierPrice;
      }



      if (
        data.tags !==
        undefined
      ) {
        if (
          !Array.isArray(
            data.tags
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Tags must be an array",
          });
        }

        product.tags =
          data.tags.map(
            (tag) =>
              String(
                tag
              ).trim()
          );
      }



      if (
        product.isDropshipping
      ) {
        if (
          !product.supplier
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Supplier is required for dropshipping product",
          });
        }

        if (
          product.supplierPrice ===
            undefined ||
          product.supplierPrice ===
            null
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Supplier price is required",
          });
        }
      }



      await product.save();



      const updatedProduct =
        await Product.findById(
          id
        )
          .populate(
            "category",
            "name slug image description"
          )
          .populate(
            "supplier",
            "name companyName phone email address website isActive"
          );

      res.status(200).json({
        success: true,

        message:
          "Product updated successfully",

        product:
          updatedProduct,
      });
    } catch (error) {
      console.error(
        "Update Product Error:",
        error
      );

      if (
        error.code === 11000
      ) {
        return res.status(400).json({
          success: false,
          message:
            "SKU or slug already exists",
        });
      }

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to update product",
      });
    }
  };



const deleteProduct =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid product ID",
        });
      }

      const product =
        await Product.findById(
          id
        );

      if (!product) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found",
        });
      }

      await Product.findByIdAndDelete(
        id
      );

      res.status(200).json({
        success: true,

        message:
          "Product deleted successfully",
      });
    } catch (error) {
      console.error(
        "Delete Product Error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to delete product",
      });
    }
  };



const toggleProductStatus =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid product ID",
        });
      }

      const product =
        await Product.findById(
          id
        );

      if (!product) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found",
        });
      }

      product.isActive =
        !product.isActive;

      await product.save();

      res.status(200).json({
        success: true,

        message:
          product.isActive
            ? "Product activated"
            : "Product deactivated",

        isActive:
          product.isActive,
      });
    } catch (error) {
      console.error(
        "Toggle Product Error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to change product status",
      });
    }
  };



const getDropshippingProducts =
  async (req, res) => {
    try {
      const products =
        await Product.find({
          isDropshipping: true,
          isActive: true,
          $or: [
            { approvalStatus: "approved" },
            { approvalStatus: { $exists: false } },
          ],
        })
          .populate(
            "category",
            "name slug image"
          )
          .populate(
            "supplier",
            "name companyName phone email website isActive"
          )
          .sort({
            createdAt: -1,
          });

      res.status(200).json({
        success: true,

        count:
          products.length,

        products,
      });
    } catch (error) {
      console.error(
        "Dropshipping Products Error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to get dropshipping products",
      });
    }
  };



const getProductsBySupplier =
  async (req, res) => {
    try {
      const { supplierId } =
        req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          supplierId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid supplier ID",
        });
      }

      const supplier =
        await Supplier.findById(
          supplierId
        );

      if (!supplier) {
        return res.status(404).json({
          success: false,
          message:
            "Supplier not found",
        });
      }

      const products =
        await Product.find({
          supplier:
            supplierId,
        })
          .populate(
            "category",
            "name slug image"
          )
          .populate(
            "supplier",
            "name companyName phone email website"
          )
          .sort({
            createdAt: -1,
          });

      res.status(200).json({
        success: true,

        supplier,

        count:
          products.length,

        products,
      });
    } catch (error) {
      console.error(
        "Supplier Products Error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to get supplier products",
      });
    }
  };



module.exports = {
  createProduct,
  submitProduct,
  getMyProducts,
  approveProduct,
  createMultipleProducts,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  getDropshippingProducts,
  getProductsBySupplier,
};
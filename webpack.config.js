const path = require("path");

module.exports = {
  // ... other webpack config
  module: {
    rules: [
      // ... other rules
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: "asset/resource",
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx", ".json"],
    alias: {
      "@Font": path.resolve(__dirname, "src/Font"),
    },
  },
};

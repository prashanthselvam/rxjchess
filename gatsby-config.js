const path = require("path");

module.exports = {
  siteMetadata: {
    title: "crazychess",
  },
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: path.join(__dirname, `src`, `static`, `images`),
      },
    },
    {
      resolve: "gatsby-plugin-root-import",
      options: {
        src: path.join(__dirname, "src"),
      },
    },
    {
      resolve: `gatsby-plugin-typescript`,
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    `gatsby-plugin-emotion`,
  ],
};

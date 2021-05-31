const path = require("path");

module.exports = {
  siteMetadata: {
    title: "crazychess",
  },
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `static`,
        path: path.join(__dirname, `src`, `static`),
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
    `gatsby-plugin-sharp`,
    `gatsby-plugin-fontawesome-css`,
    `gatsby-transformer-sharp`,
    `gatsby-plugin-emotion`,
    `gatsby-plugin-workerize-loader`,
  ],
};

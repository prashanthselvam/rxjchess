exports.onCreateWebpackConfig = ({ stage, actions, plugins }) => {
  actions.setWebpackConfig({
    plugins: [
      plugins.define({
        "global.GENTLY": false,
      }),
    ],
  });
};

exports.onCreateWebpackConfig = ({
  actions: { replaceWebpackConfig },
  getConfig,
}) => {
  const config = getConfig();

  config.module.rules.push({
    test: /\.worker\.js$/,
    use: { loader: "workerize-loader" },
  });

  config.output.globalObject = "this";

  replaceWebpackConfig(config);
};

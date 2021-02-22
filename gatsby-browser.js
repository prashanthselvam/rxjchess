import "fontsource-oswald";
import "fontsource-oswald/500.css";
import "./src/styles/global.css";

export const onClientEntry = () => {
  // IntersectionObserver polyfill for gatsby-background-image (Safari, IE)
  if (!(`IntersectionObserver` in window)) {
    // import(`intersection-observer`);
    console.log(`# IntersectionObserver is polyfilled!`);
  }
};

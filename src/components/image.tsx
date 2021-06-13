import React from "react";
import { StaticQuery, graphql } from "gatsby";
import Img, { FixedObject, FluidObject, GatsbyImageProps } from "gatsby-image";

type ImageProps = Omit<GatsbyImageProps, "fluid" | "fixed"> & {
  fileName: string;
  fluid?: FluidObject | FluidObject[];
  fixed?: FixedObject | FixedObject[];
};

const Image = ({ fileName, ...props }: ImageProps) => {
  return (
    <StaticQuery
      query={graphql`
        query {
          images: allFile {
            edges {
              node {
                relativePath
                name
                childImageSharp {
                  fluid(maxWidth: 120, quality: 90) {
                    ...GatsbyImageSharpFluid
                  }
                }
              }
            }
          }
        }
      `}
      render={(data) => {
        const image = data.images.edges.find((n) => {
          return n.node.relativePath.includes(fileName);
        });
        if (!image) {
          return null;
        }

        return <Img fluid={image.node.childImageSharp.fluid} {...props} />;
      }}
    />
  );
};

export default Image;

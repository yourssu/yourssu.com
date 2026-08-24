import { IGatsbyImageData } from 'gatsby-plugin-image';

export interface NodeType {
  publicURL: string;
  name: string;
}

export interface ImgNodeType {
  name: string;
  childImageSharp: {
    gatsbyImageData: IGatsbyImageData;
  };
}

export interface NodeListType {
  nodes: NodeType[];
}

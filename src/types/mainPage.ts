export interface SanityImage {
  asset: { url: string };
}

interface Section<T> {
  title: string;
  subtitle: string;
  items: T[];
}

export interface MainPageData {
  _rawChannel: unknown;
  _rawProduct: unknown;
  hero: {
    title: string;
    images: SanityImage[];
    buttonText: string;
    buttonLink: string;
  };
  product: Section<{
    _key: string;
    title: string;
    description: string;
    image: SanityImage;
    link: string;
  }>;
  missionVision: {
    subtitle: string;
    title: string;
    desktopDescription: string;
    mobileDescription: string;
    image: SanityImage;
  }[];
  coreValue: Section<{
    _key: string;
    desktopTitle: string;
    mobileTitle: string;
    summary: string;
    desktopDescription: string[];
    mobileDescription: string;
    image: SanityImage;
  }>;
  culture: Section<{
    _key: string;
    tag: string;
    title: string;
    description: string;
  }>;
  channel: {
    title: string;
    items: {
      _key: string;
      title: string;
      link: string;
      image: SanityImage;
      tags: string[];
    }[];
  };
  reviews: {
    _key: string;
    nickname: string;
    part: string;
    review: string;
  }[];
  recruit: {
    image: SanityImage;
    desktopTitle: string;
    mobileTitle: string;
    desktopButtonText: string;
    mobileButtonText: string;
    buttonLink: string;
  };
}

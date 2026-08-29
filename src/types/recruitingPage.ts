interface Header {
  title: string;
  subtitle: string;
}

interface SanityImage {
  asset: { url: string };
}

export interface RecruitingPageData {
  banner: {
    image: SanityImage;
    title: string;
    description: string;
  };
  positions: {
    header: Header;
    cards: {
      _key: string;
      department: {
        _rawBasicInformation: unknown;
        basicInformation: {
          name: string;
          icon: SanityImage;
          isRecruiting: boolean;
        };
      };
    }[];
  };
  ideal: {
    header: Header;
    cards: {
      _key: string;
      title: string;
      description: string;
    }[];
  };
  journey: {
    header: Header;
    steps: {
      _key: string;
      title: string;
      description: string;
      tasks: string[];
    }[];
    notice: string;
  };
  faq: {
    header: Header;
    items: {
      _key: string;
      question: string;
      answer: string;
      link?: {
        label: string;
        href: string;
      };
      _rawLink?: unknown;
    }[];
  };
}

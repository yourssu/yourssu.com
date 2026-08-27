import { Link } from 'gatsby';
import { useState } from 'react';

import { trackMainRecruitingCtaClick } from '@/analytics/events';
import useHeaderDetail from '@/components/Header/hook';

interface Props {
  isMainPage: boolean;
}

function Header({ isMainPage }: Props) {
  const { data } = useHeaderDetail();
  const [isClick, setIsClick] = useState(false);
  // const logoData = data.logo.nodes[0];
  const listIconData = data.listIcon.nodes[0];
  const xIconData = data.xIcon.nodes[0];

  const trackRecruitingClick = () => {
    if (typeof window !== 'undefined' && window.location.pathname === '/') {
      trackMainRecruitingCtaClick({
        cta_label: 'recruiting',
        cta_location: 'header_nav',
      });
    }
  };

  return (
    <header
      className={`fixed left-0 top-0 z-50 flex h-[80px] w-full flex-col items-center justify-center gap-[56.25rem] self-stretch bg-white-0 px-28 py-6 xs:h-14 xs:gap-60 xs:px-4 xs:py-3 sm:h-14 sm:gap-60 sm:px-4 sm:py-3 ${
        isClick && 'bg-white-0'
      }`}
    >
      <div className="flex w-full items-center justify-between">
        <Link to="/" className="flex items-center justify-between">
          <h1 className="T2_Lt_24 text-text-brandPrimary">YOURSSU</h1>
        </Link>
        <nav className="flex flex-row items-center gap-6 xs:hidden sm:hidden">
          <Link to="/">
            <p
              className={`B1_Rg_16 !font-bold ${
                isMainPage
                  ? 'text-text-basicSecondary'
                  : 'text-text-basicTertiary'
              }`}
            >
              MAIN
            </p>
          </Link>
          <Link to="/recruiting" onClick={trackRecruitingClick}>
            <p
              className={`B1_Rg_16 !font-bold ${
                isMainPage
                  ? 'text-text-basicTertiary'
                  : 'text-text-basicSecondary'
              }`}
            >
              RECRUITING
            </p>
          </Link>
        </nav>
        <button
          type="button"
          className="hidden xs:block sm:block"
          onClick={() => {
            setIsClick(!isClick);
          }}
        >
          {isClick ? (
            <img src={xIconData.publicURL} alt={xIconData.name} />
          ) : (
            <img src={listIconData.publicURL} alt={listIconData.name} />
          )}
        </button>
      </div>

      {isClick && (
        <nav className="absolute left-0 top-14 flex h-auto w-full flex-col items-start justify-start bg-white-0 md:hidden lg:hidden xl:hidden xxl:hidden">
          <Link
            to="/"
            className={`B1_Rg_16 p-5 !font-bold ${isMainPage ? 'text-text-basicSecondary' : 'text-text-basicTertiary'}`}
          >
            MAIN
          </Link>
          <Link
            to="/recruiting"
            onClick={trackRecruitingClick}
            className={`B1_Rg_16 p-5 !font-bold ${isMainPage ? 'text-text-basicTertiary' : 'text-text-basicSecondary'}`}
          >
            RECRUITING
          </Link>
        </nav>
      )}
    </header>
  );
}

export default Header;

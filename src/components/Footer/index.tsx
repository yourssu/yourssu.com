import tw from 'tailwind-styled-components';

import githubIcon from '@/assets/socials/github.svg';
import instagramIcon from '@/assets/socials/instagram.svg';
import kakaotalkIcon from '@/assets/socials/kakaotalk.svg';
import mediumIcon from '@/assets/socials/medium.svg';

interface Props {
  backgroundColor: string;
}

function Footer({ backgroundColor }: Props) {
  const socialData = [
    {
      name: 'kakaotalk',
      icon: kakaotalkIcon,
      href: 'http://pf.kakao.com/_AxfrxeT',
    },
    { name: 'github', icon: githubIcon, href: 'https://github.com/yourssu' },
    {
      name: 'instagram',
      icon: instagramIcon,
      href: 'https://www.instagram.com/yourssu_official',
    },
    { name: 'medium', icon: mediumIcon, href: 'https://medium.com/yourssu' },
  ];

  const background: { [key: string]: string } = {
    gray4: 'bg-gray4-0',
    bluegray4: 'bg-bluegray4-0',
  };

  return (
    <Container $bg={background[backgroundColor]}>
      <div className="mx-auto w-full">
        <LogoContainer>
          <Logo>YOURSSU</Logo>
        </LogoContainer>
        <div className="mb-2 flex items-center gap-[12px]">
          {socialData.map((item) => (
            <SocialLink
              key={item.name}
              href={item.href}
              target="_blank"
              rel="noreferrer"
            >
              <img src={item.icon} alt={item.name} />
            </SocialLink>
          ))}
        </div>
        <InfoContainer>
          <div className="py-[3px] xs:py-[2px]">
            동아리방 : 숭실대학교 학생회관 244호
          </div>
          <div>ⓒ Yourssu. All rights reserved.</div>
        </InfoContainer>
      </div>
    </Container>
  );
}

export default Footer;

const Container = tw.footer<{ $bg: string }>`
  flex
  flex-col
  items-start
  justify-start
  text-gray1-0
  py-20
  xs:px-4
  sm:px-4
  px-[120px]
  ${(props) => props.$bg}
`;

const SocialLink = tw.a`
  flex
  h-12
  w-12
  items-center
  justify-center
  gap-[10px]
  rounded-[16px]
  bg-bg-basicLight
`;

const LogoContainer = tw.div`
  mb-1
  flex
  flex-row
  items-center
`;

const Logo = tw.div`
  py-1
  font-jost
  font-[600]
  text-[20px]
  tracking-[-0.4px]
  sm:text-[14px]
  sm:tracking-[-0.28px]
  xs:text-[14px]
  xs:tracking-[-0.28px]
`;

const InfoContainer = tw.div`
  text-start
  body7
  sm:body8
  md:body8
  xs:body8
  xs:text-[13px]
  mb-8
`;

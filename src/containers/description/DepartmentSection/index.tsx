import ApplyProcedure from '@/containers/description/ApplyProcedure';
import InaWord from '@/containers/description/InaWord';
import PortableTextInformationCard from '@/containers/description/Information/PortableTextInformationCard';
import Medium from '@/containers/description/Medium';
import RoadToPro from '@/containers/description/RoadToPro';
import TeamFAQ from '@/containers/description/TeamFAQ';
import {
  ApplyProcedureInformation,
  DepartmentSectionInformation,
} from '@/types/recruiting.type';

interface DepartmentSectionProps {
  procedure: ApplyProcedureInformation[] | null;
  section: DepartmentSectionInformation;
}

function DepartmentSection({ procedure, section }: DepartmentSectionProps) {
  switch (section.kind) {
    case 'richText':
      return <PortableTextInformationCard data={section} />;
    case 'applyProcedure':
      return (
        <ApplyProcedure applyProcedure={procedure} title={section.title} />
      );
    case 'quote':
      return section.quoteText ? (
        <InaWord inaWord={{ title: section.title, word: section.quoteText }} />
      ) : null;
    case 'faq':
      return section.faqList?.length ? (
        <TeamFAQ data={{ FAQList: section.faqList, title: section.title }} />
      ) : null;
    case 'roadToPro':
      return section.roadToProList?.length ? (
        <RoadToPro
          roadToPro={{
            roadToPro_list: section.roadToProList,
            title: section.title,
          }}
        />
      ) : null;
    case 'articles':
      return section.articles?.length ? (
        <Medium medium={{ article: section.articles, title: section.title }} />
      ) : null;
  }
}

export default DepartmentSection;

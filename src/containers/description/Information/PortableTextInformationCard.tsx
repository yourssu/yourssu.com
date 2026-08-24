import { PortableText, type PortableTextComponents } from '@portabletext/react';

import { DepartmentSectionInformation } from '@/types/recruiting.type';

const components: PortableTextComponents = {
  block: {
    blockquote: ({ children }) => (
      <blockquote className="B1_Rg_16 border-l-2 border-line-basicLight pl-4 text-text-basicSecondary">
        {children}
      </blockquote>
    ),
    h3: ({ children }) => (
      <h3 className="T4_Sb_18 sm:B1_Sb_16 xs:B1_Sb_16 text-text-basicSecondary">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="B1_Sb_16 text-text-basicSecondary">{children}</h4>
    ),
    normal: ({ children }) => (
      <p className="B1_Rg_16 whitespace-pre-wrap text-text-basicSecondary">
        {children}
      </p>
    ),
  },
  hardBreak: () => <br />,
  list: {
    bullet: ({ children }) => (
      <ul className="B1_Rg_16 list-outside list-disc space-y-1 pl-7 text-text-basicSecondary xs:pl-6 sm:pl-5 md:pl-5">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="B1_Rg_16 list-outside list-decimal space-y-1 pl-7 text-text-basicSecondary xs:pl-6 sm:pl-5 md:pl-5">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => (
      <li className="whitespace-pre-wrap">{children}</li>
    ),
    number: ({ children }) => (
      <li className="whitespace-pre-wrap">{children}</li>
    ),
  },
  marks: {
    code: ({ children }) => (
      <code className="rounded bg-bg-basicLight px-1 py-0.5">{children}</code>
    ),
    departmentSectionLink: ({ children, value }) => {
      const href = typeof value?.href === 'string' ? value.href : '';
      if (!/^(https?:\/\/|mailto:)/i.test(href)) return <>{children}</>;

      const external = /^https?:\/\//i.test(href);
      return (
        <a
          className="text-text-brandPrimary underline underline-offset-2"
          href={href}
          rel={external ? 'noopener noreferrer' : undefined}
          target={external ? '_blank' : undefined}
        >
          {children}
        </a>
      );
    },
    em: ({ children }) => <em>{children}</em>,
    strong: ({ children }) => <strong>{children}</strong>,
  },
};

interface PortableTextInformationCardProps {
  data: DepartmentSectionInformation;
}

function PortableTextInformationCard({
  data,
}: PortableTextInformationCardProps) {
  if (!data.body?.length) return null;

  return (
    <section className="flex flex-col items-start gap-6 self-stretch rounded-[12px] border border-line-basicLight p-6 xs:p-5 sm:p-5">
      {data.description ? (
        <div className="flex flex-col items-start justify-end gap-1 self-stretch">
          <p className="B3_Rg_14 sm:B5_Rg_12 xs:B5_Rg_12 text-text-basicTertiary">
            {data.description}
          </p>
          <h2 className="T3_Sb_20 sm:T2_Sb_18 xs:T2_Sb_18 text-text-basicPrimary">
            {data.title}
          </h2>
        </div>
      ) : (
        <h2 className="T3_Sb_20 sm:T2_Sb_18 xs:T2_Sb_18 text-text-basicPrimary">
          {data.title}
        </h2>
      )}
      <div className="flex flex-col items-start gap-3 self-stretch">
        <PortableText
          components={components}
          onMissingComponent={false}
          value={data.body}
        />
      </div>
    </section>
  );
}

export default PortableTextInformationCard;

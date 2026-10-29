import { Fragment, type ReactNode } from 'react';
import './operator.css';

/** Props for Operator. The operator name leads; detail and the link follow after a period. */
export type OperatorProps = {
  /** Who runs the service. Set in weight 600 so it leads the line. */
  operator: string;
  /** Who is asking or signed in, such as "Signed in as mina@example.com". */
  detail?: string;
  /** Where to learn more. Renders the link "About this service". */
  href?: string;
};

/** Says who is behind a screen where the user decides something with consequences. Serves: "Say who is behind it." */
export function Operator({ operator, detail, href }: OperatorProps) {
  const parts: ReactNode[] = [
    <strong key="operator" className="h-operator-name">
      {operator}
    </strong>,
  ];
  if (detail) parts.push(detail);
  if (href) {
    parts.push(
      <a key="about" className="h-operator-link" href={href}>
        About this service
      </a>,
    );
  }

  return (
    <p className="h-operator" role="note">
      {parts.map((part, index) => (
        <Fragment key={index}>
          {index > 0 && '. '}
          {part}
        </Fragment>
      ))}
    </p>
  );
}

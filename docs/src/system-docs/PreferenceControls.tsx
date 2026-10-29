import { useState } from 'react';
import { PreferenceControls, Switch, type TableColumn } from 'humane-system';
import { PropList } from '../components/PropList';
import { TypeCode } from '../components/Code';
import { Example } from '../components/Example';
import { Serves } from '../components/Serves';
import './preference-controls.css';

const P = 'doc-preference-controls';

type PropRow = { prop: string; type: string; meaning: string };

const PROPS: PropRow[] = [
  {
    prop: 'showGrayscale',
    type: 'boolean',
    meaning:
      'Adds a grayscale test switch after the sidebar control. Off by default. Turn it on to check that the hierarchy still reads without hue.',
  },
];

const COLUMNS: TableColumn<PropRow>[] = [
  { key: 'prop', header: 'Prop', width: '30%', render: (row) => <TypeCode>{row.prop}</TypeCode> },
  { key: 'type', header: 'Type', width: '20%', render: (row) => <TypeCode>{row.type}</TypeCode> },
  { key: 'meaning', header: 'Meaning', render: (row) => row.meaning },
];

/**
 * Theme, contrast, sidebar side, and reduced motion. Each choice is the user's to make,
 * and each one applies to the whole interface at once.
 */
export default function PreferenceControlsDoc() {
  const [showGrayscale, setShowGrayscale] = useState(false);

  return (
    <>
      <p className="rule-text">
        Theme, contrast, sidebar side, and reduced motion are the user's to set, and each one applies to the whole
        interface at once. The choices are remembered in this browser.
      </p>

      <Serves
        rules={[
          'scheme-and-contrast-are-separate-choices',
          'every-mode-is-built-not-inverted',
          'structure-strengthens-with-contrast',
          'reduced-motion-keeps-continuity',
          'navigation-is-a-sidebar-that-morphs',
        ]}
      />

      <Example
        hint="Change any setting and the whole page follows at once. Show the grayscale test to add its switch to the group, then turn it on to remove all hue."
        controls={
          <Switch label="Show grayscale test" checked={showGrayscale} onChange={setShowGrayscale} size="compact" />
        }
      >
        <div className={P}>
          <PreferenceControls showGrayscale={showGrayscale} />
        </div>
      </Example>

      <div className={`${P}-props`}>
        <h4 className="doc-heading">Props</h4>
        <PropList
          caption="Props of PreferenceControls"
          columns={COLUMNS}
          rows={PROPS}
          rowKey={(row) => row.prop}
        />
      </div>
    </>
  );
}

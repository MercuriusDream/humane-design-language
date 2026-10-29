import { useState, type ReactNode } from 'react';
import { Segmented, Switch, TextField, type TableColumn, type TextFieldType } from 'humane-system';
import { PropList } from '../components/PropList';
import { Name, TypeCode } from '../components/Code';
import { Example } from '../components/Example';
import { Serves } from '../components/Serves';
import './text-field.css';

type PropRow = { prop: string; type: string; meaning: ReactNode };

const PROPS: PropRow[] = [
  { prop: 'label', type: 'string', meaning: 'The visible label. It is also the accessible name of the control.' },
  { prop: 'value', type: 'string', meaning: 'The current text. The field is controlled.' },
  { prop: 'onChange', type: '(value: string) => void', meaning: 'Called with the new text on every edit.' },
  {
    prop: 'hint',
    type: 'string',
    meaning: (
      <>
        Short text under the label, above the field, at the point of action. Linked with <Name>aria-describedby</Name>.
      </>
    ),
  },
  {
    prop: 'error',
    type: 'string',
    meaning: (
      <>
        Text under the field in the danger signal. Sets <Name>aria-invalid</Name> and is announced politely.
      </>
    ),
  },
  { prop: 'multiline', type: 'boolean', meaning: 'Renders a textarea instead of an input. Default false.' },
  { prop: 'rows', type: 'number', meaning: 'Visible rows of a multiline field. Default 4.' },
  {
    prop: 'type',
    type: "'text' | 'email' | 'search' | 'password'",
    meaning: 'The input type. A search field shows a clear control while it holds text. Default text.',
  },
  { prop: 'placeholder', type: 'string', meaning: 'Sample text shown while the field is empty. It never replaces the label.' },
  {
    prop: 'depth',
    type: '1 | 2',
    meaning: 'Depth of the surface the field sits on: 1 for a field directly on a root, 2 for a field on a depth 1 surface. The field takes the 2 px corner of that depth. Default 1.',
  },
  { prop: 'id', type: 'string', meaning: 'The id of the input. Generated when omitted.' },
  { prop: 'name', type: 'string', meaning: 'The name submitted with a form.' },
  { prop: 'required', type: 'boolean', meaning: 'Marks the field as required for the browser and for assistive technology.' },
  { prop: 'autoComplete', type: 'string', meaning: 'The autocomplete hint passed to the input, for example "email".' },
  {
    prop: 'size',
    type: "'standard' | 'compact'",
    meaning: 'Standard is a 44 px field with body text. Compact is a 36 px field with small text, for a dense region such as a toolbar. Defaults to standard.',
  },
];

const COLUMNS: TableColumn<PropRow>[] = [
  { key: 'prop', header: 'Prop', width: '11rem', render: (row) => <TypeCode>{row.prop}</TypeCode> },
  { key: 'type', header: 'Type', width: '14rem', render: (row) => <TypeCode>{row.type}</TypeCode> },
  { key: 'meaning', header: 'Meaning', render: (row) => row.meaning },
];

const TYPES: { value: TextFieldType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'email', label: 'Email' },
  { value: 'password', label: 'Password' },
];

const RULE_MESSAGE = 'Too short. Add characters until the caption has 3 or more.';

/** A labeled field: its label is set as text, it is a control plane without an outline, and its errors are stated in words. */
export default function TextFieldDoc() {
  const [type, setType] = useState<TextFieldType>('text');
  const [multiline, setMultiline] = useState(false);
  const [inSurface, setInSurface] = useState(false);
  const [requireThree, setRequireThree] = useState(false);
  const [caption, setCaption] = useState('');
  const [query, setQuery] = useState('');

  const depth = inSurface ? 2 : 1;
  const error = requireThree && caption.length < 3 ? RULE_MESSAGE : undefined;

  return (
    <>
      <p className="rule-text">
        A labeled field for one line or a block of text. It is a control plane with no outline in either contrast,
        known by its label, its placeholder, and for search its search mark. Its errors are stated
        in words under the field.
      </p>
      <Serves
        rules={[
          'labels-are-set-like-text',
          'interactive-boundaries-meet-a-contrast-floor',
          'explain-at-the-point-of-action-or-not-at-all',
          'words-are-for-intent-commands-and-errors',
          'corners-are-small-never-chosen',
          'show-and-expose',
        ]}
      />

      <Example
        hint="Type in a field. Turn on Require 3 characters to see an error that says what to do next."
        controls={
          <>
            <Segmented label="Type" options={TYPES} value={type} onChange={setType} size="compact" />
            <Switch label="Multiline" checked={multiline} onChange={setMultiline} size="compact" />
            <Switch label="Inside a surface" checked={inSurface} onChange={setInSurface} size="compact" />
            <Switch label="Require 3 characters" checked={requireThree} onChange={setRequireThree} size="compact" />
          </>
        }
      >
        <div className="doc-text-field-stack" data-surface={inSurface || undefined}>
          <TextField
            label="Caption"
            hint="Describe what the photo shows"
            placeholder="Write a caption"
            value={caption}
            onChange={setCaption}
            type={type}
            multiline={multiline}
            rows={3}
            error={error}
            depth={depth}
          />
          <TextField
            label="Search photos"
            type="search"
            placeholder="Harbor, kitchen, 2024"
            value={query}
            onChange={setQuery}
            depth={depth}
          />
        </div>
      </Example>

      <h4 className="doc-heading">Props</h4>
      <PropList caption="TextField props" columns={COLUMNS} rows={PROPS} rowKey={(row) => row.prop} />
    </>
  );
}

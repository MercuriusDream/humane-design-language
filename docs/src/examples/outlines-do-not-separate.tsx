import { useState } from 'react';
import { Example } from '../components/Example';
import { Surface, Switch } from 'humane-system';
import './outlines-do-not-separate.css';

const CARDS = [
  {
    id: 'budget',
    title: 'Budget review',
    body: 'Three lines over last month. Travel is the only one that grew.',
    facts: [
      ['Owner', 'Ana'],
      ['Due', 'Friday'],
    ],
  },
  {
    id: 'venue',
    title: 'Venue shortlist',
    body: 'Two rooms hold forty. The harbor room is free on the first weekend.',
    facts: [
      ['Votes', '4'],
      ['Status', 'Open'],
    ],
  },
  {
    id: 'notes',
    title: 'Speaker notes',
    body: 'Draft ready for a second read. Slides are not final.',
    facts: [
      ['Comments', '12'],
      ['Edited', 'Today'],
    ],
  },
];

/** Cards and their rows separate by lightness. The outline switch adds a line to every one of them. */
export default function OutlinesDoNotSeparate() {
  const [outlined, setOutlined] = useState(false);
  const lines = outlined ? CARDS.reduce((total, card) => total + 1 + card.facts.length, 0) : 0;

  return (
    <Example
      hint="Outline the cards to see the borders they add. The lightness steps already separate every card and row."
      controls={
        <>
          <Switch size="compact" label="Outline them" checked={outlined} onChange={setOutlined} />
          <p className="ex-outlines-do-not-separate-count">Outlines on screen: {lines}</p>
        </>
      }
    >
      <div className="ex-outlines-do-not-separate" data-outlined={outlined}>
        {CARDS.map((card) => (
          <Surface key={card.id} as="article" depth={1} plane="raised" className="ex-outlines-do-not-separate-card">
            <h4 className="ex-outlines-do-not-separate-title">{card.title}</h4>
            <p className="ex-outlines-do-not-separate-body">{card.body}</p>
            <dl className="ex-outlines-do-not-separate-facts">
              {card.facts.map(([term, value]) => (
                <Surface
                  key={term}
                  as="div"
                  depth={2}
                  plane="base"
                  className="ex-outlines-do-not-separate-fact"
                >
                  <dt>{term}</dt>
                  <dd>{value}</dd>
                </Surface>
              ))}
            </dl>
          </Surface>
        ))}
      </div>
    </Example>
  );
}

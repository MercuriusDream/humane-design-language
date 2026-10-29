import { useState } from 'react';
import { Example } from '../components/Example';
import { Button, Operator, Switch } from 'humane-system';
import './say-who-is-behind-it.css';

type Outcome = 'review' | 'sent' | 'cancelled';

const PAYEE = 'Harbor Coffee Co.';
const AMOUNT = '$24.50';

const TITLE: Record<Outcome, string> = {
  review: 'Confirm payment',
  sent: 'Payment sent',
  cancelled: 'Payment cancelled',
};

const ANNOUNCE: Record<Outcome, string> = {
  review: '',
  sent: `Payment of ${AMOUNT} to ${PAYEE} sent.`,
  cancelled: 'Payment cancelled. Nothing was sent.',
};

/** The payment card names the operator and the signed-in user above the two equal buttons. Serves: "Say who is behind it." */
export default function SayWhoIsBehindIt() {
  const [signedIn, setSignedIn] = useState(true);
  const [outcome, setOutcome] = useState<Outcome>('review');

  return (
    <Example
      hint="Turn sign-in off and the line above the buttons says who is paying. Pay and Cancel carry equal weight."
      controls={<Switch size="compact" label="Signed in" checked={signedIn} onChange={setSignedIn} />}
    >
      <section className="ex-say-who-is-behind-it-card" data-outcome={outcome}>
        <div className="ex-say-who-is-behind-it-summary">
          <h4 className="ex-say-who-is-behind-it-title">{TITLE[outcome]}</h4>
          <dl className="ex-say-who-is-behind-it-rows">
            <div>
              <dt>Pay to</dt>
              <dd>{PAYEE}</dd>
            </div>
            <div>
              <dt>Amount</dt>
              <dd>{AMOUNT}</dd>
            </div>
          </dl>
        </div>
        <div className="ex-say-who-is-behind-it-decision">
          <Operator
            operator="Northwind Payments Ltd"
            detail={signedIn ? 'Signed in as mina@example.com' : 'Paying as a guest'}
          />
          <div className="ex-say-who-is-behind-it-actions">
            <Button depth={2} onClick={() => setOutcome('cancelled')}>
              Cancel
            </Button>
            <Button depth={2} onClick={() => setOutcome('sent')}>
              Pay {AMOUNT}
            </Button>
          </div>
        </div>
      </section>
      <p className="visually-hidden" aria-live="polite">
        {ANNOUNCE[outcome]}
      </p>
    </Example>
  );
}

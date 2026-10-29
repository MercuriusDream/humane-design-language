import { Example } from '../components/Example';
import './shared-demos.css';
import './equal-consequence-equal-weight.css';

/** Both choices carry equal consequence, so they carry equal weight. */
export default function EqualWeightDemo() {
  return (
    <Example>
      <div className="consent ex-equal-consequence-equal-weight-consent">
        <div className="consent-text">
          <h4 className="consent-title">Share usage data?</h4>
          <p className="consent-body">Anonymous counts of which features you open. You can change this later in Settings.</p>
        </div>
        <div className="row-actions">
          <button type="button" className="h-button">
            Share
          </button>
          <button type="button" className="h-button">
            Don't share
          </button>
        </div>
      </div>
    </Example>
  );
}

import { useState, type FormEvent } from 'react';
import { Download, Mail, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { brand } from '../lib/brand';
import { buildWhatsAppUrl } from '../lib/whatsapp';

export default function ProjectBrief() {
  const [step, setStep] = useState(1);
  const [summary, setSummary] = useState('');
  const [details, setDetails] = useState({ type: 'Entrance door', dimensions: '', finish: 'Please advise', location: '', timeline: '', budget: '', name: '', email: '', message: '' });
  const update = (key: keyof typeof details, value: string) => setDetails((current) => ({ ...current, [key]: value }));
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step === 1) { setStep(2); return; }
    setSummary([
      `${brand.name} project enquiry`,
      `Name: ${details.name.trim()}`, `Email: ${details.email.trim()}`,
      `Project: ${details.type}`, `Dimensions: ${details.dimensions.trim() || 'Measurement required'}`,
      `Finish: ${details.finish}`, `Location: ${details.location.trim()}`,
      `Timeline: ${details.timeline.trim() || 'To be agreed'}`, `Budget: ${details.budget.trim() || 'To be discussed'}`,
      `Brief: ${details.message.trim() || 'Please advise on the design and specification.'}`,
    ].join('\n'));
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([summary], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'wills-group-project-brief.txt'; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div id="project-brief" className="project-brief">
      <div>
        <h3>{summary ? 'Your brief is ready.' : 'Tell us what you have in mind.'}</h3>
        <p>{summary ? 'Review and save your requirements. Nothing has been sent yet.' : 'A few details make the first conversation more useful. No prices or production dates are committed here.'}</p>
      </div>
      {summary ? <div className="brief-result" aria-live="polite">
        <pre>{summary}</pre>
        <div className="brief-actions">
          <button type="button" className="wills-button button-primary" onClick={download}><Download size={18} />Save project brief</button>
          {brand.email && <a className="wills-button button-outline" href={`mailto:${brand.email}?subject=${encodeURIComponent('Metalwork project enquiry')}&body=${encodeURIComponent(summary)}`}><Mail size={18} />Prepare email</a>}
          {brand.whatsapp && <a className="wills-button button-outline" href={buildWhatsAppUrl(summary)} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} />Open WhatsApp</a>}
          <button type="button" className="brief-edit" onClick={() => setSummary('')}>Edit details</button>
        </div>
        {!brand.email && !brand.whatsapp && <p>Business contact details are being confirmed. Save this brief for your enquiry.</p>}
      </div> : <form onSubmit={handleSubmit}>
        <p className="brief-step">Step {step} of 2: {step === 1 ? 'Your project' : 'Your details'}</p>
        {step === 1 ? <div className="brief-fields">
          <label>Project type<select value={details.type} onChange={(event) => update('type', event.target.value)}>{['Entrance door', 'Gate', 'Interiors', 'Window grille', 'Railing or staircase', 'Structural fabrication', 'Repair or custom work'].map((type) => <option key={type}>{type}</option>)}</select></label>
          <label>Approximate dimensions <span>(optional)</span><input maxLength={120} value={details.dimensions} onChange={(event) => update('dimensions', event.target.value)} placeholder="Width × height, with units" /></label>
          <label>Preferred finish<select value={details.finish} onChange={(event) => update('finish', event.target.value)}>{['Please advise', 'Painted finish', 'Polished metal', 'Decorative finish', 'Other, described in brief'].map((finish) => <option key={finish}>{finish}</option>)}</select></label>
          <label>Town / country<input required maxLength={160} autoComplete="address-level2" value={details.location} onChange={(event) => update('location', event.target.value)} placeholder="Project or delivery location" /></label>
          <label>Preferred timeline <span>(optional)</span><input maxLength={100} value={details.timeline} onChange={(event) => update('timeline', event.target.value)} placeholder="When you would like it ready" /></label>
          <label>Budget range <span>(optional)</span><input maxLength={100} value={details.budget} onChange={(event) => update('budget', event.target.value)} placeholder="Include your currency" /></label>
        </div> : <div className="brief-fields">
          <label>Your name<input required maxLength={120} autoComplete="name" value={details.name} onChange={(event) => update('name', event.target.value)} /></label>
          <label>Email<input type="email" required maxLength={254} autoComplete="email" value={details.email} onChange={(event) => update('email', event.target.value)} /></label>
          <label className="brief-wide">Design notes <span>(optional)</span><textarea rows={4} maxLength={3000} value={details.message} onChange={(event) => update('message', event.target.value)} placeholder="Style, intended use, site access or a reference design from the gallery" /></label>
        </div>}
        <p className="brief-privacy">Your details stay in this browser until you choose to save the brief or share it through email or WhatsApp. They are not stored on this website. <Link to="/privacy-policy">Read the Privacy Policy</Link>.</p>
        <div className="brief-actions">
          {step === 2 && <button type="button" className="wills-button button-outline" onClick={() => setStep(1)}>Back</button>}
          <button type="submit" className="wills-button button-primary">{step === 1 ? 'Continue' : 'Prepare my brief'}</button>
        </div>
      </form>}
    </div>
  );
}

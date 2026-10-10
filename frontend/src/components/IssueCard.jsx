import { Link } from 'react-router-dom';
import { assetUrl } from '../services/api';
export default function IssueCard({ issue }) {
  return (
    <article className="issue-card">
      <div className="issue-photo">
        {issue.photoPath ? <img src={assetUrl(issue.photoPath)} alt={`Photo for ${issue.title}`} loading="lazy" /> : <span>♧<small>No report photo</small></span>}
      </div>
      <div className="issue-content">
        <div className="tag-row"><span className={`priority ${String(issue.priority).toLowerCase()}`}>{issue.priority}</span><span className="status">{issue.status}</span></div>
        <h3>{issue.title}</h3>
        <p>{issue.category} · {issue.location}</p>
        <p className="muted">{new Date(issue.createdAt).toLocaleString()}</p>
        <Link to={`/map?issue=${issue._id}`}>View on map ↗</Link>
      </div>
    </article>
  );
}

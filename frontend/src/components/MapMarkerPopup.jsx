import { Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { assetUrl } from '../services/api';
export default function MapMarkerPopup({ issue }) {
  return (
    <Popup>
      <div className="map-popup">
        <b>{issue.title}</b>
        <p>{issue.category} · {issue.priority}</p>
        <p>{issue.location}</p>
        {issue.photoPath ? <img src={assetUrl(issue.photoPath)} alt={`Report: ${issue.title}`} /> : <p>No photo attached</p>}
        <p>Status: {issue.status}</p>
        <Link to={`/map?issue=${issue._id}`}>Issue details</Link>
      </div>
    </Popup>
  );
}

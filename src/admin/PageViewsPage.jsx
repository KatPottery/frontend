import { useEffect, useState } from "react";
import axios from "axios";
import "./css/PageViewsPage.css";

export default function PageViewsPage() {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    axios.get("/api/admin/pageviews")
      .then(res => setSessions(res.data))
      .catch(err => console.error("Failed to load sessions", err));
  }, []);

  return (
    <div className="pageviews-wrapper">
      <h2>Visitor Sessions</h2>
      <table className="session-table">
        <thead>
          <tr>
            <th>Session ID</th>
            <th>Path</th>
            <th>Timestamp</th>
            <th>Time on Page</th>
            <th>Exited?</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session, i) =>
            session.visits.map((visit, j) => (
              <tr key={`${i}-${j}`}>
                <td>{session.sessionId}</td>
                <td>{visit.path}</td>
                <td>{new Date(visit.timestamp).toLocaleString()}</td>
                <td>{visit.timeOnPage}s</td>
                <td>{visit.exited ? "Yes" : "No"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

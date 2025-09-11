import { useEffect, useState } from "react";
import axios from "axios";
import "./css/SubscribersPage.css";

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState([]);

  useEffect(() => {
    axios.get("/api/admin/subscribers")
      .then(res => setSubscribers(res.data))
      .catch(err => console.error("Failed to load subscribers", err));
  }, []);

  return (
    <div className="wrapper">
      <h2>Subscribers</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Email</th>
            <th>Name</th>
            <th>Subscribed At</th>
          </tr>
        </thead>
        <tbody>
          {subscribers.map((user, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{user.email}</td>
              <td>{user.name || "-"}</td>
              <td>{user.subscribedAt ? new Date(user.subscribedAt).toLocaleString() : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

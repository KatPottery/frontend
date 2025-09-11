import { useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import axios from 'axios';
import { getSessionId } from '../utils/session';

export default function SkibidiPageView() {
  const location = useLocation();
  const previousTime = useRef(Date.now());
  const previousPath = useRef(location.pathname);

  useEffect(() => {
    const sessionId = getSessionId();
    const now = Date.now();
    const timeOnPrevious = now - previousTime.current;

    if (previousPath.current && previousPath.current !== location.pathname) {
      axios.post("/api/skibidi/pageview", {
        sessionId,
        path: location.pathname,
        timeOnPage: 0,
        markPreviousAsExit: true
      });

      axios.post("/api/skibidi/pageview", {
        sessionId,
        path: previousPath.current,
        timeOnPage: timeOnPrevious
      });
    }

    previousTime.current = now;
    previousPath.current = location.pathname;
  }, [location.pathname]);

  return null;
}

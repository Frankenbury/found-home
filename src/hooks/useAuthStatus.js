/* eslint-disable import/prefer-default-export */
import { useEffect, useState, useRef } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export const useAuthStatus = () => {
  // state for user log in status
  const [loggedIn, setLoggedIn] = useState(false);
  // true while checking (like loading), false after response
  const [statusCheck, setStatusCheck] = useState(true);
  // avoid data leak error by not running if the component is not mounted
  const isMounted = useRef(true);

  useEffect(() => {
    if (isMounted) {
      // initialize auth
      const auth = getAuth();
      // if getAuth returned an authenticated user,
      // loggedIn state is true. If not, it remains false
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setLoggedIn(true);
        }
        // We're no longer awaiting a response, Check is false
        setStatusCheck(false);
      });
    }
    return () => {
      isMounted.current = false;
    };
  }, [isMounted]);

  return { loggedIn, statusCheck };
};

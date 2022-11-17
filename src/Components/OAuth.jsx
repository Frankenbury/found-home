/* eslint-disable react/button-has-type */
import { useLocation, useNavigate } from 'react-router-dom';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { db } from '../firebase.config';
import googleIcon from '../assets/svg/googleIcon.svg';

function OAuth() {
  const navigate = useNavigate();
  const location = useLocation();

  const onGoogleClick = async () => {
    try {
      // Authenticate the user with Google
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const { user } = result;

      /* Check the users collection in our DB for a document containing
      the uid of the user we authenticated above */
      const docRef = doc(db, 'users', user.uid);
      // get a snapshot of the referenced doc
      const docSnap = await getDoc(docRef);

      // If user is not found in DB, create an entry for them
      if (!docSnap.exists()) {
        // 2 params for setDoc (the document, and the data we want to add)
        // 3 params for document (our db, collection name and user id)
        await setDoc(doc(db, 'users', user.uid), {
          name: user.displayName,
          email: user.email,
          timestamp: serverTimestamp()
        });
      }
      navigate('/');
    } catch (error) {
      toast.error('Could not authorize with Google');
    }
  };

  return (
    <div className="socialLogin">
      <p>
        {location.pathname === '/register' ? 'Register' : 'Sign In '}
        with
      </p>
      <button className="socialIconDiv" onClick={onGoogleClick}>
        <img className="socialIconImg" src={googleIcon} alt="google" />
      </button>
    </div>
  );
}
export default OAuth;

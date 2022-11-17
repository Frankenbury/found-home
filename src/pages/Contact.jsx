/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { db } from '../firebase.config';

function Contact() {
  // local state
  const [message, setMessage] = useState('');
  const [owner, setOwner] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const params = useParams();

  // Get the user
  useEffect(() => {
    const getOwner = async () => {
      const docRef = doc(db, 'users', params.userRef);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setOwner(docSnap.data());
      } else {
        toast.error('Could not get owner information');
      }
    };
    getOwner();
  }, [params.userRef]);

  const onChange = (e) => {
    setMessage(e.target.value);
  };

  return (
    <div className="pageContainer">
      <header>
        <p className="pageHeader">Contact Property Owner</p>
      </header>
      {owner !== null && (
        <main>
          <div className="contactLandlord">
            <p className="landlordName">Contact {owner?.name}</p>
          </div>
          <form className="messageForm">
            <div className="messageDiv">
              <label htmlFor="message" className="messageLabel">
                Message
              </label>
              <textarea
                name="message"
                id="message"
                className="textarea"
                value={message}
                onChange={onChange}
              />
            </div>
            <a
              href={`mailto:${owner.email}?Subject=${searchParams.get(
                'listingName'
              )}&body=${message}`}
            >
              <button type="button" className="primaryButton">
                Send Message
              </button>
            </a>
          </form>
        </main>
      )}
    </div>
  );
}
export default Contact;

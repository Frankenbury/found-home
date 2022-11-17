/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable no-unused-expressions */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable no-shadow */
/* eslint-disable no-alert */
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAuth, updateProfile } from 'firebase/auth';
import { toast } from 'react-toastify';
import {
  updateDoc,
  doc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc
} from 'firebase/firestore';
import ListingItem from '../Components/ListingItem';
import { db } from '../firebase.config';
import arrowRight from '../assets/svg/keyboardArrowRightIcon.svg';
import homeIcon from '../assets/svg/homeIcon.svg';

function Profile() {
  const auth = getAuth();
  // setup local state for editing user information
  const [changeDetails, setChangeDetails] = useState(false);
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email
  });

  // Destructure name and email from the form data
  const { name } = formData;

  const navigate = useNavigate();

  // Get the user's listings to display for editing/deleting
  useEffect(() => {
    // Async must be expression
    const fetchUserListings = async () => {
      // Build the query for the l
      const listingsRef = collection(db, 'listings');
      const q = query(
        listingsRef,
        where('userRef', '==', auth.currentUser.uid),
        orderBy('timestamp', 'desc')
      );
      const querySnap = await getDocs(q);

      const listingsArray = [];

      querySnap.forEach(
        (doc) =>
          listingsArray.push({
            id: doc.id,
            data: doc.data()
          })
        // eslint-disable-next-line function-paren-newline
      );
      setListings(listingsArray);
      setLoading(false);
    };
    fetchUserListings();
  }, [auth.currentUser]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value
    }));
  };

  const onDelete = async (listingId) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      // Delete the document from Firebase
      await deleteDoc(doc(db, 'listings', listingId));
      // Delete from our list and display
      const updatedListings = listings.filter(
        (listing) => listing.id !== listingId
      );
      setListings(updatedListings);
      toast.success('Listing Deleted!');
    }
  };

  const onEdit = (listingId) => navigate(`/edit-listing/${listingId}`);

  // Handle submit click
  const onSubmit = async () => {
    try {
      // check for name change
      if (auth.currentUser.displayName !== name) {
        // update name in local firebase
        await updateProfile(auth.currentUser, {
          displayName: name
        });
        // update user in firestore db
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, {
          name
        });
      }
    } catch (error) {
      toast.error('Could not update profile');
    }
  };

  // Logout using signOut from auth
  const onLogout = () => {
    auth.signOut();
    navigate('/');
  };

  return (
    <div className="profile">
      <header className="profileHeader">
        <p className="pageHeader">My Profile</p>
        <button type="button" className="logOut" onClick={onLogout}>
          Logout
        </button>
      </header>
      <main>
        <div className="profileDetailsHeader">
          <p className="profileDetailsText">Personal Details</p>
          <p
            className="changePersonalDetails"
            onClick={() => {
              changeDetails && onSubmit();
              setChangeDetails((prevState) => !prevState);
            }}
          >
            {changeDetails ? 'done' : 'change'}
          </p>
        </div>
        <div className="profileCard">
          <form>
            {/* text input that is only visible if changeDetails is true */}
            <input
              type="text"
              id="name"
              value={name}
              onChange={onChange}
              className={!changeDetails ? 'profileName' : 'profileNameActive'}
              disabled={!changeDetails}
            />
          </form>
        </div>
        <Link to="/add-listing" className="createListing">
          <img src={homeIcon} alt="home" />
          <p>List your home for sale or rent</p>
          <img src={arrowRight} alt="arrow" />
        </Link>
        {!loading && listings?.length > 0 && (
          <>
            <p className="listingText">Your Listings</p>
            <ul className="listingsList">
              {listings.map((listing) => (
                <ListingItem
                  key={listing.id}
                  listing={listing.data}
                  id={listing.id}
                  onDelete={() => onDelete(listing.id)}
                  onEdit={() => onEdit(listing.id)}
                />
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}

export default Profile;

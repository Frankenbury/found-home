/* eslint-disable no-unused-expressions */
/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-boolean-value */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { useState, useEffect, useRef } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { toast } from 'react-toastify';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL
} from 'firebase/storage';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../firebase.config';
import Spinner from '../Components/Spinner';

function AddListing() {
  const [geolocationEnabled, setGeolocationEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'rent',
    name: '',
    bedrooms: 1,
    bathrooms: 1,
    parking: false,
    furnished: false,
    address: '',
    offer: false,
    regularPrice: 0,
    discountedPrice: 0,
    images: {},
    latitude: 0,
    longitude: 0
  });

  const {
    type,
    name,
    bedrooms,
    bathrooms,
    parking,
    furnished,
    address,
    offer,
    regularPrice,
    discountedPrice,
    images,
    latitude,
    longitude
  } = formData;

  const auth = getAuth();
  const navigate = useNavigate();
  const isMounted = useRef(true);

  useEffect(() => {
    if (isMounted) {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setFormData({ ...formData, userRef: user.uid });
        } else {
          navigate('/sign-in');
        }
      });
    }
    return () => {
      isMounted.current = false;
    };
  }, [isMounted]);

  const onMutate = (e) => {
    // boolean values will come in as strings (JSON)
    let boolean = null;
    if (e.target.value === 'true') {
      boolean = true;
    }
    if (e.target.value === 'false') {
      boolean = false;
    }
    // files
    if (e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        images: e.target.files
      }));
    }

    if (!e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        [e.target.id]: boolean ?? e.target.value
      }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Discounted price should be less than regular price
    if (discountedPrice >= regularPrice) {
      setLoading(false);
      toast.error('Discounted Price should be lower than the Regular Price');
      return;
    }
    // Check number of images
    if (images.length > 6) {
      setLoading(false);
      toast.error('Max image count is 6');
      return;
    }
    // I did not set up geolocation API
    const geolocation = {};
    let location;
    if (geolocationEnabled) {
      // Get geolocation data from address data
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?
        /address=${address}&key=${process.env.REACT_APP_GEOCODE_API_KEY}`
      );

      const data = response.json();
      // Set geolocation data
      geolocation.lat = data.results[0]?.geometry.location.lat ?? 0;
      geolocation.lng = data.results[0]?.geometry.location.lng ?? 0;
      location =
        data.status === 'ZERO_RESULTS'
          ? undefined
          : data.results[0]?.formatted_address;

      if (location === undefined || location.includes('undefined')) {
        setLoading(false);
        toast.error('Please enter a valid address');
        return;
      }
    } else {
      geolocation.lat = latitude;
      geolocation.lng = longitude;
    }
    // Store image in firebase
    const storeImage = async (image) =>
      new Promise((resolve, reject) => {
        const storage = getStorage();
        const fileName = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`;

        const storageRef = ref(storage, `images/${fileName}`);

        const uploadTask = uploadBytesResumable(storageRef, image);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            switch (snapshot.state) {
              case 'paused':
                break;
              case 'running':
                break;
              default:
                break;
            }
          },
          (error) => {
            reject(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve(downloadURL);
            });
          }
        );
      });

    const imgUrls = await Promise.all(
      [...images].map((image) => storeImage(image))
    ).catch(() => {
      setLoading(false);
      toast.error('Images not uploaded');
    });

    // new object allowing us to add items to the formData
    const formDataCopy = {
      ...formData,
      imgUrls,
      geolocation,
      timestamp: serverTimestamp()
    };
    // No longer need the data because we have image addresses and location
    formDataCopy.locaiton = address;
    delete formDataCopy.images;
    delete formDataCopy.address;
    !formDataCopy.offer && delete formDataCopy.discountedPrice;

    // Save the data
    const docRef = await addDoc(collection(db, 'listings'), formDataCopy);

    setLoading(false);
    toast.success('Listing Saved!');
    // Redirect to the new listing
    navigate(`/category/${formDataCopy.type}/${docRef.id}`);
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="profile">
      <header>
        <p className="pageHeader">Add a new listing</p>
      </header>

      <main>
        <form onSubmit={onSubmit}>
          <label htmlFor="type" className="formLabel">
            Sell / Rent
          </label>
          <div className="formButtons">
            <button
              type="button"
              className={type === 'sale' ? 'formButtonActive' : 'formButton'}
              id="type"
              value="sale"
              onClick={onMutate}
            >
              Sell
            </button>
            <button
              type="button"
              className={type === 'rent' ? 'formButtonActive' : 'formButton'}
              id="type"
              value="rent"
              onClick={onMutate}
            >
              Rent
            </button>
          </div>
          <label className="formLabel">Name</label>
          <input
            className="formInputName"
            type="text"
            id="name"
            value={name}
            onChange={onMutate}
            maxLength="32"
            minLength="10"
            required
          />
          <div className="formRooms flex">
            <div>
              <label className="formLabel">Bedrooms</label>
              <input
                className="formInputSmall"
                type="number"
                id="bedrooms"
                value={bedrooms}
                onChange={onMutate}
                min="1"
                max="50"
                required
              />
            </div>
            <div>
              <label className="formLabel">Bathrooms</label>
              <input
                className="formInputSmall"
                type="number"
                id="bathrooms"
                value={bathrooms}
                onChange={onMutate}
                min="1"
                max="50"
                required
              />
            </div>
          </div>
          <label htmlFor="type" className="formLabel">
            Garage
          </label>
          <div className="formButtons">
            <button
              type="button"
              className={parking ? 'formButtonActive' : 'formButton'}
              id="parking"
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              type="button"
              className={
                !parking && parking !== null ? 'formButtonActive' : 'formButton'
              }
              id="parking"
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>
          <label htmlFor="type" className="formLabel">
            Furnished
          </label>
          <div className="formButtons">
            <button
              type="button"
              className={furnished ? 'formButtonActive' : 'formButton'}
              id="furnished"
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              type="button"
              className={
                !furnished && furnished !== null
                  ? 'formButtonActive'
                  : 'formButton'
              }
              id="furnished"
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>
          <label className="formLabel">Address</label>
          <input
            className="formInputAddress"
            type="text"
            id="address"
            value={address}
            onChange={onMutate}
            required
          />
          {/* If we do not have access to geolocation API, we can give the option
          to manually add the data */}
          {!geolocationEnabled && (
            <div className="formLatLng flex">
              <div>
                <label className="formLabel">Latitude</label>
                <input
                  className="formInputSmall"
                  type="number"
                  id="latitude"
                  value={latitude}
                  onChange={onMutate}
                  required
                />
              </div>
              <div>
                <label className="formLabel">Longitude</label>
                <input
                  className="formInputSmall"
                  type="number"
                  id="longitude"
                  value={longitude}
                  onChange={onMutate}
                  required
                />
              </div>
            </div>
          )}
          <label htmlFor="type" className="formLabel">
            Discount
          </label>
          <div className="formButtons">
            <button
              type="button"
              className={offer ? 'formButtonActive' : 'formButton'}
              id="offer"
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              type="button"
              className={
                !offer && offer !== null ? 'formButtonActive' : 'formButton'
              }
              id="offer"
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>
          <label htmlFor="regularPrice" className="formLabel">
            Regular Price
          </label>
          <div className="formPriceDiv">
            <input
              className="formInputSmall"
              type="number"
              id="regularPrice"
              value={regularPrice}
              onChange={onMutate}
              min="50"
              max="750000000"
              required
            />
            {type === 'rent' && <p className="formPriceText">$ / Month</p>}
          </div>
          {offer && (
            <>
              <label htmlFor="regularPrice" className="formLabel">
                Discount Price
              </label>
              <div className="formPriceDiv">
                <input
                  className="formInputSmall"
                  type="number"
                  id="discountedPrice"
                  value={discountedPrice}
                  onChange={onMutate}
                  min="50"
                  max="750000000"
                  required={offer}
                />
              </div>
            </>
          )}
          <label htmlFor="images" className="formLabel">
            Images
          </label>
          <p className="imagesInfo">
            The first image will be the cover (max 6).
          </p>
          <input
            className="formInputFile"
            type="file"
            id="images"
            onChange={onMutate}
            max="6"
            accept=".jpg,.png,.jpeg"
            multiple
            required
          />
          <button type="submit" className="primaryButton createListingButton">
            Create Listing
          </button>
        </form>
      </main>
    </div>
  );
}
export default AddListing;

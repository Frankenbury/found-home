/* eslint-disable import/no-unresolved */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
// Import map components for leaflet module
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer
} from 'react-leaflet';
// Import Swiper components
import {
  Navigation,
  Pagination,
  Scrollbar,
  A11y
} from 'swiper';
import {
  Swiper,
  SwiperSlide
} from 'swiper/react';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import 'swiper/css/a11y';
// Firebase backend
import { getDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
// Toast for notification popups
import { toast } from 'react-toastify';
import { db } from '../firebase.config';
import moneyFormat from '../utilities/moneyFormat';
import Spinner from '../Components/Spinner';
import shareIcon from '../assets/svg/shareIcon.svg';

function Listing() {
  // Set Local State
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);

  // Initialize useful hooks
  const navigate = useNavigate();
  const params = useParams();
  const auth = getAuth();

  // Fetch the listing first thing
  useEffect(() => {
    const fetchListing = async () => {
      // Use Firebase to get the single document
      // Create a document reference and get the snapshot from the db
      const docRef = doc(db, 'listings', params.listingId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists) {
        setListing(docSnap.data());
        setLoading(false);
      } else {
        toast.error('Listing Not Found');
      }
    };
    fetchListing();
  }, [navigate, params.listingId]);

  if (loading) {
    return <Spinner />;
  }

  return (
    <main>
      {/* Swiper Slider */}
      <Swiper
        modules={[Navigation, Pagination, Scrollbar, A11y]}
        slidesPerView={1}
        pagination={{ clickable: true }}
        navigation
        style={{ height: '300px' }}
      >
        {listing.imgUrls.map((url, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <SwiperSlide key={index}>
            {/* This empty div will be self closing as the images
            are actually laid in as the background. We can
            create a closing tag and add elements overlaid on the pictures */}
            <div
              className='swiperSlideDiv'
              style={{
                background: `url(${listing.imgUrls[index]}) center no-repeat`,
                backgroundSize: 'cover'
              }}
            />
          </SwiperSlide>
        ))}
      </Swiper>
      {/* Share link copies the current page */}
      <div
        className='shareIconDiv'
        onClick={() => {
          navigator.clipboard.writeText(window.location.href);
          setShareLinkCopied(true);
          setTimeout(() => {
            setShareLinkCopied(false);
          }, 2000);
        }}
      >
        <img src={shareIcon} alt='Share' />
      </div>

      {shareLinkCopied && <p className='linkCopied'>Link Copied</p>}

      <div className='listingDetails'>
        <p className='listingName'>
          {listing.name}
          {' '}
          -
          {' '}
          {listing.offer
            ? moneyFormat(listing.discountedPrice)
            : moneyFormat(listing.regularPrice)}
        </p>
        <p className='listingLocation'>{listing.location}</p>
        <p className='listingType'>
          For
          {' '}
          {listing.type === 'rent' ? 'Rent' : 'Sale'}
        </p>
        {listing.offer && (
          <p className='discountPrice'>
            {moneyFormat(listing.regularPrice - listing.discountedPrice)}
            {' '}
            discount
          </p>
        )}

        <ul className='listingDetailsList'>
          <li>
            {listing.bedrooms > 1
              ? `${listing.bedrooms} Bedrooms`
              : '1 Bedroom'}
          </li>
          <li>
            {listing.bathrooms > 1
              ? `${listing.bathrooms} Bathrooms`
              : '1 Bathroom'}
          </li>
          <li>{listing.parking && 'Garage'}</li>
          <li>{listing.furnished && 'Furnished'}</li>
        </ul>

        <p className='listingLocationTitle'>Location</p>
        <div className='leafletContainer'>
          <MapContainer
            style={{ height: '100%', width: '100%' }}
            center={[listing.geolocation.lat, listing.geolocation.lng]}
            zoom={13}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">
              OpenStreetMap</a> contributors'
              url='https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png'
            />
            <Marker position={[listing.geolocation.lat, listing.geolocation.lng]}>
              <Popup>{listing.location}</Popup>
            </Marker>
          </MapContainer>
        </div>

        {/* If this is not the user's listing, CTA for more info */}
        {auth.currentUser?.uid !== listing.userRef && (
          <Link
            to={`/contact/${listing.userRef}?listingName=${listing.name}`}
            className='primaryButton'
          >
            Get more information
          </Link>
        )}
      </div>
    </main>
  );
}
export default Listing;

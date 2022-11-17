/* eslint-disable function-paren-newline */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable no-shadow */
/* eslint-disable import/no-unresolved */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
// Import Swiper components
import { Navigation, Pagination, Scrollbar, A11y, Autoplay } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { db } from '../firebase.config';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import 'swiper/css/a11y';
import 'swiper/css/autoplay';
import Spinner from './Spinner';
import moneyFormat from '../utilities/moneyFormat';

function Slider() {
  // Local state
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState(null);
  // useNavigate hook
  const navigate = useNavigate();

  // Get the listings for the slider
  useEffect(() => {
    // Can't use async in useEffect unless it's an expression
    const getListings = async () => {
      const listingsRef = collection(db, 'listings');
      const q = query(listingsRef, orderBy('timestamp', 'desc', limit(5)));
      const querySnap = await getDocs(q);
      const listings = [];
      querySnap.forEach((doc) =>
        listings.push({ id: doc.id, data: doc.data() })
      );
      setListings(listings);
      setLoading(false);
    };
    getListings();
  }, []);

  if (loading) {
    return <Spinner />;
  }

  // Avoid having a big, empty space if there are no listings
  if (listings.length === 0) {
    return <></>;
  }

  return (
    listings && (
      <>
        <p className="exploreHeading">Latest Listings</p>
        <Swiper
          modules={[Navigation, Pagination, Scrollbar, A11y, Autoplay]}
          slidesPerView={1}
          pagination={{ clickable: true }}
          navigation
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true
          }}
        >
          {listings.map(({ data, id }) => (
            <SwiperSlide
              key={id}
              onClick={() => navigate(`/category/${data.type}/${id}`)}
            >
              <div
                style={{
                  background: `url(${data.imgUrls[0]}) center no-repeat`,
                  backgroundSize: 'cover',
                  padding: '150px'
                }}
                className="swipeSlideDiv"
              >
                <p className="swiperSlideText">{data.name}</p>
                <p className="swiperSlidePrice">
                  {data.discountedPrice
                    ? moneyFormat(data.discountedPrice)
                    : moneyFormat(data.regularPrice)}{' '}
                  {data.type === 'rent' && '/ month'}
                </p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </>
    )
  );
}
export default Slider;

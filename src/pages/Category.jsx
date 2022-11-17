/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter
} from 'firebase/firestore';
import { toast } from 'react-toastify';
import { db } from '../firebase.config';
import Spinner from '../Components/Spinner';
import ListingItem from '../Components/ListingItem';

function Category() {
  // state for listings data
  const [listings, setListings] = useState(null);
  // state for loading spinner
  const [loading, setLoading] = useState(true);
  // state for viewing more listings past the first group
  const [lastFetchedListing, setLastFetchedListing] = useState(null);
  // Are there any more listings on the server?
  const [noMoreListings, setNoMoreListings] = useState(false);

  const params = useParams();

  // Get the listings of type within the params
  useEffect(() => {
    const fetchListings = async () => {
      try {
        // reference to query
        const listingsRef = collection(db, 'listings');
        /* Create the query for 10 listing type that
        match the category name in params in order by
        the most recent first */
        const q = query(
          listingsRef,
          where('type', '==', params.categoryName),
          orderBy('timestamp', 'desc'),
          limit(10)
        );
        // Run the query
        const querySnap = await getDocs(q);

        // Set up the last listing displayed in order to add to the list
        const lastVisible = querySnap.docs[querySnap.docs.length - 1];
        setLastFetchedListing(lastVisible);

        // Make an array of the query results and loop through it
        const listingsArray = [];
        querySnap.forEach((doc) => {
          listingsArray.push({
            id: doc.id,
            data: doc.data()
          });
        });

        // Add the listings into the listings array
        setListings(listingsArray);
        setLoading(false);
      } catch (error) {
        toast.error('Unable to fetch listings');
      }
    };
    // Call the async IIFE
    fetchListings();
  }, [params.categoryName]);

  // Pagination / load more listings
  const onFetchMoreListings = async () => {
    try {
      // reference to query
      const listingsRef = collection(db, 'listings');
      /* Create the query for 10 listing type that
      match the category name in params in order by
      the most recent first starting with the end of our list */
      const q = query(
        listingsRef,
        where('type', '==', params.categoryName),
        orderBy('timestamp', 'desc'),
        // The first listing after the last one in the useEffect list
        startAfter(lastFetchedListing),
        limit(10)
      );
      // Run the query
      const querySnap = await getDocs(q);

      // Set up the last listing displayed in order to add to the list
      const lastVisible = querySnap.docs[querySnap.docs.length - 1];
      setLastFetchedListing(lastVisible);

      // Make an array of the query results and loop through it
      const listingsArray = [];
      querySnap.forEach((doc) => {
        listingsArray.push({
          id: doc.id,
          data: doc.data()
        });
      });

      // Remaining listings? So we can add the message
      setNoMoreListings(querySnap.empty);

      // add the new listings to the existing listings array
      // spread operators allow the previous state to remain
      // while we tack the new list onto the end
      setListings((prevState) => [...prevState, ...listingsArray]);
      setLoading(false);
    } catch (error) {
      toast.error('Unable to fetch listings');
    }
  };

  return (
    <div className="category">
      <header>
        <p className="pageHeader">
          {params.categoryName === 'rent' ? 'Homes for rent' : 'Homes for sale'}
        </p>
      </header>
      {loading ? (
        <Spinner />
      ) : listings && listings.length > 0 ? (
        <>
          <main>
            <ul className="categoryListings">
              {listings.map((listing) => (
                <ListingItem
                  listing={listing.data}
                  id={listing.id}
                  key={listing.id}
                />
              ))}
            </ul>
          </main>
          <br />
          <br />
          {noMoreListings ? (
            <p>No More Listings</p>
          ) : (
            <p className="loadMore" onClick={onFetchMoreListings}>
              Load More
            </p>
          )}
        </>
      ) : (
        <p>No listings for {params.categoryName}</p>
      )}
    </div>
  );
}

export default Category;

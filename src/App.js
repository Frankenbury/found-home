import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PrivateRoute from './Components/PrivateRoute';
import AddListing from './pages/AddListing';
import Navbar from './Components/Navbar';
import Deals from './pages/Deals';
import Category from './pages/Category';
import Contact from './pages/Contact';
import EditListing from './pages/EditListing';
import Explore from './pages/Explore';
import ForgotPassword from './pages/ForgotPassword';
import Listing from './pages/Listing';
import Profile from './pages/Profile';
import Register from './pages/Register';
import SignIn from './pages/SignIn';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Explore />} />
          <Route path="/deals" element={<Deals />} />
          <Route path="/category/:categoryName" element={<Category />} />
          {/* private route for the PrivateRoute component requiring logged in user */}
          <Route path="/profile" element={<PrivateRoute />}>
            <Route path="/profile" element={<Profile />} />
          </Route>
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/add-listing" element={<AddListing />} />
          <Route
            path="/category/:categoryName/:listingId"
            element={<Listing />}
          />
          <Route path="/contact/:userRef" element={<Contact />} />
          <Route path="/edit-listing/:listingId" element={<EditListing />} />
        </Routes>
        <Navbar />
      </Router>
      <ToastContainer autoClose={3000} />
    </>
  );
}

export default App;

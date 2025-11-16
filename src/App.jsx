
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./Pages/Login";

import ProtectedRoute from "./components/ProtectedRoute";
import MainLayou from "./components/MainLayou";
import Navbar from "./Pages/Navbar";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Products from "./Pages/Products";
import Seo from "./Pages/Seo";
import SingleProduct from "./Pages/SingleProduct";



function App() {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayou />
             </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/navbar" replace />} />
          <Route path="/navbar" element={<Navbar />} />
          <Route path="/products" element={<Products />} />
          <Route path="/seo" element={<Seo />} />
          <Route path="/singleproduct" element={<SingleProduct />} />

        </Route>
      </Routes>
    </>
  );
}

export default App;

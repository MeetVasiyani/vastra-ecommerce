import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container, Row, Col, Form } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import {User,Mail,MapPin,Package,Plus,Trash2,ChevronDown,ShoppingBag,Calendar,AlertCircle,ArrowLeft,ChevronLeft,ChevronRight,Phone,Edit,X,Star,MessageSquare,KeyRound,} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../services/api";
import {fetchUserProfile,addUserAddress,deleteUserAddress,updateUserAddress,updateUserProfile,deleteAccount,changePassword,} from "../services/authService";
import { getMyOrders, cancelOrder } from "../services/orderService";
import {fetchMyReviews,updateReview,deleteReview,} from "../services/reviewService";

import EditProfileModal from "../components/account/EditProfileModal";
import AddressCard from "../components/account/AddressCard";
import NewAddressForm from "../components/account/NewAddressForm";
import EditAddressForm from "../components/account/EditAddressForm";
import OrderCard from "../components/account/OrderCard";
import Pagination from "../components/account/Pagination";
import ReviewCard from "../components/account/ReviewCard";
import ChangePasswordModal from "../components/account/ChangePasswordModal";

const AccountPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, isLoading: authLoading } = useAuth();

  const [profile, setProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [isUpdatingAddress, setIsUpdatingAddress] = useState(false);
  const [deletingAddressId, setDeletingAddressId] = useState(null);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [activeTab, setActiveTab] = useState("orders");

  const [orders, setOrders] = useState([]);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersTotalPages, setOrdersTotalPages] = useState(1);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);

  const [reviews, setReviews] = useState([]);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsTotalPages, setReviewsTotalPages] = useState(1);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [deletingReviewId, setDeletingReviewId] = useState(null);
  const [savingReviewId, setSavingReviewId] = useState(null);
  const [reviewsLoaded, setReviewsLoaded] = useState(false);

  const [error, setError] = useState("");

  const loadProfile = async () => {
    setIsLoadingProfile(true);
    const result = await fetchUserProfile();
    if (result.success && result.profile) {
      setProfile(result.profile);
    } else {
      setError(result.error || "Failed to load profile");
    }
    setIsLoadingProfile(false);
  };

  const loadOrders = async (page = 1) => {
    setIsLoadingOrders(true);
    const result = await getMyOrders(page, 5);
    if (result.success && result.orders) {
      setOrders(result.orders.items || []);
      setOrdersTotalPages(
        Math.ceil(
          (result.orders.totalCount || 0) / (result.orders.pageSize || 5),
        ),
      );
      setOrdersPage(result.orders.page || 1);
    } else {
      setError(result.error || "Failed to load orders");
    }
    setIsLoadingOrders(false);
  };

  const loadMyReviews = async (page = 1) => {
    setIsLoadingReviews(true);
    try {
      const data = await fetchMyReviews(page, 5);
      setReviews(data.items || []);
      setReviewsTotalPages(
        Math.ceil((data.totalCount || 0) / (data.pageSize || 5)),
      );
      setReviewsPage(data.page || 1);
      setReviewsLoaded(true);
    } catch {
      setError("Failed to load your reviews");
    }
    setIsLoadingReviews(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadProfile();
      loadOrders(1);
    }
  }, [isAuthenticated]);

  const handleAddAddress = async (addressData) => {
    setIsAddingAddress(true);
    setError("");

    const result = await addUserAddress(addressData);

    if (result.success && result.address) {
      setProfile((prev) => ({
        ...prev,
        addresses: [...(prev?.addresses || []), result.address],
      }));
      setShowAddressForm(false);
    } else {
      setError(result.error || "Failed to add address");
    }

    setIsAddingAddress(false);
  };

  const handleDeleteAddress = async (addressId) => {
    setDeletingAddressId(addressId);
    setError("");

    const result = await deleteUserAddress(addressId);

    if (result.success) {
      setProfile((prev) => ({
        ...prev,
        addresses: prev?.addresses?.filter((a) => a.id !== addressId) || [],
      }));
    } else {
      setError(result.error || "Failed to delete address");
    }

    setDeletingAddressId(null);
  };

  const handleUpdateAddress = async (addressId, addressData) => {
    setIsUpdatingAddress(true);
    setError("");

    const result = await updateUserAddress(addressId, addressData);

    if (result.success && result.address) {
      setProfile((prev) => ({
        ...prev,
        addresses:
          prev?.addresses?.map((a) =>
            a.id === addressId ? result.address : a,
          ) || [],
      }));
      setEditingAddress(null);
    } else {
      setError(result.error || "Failed to update address");
    }

    setIsUpdatingAddress(false);
  };

  const handleUpdateProfile = async (profileData) => {
    setIsUpdatingProfile(true);
    setError("");

    const result = await updateUserProfile(profileData);

    if (result.success && result.profile) {
      setProfile(result.profile);
      setShowEditModal(false);
    } else {
      setError(result.error || "Failed to update profile");
    }

    setIsUpdatingProfile(false);
  };

  const handleChangePassword = async (passwordData) => {
    setIsChangingPassword(true);
    const result = await changePassword(passwordData);
    setIsChangingPassword(false);

    if (result.success) {
      setShowChangePasswordModal(false);
      alert(result.message || "Password changed successfully.");
      return { success: true };
    }

    return { success: false, error: result.error || "Failed to change password" };
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    const result = await deleteAccount();

    if (result.success) {
      logout();
      navigate("/", { replace: true });
    } else {
      setError(result.error || "Failed to delete account");
      setShowDeleteConfirm(false);
    }
    setIsDeletingAccount(false);
  };

  const handleCancelOrder = async (orderId) => {
    setCancellingOrderId(orderId);
    setError("");

    const result = await cancelOrder(orderId);

    if (result.success) {
      await loadOrders(ordersPage);
    } else {
      setError(result.error || "Failed to cancel order");
    }

    setCancellingOrderId(null);
  };

  const handleOrdersPageChange = (page) => {
    loadOrders(page);
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    if (tab === "reviews" && !reviewsLoaded) {
      loadMyReviews(1);
    }
  };

  const handleReviewsPageChange = (page) => {
    loadMyReviews(page);
  };

  const handleEditReview = (review) => {
    setEditingReviewId(review.id);
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
  };

  const handleSaveReview = async (id, { rating, comment }) => {
    setSavingReviewId(id);
    setError("");
    try {
      await updateReview(id, { rating, comment });
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, rating, comment } : r)),
      );
      setEditingReviewId(null);
    } catch (err) {
      setError(err.message || "Failed to update review");
    }
    setSavingReviewId(null);
  };

  const handleDeleteReview = async (id) => {
    setDeletingReviewId(id);
    setError("");
    try {
      await deleteReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err.message || "Failed to delete review");
    }
    setDeletingReviewId(null);
  };

  if (!authLoading && !isAuthenticated) {
    navigate("/login", { state: { from: "/account" } });
    return null;
  }

  if (authLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh", background: "var(--vastra-ivory)" }}
      >
        <div className="text-center">
          <div
            className="spinner-border"
            role="status"
            style={{
              color: "var(--vastra-maroon)",
              width: "3rem",
              height: "3rem",
            }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <p
            className="mt-3"
            style={{ color: "var(--vastra-dark)", fontStyle: "italic" }}
          >
            Loading your account...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="account-page">
      <Navbar />

      {/* Page Header */}
      <section
        className="account-header py-5"
        style={{
          background:
            "linear-gradient(135deg, var(--vastra-ivory) 0%, var(--vastra-beige) 100%)",
          marginTop: "70px",
          borderBottom: "1px solid rgba(128, 0, 32, 0.08)",
        }}
      >
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link
              to="/"
              className="d-inline-flex align-items-center gap-2 mb-3 text-decoration-none"
              style={{ color: "var(--vastra-maroon)" }}
            >
              <ArrowLeft size={18} />
              Back to Home
            </Link>
            <h1
              className="mb-0"
              style={{
                fontFamily: "EB Garamond, serif",
                fontSize: "clamp(2rem, 5vw, 3rem)",
                color: "var(--vastra-dark)",
                fontWeight: 600,
              }}
            >
              My Account
            </h1>
          </motion.div>
        </Container>
      </section>

      {/* Main Content */}
      <section
        className="account-content py-5"
        style={{
          background: "var(--vastra-ivory)",
          minHeight: "60vh",
        }}
      >
        <Container>
          {/* Error Alert */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="alert d-flex align-items-center gap-2 mb-4"
                style={{
                  background: "rgba(220, 53, 69, 0.1)",
                  border: "1px solid rgba(220, 53, 69, 0.2)",
                  borderRadius: "12px",
                  color: "#dc3545",
                }}
              >
                <AlertCircle size={20} />
                {error}
                <button
                  className="btn-close ms-auto"
                  onClick={() => setError("")}
                  style={{ fontSize: "0.8rem" }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <Row className="g-4">
            {/* Profile Section */}
            <Col lg={5}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4"
                style={{
                  background: "#fff",
                  borderRadius: "16px",
                  boxShadow: "0 4px 20px rgba(128, 0, 32, 0.06)",
                  border: "1px solid rgba(128, 0, 32, 0.08)",
                }}
              >
                <div className="d-flex align-items-center gap-2 mb-4">
                  <User size={22} style={{ color: "var(--vastra-maroon)" }} />
                  <h4
                    className="mb-0"
                    style={{
                      fontFamily: "EB Garamond, serif",
                      color: "var(--vastra-dark)",
                      fontSize: "1.3rem",
                      fontWeight: 600,
                    }}
                  >
                    Profile
                  </h4>
                </div>

                {isLoadingProfile ? (
                  <div className="text-center py-4">
                    <div
                      className="spinner-border spinner-border-sm"
                      style={{ color: "var(--vastra-maroon)" }}
                    />
                    <p
                      className="mt-2 mb-0"
                      style={{ color: "var(--vastra-dark)", opacity: 0.7 }}
                    >
                      Loading profile...
                    </p>
                  </div>
                ) : profile ? (
                  <>
                    {/* User Info */}
                    <div
                      className="mb-4 p-3"
                      style={{
                        background: "var(--vastra-beige)",
                        borderRadius: "12px",
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="d-flex align-items-center gap-3 flex-grow-1">
                          <div
                            className="d-flex align-items-center justify-content-center"
                            style={{
                              width: "60px",
                              height: "60px",
                              borderRadius: "50%",
                              background:
                                "linear-gradient(135deg, var(--vastra-maroon), var(--vastra-deep-maroon))",
                              color: "#fff",
                              fontSize: "1.5rem",
                              fontFamily: "EB Garamond, serif",
                              fontWeight: 600,
                            }}
                          >
                            {profile.firstName?.[0]?.toUpperCase() || "U"}
                          </div>
                          <div>
                            <h5
                              className="mb-1"
                              style={{
                                color: "var(--vastra-dark)",
                                fontWeight: 600,
                              }}
                            >
                              {profile.firstName} {profile.lastName}
                            </h5>
                            <p
                              className="mb-1 d-flex align-items-center gap-1"
                              style={{
                                color: "var(--vastra-dark)",
                                opacity: 0.7,
                                fontSize: "0.9rem",
                              }}
                            >
                              <Mail size={14} />
                              {profile.email}
                            </p>
                            {profile.phoneNumber && (
                              <p
                                className="mb-0 d-flex align-items-center gap-1"
                                style={{
                                  color: "var(--vastra-dark)",
                                  opacity: 0.7,
                                  fontSize: "0.9rem",
                                }}
                              >
                                <Phone size={14} />
                                {profile.phoneNumber}
                              </p>
                            )}
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="btn btn-link p-2"
                          onClick={() => setShowEditModal(true)}
                          style={{ color: "var(--vastra-maroon)" }}
                          title="Edit profile"
                        >
                          <Edit size={18} />
                        </motion.button>
                      </div>
                      <div
                        className="mt-3 pt-3 d-flex justify-content-end"
                        style={{ borderTop: "1px solid rgba(128, 0, 32, 0.1)" }}
                      >
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="btn btn-sm d-flex align-items-center gap-2"
                          onClick={() => setShowChangePasswordModal(true)}
                          style={{
                            backgroundColor: "rgba(128, 0, 32, 0.05)",
                            color: "var(--vastra-maroon)",
                            border: "1px solid rgba(128, 0, 32, 0.2)",
                            borderRadius: "8px",
                            fontWeight: 500,
                          }}
                        >
                          <KeyRound size={14} />
                          Change Password
                        </motion.button>
                      </div>
                    </div>

                    {/* Addresses Section */}
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5
                        className="mb-0"
                        style={{
                          color: "var(--vastra-dark)",
                          fontWeight: 600,
                          fontSize: "1rem",
                        }}
                      >
                        <MapPin
                          size={16}
                          className="me-2"
                          style={{ color: "var(--vastra-maroon)" }}
                        />
                        Saved Addresses
                      </h5>
                    </div>

                    <AnimatePresence>
                      {profile.addresses?.length > 0 ? (
                        profile.addresses.map((address) => (
                          <AddressCard
                            key={address.id}
                            address={address}
                            onEdit={setEditingAddress}
                            onDelete={handleDeleteAddress}
                            isDeleting={deletingAddressId === address.id}
                          />
                        ))
                      ) : (
                        <p
                          className="text-center py-3"
                          style={{ color: "var(--vastra-dark)", opacity: 0.6 }}
                        >
                          No addresses saved yet
                        </p>
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {editingAddress && (
                        <EditAddressForm
                          address={editingAddress}
                          onUpdateAddress={handleUpdateAddress}
                          onCancel={() => setEditingAddress(null)}
                          isLoading={isUpdatingAddress}
                        />
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {showAddressForm && (
                        <NewAddressForm
                          onAddAddress={handleAddAddress}
                          onCancel={() => setShowAddressForm(false)}
                          isLoading={isAddingAddress}
                        />
                      )}
                    </AnimatePresence>

                    {!showAddressForm && !editingAddress && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="btn w-100 d-flex align-items-center justify-content-center gap-2 mt-3"
                        onClick={() => setShowAddressForm(true)}
                        style={{
                          border: "2px dashed rgba(128, 0, 32, 0.3)",
                          color: "var(--vastra-maroon)",
                          borderRadius: "12px",
                          padding: "12px",
                        }}
                      >
                        <Plus size={18} />
                        Add New Address
                      </motion.button>
                    )}

                    {/* Danger Zone */}
                    <div
                      className="mt-5 pt-4"
                      style={{ borderTop: "1px solid rgba(220, 53, 69, 0.2)" }}
                    >
                      <h5
                        className="mb-3"
                        style={{
                          color: "#dc3545",
                          fontSize: "1rem",
                          fontWeight: 600,
                        }}
                      >
                        Danger Zone
                      </h5>
                      <p
                        style={{
                          fontSize: "0.9rem",
                          color: "var(--vastra-dark)",
                          opacity: 0.7,
                        }}
                      >
                        Once you delete your account, there is no going back.
                        Please be certain.
                      </p>
                      {!showDeleteConfirm ? (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="btn w-100"
                          onClick={() => setShowDeleteConfirm(true)}
                          style={{
                            border: "1px solid #dc3545",
                            color: "#dc3545",
                            borderRadius: "12px",
                            padding: "10px",
                          }}
                        >
                          Delete Account
                        </motion.button>
                      ) : (
                        <div
                          className="p-3"
                          style={{
                            background: "rgba(220, 53, 69, 0.05)",
                            borderRadius: "12px",
                          }}
                        >
                          <p
                            className="mb-3"
                            style={{
                              fontSize: "0.9rem",
                              color: "#dc3545",
                              fontWeight: 500,
                            }}
                          >
                            Are you absolutely sure? This action cannot be
                            undone.
                          </p>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-danger w-100"
                              onClick={handleDeleteAccount}
                              disabled={isDeletingAccount}
                            >
                              {isDeletingAccount
                                ? "Deleting..."
                                : "Yes, Delete"}
                            </button>
                            <button
                              className="btn btn-outline-secondary w-100"
                              onClick={() => setShowDeleteConfirm(false)}
                              disabled={isDeletingAccount}
                              style={{ border: "1px solid rgba(0,0,0,0.2)" }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <AnimatePresence>
                      {showChangePasswordModal && (
                        <ChangePasswordModal
                          onChangePassword={handleChangePassword}
                          onClose={() => setShowChangePasswordModal(false)}
                          isLoading={isChangingPassword}
                        />
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <p
                    className="text-center py-4"
                    style={{ color: "var(--vastra-dark)", opacity: 0.7 }}
                  >
                    Unable to load profile
                  </p>
                )}
              </motion.div>
            </Col>

            {/* Orders & Reviews Tabbed Section */}
            <Col lg={7}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-4"
                style={{
                  background: "#fff",
                  borderRadius: "16px",
                  boxShadow: "0 4px 20px rgba(128, 0, 32, 0.06)",
                  border: "1px solid rgba(128, 0, 32, 0.08)",
                }}
              >
                {/* Tab Navigation */}
                <div
                  className="d-flex gap-2 mb-4 p-1"
                  style={{
                    background: "var(--vastra-beige)",
                    borderRadius: "12px",
                    display: "inline-flex",
                  }}
                >
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    className="btn d-flex align-items-center gap-2"
                    onClick={() => handleTabSwitch("orders")}
                    style={{
                      borderRadius: "10px",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      padding: "8px 18px",
                      transition: "all 0.25s ease",
                      background:
                        activeTab === "orders"
                          ? "var(--vastra-maroon)"
                          : "transparent",
                      color:
                        activeTab === "orders" ? "#fff" : "var(--vastra-dark)",
                      border: "none",
                      boxShadow:
                        activeTab === "orders"
                          ? "0 2px 10px rgba(128, 0, 32, 0.3)"
                          : "none",
                    }}
                  >
                    <ShoppingBag size={16} />
                    Orders
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    className="btn d-flex align-items-center gap-2"
                    onClick={() => handleTabSwitch("reviews")}
                    style={{
                      borderRadius: "10px",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      padding: "8px 18px",
                      transition: "all 0.25s ease",
                      background:
                        activeTab === "reviews"
                          ? "var(--vastra-maroon)"
                          : "transparent",
                      color:
                        activeTab === "reviews" ? "#fff" : "var(--vastra-dark)",
                      border: "none",
                      boxShadow:
                        activeTab === "reviews"
                          ? "0 2px 10px rgba(128, 0, 32, 0.3)"
                          : "none",
                    }}
                  >
                    <Star size={16} />
                    My Reviews
                  </motion.button>
                </div>

                {/* Orders Tab */}
                <AnimatePresence mode="wait">
                  {activeTab === "orders" && (
                    <motion.div
                      key="orders"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                    >
                      {isLoadingOrders ? (
                        <div className="text-center py-5">
                          <div
                            className="spinner-border"
                            style={{ color: "var(--vastra-maroon)" }}
                          />
                          <p
                            className="mt-3 mb-0"
                            style={{
                              color: "var(--vastra-dark)",
                              opacity: 0.7,
                            }}
                          >
                            Loading orders...
                          </p>
                        </div>
                      ) : orders.length > 0 ? (
                        <>
                          {orders.map((order) => (
                            <OrderCard
                              key={order.id}
                              order={order}
                              onCancel={handleCancelOrder}
                              isCancelling={cancellingOrderId === order.id}
                            />
                          ))}
                          <Pagination
                            currentPage={ordersPage}
                            totalPages={ordersTotalPages}
                            onPageChange={handleOrdersPageChange}
                          />
                        </>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-center py-5"
                        >
                          <div
                            className="d-inline-flex align-items-center justify-content-center mb-4"
                            style={{
                              width: "80px",
                              height: "80px",
                              borderRadius: "50%",
                              background:
                                "linear-gradient(135deg, rgba(128, 0, 32, 0.1) 0%, rgba(212, 175, 55, 0.1) 100%)",
                            }}
                          >
                            <Package
                              size={36}
                              style={{ color: "var(--vastra-maroon)" }}
                            />
                          </div>
                          <h5
                            className="mb-2"
                            style={{
                              color: "var(--vastra-dark)",
                              fontWeight: 600,
                            }}
                          >
                            No Orders Yet
                          </h5>
                          <p
                            className="mb-4"
                            style={{
                              color: "var(--vastra-dark)",
                              opacity: 0.7,
                            }}
                          >
                            Start shopping to see your order history here
                          </p>
                          <Link to="/shop" className="btn btn-vastra-primary">
                            Start Shopping
                          </Link>
                        </motion.div>
                      )}
                    </motion.div>
                  )}

                  {/* Reviews Tab */}
                  {activeTab === "reviews" && (
                    <motion.div
                      key="reviews"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                    >
                      {isLoadingReviews ? (
                        <div className="text-center py-5">
                          <div
                            className="spinner-border"
                            style={{ color: "var(--vastra-maroon)" }}
                          />
                          <p
                            className="mt-3 mb-0"
                            style={{
                              color: "var(--vastra-dark)",
                              opacity: 0.7,
                            }}
                          >
                            Loading your reviews...
                          </p>
                        </div>
                      ) : reviews.length > 0 ? (
                        <>
                          <AnimatePresence>
                            {reviews.map((review) => (
                              <ReviewCard
                                key={review.id}
                                review={review}
                                onEdit={handleEditReview}
                                onDelete={handleDeleteReview}
                                onSave={handleSaveReview}
                                onCancelEdit={handleCancelEdit}
                                isEditing={editingReviewId === review.id}
                                isDeleting={deletingReviewId === review.id}
                                isSaving={savingReviewId === review.id}
                              />
                            ))}
                          </AnimatePresence>
                          <Pagination
                            currentPage={reviewsPage}
                            totalPages={reviewsTotalPages}
                            onPageChange={handleReviewsPageChange}
                          />
                        </>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-center py-5"
                        >
                          <div
                            className="d-inline-flex align-items-center justify-content-center mb-4"
                            style={{
                              width: "80px",
                              height: "80px",
                              borderRadius: "50%",
                              background:
                                "linear-gradient(135deg, rgba(128, 0, 32, 0.1) 0%, rgba(212, 175, 55, 0.1) 100%)",
                            }}
                          >
                            <MessageSquare
                              size={36}
                              style={{ color: "var(--vastra-maroon)" }}
                            />
                          </div>
                          <h5
                            className="mb-2"
                            style={{
                              color: "var(--vastra-dark)",
                              fontWeight: 600,
                            }}
                          >
                            No Reviews Yet
                          </h5>
                          <p
                            className="mb-4"
                            style={{
                              color: "var(--vastra-dark)",
                              opacity: 0.7,
                            }}
                          >
                            Purchase a product and share your experience!
                          </p>
                          <Link to="/shop" className="btn btn-vastra-primary">
                            Browse Products
                          </Link>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditModal && (
          <EditProfileModal
            profile={profile}
            onUpdate={handleUpdateProfile}
            onClose={() => setShowEditModal(false)}
            isLoading={isUpdatingProfile}
          />
        )}
      </AnimatePresence>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AccountPage;

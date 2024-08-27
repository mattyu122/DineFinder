const express = require('express');
const { uploadPhoto, getReservation, getRestaurantById, updatePushNotificationToken, createRestaurant, getAllRestaurants, createRestaurantFromGoogle, updateRestaurant, getRestaurantReview, getRestaurantReviewPhoto, updateRestaurantTable } = require('../controllers/restaurantController');
const { updateUserPhotoUrl, updatePhoto, updateUser, createUser, loginUser, getUserInfo, saveToWishlist, getAllWishlistID, reserveRestaurant, getAllReservation, confirmRestaurantRegistration, deleteWishItem, submitReview, uploadReviewPicture, deleteAccount} = require('../controllers/userController');
const authenticateToken = require('../middleware/authMiddleware');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
// const upload = multer({ storage });
const upload = multer({ storage: storage });
  
//testing config
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const fileParser = require('express-multipart-file-parser');

// router.use(fileParser);
// router.use(cors({ origin: true }));
// router.use(bodyParser.urlencoded({ extended: true }));

// RESTAURANT ROUTES
router.post('/restaurant/createFromGoogle', createRestaurantFromGoogle);
router.post('/restaurant/create', createRestaurant);
router.get('/restaurant/all', getAllRestaurants);
router.get('/restaurant/:id', getRestaurantById);
router.put('/restaurant/:id', updateRestaurant)
router.get('/restaurant/reservation/:id', getReservation)
router.post('/restaurant/:id/updatePushNotificationToken', updatePushNotificationToken)
router.post('/restaurant/uploadPhoto',upload.array('files'), uploadPhoto)
router.get('/restaurant/reviews/:restaurantID',getRestaurantReview)
router.get('/restaurant/photo/:restaurantID', getRestaurantReviewPhoto)
router.put('/restaurant/:id/updateTable', updateRestaurantTable)

// USER ROUTES
router.post('/user/register', createUser);
router.post('/user/login', loginUser);
router.post('/user/updatePhoto',upload.array('files'),updatePhoto)
// router.post('/user/updatePhotoFunctions',upload.single("filename"), updatePhotoFunctions)
// router.get('/user/info', authenticateToken, getUserInfo);
router.get('/user/info/:userId', getUserInfo);
router.put('/user/update/:userId', updateUser);
router.put('/user/updatePhotoUrl/:userId', updateUserPhotoUrl);
router.post('/user/deleteAccount', deleteAccount)
// Wishlist
router.post('/user/:user/wishlist/:restaurantID', saveToWishlist);
router.get('/user/:user/allWishlistID', getAllWishlistID);
router.delete('/user/:user/wishList/:restaurantID', deleteWishItem)

// Reservation
router.post('/user/:user/reservation', reserveRestaurant);
router.get('/user/:user/allReservation', getAllReservation);

// Confirm restaurant have register in our server
router.get('/user/confirmRestaurantRegistration/:restaurantID', confirmRestaurantRegistration);

// Submit restaurant review
router.put('/user/:user/review/:restaurantID', submitReview)
router.post('/user/:user/reviewPicture/:restaurantID', upload.array('reviewPictures'), uploadReviewPicture)

module.exports = router;

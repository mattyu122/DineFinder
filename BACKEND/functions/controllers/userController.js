const { auth, db, bucket } = require('../config/firebaseConfig');
const admin = require('firebase-admin');
const { Reservation } = require('../models/restaurantModel');

// Register User
const createUser = async (req, res) => {
  const { email, password, displayName, photoURL, disabled, role } = req.body;

  try {
    // Create user with email and password
    const userRecord = await auth.createUser({
      email,
      password,
      displayName,
      photoURL,
      disabled
    });

    // Set custom user claims (e.g., role)
    await auth.setCustomUserClaims(userRecord.uid, { role });

    // Store additional user information in Firestore
    const userId = userRecord.uid;
    await db.collection('USER').doc(userId).set({
      email,
      displayName,
      photoURL,
      disabled,
      role,
      wishList: [],
      // createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).send({ userID: userId, email, displayName });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Login User
const loginUser = async (req, res) => {
  const { email } = req.body;

  try {
    const userRecord = await auth.getUserByEmail(email);
    const userId = userRecord.uid;

    if (!userId) {
      throw new Error('Invalid user ID');
    }

    // get User role
    const userDoc = await db.collection('USER').doc(userId).get();
    if (!userDoc.exists) {
       res.status(404).send({ message: 'User not found' });
    }
  
    // Log the userId to ensure it is not empty or null
    console.log('BACKEND userID:', userId);
    console.log('BACKEND userID displayname:', userRecord.displayName);
    console.log('BACKEND userID role:', userDoc.data().role);
    // console.log('BACKEND restaurantId:', userDoc.data().restaurantId);
    // console.log('User API:', userRecord);

    res.status(200).send({ userID: userId, displayName: userRecord.displayName, role: userDoc.data().role, restaurantId: userDoc.data().restaurantId, wishList: userDoc.data().wishList });

  } catch (error) {
    res.status(500).send({ message: `BACKEND login: ${error.message}` });
  }
};

// Get User Info
const getUserInfo = async (req, res) => {
  try {
    const userId = req.params.userId;
    const userDoc = await db.collection('USER').doc(userId).get();
    if (!userDoc.exists) {
       res.status(404).send({ message: 'User not found' });
    }

    res.status(200).send({
      id: userDoc.id,
      ...userDoc.data(),
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// user@example.com
// save restaurant into wishlist for user
const saveToWishlist = async (req, res) => {
  const { user, restaurantID } = req.params;

  if (!restaurantID || !user) {
    res.status(400).send({ message: "Invalid req param" })
    return
  }

  try {
    const userRef = db.collection('USER').doc(user)
    await userRef.update({
      wishList: admin.firestore.FieldValue.arrayUnion(restaurantID)
    });
    res.status(200).send({ message: "Restaurant added to wishlist" })
  } catch (error) {
    res.status(500).send({ message: error.message })
  }
}


// get all items from wishList by user
const getAllWishlistID = async (req, res) => {
  const { user } = req.params;

  if (!user) {
    res.status(400).send({ message: "Invalid request parameters" })
    return
  }

  try {
    const userDoc = await db.collection('USER').doc(user).get();
    
    if (!userDoc.exists) {
      // res.status(404).send({ message: "User doc not found in Wishlist" });
      res.status(200).send({ message: "Wishlist not found in User doc" });
      return
    }
    const data = userDoc.data()
    const wishList = data.wishList
    res.status(200).send(wishList)
  } catch (error) {
    console.error(error.message)
  }
}

// make a restaurant reservation
const reserveRestaurant = async(req, res) => {
  const { user } = req.params;
  try {
    const {
      reservationID,
      reservationDate,
      numberOfCustomer,
      userID,
      restaurantID,
      pushNotificationToken
    } = req.body;

    console.log('Received reservation data:', req.body);


    const newReservation = new Reservation(
      reservationID,
      reservationDate,
      numberOfCustomer,
      userID,
      restaurantID,
      pushNotificationToken
    )
    console.log("🚀 ~ reserveRestaurant ~ newReservation:", newReservation)

    const plainReservation = {
      reservationID: newReservation.reservationID,
      reservationDate: newReservation.reservationDate,
      numberOfCustomer: newReservation.numberOfCustomer,
      userID: newReservation.userID,
      restaurantID: newReservation.restaurantID,
      pushNotificationToken: newReservation.pushNotificationToken
    };

    const sendPushNotification = async (expoPushToken) => {
      const message = {
        to: expoPushToken,
        sound: 'default',
        title: 'New Reservation!',
        body: `You have a new reservation of ${numberOfCustomer} on ${reservationDate}!`,
        data: { someData: 'goes here' },
      };
    
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });
    }
    console.log("🚀 ~ reserveRestaurant ~ plainReservation:", plainReservation)

    await db.collection('RESERVATION').add(plainReservation)

    if(pushNotificationToken) {
      await sendPushNotification(pushNotificationToken)
    }

    res.status(200).send({ message: "Reservation made successful" })
  } catch (error) {
    res.status(500).send({ message: error.message })
  }
}

const updateUser = async (req, res) => {
  const { userId } = req.params;
  const { restaurantId } = req.body;

  try {
    console.log('Updating user:', req.body);
    const userDoc = db.collection('USER').doc(userId);
    await userDoc.update({
      restaurantId,
    });

    res.status(200).send({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }

}

const updateUserPhotoUrl = async (req, res) => {
  const { userId } = req.params;
  const { photoURL } = req.body;

  try {
    console.log('Updating user:', req.body);
    const userDoc = db.collection('USER').doc(userId);
    await userDoc.update({
      photoURL: photoURL,
    });

    res.status(200).send({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }

}

const updatePhoto = async (req, res) => {
  try {
    const { userId } = req.body;
    const files = req.files;

    console.log('userId:', userId);
    console.log('files:', files);
    if (!userId || !files || files.length === 0) {
      res.status(400).send({ message: 'Invalid request' });
      return;
    }

    const fileUrls = [];

    for(const file of files){
      const blob = bucket.file(`user-images/${userId}/${Date.now()}-${file.originalname}`);
      const blobStream = blob.createWriteStream({
        resumable: false,
        metadata: {
          contentType: file.mimetype,
        }
      })
      await new Promise((resolve, reject)=>{
        blobStream.on('finish', async() => {
          await blob.makePublic();
          fileUrls.push(`https://storage.googleapis.com/${bucket.name}/${blob.name}`)
          resolve();
        }).on('error',(reject)).end(file.buffer);
      })
    }

    const docRef = db.collection('USER').doc(userId);
    await docRef.update({
      photoURL: fileUrls[0]
    })
    res.status(200).send({ fileUrls });

  } catch (error) {
    res.status(500).send({ message: error.message });
  }

}

// get all reservation by user ID
const getAllReservation = async(req, res) => {
  const { user } = req.params;

  if (!user) {
    res.status(400).send({ message: "Invalid request parameters" })
    return
  }

  try {
    const querySnapshot = await db.collection('RESERVATION')
      .where('userID.userID', '==', user)
      .get();

    // if (querySnapshot.empty) {
    //   return res.status(404).json({ error: 'No reservations found for this user.' });
    // }

    const reservations = querySnapshot.docs.map(doc => ({
      ...doc.data(),
    }));
    
    console.log("🚀 ~ reservations ~ reservations:", reservations)  
    res.status(200).send(reservations)
  } catch (error) {
    console.error(error.message)
  }
}

const confirmRestaurantRegistration = async(req,res) => {
  const { restaurantID } = req.params
  console.log("🚀 ~ confirmRestaurantRegistration ~ restaurantID:", restaurantID)

  try{
    const querySnapshot = await db.collection('USER').where('restaurantId', '==', restaurantID).limit(1).get()
    console.log("🚀 ~ confirmRestaurantRegistration ~ querySnapshot:", querySnapshot)

    if (querySnapshot.empty) {
      res.status(200).send({ exists: false });
    } else {
      res.status(200).send({ exists: true });
    }
  }catch (error){
    console.error('Error confirming restaurant registration:', error);
    res.status(500).send({ error: 'Internal Server Error' });  }
}

const deleteWishItem = async(req, res) => {
  const { user } = req.params
  console.log("🚀 ~ deleteWishItem ~ user:", user)
  const { restaurantID } = req.params
  console.log("🚀 ~ deleteWishItem ~ restaurantID:", restaurantID)

 try{
   const userRef = db.collection('USER').doc(user)
   await userRef.update({
     wishList: admin.firestore.FieldValue.arrayRemove(restaurantID)
   })
   res.status(200).send({message: 'Delete wishList items successfully'})
 }catch(error){
    console.error(`Error of deleteWishItem: ${error}`)
    res.status(500).send({error: `Internal Server Error`});
 }

}

const submitReview = async(req,res) => {
  const { user, restaurantID } = req.params;
  const review = req.body.review
  const reviewID = req.body.reviewID

  if (!restaurantID || !user) {
    res.status(400).send({ message: "Invalid req param" })
    return
  }

  if( !review ){
    res.status(400).send({message: "Invalid req body"})
    return
  }

  try {
    const userRef = db.collection('REVIEW').doc(restaurantID)
    await userRef.update({
      reviewList: admin.firestore.FieldValue.arrayUnion(review)
    }, { merge: true });

    const restaurantReviewDocRef = db.collection('RESTAURANT').doc(restaurantID).collection('REVIEWS').doc(reviewID)
    await restaurantReviewDocRef.update({
      review
    }, { merge: true });

    res.status(200).send({ message: "Review added successfully to REVIEW Collection, RESTAURANT Subcollection REVIEWS and Image Storage" });
  } catch (error) {
    res.status(500).send({ message: `Review collection:${error.message}` })
  }

}


const uploadReviewPicture = async(req,res) => {
  console.log('Received request:', req.body);
  console.log('Received files:', req.files);
  const { user, restaurantID } = req.params;
  const reviewPictures = req.files?.reviewPictures || [];
  console.log("uploadReviewPicture ~ reviewPictures:", reviewPictures) 

  if (!reviewPictures || !restaurantID) {
    return res.status(400).send({ message: 'Missing required fields or files' });
  }

  try {
    console.log("trying to upload")
    const fileUrls = [];
 
    for (const file of reviewPictures) {
      const blob = bucket.file(`reviews-images/${restaurantID}/${Date.now()}-${file.originalname}`);
      console.log("uploadReviewPicture ~ file.originalname:", file.originalname)
      console.log("uploadReviewPicture ~ blob:", blob)
      const blobStream = blob.createWriteStream({
        resumable: false,
        metadata: {
          contentType: file.mimetype,
        }
      })
      console.log("uploadReviewPicture ~ blobStream:", blobStream)
      
      await new Promise((resolve, reject) => {
        blobStream.on('finish', async () => {
          await blob.makePublic();
          console.log("blobStream.on ~ bucket.name:", bucket.name)
          console.log("blobStream.on ~ blob.name:", blob.name)
          fileUrls.push(`https://storage.googleapis.com/${bucket.name}/${blob.name}`)
          
          resolve();
        }).on('error', (reject)).end(file.buffer);
      }) 
    }

    res.status(200).send({ message: "Review added successfully to REVIEW Collection, RESTAURANT Subcollection REVIEWS and Image Storage", fileUrls, });
  } catch (error) {
    console.log("🚀 ~ uploadPhoto ~ error:", error)
    res.status(500).send({ message: `uploadPhoto :${error.message}` })
  }
}

const deleteAccount = async(req,res) => {
  const {userID} = req.body
  try{
    await admin.auth().deleteUser(userID);
    await admin.firestore().collection('USER').doc(userID).delete();
    res.status(200).send({ message: 'User account and data deleted successfully' });
  }catch(error){
    console.error('Error deleting user account and data:', error);
    res.status(500).send({ error: 'Failed to delete user account and data' });
  }
}

module.exports = { updateUser, createUser, loginUser, getUserInfo, 
  saveToWishlist, getAllWishlistID, reserveRestaurant, getAllReservation, updateUserPhotoUrl,
  confirmRestaurantRegistration, deleteWishItem, submitReview, uploadReviewPicture, updatePhoto, 
  deleteAccount
};
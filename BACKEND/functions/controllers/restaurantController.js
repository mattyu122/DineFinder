const { firestore } = require('firebase-admin');
const { db, bucket } = require('../config/firebaseConfig');
const { Geogcood, Openinghours, Service, Restaurant } = require('../models/restaurantModel');

// Get a restaurant by ID
const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('RESTAURANT').doc(id).get();
    if (!doc.exists) {
      console.log('No such document!')
      return res.send(null);
    }
    const data = doc.data();
    const geogcood = new Geogcood(data.geogcood.lat, data.geogcood.lng);
    const openinghours = new Openinghours(
      data.openinghours.sunday,
      data.openinghours.monday,
      data.openinghours.tuesday,
      data.openinghours.wednesday,
      data.openinghours.thursday,
      data.openinghours.friday,
      data.openinghours.saturday
    );
    const service = new Service(
      data.service.dineIn,
      data.service.takeout,
      data.service.delivery
    );
    const restaurant = new Restaurant(
      data.restaurantid,
      data.restaurantname,
      data.cuisine,
      data.address,
      data.city,
      data.postalcode,
      data.website,
      data.rating,
      data.description,
      data.coverpic,
      geogcood,
      openinghours,
      service,
      data.priceRange,
      data.table,
      data.pushNotificationToken
    );
    res.status(200).send(restaurant);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// Create a new restaurant
const createRestaurant = async (req, res) => {
  try {
    const {
      restaurantid,
      restaurantname,
      cuisine,
      address,
      city,
      postalcode,
      website,
      rating,
      description,
      coverpic,
      geogcood,
      openinghours,
      service,
      priceRange,

    } = req.body;

    const newRestaurant = new Restaurant(
      restaurantid,
      restaurantname,
      cuisine,
      address,
      city,
      postalcode,
      website,
      rating,
      description,
      coverpic,
      priceRange,
      new Geogcood(geogcood.lat, geogcood.lng),
      new Openinghours(
        openinghours.sunday,
        openinghours.monday,
        openinghours.tuesday,
        openinghours.wednesday,
        openinghours.thursday,
        openinghours.friday,
        openinghours.saturday
      ),
      new Service(service.dineIn, service.takeout, service.delivery)
    );

    const docRef = await db.collection('RESTAURANT').add(Object.assign({}, newRestaurant));
    res.status(201).send({ id: docRef.id, ...newRestaurant });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const createRestaurantFromGoogle = async (req, res) => {
  try {
    const {
      restaurantid,
      restaurantname,
      cuisine,
      address,
      city,
      postalcode,
      website,
      rating,
      description,
      coverpic,
      geogcood,
      openinghours,
      service,
      priceRange,
    } = req.body;

    const newRestaurant = {
      restaurantid,
      restaurantname,
      cuisine,
      address,
      city,
      postalcode,
      website,
      rating,
      description,
      coverpic,
      priceRange,
      geogcood: {
        lat: geogcood.lat,
        lng: geogcood.lng
      },
      openinghours: {
        sunday: openinghours.sunday,
        monday: openinghours.monday,
        tuesday: openinghours.tuesday,
        wednesday: openinghours.wednesday,
        thursday: openinghours.thursday,
        friday: openinghours.friday,
        saturday: openinghours.saturday
      },
      service: {
        dineIn: service['dineIn'],
        takeout: service.takeout,
        delivery: service.delivery
      }
    };

    const docRef = db.collection('RESTAURANT').doc(restaurantid);
    await docRef.set(newRestaurant);
    res.status(201).send({ id: docRef.id, ...newRestaurant });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: error.message });
  }
}

// Get all restaurants
const getAllRestaurants = async (req, res) => {
  try {
    const snapshot = await db.collection('RESTAURANT').get();
    const restaurants = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      const restaurant = new Restaurant(
        data.restaurantid,
        data.restaurantname,
        data.cuisine,
        data.address,
        data.city,
        data.postalcode,
        data.website,
        data.rating,
        data.description,
        data.coverpic,
        data.geogcood,
        data.openinghours,
        data.service,
        data.priceRange,
        data.table
      );
      restaurants.push({ id: doc.id, ...restaurant });
    });
    // console.log(restaurants)
    res.status(200).send(restaurants);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
const uploadPhoto = async (req, res) => {
  try {
    const { restaurantId } = req.body;
    const files = req.files;

    console.log('restaurantId:', restaurantId);
    console.log('files:', files);
    if (!restaurantId || !files || files.length === 0) {
      res.status(400).send({ message: 'Invalid request' });
      return;
    }

    const fileUrls = [];

    for(const file of files){
      const blob = bucket.file(`restaurant-images/${restaurantId}/${Date.now()}-${file.originalname}`);
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

    const docRef = db.collection('RESTAURANT').doc(restaurantId);
    await docRef.update({
      coverpic: firestore.FieldValue.arrayUnion(...fileUrls)
    })
    res.status(200).send({ fileUrls });

  } catch (error) {
    res.status(500).send({ message: error.message });
  }

}
const updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      restaurantid,
      restaurantname,
      ownerid,
      cuisine,
      address,
      city,
      postalcode,
      website,
      rating,
      description,
      coverpic,
      geogcood,
      openinghours,
      service,
      priceRange,
      table,
    } = req.body;

    // Create the new restaurant object
    const newRestaurant = {
      restaurantid,
      restaurantname,
      cuisine,
      ownerid,
      address,
      city,
      postalcode,
      website,
      rating,
      description,
      coverpic,
      geogcood: {
        lat: geogcood.lat,
        lng: geogcood.lng,
      },
      openinghours: {
        sunday: openinghours.sunday,
        monday: openinghours.monday,
        tuesday: openinghours.tuesday,
        wednesday: openinghours.wednesday,
        thursday: openinghours.thursday,
        friday: openinghours.friday,
        saturday: openinghours.saturday,
      },
      service: {
        dineIn: service.dineIn,
        takeout: service.takeout,
        delivery: service.delivery,
      },
      priceRange,
      table,
    };

    const docRef = db.collection('RESTAURANT').doc(id);
    await docRef.update(newRestaurant);

    res.status(201).send({ id: docRef.id, ...newRestaurant });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const updateRestaurantTable = async(req,res) => {
  try {
    const { id } = req.params;
    const {table} = req.body;

    const docRef = db.collection('RESTAURANT').doc(id);
    await docRef.update(table);

    res.status(201).send({ id: docRef.id, ...newRestaurant });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
}

const getReservation = async (req,res)=>{
  try{
    const {id} = req.params;
    const snapshot = await db.collection('RESERVATION').where('restaurantID','==',id).get();
    const reservations = [];
    snapshot.forEach(doc => {
        const data = doc.data();
        reservations.push({ id: doc.id, ...data });
    });
    res.status(200).send(reservations);
  }catch(error){
    res.status(500).send({message:error.message})
  }
}

const updatePushNotificationToken = async (req, res) => {
  try{
    const { id } = req.params;
    console.log("🚀 ~ updatePushNotificationToken ~ id:", id)
    const { pushNotificationToken } = req.body;
    console.log("🚀 ~ updatePushNotificationToken ~ pushNotificationToken:", pushNotificationToken)
    const docRef = db.collection('RESTAURANT').doc(id);
    await docRef.update({ pushNotificationToken: pushNotificationToken });
    res.status(200).send({ message: "Push notification token updated" })
  }catch(error){
    res.status(500).send({message:error.message})
  
  }
}

const updateRestaurantReviews = async (req, res) => {
  try {
    const {
      restaurantid,
      userid,
      comment,
      rating,
      submitdate,
      title
    } = req.body;

    const mapTitle = `${userid}_${submitdate}`

    // Create the new review object
    const newReview = {
      [mapTitle]: {
        restaurantid: restaurantid,
        userid: userid,
        comment: comment,
        rating: rating,
        submitdate: submitdate,
        title: title,
      }
    };

    const docRef = db.collection('RESTAURANT').doc(restaurantid);
    await docRef.update(newReview);

    res.status(201).send('Review successfully updated.');
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};


const getRestaurantReview = async(req,res) => {
  const {restaurantID} = req.params
  console.log("🚀 ~ getRestaurantReview ~ restaurantID:", restaurantID)

  try{
    const docRef = await db.collection('REVIEW').doc(restaurantID).get()
    if(docRef.exists){
      const items = docRef.data().reviewList || [];
      console.log("🚀 ~ getRestaurantReview ~ items:", items)
      res.status(200).json(items);
    }else{
      console.error('Document not found')
      return
    }
    
  }catch(error){
    console.log("🚀 ~ getRestaurantReview ~ error:", error)
    res.status(500).send({ message: error.message });
  }
}

const getRestaurantReviewPhoto = async(req,res) => {
  const {restaurantID} = req.params
  const folderPath = `reviews-images/${restaurantID}`;

  if (!folderPath) {
    return res.status(400).send('Folder Path is required');
  }

  try {
    const [files] = await bucket.getFiles({ prefix: folderPath });
    console.log("🚀 ~ getRestaurantReviewPhoto ~ [files]:", [files])
    const imageUrls = await Promise.all(
      files
        .filter(file => file.name.match(/\.(jpg|jpeg|png|gif)$/i)) 
        .map(async (file) => {
          const [url] = await file.getSignedUrl({
            action: 'read',
            expires: '01-01-2100', 
          });
          console.log("🚀 ~ .map ~ file.name:", file.name)
          return { name: file.name, url };
        })
    );
    res.json(imageUrls);
  } catch (error) {
    console.error('Error generating signed URL:', error);
    res.status(500).send('Error generating signed URL');
  }
}




module.exports = {
  getRestaurantById,
  createRestaurant,
  getAllRestaurants,
  createRestaurantFromGoogle,
  updateRestaurant,
  getReservation,
  updatePushNotificationToken,
  uploadPhoto,
  updateRestaurantReviews,
  getRestaurantReview,
  getRestaurantReviewPhoto,
  updateRestaurantTable
};

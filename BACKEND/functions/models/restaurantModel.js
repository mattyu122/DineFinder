class Geogcood {
  constructor(lat, lng) {
    this.lat = lat;
    this.lng = lng;
  }
}

class TableConfig {
  constructor(totalTable, maxCapacity, minCapacity, openForBooking){
    this.totalTable = totalTable
    this.maxCapacity = maxCapacity
    this.minCapacity = minCapacity
    this.openForBooking = openForBooking
  }
}
class Openinghours {
  constructor(sunday, monday, tuesday, wednesday, thursday, friday, saturday) {
    this.sunday = sunday;
    this.monday = monday;
    this.tuesday = tuesday;
    this.wednesday = wednesday;
    this.thursday = thursday;
    this.friday = friday;
    this.saturday = saturday;
  }
}

class Service {
  constructor(dineIn, takeout, delivery) {
    this.dineIn = dineIn;
    this.takeout = takeout;
    this.delivery = delivery;
  }
}

class Restaurant {
  constructor(
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
    table,
    pushNotificationToken
  ) {
    this.restaurantid = restaurantid;
    this.restaurantname = restaurantname;
    this.cuisine = cuisine;
    this.address = address;
    this.city = city;
    this.postalcode = postalcode;
    this.website = website;
    this.rating = rating;
    this.description = description;
    this.coverpic = coverpic;
    this.geogcood = geogcood;
    this.openinghours = openinghours;
    this.service = service;
    this.priceRange = priceRange;
    this.table = table
    this.pushNotificationToken = pushNotificationToken
  }
}

class Reservation {
  constructor(
    reservationID,
    reservationDate,
    numberOfCustomer,
    userID,
    restaurantID,
    pushNotificationToken
  ){
    this.reservationID = reservationID
    this.reservationDate = reservationDate
    this.numberOfCustomer = numberOfCustomer
    this.userID = userID
    this.restaurantID = restaurantID
    this.pushNotificationToken = pushNotificationToken
  }
}

class Review{
  constructor(
  reviewID,
  userID,
  userDisplayName,
  submitDate,
  title,
  rating,
  comment
  ){
    this.reviewID = reviewID
    this.userID = userID
    this.userDisplayName = userDisplayName
    this.submitDate = submitDate
    this.title = title
    this.rating = rating
    this.comment = comment
  }
}

module.exports = {
  Geogcood,
  Openinghours,
  Service,
  Restaurant,
  Reservation,
  TableConfig,
  Review
};
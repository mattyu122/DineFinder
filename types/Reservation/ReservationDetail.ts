export interface Reservation {
    reservationID: string,
    reservationDate: string,
    numberOfCustomer: string | null,
    userID: string,
    restaurantID: string | string[] | undefined
    pushNotificationToken: string | undefined;
}
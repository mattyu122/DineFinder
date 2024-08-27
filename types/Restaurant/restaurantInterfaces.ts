import { RestaurantType, cuisineMapping } from '@/enum/RestaurantType';
import { googleApiKey } from '../../config/googleConsoleMapConfig';
export interface Geogcood {
    lat: string;
    lng: string;
}

export interface TableConfig {
    totalTable: number;
    maxCapacity: number;
    minCapacity: number;
    openForBooking: boolean;
    }
export interface Openinghours {
    sunday: string;
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
}
export interface Service {
    dineIn: boolean;
    takeout: boolean;
    delivery: boolean;
}

export interface Restaurant {
    pushNotificationToken: string| undefined;
    restaurantid: string;
    ownerid: string | null;
    restaurantname: string;
    cuisine: string;
    address: string;
    city: string;
    postalcode: string;
    website: string;
    rating: string;
    description: string;
    coverpic: [string];
    priceRange: string;
    geogcood: Geogcood;
    openinghours: Openinghours;
    service: Service;
    table: {
        [key: string]: TableConfig
    }
}

export const GoogleRestaurantToRestaurant = (data: any[] | any): Restaurant[] | Restaurant => {
    const transform = (restaurant: any): Restaurant => {

        const geogcood: Geogcood = {
    lat: restaurant.geometry.location.lat.toString(),
    lng: restaurant.geometry.location.lng.toString(),
        };
    
        const openinghours: Openinghours = {
    sunday: '',
    monday: '',
    tuesday: '',
    wednesday: '',
    thursday: '',
    friday: '',
    saturday: '',
        };
    
        if (restaurant.opening_hours && restaurant.opening_hours.weekday_text) {
    restaurant.opening_hours.weekday_text.forEach((day: string) => {
            const [dayName, hours] = day.split(': ');
            switch (dayName.toLowerCase()) {
    case 'sunday':
                openinghours.sunday = hours;
                break;
    case 'monday':
                openinghours.monday = hours;
                break;
    case 'tuesday':
                openinghours.tuesday = hours;
                break;
    case 'wednesday':
                openinghours.wednesday = hours;
                break;
    case 'thursday':
                openinghours.thursday = hours;
                break;
    case 'friday':
                openinghours.friday = hours;
                break;
    case 'saturday':
                openinghours.saturday = hours;
                break;
            }
    });
        }
    
        const service: Service = {
    dineIn: restaurant.types.includes('restaurant'),
    takeout: restaurant.types.includes('meal_takeaway'),
    delivery: restaurant.types.includes('meal_delivery'),
        };
        const GOOGLE_PHOTO_URL = 'https://maps.googleapis.com/maps/api/place/photo';

        const coverpic = restaurant.photos && restaurant.photos.length > 0
    ? restaurant.photos.map((photo:any)=>{
        return `${GOOGLE_PHOTO_URL}?maxwidth=400&photoreference=${photo.photo_reference}&key=${googleApiKey}`
    })
    : '';

        const cuisines = restaurant.types.map((type: string)=> cuisineMapping[type as RestaurantType]).filter((type: string) => type !== undefined).join(', ')
        return {
            ownerid: null,
            pushNotificationToken: restaurant.pushNotificationToken || undefined,
            restaurantid: restaurant.place_id,
            restaurantname: restaurant.name,
            cuisine: cuisines, // Assuming types represent cuisines
            address: restaurant.vicinity,
            city: restaurant.vicinity.split(', ').pop() || '', // Assuming the city is Toronto; update as necessary
            postalcode: '', // Google Places API does not provide postal code directly
            website: restaurant.website || '',
            rating: restaurant.rating ? restaurant.rating.toString() : '',
            description: '', // Add description if available
            coverpic,
            priceRange: restaurant.price_level ? '$'.repeat(restaurant.price_level) : '',
            geogcood,
            openinghours,
            service,
            table: {},
            };
    };
    
    if (Array.isArray(data)) {
        return data.map(transform) as Restaurant[];
    } else {
        return transform(data) as Restaurant;
    }
}



const Location = require('./model');

const addNewCity = async (data) => {
    try {
        const { location } = data;
        if (!location) {
            throw new Error('City/Municipality is required');
        }
        const existingLocation = await Location.findOne({ location });

        if (existingLocation) {
            throw new Error('City/Municipality already exists');
        }
        const count = await Location.countDocuments();
        const newLocation = new Location({
            key: count + 1,
            name: location
        });
        const createdLocation = await newLocation.save();
        return createdLocation;
    } catch (error) {
        throw error;
    }
}

const deleteCity = async (data) => {
    try {
        const { location } = data;
        if (!location) {
            throw new Error('City/Municipality is required');
        }
        const existingLocation = await Location.findOne({ location });
        if (!existingLocation) {
            throw new Error('City/Municipality does not exist');
        }
        const deletedLocation = await Location.findOneAndDelete({ location });
        return deletedLocation;
    } catch (error) {
        throw error;
    }
}

const getCities = async () => {
    try {
        const cities = await Location.find();
        if (!cities) {
            throw new Error('No cities found');
        }
        return cities;
    } catch (error) {
        throw error;
    }

}


module.exports = { addNewCity, deleteCity, getCities };

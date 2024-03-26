const Service = require('./model');

const addNewService = async (data) => {
    try {
        const { service } = data;

        if (!service) {
            throw new Error('Service is required');
        }

        const existingLocation = await Service.findOne({ Service });

        if (existingLocation) {
            throw new Error('Service already exists');
        }

        const count = await Service.countDocuments();
        const newLocation = new Service({
            key: count + 1,
            name: service
        });
        const createdLocation = await newLocation.save();
        return createdLocation;
    } catch (error) {
        throw error;
    }
}

const deleteService = async (data) => {
    try {
        const { service } = data;

        if (!service) {
            throw new Error('Service is required');
        }

        const existingService = await Service.findOne({ service });

        if (!existingService) {
            throw new Error('Service does not exist');
        }

        const deletedService = await Service.findOneAndDelete({ service });
        return deletedService;
    } catch (error) {
        throw error;
    }
}

const getServices = async () => {
    try {
        const services = await Service.find();
        if (!services) {
            throw new Error('No services found');
        }
        return services;
    } catch (error) {
        throw error;
    }

}

module.exports = { addNewService, deleteService, getServices };

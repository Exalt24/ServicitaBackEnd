const  { User } = require('./../user/model');
const Admin = require('./model');

const login = async (username, password) => {
    try {
        if (!username || !password) {
            throw new Error('Username and password are required');
        }
        const admin = await Admin.findOne({username, password});
        if(!admin){
            throw new Error('Invalid username or password');
        } else {
            return admin;
        }
    } catch (error) {
        throw error;
    }
}

const findUsersByRole = async (role) => {
    try {
        if (!role) {
            throw new Error('Role is required');
        }
        const users = await User.find({role});
        if(!users){
            throw new Error('No users found');
        } else {
            return users;
        }
    }
    catch (error) {
        throw error;
    }
}

const findUserById = async (userId) => {
    try {
        if (!userId) {
            throw new Error('User ID is required');
        }
        const user = await User.findOne({_id: userId});
        if(!user){
            throw new Error('User not found');
        } else {
            return user;
        }
    } catch (error) {
        throw error;
    }
}

const deleteUser = async (userId) => {
    try {
        if (!userId) {
            throw new Error('User ID is required');
        }
        const user = await User.findOne({_id: userId});
        if(!user){
            throw new Error('User not found');
        } else {
            await User.deleteOne({_id: userId});
            return {status: 'SUCCESS', message: 'User deleted successfully'};
        }
    }
    catch (error) {
        throw error;
    }
}

module.exports = { login, findUsersByRole, findUserById, deleteUser };
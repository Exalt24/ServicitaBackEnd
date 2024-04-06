const  { User } = require('./../user/model');
const Admin = require('./model');
const verifyHashedData = require('./../../util/verifyHashedData');

const login = async (username, password) => {
    try {
        if (!username || !password) {
            throw new Error('Username and password are required');
        }
        const admin = await Admin.findOne({userName: username});
        if(!admin){
            throw new Error('Invalid credentials');
        } else {
            const isPasswordValid = await verifyHashedData(password, admin.password);
            if(!isPasswordValid){
                throw new Error('Invalid password');
            } else {
                return admin;
            }
        }
    } catch (error) {
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

const suspendUser = async (userId, hours) => {
    try {
        if (!userId) {
            throw new Error('User ID is required');
        }
        const user = await User.findOne({_id: userId});
        console.log(user);
        if(!user){
            throw new Error('User not found');
        } else {
            const expirationDate = Date.now() + hours * 60 * 60 * 1000;
            console.log('Expiration Date:', expirationDate);
            
            user.suspension = {
                isSuspended: true,
                expiresAt: expirationDate
            };

            await user.save();
        }
    }
    catch (error) {
        console.log('Error:', error);
        throw error;
    }
}

const unsuspendUser = async (email) => {
    try {
        if (!email) {
            throw new Error('User email is required');
        }
        const user = await User.findOne({email: email});
        if(!user){
            throw new Error('User not found');
        } 

        user.suspension = {
            isSuspended: false,
            expiresAt: null
        };

        await user.save();
    }
    catch (error) {
        throw error;
    }
}  

const checkSuspensionStatus = async (email) => {
    try {
        if (!email) {
            throw new Error('User email is required');
        }
        const user = await User.findOne({email: email});
        if(!user){
            throw new Error('User not found');
        } else {
            if(user.suspension && user.suspension.isSuspended){
                const now = new Date();
                const remainingTime = Math.floor((user.suspension.expiresAt - now) / 1000 / 60);
                return {type: 'SUSPENDED', remainingTime};
            } else {
                return {type: 'NOT_SUSPENDED', remainingTime: 0};
            }
        }
    }
    catch (error) {
        throw error;
    }
}

module.exports = { login, findUserById, deleteUser, suspendUser, unsuspendUser, checkSuspensionStatus };
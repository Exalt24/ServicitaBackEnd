const User = require('./model');
const hashData = require('./../../util/hashData');
const verifyHashedData = require('./../../util/verifyHashedData');


const createNewUser = async (data) => {
    try {
        const { name, email, mobile, password, dateOfBirth} = data;
        const existingUser = await User.find({ email });
        if (existingUser.length) {
            throw Error("Email is being used by another user.");
        } else {
            const hashedPassword = await hashData(password);
            const newUser = new User({
                name,
                email,
                mobile,
                password: hashedPassword,
                dateOfBirth,
                verified: false,
            });
            const createdUser = await newUser.save();
            return createdUser;
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const authenticateUser = async (email, password) => {
    try {
        const fetchedUsers = await User.find({ email });
        if (!fetchedUsers.length) {
            throw Error("Invalid credentials entered!");
        } else {
            if (!fetchedUsers[0].verified) {
                throw Error("Email has not been verified yet.");
            } else {
                const hashedPassword = fetchedUsers[0].password;
                const passwordMatch = await verifyHashedData(password, hashedPassword);
                if (!passwordMatch) {
                    throw Error("Invalid password entered!");
                } else {  
                    return fetchedUsers;
                }
            }
        }
    } catch (error) {
        throw error;
    }
};

module.exports = { createNewUser, authenticateUser };
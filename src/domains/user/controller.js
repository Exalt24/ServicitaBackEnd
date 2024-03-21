const { User, TempUser } = require('./model');
const hashData = require('./../../util/hashData');
const verifyHashedData = require('./../../util/verifyHashedData');

const createNewUser = async (data) => {
    try {
        const { email, mobile, password, role, verified } = data;
        const [existingUserByEmail, existingUserByMobile] = await Promise.all([
            User.findOne({ email }),
            User.findOne({ mobile })
        ]);
        if (existingUserByEmail && !existingUserByEmail.verified.email) {
            throw new Error("Email has been registered but not verified yet. Please verify your email.");
        } else if (existingUserByEmail && existingUserByEmail.verified.email) {
            throw new Error("Email is being used by another user.");
        } else if (existingUserByMobile && existingUserByMobile.verified.mobile) {
            throw new Error("Mobile number is being used by another user.");
        } else {
            const hashedPassword = await hashData(password);
            const newUser = new User({
                email,
                mobile,
                password: hashedPassword,
                role,
                verified: verified || { email: false, mobile: false },
                expiresAfter: new Date(Date.now() + 24 * 60 * 60 * 1000)
            });
            const createdUser = await newUser.save();
            return createdUser;
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const addTempUser = async (data) => {
    try {
        const { userId, name, address, birthDate, service } = data;
        const newTempUser = new TempUser({
            userId,
            name,
            address,
            birthDate,
            service: service || '',
            expiresAfter: new Date(Date.now() + 24 * 60 * 60 * 1000)
        });
        const createdTempUser = await newTempUser.save();
        return createdTempUser;
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
            const hashedPassword = fetchedUsers[0].password;
            const passwordMatch = await verifyHashedData(password, hashedPassword);
            if (!passwordMatch) {
                throw Error("Invalid password entered!");
            } else {
                if (!fetchedUsers[0].verified.email) {
                    throw Error("Email has not been verified yet.");
                } else {
                    return fetchedUsers;
                }
            }
        }
    } catch (error) {
        throw error;
    }
};

const authenticateUserWithoutPass = async (email) => {
    try {
        const fetchedUsers = await User.find({ email });
        if (!fetchedUsers.length) {
            throw Error("Invalid credentials entered!");
        } else {
            if (!fetchedUsers[0].verified.email) {
                throw Error("Email has not been verified yet.");
            } else { 
                return fetchedUsers;
            }
        }
    } catch (error) {
        throw error;
    }
};

const authenticateUserWithNumber = async (mobile) => {
    try {
        const fetchedUsers = await User.find({ mobile });
        if (!fetchedUsers.length) {
            throw Error("Invalid credentials entered!");
        } else {
            if (!fetchedUsers[0].verified.mobile) {
                throw Error("Mobile number has not been verified yet.");
            } else { 
                return fetchedUsers;
            }
        }
    } catch (error) {
        throw error;
    }
}

module.exports = { createNewUser, authenticateUser, authenticateUserWithoutPass, authenticateUserWithNumber, addTempUser};
const { User, TempUser } = require('./model');
const hashData = require('./../../util/hashData');
const verifyHashedData = require('./../../util/verifyHashedData');

const createNewUser = async (data) => {
    try {
        const { email, mobile, password, role} = data;
        if (!email || !mobile || !password || !role) {
            throw new Error("Missing required parameters for user creation.");
        }
        const hashedPassword = await hashData(password);
        const newUser = new User({
            email,
            mobile,
            password: hashedPassword,
            role,
        });
        const createdUser = await newUser.save();
        await TempUser.deleteOne({ email: email });
        return createdUser;
    } catch (error) {
        throw error;
    }
}

const addTempUser = async (data) => {
    try {
        const { email, mobile, password, role, name, address, birthDate, service } = data;
        if (!email || !mobile || !password || !name || !address || !birthDate){
            throw new Error("Missing required parameters for temporary user creation.");
        }
        const existingTempUserByEmail = await TempUser.findOne({ email });
        const existingTempUserByMobile = await TempUser.findOne({ mobile });
        const existingUserByEmail = await User.findOne({ email });
        const existingUserByMobile = await User.findOne({ mobile });
        if (existingTempUserByEmail) {
            throw new Error("Temporary user already exists with the given email.");
        } else if (existingTempUserByMobile) {
            throw new Error("Temporary user already exists with the given mobile number.");
        } else if (existingUserByEmail) {
            throw new Error("User already exists with the given email.");
        } else if (existingUserByMobile) {
            throw new Error("User already exists with the given mobile number.");
        } else {
            const newTempUser = new TempUser({
                email,
                mobile,
                password,
                role,
                name,
                address,
                birthDate,
                service: service || [],
                expiresAfter: new Date(Date.now() + 24 * 60 * 60 * 1000)
            });
            const createdTempUser = await newTempUser.save();
            return createdTempUser;
        }
    } catch (error) {
        throw error;
    }
}

const authenticateUser = async (email, password) => {
    try {
        if (!email || !password) {
            throw new Error("Missing required parameters for user authentication.");
        }
        const fetchedTempUser = await TempUser.findOne({ email, password });
        if (fetchedTempUser) {
            throw new Error("User has not completed the registration process yet.");
        }
        const fetchedUser = await User.findOne({ email });
        if (!fetchedUser) {
            throw new Error("Invalid credentials entered!");
        } else {
            const hashedPassword = fetchedUser.password;
            const passwordMatch = await verifyHashedData(password, hashedPassword);
            if (!passwordMatch) {
                throw new Error("Invalid password entered!");
            } else {
                return fetchedUser;
            }
        }
    } catch (error) {
        throw error;
    }
};

const authenticateUserWithoutPass = async (email) => {
    try {
        if (!email) {
            throw new Error("Missing required parameters for user authentication.");
        }
        const fetchedTempUser = await TempUser.findOne({ email });
        if (fetchedTempUser) {
            throw new Error("User has not completed the registration process yet.");
        }
        const fetchedUser = await User.findOne({ email });
        if (!fetchedUser) {
            throw new Error("Invalid credentials entered!");
        } else {
            return fetchedUser;
        }
    } catch (error) {
        throw error;
    }
};

const authenticateUserWithNumber = async (mobile) => {
    try {
        if (!mobile) {
            throw new Error("Missing required parameters for user authentication.");
        }
        const fetchedTempUser = await TempUser.findOne({ mobile });
        if (fetchedTempUser) {
            throw new Error("User has not completed the registration process yet.");
        }
        const fetchedUser = await User.findOne({ mobile });
        if (!fetchedUser) {
            throw new Error("No user found with the given mobile number!");
        } else {
            return fetchedUser;
        }
    } catch (error) {
        throw error;
    }
}

const getDetails = async (email) => {
    try {
        if (!email) {
            throw new Error("Missing required parameters for getting temporary user details.");
        }
        const tempUser = await TempUser.findOne({ email });
        const user = await User.findOne({ email })
        if (!tempUser && !user) {
            throw new Error("No user found with the given email.");
        } else if (tempUser) {
            return { data: tempUser, type: "temp" };
        } else {
            return { data: user, type: "permanent" };
        }
    } catch (error) {
        throw error;
    }
}

const getDetailsByMobile = async (mobile) => {
    try {
        if (!mobile) {
            throw new Error("Missing required parameters for getting temporary user details.");
        }
        const tempUser = await TempUser.findOne({ mobile });
        const user = await User.findOne({ mobile });
        if (tempUser || user) {
            throw new Error("User found with the given number.");
        }
        if (!tempUser && !user) {
            return { type: "not found" };
        }
    } catch (error) {
        throw error;
    }
}

const getActualDetailsByMobile = async (mobile) => {
    try {
        if (!mobile) {
            throw new Error("Missing required parameters for getting temporary user details.");
        }
        const user = await User.findOne({ mobile });
        if (!user) {
            throw new Error("No user found with the given mobile number.");
        } else {
            return user;
        }
    } catch (error) {
        throw error;
    }
}

const updateDetail = async (userId, updateType, updateValue) => {
    try {
        if (!userId || !updateType || !updateValue) {
            throw new Error("Missing required parameters for updating user details.");
        }
        const user = await User.findOne({ _id: userId });
        if (!user) {
            throw new Error("No user found with the given ID.");
        } else {
            if (updateType === "email") {
                await User.updateOne({ _id: userId }, { email: updateValue });
            } else if (updateType === "mobile") {
                await User.updateOne({ _id: userId }, { mobile: updateValue });
            } else if (updateType === "password") {
                const hashedPassword = await hashData(updateValue);
                await User.updateOne({ _id: userId }, { password: hashedPassword });
            } else {
                throw new Error("Invalid update type.");
            }
            return { userId, updateType, updateValue };
        }
    } catch (error) {
        throw error;
    }
}

const updateTempUserNumber = async (email, mobile) => {
    try {
        if (!email || !mobile) {
            throw new Error("Missing required parameters for updating temporary user details.");
        }
        const tempUser = await TempUser.findOne({ email });
        if (!tempUser) {
            throw new Error("No temporary user found with the given email.");

        } else {
            await TempUser.updateOne({ email }, { mobile });
            return { email, mobile };
        }
    } catch (error) {
        throw error;
    }
}

module.exports = { createNewUser, authenticateUser, authenticateUserWithoutPass, authenticateUserWithNumber, addTempUser, getDetails, updateDetail, getDetailsByMobile, updateTempUserNumber, getActualDetailsByMobile}
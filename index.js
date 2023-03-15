const dotenv = require("dotenv");
dotenv.config();
const io = require("socket.io")(3001, {
	cors: {
		origin: process.env.CLIENT,
		preflightContinue: false,
	},
});

let users = [];

const addUser = (userId, socketId) => {
	!users.some((user) => user.userId === userId) &&
		users.push({ userId, socketId });
};

const removeUser = (socketId) => {
	users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
	return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
	//when ceonnect
	console.log("a user connected.");

	//take userId and socketId from user
	socket.on("addUser", (userId) => {
		addUser(userId, socket.id);
		io.emit("getUsers", users);
	});

	//send and get message
	socket.on("sendMessage", ({ receiverId, senderId, message, convType }) => {
		const user = getUser(receiverId);
		io.to(user?.socketId).emit("getMessage", {
			message,
			senderId,
		});
	});

	socket.on("isSeen", ({ receiverId,senderId, message}) => {
		const user = getUser(receiverId);
		io.to(user?.socketId).emit("getSeen", {
			senderId,
			message,
		});
	});

	socket.on("sendTypingStatus", ({ sender, receiverId, isTyping }) => {
		const user = getUser(receiverId);
		let status = {
			isTyping: true,
			sender,
			receiverId,
		};
		if (isTyping) {
			io.to(user?.socketId).emit("getTypingStatus", status);
		} else {
			status.isTyping = false;
			io.to(user?.socketId).emit("getTypingStatus", status);
		}
	});

	//when disconnect
	socket.on("disconnect", () => {
		console.log("a user disconnected!");
		removeUser(socket.id);
		io.emit("getUsers", users);
	});
});

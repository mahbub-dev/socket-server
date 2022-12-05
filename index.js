const dotenv = require("dotenv");
dotenv.config();
const io = require("socket.io")(3001, {
	cors: {
		origin: "https://react-chat-app-ecru.vercel.app",
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
	socket.on("sendMessage", ({ sender, receiverId, message }) => {
		const user = getUser(receiverId);
		io.to(user?.socketId).emit("getMessage", {
			sender,
			message,
			createdAt: Date.now(),
		});
	});

	//when disconnect
	socket.on("disconnect", () => {
		console.log("a user disconnected!");
		removeUser(socket.id);
		io.emit("getUsers", users);
	});
});

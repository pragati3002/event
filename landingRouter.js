const { Router } = require("express");
const landingRouter = Router();
const { eventModel, attendenceModel, trackerModel, enterModule } = require("../db");
const jwt = require("jsonwebtoken");
const { JWT_KEY } = require("../config");
const { dataMiddleware } = require("../middleware/data");
const { z } = require("zod");
const bcrypt = require("bcrypt");


// User Signup
landingRouter.post("/Signup", async function(req, res) {
    const requireBody = z.object({
        email: z.string(),
        password: z.string(),
        firstName: z.string(),
        lastName: z.string()
    });
    const parseData = requireBody.safeParse(req.body);
    if (!parseData.success) {
        return res.status(400).json({
            message: "Incorrect format",
            error: parseData.error
        });
    }
    const { email, password, firstName, lastName } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await enterModule.create({
            email: email,
            password: hashedPassword,
            firstName: firstName,
            lastName: lastName
        });
        return res.json({
            message: "You are signed up!"
        });
    } catch (e) {
        return res.status(500).json({
            message: "Error",
            error: e.message
        });
    }
});

// User Login
landingRouter.post("/LogIn", async function(req, res) {
    const { email, password } = req.body;

    const response = await enterModule.findOne({ email: email });

    if (!response) {
        return res.status(500).json({
            message: "User doesn't exist"
        });
    }

    // Password comparison should be inside this block since the user exists
    const passwordMatch = await bcrypt.compare(password, response.password);

    if (passwordMatch) {
        const token = jwt.sign({
            id: response._id
        }, JWT_KEY);

        return res.json({
            token: token
        });
    } else {
        return res.status(403).json({
            message: "Incorrect credentials"
        });
    }
});

// Event Creation
landingRouter.post("/event", dataMiddleware, async function(req, res) {
    const adminId = req.userId;
    try {
        const { title, description, location, date } = req.body;

        if (!title || !description || !location || !date) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const data = await eventModel.create({
            title,
            description,
            location,
            date,
            creatorId: adminId
        });
        if (data) {
            return res.json({
                message: "Event created successfully"
            });
        }
    } catch (error) {
        console.error("Error creating event:", error);
        res.status(500).json({
            message: "Error creating event",
            error: error.message
        });
    }
});

// Fetch Events
landingRouter.get("/event", dataMiddleware, async function(req, res) {
    const adminId = req.userId;
    try {
        const events = await eventModel.find({ creatorId: adminId });
        res.json(events);
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({
            message: "Error fetching events",
            error: error.message
        });
    }
});

// Edit Event
landingRouter.put("/event/:id", dataMiddleware, async function(req, res) {
    const adminId = req.userId;
    const { title, description, location, date } = req.body;

    try {
        const event = await eventModel.findOneAndUpdate(
            { _id: req.params.id, creatorId: adminId },
            { title, description, location, date },
            { new: true }
        );

        if (event) {
            res.json({
                message: "Event updated successfully",
                event
            });
        } else {
            res.status(404).json({
                message: "Event not found"
            });
        }
    } catch (error) {
        console.error("Error updating event:", error);
        res.status(500).json({
            message: "Error updating event",
            error: error.message
        });
    }
});

// Delete Event
landingRouter.delete("/event/:id", dataMiddleware, async function(req, res) {
    try {
        const event = await eventModel.findOneAndDelete({ _id: req.params.id });
        if (event) {
            res.json({
                message: "Event deleted successfully"
            });
        } else {
            res.status(404).json({
                message: "Event not found"
            });
        }
    } catch (error) {
        console.error("Error deleting event:", error);
        res.status(500).json({
            message: "Error deleting event",
            error: error.message
        });
    }
});

// Attendee Creation
landingRouter.post("/attendence", async function(req, res) {
    try {
        const { attendee, assignEvent } = req.body;
        if (!attendee || !assignEvent) {
            return res.status(400).json({ message: "All fields are required" });
        }

        await attendenceModel.create({
            attendee,
            assignEvent
        });

        res.status(201).json({
            message: "Attendee successfully added"
        });
    } catch (error) {
        console.error("Error adding attendee:", error);
        res.status(500).json({
            message: "Error adding attendee",
            error: error.message
        });
    }
});

// Fetch Attendees
landingRouter.get("/attendence", async function(req, res) {
    try {
        const attendees = await attendenceModel.find();
        res.json(attendees);
    } catch (error) {
        console.error("Error fetching attendees:", error);
        res.status(500).json({
            message: "Error fetching attendees",
            error: error.message
        });
    }
});

// Task Creation
landingRouter.post("/tracker", async function(req, res) {
    try {
        const { taskdescription, date, event, task, attendee } = req.body;
        if (!taskdescription || !date || !event || !task || !attendee) {
            return res.status(400).json({ message: "All fields are required" });
        }

        await trackerModel.create({
            taskdescription,
            date,
            event,
            task,
            attendee
        });

        res.status(201).json({
            message: "Task successfully created"
        });
    } catch (error) {
        console.error("Error creating task:", error);
        res.status(500).json({
            message: "Error creating task",
            error: error.message
        });
    }
});

// Fetch Tasks
landingRouter.get("/tracker", async function(req, res) {
    try {
        const tasks = await trackerModel.find();
        res.json(tasks);
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({
            message: "Error fetching tasks",
            error: error.message
        });
    }
});

module.exports = {
    landingRouter: landingRouter
};

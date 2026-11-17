
const mongoose = require("mongoose");
const Student = require("../models/Student");
const sendEmail = require("../utils/sendEmail");

// =====================================
// ALLOWED STUDENT FIELDS
// =====================================

const studentFields = [
    "firstName",
    "lastName",
    "gender",
    "dateOfBirth",
    "phoneNumber",
    "email",
    "location",
    "candidateType",
    "collegeName",
    "yearOfStudy",
    "branch",
    "passoutYear",
    "scoreType",
    "score",
    "internshipDuration",
    "internshipDomain",
    "presentSkills",
    "experienceType",
    "experienceYears",
    "employmentSector",
    "jobDescription",
    "careerGoalDescription"
];

// Get student data
const getStudentData = (body) => {
    const data = {};

    studentFields.forEach((field) => {
        if (body[field] !== undefined) {
            data[field] = body[field];
        }
    });

    return data;
};

// Get admin ID
const getAdminId = (req) => {
    return req.user?.id || req.user?._id;
};

// Validate MongoDB ID
const isValidId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

// Escape HTML
const escapeHtml = (value) => {
    return String(value).replace(/[&<>"']/g, (char) => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[char];
    });
};


// =====================================
// COMMON PERSONALIZED WELCOME EMAIL
// =====================================

const sendWelcomeEmail = async (student) => {

    const studentName =
        `${student.firstName || ""} ${student.lastName || ""}`.trim()
        || "Student";

    const courseName =
        student.internshipDomain || "Your Selected Course";

    const duration =
        student.internshipDuration || "As per your program";

    const subject =
        `Welcome to TAiM AI Mentors, ${studentName}!`;

    const text = `
Dear ${studentName},

Welcome to TAiM AI Mentors!

Your registration for the ${courseName} course has been successfully completed.

Internship Duration: ${duration}

We are happy to have you with us. Best wishes for your learning journey!

Thank you,
TAiM AI Mentors Team
    `;

    const html = `
        <h2>Welcome, ${escapeHtml(studentName)}!</h2>

        <p>Welcome to TAiM AI Mentors!</p>

        <p>
            Your registration for the
            <b>${escapeHtml(courseName)}</b>
            course has been successfully completed.
        </p>

        <p>
            <b>Internship Duration:</b>
            ${escapeHtml(duration)}
        </p>

        <p>
            We are happy to have you with us.
            Best wishes for your learning journey!
        </p>

        <p>
            Thank you,<br>
            <b>TAiM AI Mentors Team</b>
        </p>
    `;

    return await sendEmail(
        student.email,
        subject,
        text,
        html
    );
};


// =====================================
// 1. ADD STUDENT + AUTOMATIC WELCOME EMAIL
// =====================================

const addStudent = async (req, res) => {
    try {
        const adminId = getAdminId(req);

        if (!adminId || !isValidId(adminId)) {
            return res.status(401).json({
                success: false,
                message: "Invalid admin authentication"
            });
        }

        const studentData = getStudentData(req.body);

        const existingStudent = await Student.findOne({
            email: studentData.email
        });

        if (existingStudent) {
            return res.status(409).json({
                success: false,
                message: "Student with this email already exists"
            });
        }

        // Save student in MongoDB
        const student = await Student.create({
            ...studentData,
            createdBy: adminId
        });

        // Send Welcome Email
        let welcomeEmailSent = false;

        try {
            await sendWelcomeEmail(student);
            welcomeEmailSent = true;

        } catch (emailError) {
            console.error(
                "Welcome Email Error:",
                emailError.message
            );
        }

        return res.status(201).json({
            success: true,
            message: "Student added successfully",
            welcomeEmailSent,
            emailMessage: welcomeEmailSent
                ? "Welcome email sent successfully"
                : "Student added, but welcome email could not be sent",
            student
        });

    } catch (error) {
        console.error("Add Student Error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Student email already exists"
            });
        }

        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: "Unable to add student"
        });
    }
};


// =====================================
// 2. GET ALL STUDENTS
// =====================================

const getAllStudents = async (req, res) => {
    try {
        const adminId = getAdminId(req);

        const students = await Student.find({
            createdBy: adminId
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: students.length,
            students
        });

    } catch (error) {
        console.error("Get Students Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch students"
        });
    }
};


// =====================================
// 3. GET STUDENT BY ID
// =====================================

const getStudentById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid student ID"
            });
        }

        const student = await Student.findById(id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        return res.status(200).json({
            success: true,
            student
        });

    } catch (error) {
        console.error("Get Student Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch student"
        });
    }
};


// =====================================
// 4. UPDATE STUDENT
// =====================================

const updateStudent = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid student ID"
            });
        }

        const studentData = getStudentData(req.body);

        const student = await Student.findByIdAndUpdate(
            id,
            studentData,
            {
                new: true,
                runValidators: true
            }
        );

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Student updated successfully",
            student
        });

    } catch (error) {
        console.error("Update Student Error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Student email already exists"
            });
        }

        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: "Unable to update student"
        });
    }
};


// =====================================
// 5. DELETE STUDENT
// =====================================

const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid student ID"
            });
        }

        const student = await Student.findByIdAndDelete(id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Student deleted successfully"
        });

    } catch (error) {
        console.error("Delete Student Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to delete student"
        });
    }
};


// =====================================
// 6. MANUAL SEND PERSONALIZED WELCOME EMAIL
// =====================================

const sendStudentEmail = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = getAdminId(req);

        if (!isValidId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid student ID"
            });
        }

        if (!adminId || !isValidId(adminId)) {
            return res.status(401).json({
                success: false,
                message: "Invalid admin authentication"
            });
        }

        // Find student created by logged-in admin
        const student = await Student.findOne({
            _id: id,
            createdBy: adminId
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        // Automatically send student name and selected course
        await sendWelcomeEmail(student);

        return res.status(200).json({
            success: true,
            message: "Personalized welcome email sent successfully",
            email: student.email,
            studentName:
                `${student.firstName || ""} ${student.lastName || ""}`.trim(),
            course: student.internshipDomain,
            internshipDuration: student.internshipDuration
        });

    } catch (error) {
        console.error("Manual Email Error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to send welcome email"
        });
    }
};


// =====================================
// EXPORT CONTROLLERS
// =====================================

module.exports = {
    addStudent,
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
    sendStudentEmail
};

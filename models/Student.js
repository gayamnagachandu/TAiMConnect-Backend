
const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
    {
        // Personal Details
        firstName: {
            type: String,
            required: [true, "First name is required"],
            trim: true
        },

        lastName: {
            type: String,
            required: [true, "Last name is required"],
            trim: true
        },

        gender: {
            type: String,
            required: [true, "Gender is required"],
            enum: ["Male", "Female"]
        },

        dateOfBirth: {
            type: Date,
            required: [true, "Date of birth is required"]
        },

        // Contact Details
        phoneNumber: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                "Please enter a valid email"
            ]
        },

        location: {
            type: String,
            required: [true, "Location is required"],
            trim: true
        },

        // Candidate Details
        candidateType: {
            type: String,
            required: [true, "Candidate type is required"],
            enum: ["College Student", "Job Seeker"]
        },

        // Education Details
        collegeName: {
            type: String,
            trim: true,
            default: ""
        },

        yearOfStudy: {
            type: String,
            trim: true,
            default: ""
        },

        branch: {
            type: String,
            trim: true,
            default: ""
        },

        passoutYear: {
            type: Number,
            min: 1900
        },

        // Academic Details
        scoreType: {
            type: String,
            enum: ["CGPA", "GPA", "Percentage"]
        },

        score: {
            type: Number,
            min: 0
        },

        // Internship Details
        internshipDuration: {
            type: String,
            enum: ["3 Months", "6 Months"]
        },

        internshipDomain: {
            type: String,
            enum: [
                "Full Stack Python",
                "Full Stack Java",
                "Full Stack MERN",
                "Full Stack MEAN"
            ]
        },

        // Skills
        presentSkills: {
            type: [String],
            default: []
        },

        // Experience Details
        experienceType: {
            type: String,
            required: [true, "Experience type is required"],
            enum: ["Fresher", "Experienced"],
            default: "Fresher"
        },

        experienceYears: {
            type: Number,
            min: 0,
            default: 0
        },

        employmentSector: {
            type: String,
            enum: ["IT", "Non-IT"]
        },

        // Job Details
        jobDescription: {
            type: String,
            trim: true,
            default: ""
        },

        // Career Details
        careerGoalDescription: {
            type: String,
            trim: true,
            default: ""
        },

        // Admin who created this record
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

// Export Student Model
module.exports = mongoose.model("Student", studentSchema);

// controllers/adminController.js
import { SuperAdmin, Professor } from "../models/User.js";
import Subject from "../models/Subject.js";
import bcrypt from "bcryptjs";

// TEMPORARY: Seed First Super Admin
export const seedSuperAdmin = async (req, res) => {
    try {
        const adminExists = await SuperAdmin.findOne({ email: "admin@exam.com" });
        if (adminExists) {
            return res.status(400).json({ message: "Super Admin already exists!" });
        }

        const hashedPassword = await bcrypt.hash("admin123", 10);

        const superAdmin = await SuperAdmin.create({
            name: "Main Admin",
            email: "admin@exam.com",
            password: hashedPassword,
        });

        res.status(201).json({ message: "Super Admin created", superAdmin });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// controllers/adminController.js (Add this function)

// SUPER ADMIN ONLY: Create Professor and assign to a Subject
export const createProfessor = async (req, res) => {
    try {
        console.log(req.body);
        const { name, email, password, subjectId } = req.body;

        // 1. Check if the subject exists
        const subject = await Subject.findById(subjectId);
        if (!subject) {
            return res.status(404).json({ message: "Subject not found" });
        }

        // 2. Check if a professor is already assigned to this subject
        if (subject.assignedProfessor) {
            return res.status(400).json({ message: "A professor is already assigned to this subject" });
        }

        // 3. Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Create the Professor (using the Discriminator Model)
        const newProfessor = await Professor.create({
            name,
            email,
            password: hashedPassword,
            // department: "Computer Science" // optional, if you added this to the schema
        });

        // 5. Link the Professor to the Subject
        subject.assignedProfessor = newProfessor._id;
        await subject.save();

        res.status(201).json({
            message: "Professor created and successfully assigned to the subject",
            professor: {
                _id: newProfessor._id,
                name: newProfessor.name,
                email: newProfessor.email,
                role: newProfessor.role
            },
            subject: subject.name
        });

    } catch (error) {
        // Handle duplicate email error specifically
        if (error.code === 11000) {
            return res.status(400).json({ message: "Email already exists" });
        }
        res.status(500).json({ error: error.message });
    }
};

export const getProfessors = async (req, res) => {
  try {
    const professors = await Professor.find()
      .select("-password");

    res.status(200).json(professors);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// Get single professor by id
export const getProfessorById = async (req, res) => {
    try {
        const professor = await Professor.findById(req.params.id).select('-password');

        if (!professor) {
            return res.status(404).json({ message: 'Professor not found' });
        }

        res.status(200).json({ professor });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update professor
export const updateProfessor = async (req, res) => {
    try {
        const professor = await Professor.findById(req.params.id);

        if (!professor) {
            return res.status(404).json({ message: 'Professor not found' });
        }

        const { name, email, password } = req.body;

        professor.name = name || professor.name;
        professor.email = email || professor.email;

        if (password) {
            const hashed = await bcrypt.hash(password, 10);
            professor.password = hashed;
        }

        await professor.save();

        res.status(200).json({ message: 'Professor updated successfully', professor });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        res.status(500).json({ error: error.message });
    }
};

// Delete professor
export const deleteProfessor = async (req, res) => {
    try {
        const professor = await Professor.findById(req.params.id);

        if (!professor) {
            return res.status(404).json({ message: 'Professor not found' });
        }

        await professor.deleteOne();

        // Optionally unassign from subjects
        await Subject.updateMany({ assignedProfessor: professor._id }, { $unset: { assignedProfessor: '' } });

        res.status(200).json({ message: 'Professor deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
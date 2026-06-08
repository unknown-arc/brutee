// controllers/examController.js
import Exam from "../models/Exam.js";
import Subject from "../models/Subject.js";
import Question from "../models/Question.js";
import { logEvent } from "../utils/logger.js";

export const createExam = async (req, res) => {
    try {
        const { title, questionIds, durationMinutes, startTime } = req.body;
        const user = req.user;

        const subject = await Subject.findOne({ assignedProfessor: user._id });
        if (!subject) {
            return res.status(403).json({ message: "You are not assigned to manage any subject." });
        }

        const validQuestions = await Question.find({
            _id: { $in: questionIds },
            subjectId: subject._id
        });

        if (validQuestions.length !== questionIds.length) {
            return res.status(400).json({ message: "Invalid questions." });
        }

        const totalMarks = validQuestions.reduce((sum, q) => sum + q.marks, 0);

        const newExam = await Exam.create({
            title,
            subjectId: subject._id,
            createdBy: user._id,
            questions: questionIds,
            durationMinutes,
            totalMarks,
            startTime
        });

        // --- TRIGGER AUDIT LOG HERE ---
        await logEvent({
            userId: user._id,
            action: "CREATED_EXAM",
            resourceType: "Exam",
            resourceId: newExam._id,
            description: `Exam paper '${title}' created for subject ${subject.name}`,
            ipAddress: req.ip // Express automatically grabs the IP
        });

        res.status(201).json({
            message: "Exam paper created successfully",
            exam: newExam,
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Fetch created exams
export const getExams = async (req, res) => {
    try {
        const subject = await Subject.findOne({ assignedProfessor: req.user._id });
        if (!subject) return res.status(200).json([]);

        const exams = await Exam.find({ subjectId: subject._id })
            .populate("questions", "questionText marks");

        res.status(200).json(exams);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get single exam by id
export const getExamById = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id)
            .populate('questions', 'questionText marks')
            .populate('subjectId', 'name subjectCode');

        if (!exam) {
            return res.status(404).json({ success: false, message: 'Exam not found' });
        }

        res.status(200).json({ success: true, exam });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAvailableExams = async (req, res) => {
    try {
        const exams = await Exam.find({
            isActive: true,
        })
            .populate("subjectId", "name")
            .select(
                "title subjectId durationMinutes totalMarks startTime"
            );

        res.status(200).json(exams);
    } catch (error) {
        res.status(500).json({
            error: error.message,
        });
    }
};

export const deleteExam = async (
    req,
    res
) => {
    try {
        const exam = await Exam.findById(
            req.params.id
        );

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: "Exam not found",
            });
        }

        await exam.deleteOne();

        res.status(200).json({
            success: true,
            message:
                "Exam deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const updateExam = async (
    req,
    res
) => {
    try {
        const exam = await Exam.findById(
            req.params.id
        );

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: "Exam not found",
            });
        }

        exam.title =
            req.body.title || exam.title;

        exam.durationMinutes =
            req.body.durationMinutes ||
            exam.durationMinutes;

        exam.startTime =
            req.body.startTime ||
            exam.startTime;

        await exam.save();

        res.status(200).json({
            success: true,
            message:
                "Exam updated successfully",
            exam,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


export const publishExam = async (
    req,
    res
) => {
    try {
        const exam = await Exam.findById(
            req.params.id
        );

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: "Exam not found",
            });
        }

        exam.isActive = true;
        exam.isPublished = true;
        exam.status = "ACTIVE";

        await exam.save();

        res.status(200).json({
            success: true,
            message:
                "Exam published successfully",
            exam,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const Proposal = require("../models/proposal.model");
const Feedback = require("../models/feedback.model");
const User = require("../models/user.model");

exports.getTopContributors = async (req, res) => {
  try {
    const topContributors = await Proposal.aggregate([
      { $match: { status: "approved" } },
      { $group: { 
          _id: "$contributor", 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      { $project: {
          username: "$user.username",
          contributions: "$count"
        }
      }
    ]);
    
    res.json(topContributors);
  } catch (error) {
    console.error("Error fetching top contributors:", error);
    res.status(500).json({ 
      message: "Error fetching top contributors", 
      error: error.message 
    });
  }
};

exports.getTopFeedback = async (req, res) => {
  try {
    const topFeedback = await Feedback.aggregate([
      { $match: { status: "resolved" } },
      { $group: { 
          _id: "$user", 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      { $project: {
          username: "$user.username",
          feedbackCount: "$count"
        }
      }
    ]);
    
    res.json(topFeedback);
  } catch (error) {
    console.error("Error fetching top feedback providers:", error);
    res.status(500).json({ 
      message: "Error fetching top feedback providers", 
      error: error.message 
    });
  }
};
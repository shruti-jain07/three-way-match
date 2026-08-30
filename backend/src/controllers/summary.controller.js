import { getSummary } from "../services/match.service.js";
 
const getMatchSummary = async (req, res) => {
  try {
    const { poNumber } = req.params;
 
    if (!poNumber) {
      return res.status(400).json({
        success: false,
        message: "poNumber is required",
      });
    }
 
    const summary = await getSummary(poNumber);
 
    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate summary",
    });
  }
};
 
export { getMatchSummary };
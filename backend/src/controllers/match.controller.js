import { computeMatch } from "../services/match.service.js";
 
const getMatchResult = async (req, res) => {
  try {
    const { poNumber } = req.params;
 
    if (!poNumber) {
      return res.status(400).json({
        success: false,
        message: "poNumber is required",
      });
    }
 
    const result = await computeMatch(poNumber);
 
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to match documents",
    });
  }
};
 
export { getMatchResult };
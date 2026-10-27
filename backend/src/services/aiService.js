/**
 * Deterministic AI & Text Intelligence Service for SetuCase
 * Supports:
 * 1. One-line neutral case summary generation
 * 2. Smart overlap / related complaint matching with transparent scoring
 */

// Helper to calculate word overlap (Jaccard-like keyword similarity)
function calculateWordOverlap(text1 = '', text2 = '') {
  const sanitize = (txt) =>
    txt
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 3 && !['with', 'from', 'this', 'that', 'have', 'been', 'institute', 'college'].includes(w));

  const words1 = new Set(sanitize(text1));
  const words2 = new Set(sanitize(text2));

  if (words1.size === 0 || words2.size === 0) return 0;

  let intersectionCount = 0;
  for (const w of words1) {
    if (words2.has(w)) intersectionCount++;
  }

  const unionSize = new Set([...words1, ...words2]).size;
  return unionSize > 0 ? intersectionCount / unionSize : 0;
}

/**
 * Generates neutral 1-line case summary adhering to rules:
 * - Neutral statement of alleged issue
 * - Mention institution
 * - Current status
 * - Next pending action
 */
export function generateOneLineSummary(complaint) {
  const institution = complaint.institutionName || 'the reported institution';
  const category = complaint.category || 'Grievance';
  const status = complaint.status || 'Submitted';
  const nextAction = complaint.nextPendingAction || 'Pending bureau review';

  // Extract clean essence of title or issue
  let issueSnippet = complaint.title ? complaint.title.trim() : 'grievance regarding institutional compliance';
  if (issueSnippet.length > 60) {
    issueSnippet = issueSnippet.substring(0, 57) + '...';
  }

  // Generate neutral, legally conscious summary
  return `Reported ${category.toLowerCase()} (${issueSnippet}) at ${institution}; currently ${status.toLowerCase()} and awaiting ${nextAction.toLowerCase()}. [AI-Assisted]`;
}

/**
 * Smart overlap detection algorithm:
 * Weights:
 * - Same Institution Name / Code: +40 points
 * - Same Category: +25 points
 * - Keyword/Text Similarity (title + description): up to +25 points
 * - Proximity of Incident Dates (within 60 days): +10 points
 */
export function detectRelatedComplaints(targetComplaint, allComplaints) {
  const matches = [];

  for (const item of allComplaints) {
    // Do not compare against self
    if (item._id === targetComplaint._id || item.complaintId === targetComplaint.complaintId) {
      continue;
    }

    let score = 0;
    const reasons = [];

    // 1. Institution Match
    const targetInst = (targetComplaint.institutionName || '').toLowerCase().trim();
    const itemInst = (item.institutionName || '').toLowerCase().trim();
    if (targetInst && itemInst && (targetInst === itemInst || targetInst.includes(itemInst) || itemInst.includes(targetInst))) {
      score += 40;
      reasons.push(`Identical institution (${item.institutionName})`);
    }

    // 2. Category Match
    if (targetComplaint.category && item.category && targetComplaint.category === item.category) {
      score += 25;
      reasons.push(`Matching category (${item.category})`);
    }

    // 3. Text & Keyword Similarity
    const targetFullText = `${targetComplaint.title} ${targetComplaint.description}`;
    const itemFullText = `${item.title} ${item.description}`;
    const overlapRatio = calculateWordOverlap(targetFullText, itemFullText);
    
    if (overlapRatio > 0.15) {
      const textPoints = Math.min(25, Math.round(overlapRatio * 60));
      score += textPoints;
      reasons.push(`High textual and keyword overlap (${Math.round(overlapRatio * 100)}% match)`);
    }

    // 4. Incident Date Proximity
    if (targetComplaint.incidentDate && item.incidentDate) {
      const d1 = new Date(targetComplaint.incidentDate).getTime();
      const d2 = new Date(item.incidentDate).getTime();
      const diffDays = Math.abs(d1 - d2) / (1000 * 60 * 60 * 24);
      if (diffDays <= 60) {
        score += 10;
        reasons.push(`Reported incidents occurred within ${Math.round(diffDays)} days`);
      }
    }

    // Threshold for suggesting a possible match is >= 50%
    if (score >= 50) {
      matches.push({
        relatedComplaintId: item.complaintId,
        relatedMongoId: item._id,
        title: item.title,
        category: item.category,
        institutionName: item.institutionName,
        status: item.status,
        submittedAt: item.createdAt,
        similarityScore: Math.min(98, score), // cap at 98% because human verification is mandatory
        reason: reasons.join(' • '),
        summary: item.oneLineSummary || generateOneLineSummary(item),
        state: 'SUGGESTED' // SUGGESTED | CONFIRMED | REJECTED
      });
    }
  }

  // Sort descending by score
  return matches.sort((a, b) => b.similarityScore - a.similarityScore);
}


import { 
  collection, 
  getDocs, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  doc, 
  updateDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "./firebase.js";

/**
 * The exact verified Firestore collection used by CivicLens AI to store reports.
 * Project: digitaltwin-13cdb
 * Collection: public
 */
export const CIVICLENS_COLLECTION = "public";

/**
 * Normalizes a Firestore document snapshot into a standardized report object.
 */
export function normalizeReport(docSnap) {
  const data = docSnap.data ? docSnap.data() : docSnap;
  const id = docSnap.id || data.id || "unknown";

  // Parse timestamp
  let parsedDate = null;
  if (data.timestampMs) {
    parsedDate = new Date(data.timestampMs);
  } else if (data.createdAt?.seconds) {
    parsedDate = new Date(data.createdAt.seconds * 1000);
  } else if (data.timestamp) {
    const tryDate = new Date(data.timestamp);
    if (!isNaN(tryDate.getTime())) parsedDate = tryDate;
  }
  const formattedTime = parsedDate && !isNaN(parsedDate.getTime())
    ? parsedDate.toLocaleString("en-IN", { 
        month: "short", 
        day: "numeric", 
        year: "numeric", 
        hour: "numeric", 
        minute: "2-digit", 
        hour12: true 
      })
    : (data.timestamp || "Recent");

  // Determine image / meta info
  const meta = data.fullReport?.meta || {};
  const imageInfo = {
    hasImage: !!(data.imageUrl || data.image || meta.imageSize),
    url: data.imageUrl || data.image || null,
    size: meta.imageSize ? `${(meta.imageSize / 1024).toFixed(1)} KB` : null,
    mimeType: meta.mimeType || null,
    model: meta.model || data.source || "Gemma 4 AI",
  };

  return {
    id,
    action: data.action || "REPORTED_CIVIC_ISSUE",
    title: data.issueTitle || data.fullReport?.suggestedReport?.title || "Civic Infrastructure Issue",
    category: data.category || data.fullReport?.issueCategory || "General Infrastructure",
    severity: data.severity || data.fullReport?.severity?.level || "Medium",
    severityRationale: data.fullReport?.severity?.rationale || "",
    status: data.status || "OPEN",
    location: data.location || data.fullReport?.suggestedReport?.locationContext || "Unspecified Location",
    summary: data.summary || data.fullReport?.summary || "",
    details: data.details || data.userDescription || data.fullReport?.suggestedReport?.description || "",
    urgencyNote: data.urgencyNote || data.fullReport?.suggestedReport?.urgencyNote || "",
    userDescription: data.userDescription || "",
    isCivicIssue: data.isCivicIssue !== undefined ? data.isCivicIssue : true,
    confidenceScore: data.confidenceScore || "Medium",
    visibleEvidence: Array.isArray(data.visibleEvidence) ? data.visibleEvidence : [],
    recommendedActions: Array.isArray(data.recommendedActions) ? data.recommendedActions : [],
    potentialImpact: data.potentialImpact || {},
    uncertainty: data.uncertainty || "",
    source: data.source || "CivicLens AI / Gemma 4",
    reporter: {
      uid: data.reporter?.uid || data.teamId || "anonymous",
      email: data.reporter?.email || data.adminEmail || "public-reporter@civiclens.local",
      displayName: data.reporter?.displayName || (data.adminEmail ? data.adminEmail.split("@")[0] : "Public Citizen"),
      isAnonymous: !!data.reporter?.isAnonymous,
    },
    adminEmail: data.adminEmail || data.reporter?.email || "public-reporter@civiclens.local",
    teamId: data.teamId || data.reporter?.uid || "guest",
    timestamp: formattedTime,
    timestampMs: data.timestampMs || (parsedDate ? parsedDate.getTime() : Date.now()),
    createdAtRaw: data.createdAt || null,
    imageInfo,
    rawDoc: data,
  };
}

/**
 * Real-time listener for CivicLens AI reports in Firestore 'public' collection.
 * Includes automatic failover if the composite index on timestampMs is pending.
 */
export function subscribeToCivicReports({ onData, onError, maxLimit = 100 }) {
  try {
    const colRef = collection(db, CIVICLENS_COLLECTION);
    const q = query(colRef, orderBy("timestampMs", "desc"), limit(maxLimit));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const reports = [];
        snapshot.forEach((docSnap) => {
          reports.push(normalizeReport(docSnap));
        });
        onData(reports);
      },
      (error) => {
        console.warn("[CivicReportsService] OrderBy snapshot warning, falling back to base collection:", error.message);
        // Fallback to simple collection snapshot without orderBy in case of index issues
        const simpleUnsub = onSnapshot(
          colRef,
          (simpleSnapshot) => {
            const reports = [];
            simpleSnapshot.forEach((docSnap) => {
              reports.push(normalizeReport(docSnap));
            });
            // Sort in memory by timestampMs descending
            reports.sort((a, b) => (b.timestampMs || 0) - (a.timestampMs || 0));
            onData(reports.slice(0, maxLimit));
          },
          (err2) => {
            console.error("[CivicReportsService] Firestore subscription error:", err2);
            if (onError) onError(err2);
          }
        );
        return simpleUnsub;
      }
    );

    return unsubscribe;
  } catch (err) {
    console.error("[CivicReportsService] Failed to establish Firestore listener:", err);
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Fetch all CivicLens AI reports once (for manual Refresh button).
 */
export async function fetchCivicReports(maxLimit = 100) {
  try {
    const colRef = collection(db, CIVICLENS_COLLECTION);
    let snapshot;
    try {
      const q = query(colRef, orderBy("timestampMs", "desc"), limit(maxLimit));
      snapshot = await getDocs(q);
    } catch {
      snapshot = await getDocs(colRef);
    }

    const reports = [];
    snapshot.forEach((docSnap) => {
      reports.push(normalizeReport(docSnap));
    });
    // In-memory sort fallback
    reports.sort((a, b) => (b.timestampMs || 0) - (a.timestampMs || 0));
    return reports.slice(0, maxLimit);
  } catch (err) {
    console.error("[CivicReportsService] Failed to fetch documents:", err);
    throw err;
  }
}

/**
 * Update report status (e.g. OPEN, IN_REVIEW, RESOLVED, DISMISSED) in Firestore.
 */
export async function updateReportStatus(reportId, newStatus) {
  if (!reportId) throw new Error("Report ID is required");
  const docRef = doc(db, CIVICLENS_COLLECTION, reportId);
  await updateDoc(docRef, {
    status: newStatus,
    updatedAt: serverTimestamp(),
  });
  return { id: reportId, status: newStatus };
}

/**
 * Compute REAL statistics strictly from the fetched Firestore documents.
 * Never fabricates or uses mock numbers.
 */
export function computeReportStats(reports = []) {
  const total = reports.length;

  const severityCounts = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };

  const statusCounts = {
    open: 0,
    inReview: 0,
    resolved: 0,
    dismissed: 0,
  };

  const categoryMap = {};
  const locationMap = {};
  const uniqueReporters = new Set();

  reports.forEach((r) => {
    // Severity
    const s = (r.severity || "").toLowerCase();
    if (s.includes("crit")) severityCounts.critical++;
    else if (s.includes("high")) severityCounts.high++;
    else if (s.includes("med") || s.includes("mod")) severityCounts.medium++;
    else severityCounts.low++;

    // Status
    const st = (r.status || "OPEN").toUpperCase();
    if (st === "OPEN") statusCounts.open++;
    else if (st === "IN_REVIEW" || st === "REVIEW") statusCounts.inReview++;
    else if (st === "RESOLVED") statusCounts.resolved++;
    else if (st === "DISMISSED") statusCounts.dismissed++;

    // Category
    const cat = r.category || "Uncategorized";
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;

    // Location
    const loc = r.location || "Unspecified";
    locationMap[loc] = (locationMap[loc] || 0) + 1;

    // Reporter
    if (r.reporter?.email) uniqueReporters.add(r.reporter.email);
    else if (r.reporter?.uid) uniqueReporters.add(r.reporter.uid);
  });

  const categories = Object.entries(categoryMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const locations = Object.entries(locationMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return {
    total,
    severityCounts,
    statusCounts,
    categories,
    locations,
    uniqueReporterCount: uniqueReporters.size,
    isRealData: true,
  };
}

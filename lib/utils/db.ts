import client from "@/lib/appwrite.config";
import { Account, Databases, Query } from "react-native-appwrite";

const databases = new Databases(client);

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID ?? "";
const USERS_COLLECTION_ID =
  process.env.EXPO_PUBLIC_APPWRITE_USERS_COLLECTION_ID ?? "users";


// Get all bookmarks for a user
export async function getBookmarks(account: Account) {
  const userID = (await account.get()).$id;
  try {
    const list = await databases.listDocuments(DATABASE_ID, "bookmarks", [
      Query.equal("userId", userID),
    ]);
    return { success: true, bookmarks: list.documents };
  } catch (err) {
    console.error("Failed to fetch bookmarks:", err);
    return { success: false, error: err };
  }
}

export async function isBookmarked(account: Account, station_code: string) {
  const userID = (await account.get()).$id;

  const safeUserID = String(userID).replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 16);
  const safeStationCode = String(station_code).replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 16);
  const docId = `${safeUserID}_${safeStationCode}`;

  console.log(docId);

  try {
    const doc = await databases.getDocument(
      DATABASE_ID,
      "bookmarks",
      docId
    );
    return true;
  } catch (err) {
    // console.error("Failed to fetch bookmark:", err);
    return false;
  }
}

export async function addBookmark(account: Account, stationcode: string) {
  const userID = (await account.get()).$id;
  try {
    // Fetch station data from API
    console.log(stationcode)
    const response = await fetch(
      "https://indiawris.gov.in/stationMaster/getMasterStationsList",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stationcode: stationcode,
          datasetcode: "GWATERLVL",
        }),
      }
    );
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const stationjson = await response.json();
    const station = stationjson.data[0];
    const payload = {
      station_name: station.station_Name || station.station_name || "",
      station_code: station.station_Code || station.station_code || stationcode,
      latitude: station.latitude != null ? station.latitude.toFixed(4) : null,
      longitude:
        station.longitude != null ? station.longitude.toFixed(4) : null,
      state: station.state || "",
      district: station.district || "",
      agency_name: station.agency_Name || station.agency_name || "",
      station_type: station.station_Type || station.station_type || "",
      station_status: station.station_Status || station.station_status || "",
      data_available_from: station.data_available_from || "",
      data_available_till: station.data_available_Till || "",
      well_depth: station.well_depth ?? null,
      well_aquifer_type: station.well_aquifer_type || "",
      mslmeter: station.mslmeter ?? null,
      uint: station.unit || "",
      userId: userID,
    };

  // Sanitize and truncate userID and stationcode for docId
  const safeUserID = String(userID).replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 16);
  const safeStationCode = String(stationcode).replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 16);
  const docId = `${safeUserID}_${safeStationCode}`;
    // Check if bookmark already exists
    try {
      const existing = await databases.getDocument(
        DATABASE_ID,
        "bookmarks",
        docId
      );
      // If found, return already exists
      return { status: "already_exists", doc: existing };
    } catch (e) {
      // Not found, proceed to create
    }
    const created = await databases.createDocument(
      DATABASE_ID,
      "bookmarks",
      docId,
      payload
    );
    return { status: "created", doc: created };
  } catch (err) {
    console.error("Failed to call API:", err);
    return { status: "error", error: err };
  }
}

// Delete a bookmark document by userId and stationcode
export async function deleteBookmark(account: Account, stationcode: string) {
  const userID = (await account.get()).$id;
  const safeUserID = String(userID).replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 16);
  const safeStationCode = String(stationcode).replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 16);
  const docId = `${safeUserID}_${safeStationCode}`;
  try {
    await databases.deleteDocument(DATABASE_ID, "bookmarks", docId);
    return { deleted: true };
  } catch (err) {
    console.error("Failed to delete bookmark:", err);
    return { deleted: false, error: err };
  }
}

export async function ensureUserInDB(
  userId: string,
  data: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    verified?: boolean;
  }
) {
  if (!DATABASE_ID) {
    throw new Error(
      "Missing EXPO_PUBLIC_APPWRITE_DATABASE_ID environment variable."
    );
  }

  try {
    const list = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.equal("UserId", userId)]
    );

    if (list.total && list.total > 0) {
      return { created: false, doc: list.documents[0] };
    }

    const payload = {
      first_name: data.first_name ?? "",
      last_name: data.last_name ?? "",
      email: data.email ?? "",
      UserId: userId,
      verified: data.verified ?? false,
      phone: data.phone ?? "",
    };
    const created = await databases.createDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      userId,
      payload
    );
    return { created: true, doc: created };
  } catch (e) {
    throw e;
  }
}

export default databases;

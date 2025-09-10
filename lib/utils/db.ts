import client from "@/lib/appwrite.config";
import { Databases, Query } from "react-native-appwrite";

const databases = new Databases(client);

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID ?? "";
const USERS_COLLECTION_ID =
  process.env.EXPO_PUBLIC_APPWRITE_USERS_COLLECTION_ID ?? "users";

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

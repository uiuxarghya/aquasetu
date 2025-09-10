import { Client } from "react-native-appwrite";

const client = new Client();

client
  .setEndpoint(
    process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT ?? "http://localhost/v1"
  )
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!)
  .setPlatform(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_NAME!);

export default client;

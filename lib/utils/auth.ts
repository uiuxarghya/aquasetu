import { Account } from 'react-native-appwrite'
import Constants from 'expo-constants'

export async function getLoginStatus(account: Account) {
    try {
        await account.get();
        return true;
    }
    catch {
        return false;
    }
}

export async function logout(account: Account){
     try {
        await account.deleteSession({
          sessionId: 'current'
        });
        return true;

    }
     catch {
        return false;
    }
}

/**
 * Get the app's URL scheme dynamically from app configuration
 * Falls back to 'aquasetu' if not found
 */
export function getAppScheme(): string {
    return Constants.expoConfig?.scheme as string || 'aquasetu';
}




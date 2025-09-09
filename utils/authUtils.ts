import {Account , ID} from 'react-native-appwrite'

export async function getLoginStatus(account : Account){
    try{
        const ret = await account.get();
        return true;
    }
    catch(e){
        return false;  
    }
}

export async function logout(account: Account){
     try {
        await account.deleteSession('current');
        console.log('Successfully logged out.'); 
        return true;
       
    } 
     catch (error) {
        console.error('Logout failed:', error);
        return false;
    }
}




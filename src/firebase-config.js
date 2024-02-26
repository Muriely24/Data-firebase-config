import { initializeApp } from "firebase/app"; 
import {getFirestore} from '@firebase/firestore' 

 

const firebaseConfig = { 
    apiKey: "AIzaSyD4-0TGuz4qrp56_gKD7XkOoyckXNCn2OA", 
    authDomain: "customers-test-f10df.firebaseapp.com", 
    projectId: "customers-test-f10df", 
    storageBucket: "customers-test-f10df.appspot.com", 
    messagingSenderId: "857205683642", 
    appId: "1:857205683642:web:b831663382c8cba3ead983", 
    measurementId: "G-YYFQMS578D" 

  }; 

 
  const app = initializeApp(firebaseConfig); 
  export const db = getFirestore(app) 

 

 

 

 

 

 

 

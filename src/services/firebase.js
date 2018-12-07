import Firebase from 'firebase'
import 'firebase/firestore'

let config = {
	apiKey: "AIzaSyBk8z_7YM8zN458Tp_oHKEhuAWJvtFVTKw",
    authDomain: "psu-complaint.firebaseapp.com",
    databaseURL: "https://psu-complaint.firebaseio.com",
    projectId: "psu-complaint",
    storageBucket: "psu-complaint.appspot.com",
    messagingSenderId: "663383467818"
}

let firebaseApp = Firebase.initializeApp(config)
const firestore = firebaseApp.firestore()

firestore.settings({
	timestampsInSnapshots: true
})

export default firestore
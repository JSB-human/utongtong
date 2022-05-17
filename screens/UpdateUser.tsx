
import { Button } from "@rneui/base";
import { getAuth, updateProfile } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { LogBox, Platform, StyleSheet, TextInput, ActivityIndicator, Image} from "react-native";
import { View } from "../components/Themed";
import * as ImagePicker from "expo-image-picker";
import * as Clipboard from "expo-clipboard";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getDatabase, onValue, push, set } from "firebase/database";
import * as Database from 'firebase/database';
import uuid from "react-native-uuid";
import { RootStackScreenProps } from "../types";
import { registerForPushNotificationsAsync } from "../components/Notification";

LogBox.ignoreLogs([`Setting a timer for a long period`]);

export default function UpdateUser({ navigation }: RootStackScreenProps<'UpdateUser'>) {
    const [name, setName] = useState('');
    const [image, setImage] = useState('https://firebasestorage.googleapis.com/v0/b/distributionking-32d8b.appspot.com/o/user.png?alt=media&token=21fcbb2f-6560-4e94-ad57-441eb47b5dad');
    const [teamName, setTeamName] = useState('');
    const [uploading, setUploading] =useState(false);
    const [expoPushToken, setExpoPushToken] = useState<string>('');
    const [IsLeader, setIsLeader] = useState(false); 
    
    const auth = getAuth();
    const user = auth.currentUser;

    useEffect(() => {
      registerForPushNotificationsAsync().then(token => setExpoPushToken(token));
      setName(user.displayName);
      setImage(user.photoURL);

      const db = getDatabase();
        const list = Database.ref(db, 'member/'+user?.uid);
        onValue(list, (snapshot) => {
            if(snapshot.exists()){
              const data = snapshot.val();
              if(snapshot.child('teamname').exists()){
                setTeamName(data.teamname);
              }
              if(snapshot.child('leader').exists()){
                // console.log('leader >> ',data.leader);
                if(data.leader === true){
                  setIsLeader(true);
                }else{
                  setIsLeader(false);
                }
                
              }
            }
        })
      
      const ready = async () => {
          if(Platform.OS !== "web"){
              const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if(status !== "granted"){
                  alert("갤러리 권한을 허락해주세요.");
              } 
          }
      }
      return () => {
          ready();
      }
    },[])

    const updateBtn = () => {
      if(name !== ''){
        updateProfile(user,{
          displayName : name,
          photoURL : image,
        })
        .then(() => {
          const db = getDatabase();
                    try {
                        set(Database.ref(db, 'member/'+user.uid), {
                            image : image,
                            name : name,
                            teamname : teamName,
                            expoPushToken : expoPushToken,
                            leader : IsLeader
                        }).then(()=>{
                          if(IsLeader === false){
                              if(teamName !== ''){
                                set(Database.ref(db, 'party/'+teamName+'/mem/'+user.uid), {
                                  image : image,
                                  member : name,
                                  expoPushToken : expoPushToken
                              }).then(()=>{
                                  navigation.navigate('Root');
                              })
                            }
                          }else{
                            if(teamName !== ''){
                              set(Database.ref(db, 'party/'+teamName+'/leader'), {
                                maker : name,
                                makerToken : expoPushToken,
                                makerimage : image,
                                makername : name
                            })
                          }
                          }      
                        })
                    } catch (error) {
                        console.log(error);
                    }
        })
        .then(() => {
          navigation.navigate('Home');
        })
      }
    }

    
    async function uploadImageAsync(uri: string) {
      // Why are we using XMLHttpRequest? See:
      // https://github.com/expo/expo/issues/2402#issuecomment-443726662
      const blob : any = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
          resolve(xhr.response);
        };
        xhr.onerror = function (e) {
          console.log(e);
          reject(new TypeError("Network request failed"));
        };
        xhr.responseType = "blob";
        xhr.open("GET", uri, true);
        xhr.send(null);
      });
      //@ts-ignore
      const fileRef = ref(getStorage(), uuid.v4());
      const result = await uploadBytes(fileRef, blob);
    
      // We're done with the blob, close and release it
      blob.close();
    
      return await getDownloadURL(fileRef);
    }

    const takePhoto = async () => {
      let pickerResult = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 4],
      });
  
      handleImagePicked(pickerResult);
    };

    const pickImage = async () => {
      let pickerResult = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 4],
      });
      handleImagePicked(pickerResult);
    };

    const handleImagePicked = async (pickerResult: any) => {
      try {
        setUploading(true);
        // console.log("picker>>",pickerResult)
        if (!pickerResult.cancelled) {
          const uploadUrl = await uploadImageAsync(pickerResult.uri);
          setImage(uploadUrl);
        }
      } catch (e) {
        console.log(e);
        alert("업로드 중 오류!");
      } finally {
        setUploading(false);
      }
    };

    return (
        <View style={styles.container}>
            <Image source={{ uri: image }} style={{ width: 250, height: 250 }} />
           
            <View style={styles.btnView}>
              <Button 
                title = "갤러리"
                onPress = {() => {pickImage()}}
                buttonStyle={{
                  width : 170,
                  marginRight : 5,
                  backgroundColor : '#4CAF50'
                }}
              />
              <Button 
                title = "카메라"
                onPress = {() => {takePhoto()}}
                buttonStyle={{
                  width : 170,
                  backgroundColor : '#8BC34A'
                }}
              />
            </View>
            <TextInput 
                placeholder={"사용자명"}
                value={name}
                onChangeText={setName}
                style={styles.name}
            />
            <Button 
                title = "저장"
                onPress={() => updateBtn()}
                buttonStyle={{
                  backgroundColor : '#3F51B5',
                  width : 350,
                  marginTop : 20,
                }}
                
            />
        </View>
    )

    
}






const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
      },
    control : {
        marginTop: 10
    },
    name : {
        width : 350,
        height : 40,
        borderColor : 'black',
        borderWidth : 1,
        margin : 30,
        textAlign : 'center'
    },
    btnView : {
      flexDirection : 'row',
      justifyContent : 'space-around',
      alignContent : 'space-around',
      marginTop : 30
    }
})
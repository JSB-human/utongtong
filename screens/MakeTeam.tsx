import { Button } from "@rneui/base";
import { useState } from "react";
import { Alert, StyleSheet, TextInput } from "react-native";
import { Text, View } from "../components/Themed";
import { getDatabase, onValue, ref, set } from 'firebase/database';
import { FirebaseApp } from "../firebaseConfig";
import { getAuth } from "@firebase/auth";
import { useEffect } from "react";
import { RootStackScreenProps } from "../types";
import { registerForPushNotificationsAsync } from "../components/Notification";

FirebaseApp;


export default function MakeTeam({ navigation }: RootStackScreenProps<'MakeTeam'>){
    const [teamname, setTeamname] = useState<string>('');
    const [teamPwd, setTeamPwd] = useState<string>('');
    const [userName, setUserName] = useState<string | null>();
    const [uid, setUid] = useState<string | null>();
    const [photo, setPhoto] = useState<string | null>();
    const [isExist, setIsExist] = useState<boolean>(false);
    const [expoPushToken, setExpoPushToken] = useState<string>('');

    useEffect(() => {
        registerForPushNotificationsAsync().then(token => setExpoPushToken(token));
        // console.log(expoPushToken);
        const auth = getAuth();
        const user = auth.currentUser;
        const displayName= user?.displayName;
        const uidnum = user?.uid;
        const photourl = user?.photoURL;

        if(user !== null){
            setUserName(displayName);
            setUid(uidnum);
            setPhoto(photourl);
        }else{
            navigation.navigate('Login');
        }
    }, [userName])

    const ButtonClick = () => {
        if(teamname !== ''){
            const db = getDatabase();
            const list = ref(db, 'party/'+teamname);
            onValue(list, (snapshot) => {
                try {
                    if(!snapshot.exists()){
                        set(ref(db, 'party/'+teamname), {
                            teamname : teamname,
                            teamPwd : teamPwd,
                        })
                        .then(()=>{
                            set(ref(db, 'party/'+teamname+'/leader'),{
                                maker : uid,
                                makername : userName,
                                makerimage : photo,
                                makerToken : expoPushToken
                            })
                        })
                        .then(()=>{
                            set(ref(db, 'member/'+uid),{
                                teamname : teamname,
                                name : userName,
                                image : photo,
                                expoPushToken : expoPushToken,
                                leader : true
                            }).then(()=>{
                                navigation.navigate('Root');
                            })
                        })
                    }else{
                        setIsExist(true);
                    }

                } catch (error) {
                    console.error(error);
                }
            },{onlyOnce : true})
        }else{
            Alert.alert(
                "알림",
                "팀명을 입력해주세요."
            )
        }
    }

    return(
        <View style={styles.container}>
            <Text style={styles.text}>이름</Text>
            <TextInput 
                style={styles.teamname}
                value={teamname}
                onChangeText={(text)=>{setTeamname(text)}}
            />
            <Text style={styles.subtext}>회사명이나 팀명을 적어주세요.</Text>
            {
                isExist ? 
                <Text style={styles.error}>이미 존재하는 팀명입니다.</Text>
                :
                <View></View>
            }
            <Text style={styles.text}>방 비밀번호</Text>
            <TextInput
                style={styles.teampwd}
                value={teamPwd}
                onChangeText={(text)=>{setTeamPwd(text)}}
            />

            <Button 
                title="생성"
                buttonStyle={{
                    width : 400
                }}
                onPress={ButtonClick}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container : {
        flex : 1,
        backgroundColor : 'white',
        alignItems : 'center',
        justifyContent : 'center'
    },
    text : {
        fontSize : 30
    },
    subtext : {
        fontSize : 15,
        marginBottom : 20,
        color : 'coral'
    },
    teamname : {
        width : 400,
        borderWidth : 2,
        borderColor : 'black',
        height : 40,
        borderRadius : 5,
        alignItems: 'center',
        
        fontSize : 20
    },
    error : {
        fontSize : 15,
        color : 'red',
        marginBottom : 20
    },
    teampwd : {
        marginBottom : 20,
        width : 400,
        borderWidth : 2,
        borderColor : 'black',
        height : 40,
        borderRadius : 5,
        alignItems: 'center',
        
        fontSize : 20
    }
})
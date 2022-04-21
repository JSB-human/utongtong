import { Button } from "@rneui/base";
import { useState } from "react";
import { StyleSheet, TextInput } from "react-native";
import { Text, View } from "../components/Themed";
import { getDatabase, ref, set } from 'firebase/database';
import { FirebaseApp } from "../firebaseConfig";
import { getAuth } from "@firebase/auth";
import { useEffect } from "react";
import { RootStackScreenProps } from "../types";

FirebaseApp;


export default function MakeTeam({ navigation }: RootStackScreenProps<'MakeTeam'>){
    const [teamname, setTeamname] = useState<string>('');
    const [userName, setUserName] = useState<string | null>();
    const [uid, setUid] = useState<string | null>();
    const [photo, setPhoto] = useState<string | null>();

    useEffect(() => {
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
        const db = getDatabase();
        set(ref(db, 'party/'+teamname), {
            teamname : teamname,
            maker : uid,
            makername : userName
        }).then(()=>{
            set(ref(db, 'member/'+uid),{
                teamname : teamname,
                name : userName,
                image : photo
            })
        }).then(()=>{
            set(ref(db, 'party/'+teamname+'/mem/'+uid),{
                member : userName,
                image : photo
            })
            .then(() => {
                navigation.navigate('Root');
            })
        })
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
})
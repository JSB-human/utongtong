import { Input } from "@rneui/base";
import { Button, ListItem } from "@rneui/themed";
import { useState } from "react";
import { FlatList, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Text, View } from "../components/Themed";
import { FirebaseApp } from "../firebaseConfig";
import { getDatabase, ref, onValue} from "firebase/database";
import { useEffect } from "react";
import { getAuth } from "firebase/auth";
import { RootStackScreenProps } from "../types";

FirebaseApp;
const auth = getAuth();
const user = auth.currentUser;


export default function JoinTeam({ navigation }: RootStackScreenProps<'JoinTeam'>){
    const [searchTxt, setSearchTxt] = useState<string>('');
    const [listdata, setListdata] = useState<Array<any>>();
    const [nowteam, setNowteam] = useState<string>();

    useEffect(() => {
        const db = getDatabase();
        const list = ref(db, 'party');
        onValue(list, (snapshot) => {
            const data = snapshot.val();
            try {
                // console.log(Object.values(data));
                // console.log('effect');
                setListdata(Object.values(data));

                const list2 = ref(db, 'member/' + user?.uid);
                onValue(list2, (snapshot) => {
                    const data = snapshot.val();
                    try{
                        // console.log('data',data.teamname);
                        setNowteam(data.teamname)
                    }catch{
                        console.log('err');
                    }
        })
            }catch{
                console.log('err');
            } 
        })
        
        
    },[])

    const Joinparty = () => {

        navigation.navigate('Root')
    }
   

    return(
        <View style={styles.container}>
            <Text style={styles.text}>참가할 팀</Text>
            <Input 
                style={styles.search}
                value={searchTxt}
                onChangeText={(text)=>{setSearchTxt(text)}}
                shake={()=>{console.log('shake')}}
                rightIcon={{type:'font-awesome', name:'search' }}
            />
            <View style={styles.nowteamView}>
                <Text>현재 참가한 팀</Text>
                <TouchableOpacity style={styles.touch}
                    onPress={Joinparty}
                >
                    <Text style={styles.touchfont}>{nowteam}</Text>
                    <Button 
                        title="입장"
                        buttonStyle={{
                            backgroundColor : "black",
                            height : 40
                        }}
                        onPress={Joinparty}
                    />
                </TouchableOpacity>
            </View>
            <ScrollView>
                {listdata?.map((value, i) => {
                    return(
                        <TouchableOpacity key={i} style={styles.touch}
                            onPress={Joinparty}
                        >
                            <Text style={styles.touchfont}>{value.teamname}</Text>
                            <Button 
                                title="입장"
                                buttonStyle={{
                                    backgroundColor : "black",
                                    height : 40
                                }}
                                onPress={Joinparty}
                            />
                        </TouchableOpacity>
                    )
                })}
            </ScrollView>
           
        </View>
    )
}

const styles = StyleSheet.create({
    container : {
        flex : 1,
        backgroundColor : 'white',
        alignItems : 'center',
    },
    text : {
        fontSize : 30
    },
    search : {
        
    },
    touch : {
        borderWidth : 1,
        width : 400,
        height : 80,
        borderRadius : 10,
        flexDirection : "row",
        justifyContent : "space-between",
        marginBottom : 15,
        padding :"5%",
        backgroundColor : "white"
    },
    touchfont : {
        fontSize : 30,
        height : 80,
    },
    nowteamView : {
        borderBottomWidth : 1,
        borderBottomColor : '#BEBEBE',
        marginBottom : 10,
    }
})
import { Input } from "@rneui/base";
import { Button, Image, ListItem, SearchBar } from "@rneui/themed";
import { useState } from "react";
import { ActivityIndicator, Alert, Dimensions, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Text, View } from "../components/Themed";
import { FirebaseApp } from "../firebaseConfig";
import { getDatabase, ref, onValue, set} from "firebase/database";
import { useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { RootStackScreenProps } from "../types";
import { Ionicons } from "@expo/vector-icons";

const chartHeight = Dimensions.get('window').height;
const chartWidth = Dimensions.get('window').width;


FirebaseApp;

export default function JoinTeam({ navigation }: RootStackScreenProps<'JoinTeam'>){
    const [searchTxt, setSearchTxt] = useState<string>('');
    const [listdata, setListdata] = useState<Array<any>>();
    const [nowteam, setNowteam] = useState<string>('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [uid, setUid] = useState<string | null | undefined>('');
    const [userImage, setUserImage] = useState<string | null | undefined>('');
    const [userName, setUserName] = useState<string | null | undefined>('');
    const [memberCount, setMemberCount] = useState<Array<number>>([]);

    const auth = getAuth();
    // const user = auth.currentUser;

    useEffect(() => {
        const db = getDatabase();
        const listener = onAuthStateChanged(auth, async (user) => {
            setIsAuthenticated(!!user);
            setUid(user?.uid);
            setUserImage(user?.photoURL);
            setUserName(user?.displayName);
            
            const list = ref(db, 'party');
            onValue(list, (snapshot) => {
                const data = snapshot.val();
                let count = new Array();
                snapshot.forEach((child) => {
                    let val : number = 0;
                    try {
                        val = child.child('mem').size;
                    } catch (error) {
                        val = 0;
                    }
                    // console.log(val);
                    count.push(val);
                    setMemberCount(count);
                });

                if(snapshot.exists()){
                    try {
                        setListdata(Object.values(data));
                        
                        const list2 = ref(db, 'member/' + uid);
                        onValue(list2, (snapshot) => {
                            // console.log('data >> ',data);
                            if(snapshot.exists()){
                                try{   
                                    const data = snapshot.val();
                                    setNowteam(data.teamname)
                                }catch{
                                    console.log('err1');
                                }
                            }else{
                                setNowteam('');
                            }
                            // console.log('nowteam >> ',nowteam);
                        })
                    }catch{
                        console.log('err2');
                    } 
                }else{
                    console.log('데이터 없음');
                    setNowteam('');
                }
            })
        });
        return ()=>{
            listener();
        }
        
    },[uid, isAuthenticated, nowteam])

    const Joinparty = () => {
        navigation.navigate('Root')
    }

    const AddPartyInfo = (teamname: any ) => {
        Alert.alert('알림',teamname+'에 참가하시겠습니까?',[
            {
                text : '예',
                onPress : () => {
                    const db = getDatabase();
                    try {
                        set(ref(db, 'member/'+uid), {
                            image : userImage,
                            name : userName,
                            teamname : teamname
                        }).then(()=>{
                            set(ref(db, 'party/'+teamname+'/mem/'+uid), {
                                image : userImage,
                                member : userName,
                            }).then(()=>{
                                navigation.navigate('Root');
                            })
                        })
                    } catch (error) {
                        console.log(error);
                    }
                }
            },
            {
                text : '아니오',
                onPress : () => null
            }
        ])
        
    }

   const searchBtn = () => {
    const db = getDatabase();
    const list = ref(db, 'party/' + searchTxt);
            onValue(list, (snapshot) => {
                if(snapshot.exists()){
                    const data = snapshot.val();
                    try {
                        // setListdata(Object.values(data));
                        console.log('exist1');
                    }catch{
                        console.log('err2');
                    } 
                }else{
                    Alert.prompt('알림', '검색 결과가 없습니다.')
                }
            })
   }

    return(
        <View style={styles.container}>
            {/* <Text style={styles.text}>참가할 팀</Text> */}
            {/* <View style={styles.searchView}>
                <Input 
                    style={styles.search}
                    value={searchTxt}
                    onChangeText={(text)=>{setSearchTxt(text)}}
                    shake={()=>{console.log('shake')}}
                    rightIcon={{type:'font-awesome', name:'search' }}
                    containerStyle={{width : chartWidth - 80}}
                    placeholder={"참가한 팀이 존재하면 검색 불가"}
                />
            <Button  title={"검색"}
                containerStyle={styles.searchBtn}
                buttonStyle={{backgroundColor : '#009688'}}
                onPress={searchBtn}
            />
            </View> */}
            
            {/* <SearchBar
                theme={null}
                value={searchTxt}
                onChangeText={(text)=>{setSearchTxt(text)}}
            /> */}
            {
                nowteam !== '' ?
                <View style={styles.nowteamView}>
                    <Text style={{color:'gray'}}>현재 참가한 팀</Text>
                    <TouchableOpacity style={styles.touch}
                        onPress={Joinparty}
                    >
                        <Text style={styles.touchfont}>{nowteam}</Text>
                        {/* <Button 
                            title="입장"
                            buttonStyle={{
                                backgroundColor : "#BEBEBE",
                                height : 40
                            }}
                            onPress={Joinparty}
                        /> */}
                    </TouchableOpacity>
                </View>
                : 
                <ScrollView>
                <Text style={{color:'gray'}}>팀 리스트</Text>
                {listdata?.map((value, i) => {
                    // console.log('cnt > ',memberCount[i]);
                    let memberCnt : number = 1 + memberCount[i];
                    return(
                        <TouchableOpacity key={i} style={styles.touch}
                            onPress={() => AddPartyInfo(value.teamname)}
                        >
                            <Text style={styles.touchfont}>{value.teamname}</Text>
                            <View>
                                <View style={styles.partyInfo}>
                                    <Image source={{uri : value.makerimage}} 
                                        PlaceholderContent={<ActivityIndicator/>}
                                        containerStyle={styles.userImg}
                                    />
                                    <Text style={styles.imgTxt}>{value.makername}</Text>
                                </View>
                                <View style={styles.partyInfo2}>
                                    <Ionicons size={16} name="person"></Ionicons>
                                    <Text style={styles.personIcon}>{memberCnt}명</Text>
                                </View>
                            </View>
                            
                            
                            {/* <Button 
                                title="입장"
                                buttonStyle={{
                                    backgroundColor : "black",
                                    height : 40
                                }}
                                onPress={() => AddPartyInfo(value.teamname)}
                            /> */}
                        </TouchableOpacity>
                    )
                })}
                </ScrollView>
            }
            
           
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
        width : 100
    },
    searchView :{
        width : chartWidth,
        flexDirection : 'row',
        justifyContent : 'space-evenly',
        padding : '2%'
    },
    searchBtn : {
        width : 70
    },
    touch : {
        borderTopWidth : 1,
        borderBottomWidth : 1,
        borderColor : '#BEBEBE',
        width : 400,
        height : 80,
        // borderRadius : 10,
        flexDirection : "row",
        justifyContent : "space-between",
        marginBottom : 15,
        padding :"5%",
        backgroundColor : "white"
    },
    touchfont : {
        fontSize : 20,
        height : 80,
    },
    nowteamView : {
        // borderBottomWidth : 1,
        // borderBottomColor : '#BEBEBE',
        marginBottom : 10,
    },
    userImg :{
        width : 18,
        height : 18,
        borderRadius : 20
    },
    partyInfo : {
        flexDirection : 'row',
        justifyContent : 'flex-end',
        alignItems : 'center'
    },
    partyInfo2 : {
        flexDirection : 'row',
        justifyContent :'flex-end',
        alignItems : 'center'
    },
    imgTxt : {
        paddingLeft : 3,
        fontWeight : 'bold',
        fontSize : 14
    },
    personIcon : {
        marginLeft : 2,
    }
})
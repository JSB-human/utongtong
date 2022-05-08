import { Button } from "@rneui/base";
import { Input } from "@rneui/themed";
import { getAuth } from "firebase/auth";
import { getDatabase, onValue, push, ref, set } from "firebase/database";
import moment from "moment";
import { useEffect } from "react";
import { useState } from "react";
import { StyleSheet } from "react-native";
import { Text, View } from "../components/Themed";
import { FirebaseApp } from "../firebaseConfig";
import { RootStackScreenProps } from "../types";

FirebaseApp;

export default function AddProduct({ navigation }: RootStackScreenProps<'AddProduct'>){
    const [teamName, setTeamname] = useState('');
    const [writer, setWriter] = useState('');
    const [writerUid, setWriterUid] = useState('');
    const [place, setPlace] = useState('');
    const [product, setProduct] = useState('');
    const [userImg, setUserImg] = useState('');
    const [qty, setQty] = useState('');
    const [remarks, setRemarks] = useState('');
    const [alert, setAlert] = useState('');
    const [todayTxt, setTodayTxt] = useState<string>(moment(new Date()).format('YYYYMMDD'));

    const [nowTime, setNowTime] = useState<string>(moment(new Date()).format('hh시 mm분 ss초'));

    const [tokenList, setTokenList] = useState<Array<string>>();

    useEffect(() => {
        const auth = getAuth();
        const user = auth.currentUser;
        setWriterUid(user.uid);
        const today = moment(new Date()).format('YYYYMMDD');
        setTodayTxt(today);
        const now = moment(new Date()).format('hh시 mm분 ss초');
        setNowTime(now);

        const db = getDatabase();
        const list = ref(db, 'member/'+user?.uid);
        onValue(list, (snapshot) => {
            const data = snapshot.val();
            setTeamname(data.teamname);
            setWriter(data.name);
            setUserImg(data.image);
        })
        if(teamName !== ''){
            const TokenList = ref(db, 'party/'+teamName+'/mem')
            onValue(TokenList, (snapshot) => {
                const data2 = snapshot.val();
                let arr = new Array();
                snapshot.forEach((child) => {
                    // console.log('child', child.val().expoPushToken);
                    arr.push(child.val().expoPushToken);
                    setTokenList(arr);
                })
            })
        }

    // },[])
    },[teamName,writer])

    const AddBtn = () => {
        if(place === '' || writer === '' || userImg==='' || product==='' || qty===''){
            setAlert('빈칸을 채워주세요');
            return;
        }else{
            setAlert('');
        }
        const db = getDatabase();
        const postListRef = ref(db, 'work/'+teamName+'/'+todayTxt+'/wait');
        const newPostRef = push(postListRef);
        set(newPostRef, {
            place : place,
            writer : writer,
            writerUid : writerUid,
            writerImg : userImg,
            product : product,
            qty : qty,
            remarks : remarks,
            writeTime : nowTime
        }).then(() => {
            tokenList.forEach((val, i) => {
                // console.log(tokenList[i])
                sendPushNotification(tokenList[i]);
            })
        }).then(() => {
            navigation.navigate('Root');
        })
    }

    async function sendPushNotification(expoPushToken: any) {
      const message = {
        to: expoPushToken,
        sound: 'default',
        title: writer,
        body: place + ' : ' + product + ' ('+qty+')',
        data: { someData: 'goes here' },
      };
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });
    }

    return(
        <View style={styles.container}>
            <View style={styles.top}>
                <Text style={styles.txt}>팀명</Text>
                <Text style={styles.toptxt}>{teamName}</Text>
            </View>
            <View style={styles.top}>
                <Text style={styles.txt}>작성자</Text>
                <Text style={styles.toptxt}>{writer}</Text>
            </View>
            <View style={styles.content}>
                <Text style={styles.txt}>장소명</Text>
                <Input 
                    value={place}
                    onChangeText={(txt) => {setPlace(txt)}}
                    shake={()=>{}}
                    style={styles.place}
                />
                <Text style={styles.txt}>상품명(한 품목씩 넣어주세요)</Text>
                <Input 
                    value={product}
                    onChangeText={(txt) => {setProduct(txt)}}
                    shake={()=>{}}
                    style={styles.place}
                />
                <Text style={styles.txt}>수량(단위도 적어주세요)</Text>
                <Input 
                    value={qty}
                    onChangeText={(txt) => {setQty(txt)}}
                    shake={()=>{}}
                    style={styles.place}
                />
                <Text style={styles.txt}>특이사항</Text>
                <Input 
                    value={remarks}
                    onChangeText={(txt) => {setRemarks(txt)}}
                    shake={()=>{}}
                    style={styles.place}
                    placeholder={"없음"}
                />
            </View>
            <Text style={styles.alert}>{alert}</Text>
            <Button title={'추가'}
                onPress={AddBtn}
                buttonStyle={{
                    backgroundColor : '#00BCD4'
                }}
            />
         
        </View>
    )
}

const styles = StyleSheet.create({
    container : {
        flex : 1,
        padding : "2%"
    },
    txt :{
        fontSize : 20
    },
    place : {
    },
    top : {
        flexDirection : "row",
        justifyContent : 'space-between',
        paddingBottom : 10,
        borderBottomColor : "#BEBEBE",
        borderBottomWidth : 1,
        padding : "2%"
    },
    toptxt : {
        fontSize : 15
    },
    content : {
        padding : "2%"
    },
    alert : {
        textAlign : 'center',
        color : 'red'
    }
})
import { Alert, BackHandler, StyleSheet } from 'react-native';
import { Text, View } from '../components/Themed';
import { RootStackScreenProps } from '../types';
import { Button } from '@rneui/base';
import { FirebaseApp } from '../firebaseConfig';
import {getAuth, onAuthStateChanged, signOut, User} from 'firebase/auth';
import { useState, useEffect } from 'react';
import AnimatedLottieView from 'lottie-react-native';
import { Image } from '@rneui/themed/dist/Image';
import { getDatabase, onValue, ref } from 'firebase/database';

FirebaseApp;
export default function HomePage({ navigation }: RootStackScreenProps<'Home'>) {
  const [userData, setUserData] = useState<User>();
  const [userName, setUserName] = useState<string | null | undefined>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [teamName, setTeamName] = useState<string>('');

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    setUserData(user);
    const displayName = user?.displayName;
    setUserName(displayName);
    const db = getDatabase();
    const list = ref(db, 'member/'+user?.uid);
    onValue(list, (snapshot) => {
      if(snapshot.exists()){
        const data = snapshot.val();
        setTeamName(data.teamname);
        // console.log(teamName);
      }
    })
    console.log(user);

    
    const listener = onAuthStateChanged(auth, async (user) => {
      // console.log(user);
      setIsAuthenticated(!!user);
      setUserName(displayName);
      if(!user){
        navigation.navigate('Login');
      }
    });

    const backAction = () => {
      Alert.alert("종료", "종료하시겠습니까?" ,[
        { text : "확인", onPress : () => BackHandler.exitApp() },
        {
        text : "취소",
        onPress : () => null,
        }
      ]);
      return true;
    }
    const backHandler = BackHandler.addEventListener("hardwareBackPress",backAction);

    return ()=>{
      listener();
      backHandler.remove();
    }

  },[isAuthenticated,teamName,userName,userData])

  

  return (
    <View style={styles.container}>
      <Image 
        source={require('../assets/images/utongtong.png')}
        style={{
          width : 300,
          height : 80,
          position : 'relative',
          bottom : 400,
          alignSelf : 'center'
        }}
      />
      <AnimatedLottieView 
      source={require('../assets/animations/97311-truck.json')}
      autoPlay
      loop
      style={{
          justifyContent:'flex-start',
          alignSelf:'center',

      }}
      />
      
      <View style={styles.bottom}>
        <Text style={styles.title}>반갑습니다.</Text>
        <Text style={styles.title}>팀을 참가하거나 만들어주세요.</Text>
        <View style={styles.btns}>
          {
            teamName === '' ? 
            <Button title="팀 만들기" 
            buttonStyle={{
              backgroundColor : "#9C27B0",
              borderRadius : 15,
              width : 400
            }}
            onPress={() => {navigation.navigate('MakeTeam')}}
            />
            :
            <View></View>
          }
          
          <Button title="팀 참가하기" 
            buttonStyle={{
              backgroundColor : "#3F51B5",
              borderRadius : 15,
              width : 400,
              marginTop : 10
            }}
            onPress={() => {navigation.navigate('JoinTeam')}}
          />
          <Button title="로그아웃" 
            buttonStyle={{
              backgroundColor : "#009688",
              borderRadius : 15,
              width : 400,
              marginTop : 10
            }}
            onPress={() => {
              const auth = getAuth();
              signOut(auth).then(()=>{
                navigation.navigate("Login");
              })
            }}
          />
        </View>
      </View>


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  btns : {
    paddingTop : "5%"
  },
  bottom: {
    position : 'relative',
    top : 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo : {
    position : 'absolute',
    top : 100,
    fontSize : 30,
    color : '#9C27B0',
    fontWeight : 'bold'
  }
});

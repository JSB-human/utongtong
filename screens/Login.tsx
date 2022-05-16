import { Button, Image } from '@rneui/base';
import { ActivityIndicator, Dimensions, Platform, StyleSheet, TextInput } from 'react-native';
import { Text, View } from '../components/Themed';
import { RootStackScreenProps} from '../types';
import { useEffect, useState } from 'react';
import { android_clientId, expo_clientId, FirebaseApp, web_clientId, web_secret } from '../firebaseConfig';
import * as WebBrouser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session'
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithCredential, User } from '@firebase/auth';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
// import * as GoogleSignIn from 'expo-google-sign-in';
// import {GoogleSignin} from '@react-native-google-signin/google-signin';


FirebaseApp;
WebBrouser.maybeCompleteAuthSession();

const chartHeight = Dimensions.get('window').height;
const chartWidth = Dimensions.get('window').width;
const redirectUri = AuthSession.makeRedirectUri({useProxy:true});

export default function Login({ navigation }: RootStackScreenProps<'Login'>) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
        clientId : web_clientId,  
      // iosClientId : web_clientId,
        // webClientId : web_clientId,
        // androidClientId : android_clientId,
        // expoClientId : expo_clientId,
        redirectUri: redirectUri, 
      })
    const [userData, setUserData] = useState<User>();
    const [Email, setEmail] = useState('');
    const [Password, setPassword] = useState('');


    useEffect(()=>{
      const auth = getAuth();
      const currentUser = auth.currentUser; 
      setUserData(currentUser);
      if(response?.type === 'success'){
        const { id_token } = response.params;
        const provider = GoogleAuthProvider;
        const credential = provider.credential(id_token);
        signInWithCredential(auth, credential);
        navigation.navigate("Home");
      }
      // console.log('cu',userData);
      const listener = onAuthStateChanged(auth, async (user) => {
        setIsAuthenticated(!!user);
        if(userData === null || userData === undefined){
            // navigation.navigate("Login");
        }else{
          navigation.navigate("Home");
        }
    });

    return () => {
      listener();
    }
    }, [response,isAuthenticated])

    const SignInWithEmail = () =>{
      const auth = getAuth();
      signInWithEmailAndPassword(auth, Email, Password)
      .then((user) => {
        // console.log(user);
        navigation.navigate("Home");
      })
      .catch((err) => {
        let errorCode = err.code;
        if(errorCode === 'auth/wrong-password'){
          alert('비밀번호가 틀립니다.');
        }else if(errorCode === 'auth/invalid-email'){
          alert('유효한 이메일 주소가 아닙니다.');
        }else if(errorCode === 'auth/user-not-found'){
          alert('회원을 찾을 수 없습니다.');
        }
      })
    }


  // const [user, setUser] = useState(null);
  // useEffect(() => {
  //   initAsync();
  // })
  // const initAsync = async () => {
  //   await GoogleSignIn.initAsync({
  //     // You may ommit the clientId when the firebase `googleServicesFile` is configured
  //     signInType : GoogleSignIn.TYPES.DEFAULT,
  //     clientId: Platform.OS === "android" ?
  //       android_clientId : web_clientId
  //     ,
  //   });
  //   _syncUserWithStateAsync();
  // };

  // const _syncUserWithStateAsync = async () => {
  //   const user = await GoogleSignIn.signInSilentlyAsync();
  //   setUser(user);
  // };

  // const signOutAsync = async () => {
  //   await GoogleSignIn.signOutAsync();
  //   setUser(null);
  // };

  // const signInAsync = async () => {
  //   try {
  //     await GoogleSignIn.askForPlayServicesAsync();
  //     const { type, user } = await GoogleSignIn.signInAsync();
  //     if (type === 'success') {
  //       _syncUserWithStateAsync();
  //       setUser(user);
  //       navigation.navigate('Home');
  //     }
  //   } catch ({ message }) {
  //     alert('login: Error:' + message);
  //   }
  // };

  // const GoogleBtn = () => {
  //   if (user) {
  //     signOutAsync();
  //   } else {
  //     signInAsync();
  //   }
  // };

  
    
    
    // const naverLogin = async () => {
    //   console.log(redirectUri);
    //   const result = await AuthSession.startAsync({
    //     authUrl : "https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=NTgYiv5RjAK0IblnZ0Gm&redirect_uri="+redirectUri
    //   })
    //   if(result.type === 'success'){
    //     const id_token = result;
    //     console.log(id_token);
    //   }
    // }

    // const facebookLogin = async () => {

    // }

    return (
        <View style={styles.container}>
            
            {/* <Button 
                disabled={!request}
                title="로그인"
                onPress={()=> promptAsync()}
                containerStyle={{
                  
                }}
            /> */}
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
            <View style={styles.btnView}>
              <Text style={styles.title}>로그인</Text>
              <TextInput 
                value={Email}
                onChangeText={(text) => setEmail(text)}
                style={styles.textinput}
                placeholder={"이메일@email.com"}
              />
              <TextInput 
                value={Password}
                onChangeText={(text) => setPassword(text)}
                style={styles.textinput}
                secureTextEntry={true}
                placeholder={"비밀번호"}
              />
              {/* <Image 
                source={require('../assets/images/google_login.png')}
                containerStyle={styles.loginBtn}
                PlaceholderContent={<ActivityIndicator />}
                onPress={
                  () => promptAsync()
                }
              /> */}
              {/* <Image 
                source={require('../assets/images/naverBtn.png')}
                containerStyle={styles.naverBtn}
                style ={styles.naverBtn}
                PlaceholderContent={<ActivityIndicator />}
                onPress={
                  () => naverLogin()
                }
              />
               <Image 
                source={require('../assets/images/naverBtn.png')}
                containerStyle={styles.naverBtn}
                style ={styles.naverBtn}
                PlaceholderContent={<ActivityIndicator />}
                onPress={
                  () => naverLogin()
                }
              /> */}
              {/* <Text>{redirectUri}</Text> */}
              <Button title="로그인"
                buttonStyle={{
                  backgroundColor : '#CDDC39',
                  width : 250,
                  marginBottom : 5,
                  marginTop : 10
                }}
                onPress={() => SignInWithEmail()}
              />
              <Button title="회원가입"
                onPress={()=>navigation.navigate("Register")}
                buttonStyle={{
                  backgroundColor : 'coral',
                  width : 250
                }}
              />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor : '#00BCD4'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color : 'white'
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  loginBtn: {
    width : 200,
    height :50,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor : 'black'
  },
  btnView : {
    flex : 0.7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor : '#3F51B5',
    width : chartWidth,
    // borderRadius : 20
  },
  naverBtn : {
    width : 190,
    height : 40,
    alignItems: 'center',
    justifyContent: 'center',
    
  },
  textinput : {
    width : 300,
    height : 40,
    backgroundColor : 'white',
    margin : 5
  }
});
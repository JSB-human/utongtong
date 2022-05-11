import { Button, Image } from '@rneui/base';
import { ActivityIndicator, Dimensions, StyleSheet } from 'react-native';
import { Text, View } from '../components/Themed';
import { RootStackScreenProps} from '../types';
import { useEffect, useState } from 'react';
import { android_clientId, expo_clientId, FirebaseApp, web_clientId, web_secret } from '../firebaseConfig';
import * as WebBrouser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { onAuthStateChanged, getAuth, GoogleAuthProvider, signInWithCredential, User} from 'firebase/auth';
import * as AuthSession from 'expo-auth-session';


FirebaseApp;
WebBrouser.maybeCompleteAuthSession();

const chartHeight = Dimensions.get('window').height;
const chartWidth = Dimensions.get('window').width;
const redirectUri = AuthSession.makeRedirectUri({useProxy:true});

export default function Login({ navigation }: RootStackScreenProps<'Login'>) {
  console.log('uri >> ',redirectUri);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
        clientId : web_clientId,
        // webClientId : web_clientId,
        // androidClientId : android_clientId,
        // expoClientId : expo_clientId,
        redirectUri: redirectUri  
      })
    const [userData, setUserData] = useState<User>();
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
      // const listener = onAuthStateChanged(auth, async (user) => {
      //   setIsAuthenticated(!!user);
      //   if(userData === null || userData === undefined){
      //       // navigation.navigate("Login");
      //   }else{
      //     navigation.navigate("Home");
      //   }
    // });

    // return () => {
    //   listener();
    // }
    }, [response,userData])

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
              <Image 
                source={require('../assets/images/google_login.png')}
                containerStyle={styles.loginBtn}
                PlaceholderContent={<ActivityIndicator />}
                onPress={
                  () => promptAsync({useProxy : true})
                  // {}
                }
              />
              <Text>{redirectUri}</Text>
              <Button title="홈페이지"
                onPress={()=>navigation.navigate("Home")}
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
    flex : 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor : '#3F51B5',
    width : chartWidth,
    // borderRadius : 20
  }
});
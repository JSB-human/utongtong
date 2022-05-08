import { Button, Image } from '@rneui/base';
import { ActivityIndicator, Dimensions, StyleSheet } from 'react-native';
import { Text, View } from '../components/Themed';
import { RootStackScreenProps} from '../types';
import { useEffect, useState } from 'react';
import { FirebaseApp, web_clientId } from '../firebaseConfig';
import * as WebBrouser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { onAuthStateChanged, getAuth, GoogleAuthProvider, signInWithCredential} from 'firebase/auth';
FirebaseApp;
WebBrouser.maybeCompleteAuthSession();
const useProxy = true;
const chartHeight = Dimensions.get('window').height;
const chartWidth = Dimensions.get('window').width;

export default function Login({ navigation }: RootStackScreenProps<'Login'>) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
        clientId : web_clientId
      })

    useEffect(()=>{
      const auth = getAuth();
      const currentUser = auth.currentUser; 
      if(response?.type === 'success'){
        const { id_token } = response.params;
        const provider = GoogleAuthProvider;
        const credential = provider.credential(id_token);
        signInWithCredential(auth, credential);
        
        // navigation.navigate("Home");
      }
      const listener = onAuthStateChanged(auth, async (user) => {
        setIsAuthenticated(!!user);
        // console.log('cu',currentUser);
        if(currentUser === null || currentUser === undefined){
            // navigation.navigate("Login");
        }else{
            navigation.navigate("Home");
        }
    });

    return () => {
      listener();
    }
    }, [response,isAuthenticated])

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
                  () => promptAsync()
                }
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

import { Button } from '@rneui/base';
import { StyleSheet } from 'react-native';
import { Text, View } from '../components/Themed';
import { RootStackScreenProps} from '../types';
import { useEffect } from 'react';
import { FirebaseApp, web_clientId } from '../firebaseConfig';
import * as WebBrouser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { onAuthStateChanged, getAuth, GoogleAuthProvider, signInWithCredential} from 'firebase/auth';
FirebaseApp;


WebBrouser.maybeCompleteAuthSession();


export default function Login({ navigation }: RootStackScreenProps<'Login'>) {

    const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
        clientId : web_clientId,
      })
      
    useEffect(()=>{
      if(response?.type === 'success'){
        const { id_token } = response.params;

        const auth = getAuth();
        // onAuthStateChanged(auth, user =>{
        //   if(user != null){
        //     // console.log(user);
        //     
        //   }
        // })
        const provider = GoogleAuthProvider;
        const credential = provider.credential(id_token);
        signInWithCredential(auth, credential);
        navigation.navigate("Home");
      }
    }, [response])

    return (
        <View style={styles.container}>
            <Text style={styles.title}>로그인</Text>
            <Button 
                disabled={!request}
                title="로그인"
                onPress={()=> promptAsync({
                  
                })}
            />
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
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});

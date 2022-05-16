import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useEffect, useState } from "react";
import { View } from "../components/Themed";
import { RootStackScreenProps } from "../types";
import * as Auth from '@firebase/auth';
import { Input } from "@rneui/themed";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";
import { Button } from "@rneui/base";



export default function Register({navigation} : RootStackScreenProps<'Register'>) {
    const [initializing, setInitializing] = useState(true);
    const [user, setUser] = useState();
    const [ registerEmail, setRegisterEmail ] = useState("");
    const [ registerPassword, setRegisterPassword ] = useState("");
    const [ registerPasswordCheck, setRegisterPasswordCheck ] = useState("");

    const auth = Auth.getAuth();

    function onAuthStateChanged(user : any) {
        setUser(user);
        if (initializing) setInitializing(false);
      }
  
      useEffect(() => {
        const subscriber = onAuthStateChanged(onAuthStateChanged);
        return subscriber; // unsubscribe on unmount
      }, []);
  
      if (initializing) return null;
    //   validator.isEmail('john.doe@example.com');    // true
      const register = async () => {
        let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
        if(registerPassword === registerPasswordCheck && reg.test(registerEmail) && registerPassword.length > 5){
            try {
                const user = await createUserWithEmailAndPassword(auth ,registerEmail, registerPassword)
                .then(() => {
                    signInWithEmailAndPassword(auth,registerEmail, registerPassword)
                    .then((res) => {
                        updateProfile(res.user, {
                            displayName : '사용자',
                            photoURL : 'https://firebasestorage.googleapis.com/v0/b/distributionking-32d8b.appspot.com/o/user.png?alt=media&token=21fcbb2f-6560-4e94-ad57-441eb47b5dad'
                        }).then(() => {
                            navigation.navigate('UpdateUser');
                        })
                    })
                    .catch((err) => {
                        console.log(err);
                    })
                })
                .catch((err) => {
                    if(err.code === 'auth/email-already-in-use') {
                        alert('이미 사용중인 이메일 주소 입니다.');
                    }else{
                        alert('회원가입 중 오류가 발생했습니다.');
                    }
                })
                
            } catch(error) {
            console.log(error.message);
            }
        }else if(registerPassword !== registerPasswordCheck) {
            alert("비밀번호가 일치하지 않습니다.");
        }else if(!reg.test(registerEmail)) {
            alert("이메일 형식이 아닙니다.");
        }else if(registerPassword.length < 6){
            alert("비밀번호는 6자 이상이어야 합니다.")
        }

        
     };

    return (
        <View style={styles.container}>
            <Input
            placeholder='이메일'
            containerStyle={styles.control}
            value={registerEmail}
            onChangeText={(text) => setRegisterEmail(text)}
            leftIcon={<Ionicons
                name='newspaper'
                size={16}
            />}
        />

            <Input
                placeholder='비밀번호'
                containerStyle={styles.control}
                value={registerPassword}
                onChangeText={(text) => setRegisterPassword(text)}
                secureTextEntry={true}
                leftIcon={<Ionicons
                    name='key'
                    size={16}
                />}
            />
            <Input
                placeholder='비밀번호 확인'
                containerStyle={styles.control}
                value={registerPasswordCheck}
                onChangeText={(text) => setRegisterPasswordCheck(text)}
                secureTextEntry={true}
                leftIcon={<Ionicons
                    name='key'
                    size={16}
                />}
            />
        <Button
            title="가입"
            onPress={() => register()}
        />

        </View>
    )
    
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
      },
    control : {
        marginTop: 10
    } 
})
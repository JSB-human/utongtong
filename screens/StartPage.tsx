import { Image } from "@rneui/themed";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { Text, View } from "../components/Themed";
import { RootStackScreenProps } from "../types";

export default function StartPage({ navigation }: RootStackScreenProps<'Start'>){
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const auth = getAuth();
        const currentUser = auth.currentUser; 

        const listener = onAuthStateChanged(auth, async (user) => {
            setIsAuthenticated(!!user);
            // console.log('cu',currentUser);
            if(currentUser === null || currentUser === undefined){
                navigation.navigate("Login");
            }else{
                navigation.navigate("Home");
            }
        });

        return () => {
            listener();
        }
    },[isAuthenticated])
    
    return(
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
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
});
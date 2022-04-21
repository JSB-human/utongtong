import { StyleSheet } from 'react-native';
import { Text, View } from '../components/Themed';
import { RootStackScreenProps } from '../types';
import { Button } from '@rneui/base';
import { FirebaseApp } from '../firebaseConfig';
import {getAuth, onAuthStateChanged} from 'firebase/auth';
import { useState, useEffect } from 'react';

FirebaseApp;


export default function HomePage({ navigation }: RootStackScreenProps<'Home'>) {
  const [userName, setUserName] = useState<string | null>();

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    const displayName= user?.displayName;
    if(user !== null){
      setUserName(displayName);
    }
  },[userName])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>반갑습니다. {userName}님</Text>
      <Text style={styles.title}>팀을 참가하거나 만들어주세요.</Text>
      <View style={styles.btns}>
        <Button title="팀 만들기" 
          buttonStyle={{
            backgroundColor : "#9C27B0"
          }}
          onPress={() => {navigation.navigate('MakeTeam')}}
        />
        <Button title="팀 참가하기" 
          buttonStyle={{
            backgroundColor : "#3F51B5"
          }}
          onPress={() => {navigation.navigate('JoinTeam')}}
        />
      </View>


      {/*
      <Button 
            title="루트"
            onPress={()=> navigation.navigate('Root')}
        /> */}
        
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
    flexDirection : 'row',
    paddingTop : "5%"
  }
});

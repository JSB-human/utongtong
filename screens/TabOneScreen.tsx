import { getAuth } from 'firebase/auth';
import { getDatabase, onValue, ref } from 'firebase/database';
import { useState } from 'react';
import { useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import EditScreenInfo from '../components/EditScreenInfo';
import { Text, View } from '../components/Themed';
import { FirebaseApp } from '../firebaseConfig';
import { RootTabScreenProps } from '../types';

FirebaseApp;


export default function TabOneScreen({ navigation }: RootTabScreenProps<'TabOne'>) {
  const [teamname, setTeamname] = useState<string>('');
  const [teamleader, setTeamleader] = useState<string>('');
  

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    const db = getDatabase();
    const list = ref(db, 'member/'+user?.uid);
    onValue(list, (snapshot) => {
      const data = snapshot.val();
      console.log(data.teamname);
      setTeamname(data.teamname);

      const list2 = ref(db, 'party/'+teamname);
      onValue(list2, (snapshot) => {
        const data = snapshot.val();
        console.log('',data);
      })
    })

    

  }, [])
  
  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <Text style={styles.toptxt}>{teamname}</Text>
      </View>
      <Text>팀장</Text>
      <View style={styles.teamleader}>
        {  }
      </View>
      <ScrollView>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding : "2%"
    // alignItems: 'center',
    // justifyContent: 'center',
  },
  top : {
    borderBottomWidth : 1,
    borderBottomColor : '#BEBEBE',
    height : 80,
    justifyContent : 'center',
    padding : "5%"
  },
  toptxt : {
    fontSize : 20
  },
  teamleader : {

  }

});
